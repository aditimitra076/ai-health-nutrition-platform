import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import OtpChallenge from "../models/OtpChallenge.js";
import User from "../models/User.js";
import { AUTH_COOKIE_NAME } from "../middleware/authMiddleware.js";
import { sendOtpEmail } from "../services/emailService.js";

const OTP_LIFETIME_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const INVALID_OTP_MESSAGE = "Invalid or expired verification code.";

const normalizeEmail = (value) => {
  if (typeof value !== "string" || value.length > 254) {
    return null;
  }

  const email = value.trim().toLowerCase();
  const parts = email.split("@");
  if (parts.length !== 2) {
    return null;
  }

  const [localPart, domain] = parts;
  const labels = domain.split(".");
  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    labels.length < 2 ||
    labels.some((label) =>
      !label ||
      label.length > 63 ||
      label.startsWith("-") ||
      label.endsWith("-") ||
      !/^[a-z0-9-]+$/i.test(label)
    ) ||
    /[\s<>(),;:\\"\[\]]/.test(localPart)
  ) {
    return null;
  }

  return email;
};

const createOtp = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

const hashOtp = (email, otp) => {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("OTP_HASH_SECRET must contain at least 32 bytes.");
  }

  return createHmac("sha256", secret)
    .update(`${email}:${otp}`)
    .digest("hex");
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes.");
  }

  return secret;
};

const passwordsMatch = (storedHash, candidateHash) => {
  const stored = Buffer.from(storedHash, "hex");
  const candidate = Buffer.from(candidateHash, "hex");
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE_MS
});

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  createdAt: user.createdAt
});

const invalidOtp = (res) => (
  res.status(400).json({ success: false, message: INVALID_OTP_MESSAGE })
);

export const requestOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    res.status(400).json({ success: false, message: "Enter a valid email address." });
    return;
  }

  const otp = createOtp();
  const now = new Date();
  const cooldownCutoff = new Date(now.getTime() - RESEND_COOLDOWN_MS);
  let otpHash;
  let challenge;

  try {
    otpHash = hashOtp(email, otp);
    try {
      challenge = await OtpChallenge.findOneAndUpdate(
        { email, lastSentAt: { $lte: cooldownCutoff } },
        {
          $set: {
            otpHash,
            lastSentAt: now,
            expiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
            attempts: 0,
            consumed: false,
            updatedAt: now
          }
        },
        { new: true, upsert: true, runValidators: true }
      );
    } catch (error) {
      if (error?.code === 11000) {
        res.status(429).json({
          success: false,
          message: "Please wait before requesting another verification code."
        });
        return;
      }

      throw error;
    }

    await sendOtpEmail(email, otp);
    res.status(200).json({
      success: true,
      message: "If the address can receive email, a verification code has been sent."
    });
  } catch (error) {
    if (challenge?._id && otpHash) {
      try {
        await OtpChallenge.deleteOne({ _id: challenge._id, otpHash });
      } catch (cleanupError) {
        console.error("Unable to remove the undelivered verification challenge:", cleanupError.name);
      }
    }
    console.error("Authentication code request failed:", error.name);
    res.status(503).json({
      success: false,
      message: "Unable to process the verification request right now. Please try again later."
    });
  }
};

export const verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = req.body?.otp;

  if (!email || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    res.status(400).json({ success: false, message: "Enter a valid email and six-digit code." });
    return;
  }

  try {
    const jwtSecret = getJwtSecret();
    const now = new Date();
    const challenge = await OtpChallenge.findOne({
      email,
      consumed: false,
      expiresAt: { $gt: now },
      attempts: { $lt: MAX_OTP_ATTEMPTS }
    });

    if (!challenge) {
      invalidOtp(res);
      return;
    }

    if (!passwordsMatch(challenge.otpHash, hashOtp(email, otp))) {
      await OtpChallenge.updateOne(
        {
          _id: challenge._id,
          consumed: false,
          expiresAt: { $gt: now },
          attempts: { $lt: MAX_OTP_ATTEMPTS }
        },
        { $inc: { attempts: 1 } }
      );
      invalidOtp(res);
      return;
    }

    const consumedChallenge = await OtpChallenge.findOneAndUpdate(
      {
        _id: challenge._id,
        otpHash: challenge.otpHash,
        consumed: false,
        expiresAt: { $gt: now },
        attempts: { $lt: MAX_OTP_ATTEMPTS }
      },
      { $set: { consumed: true } },
      { new: true }
    );

    if (!consumedChallenge) {
      invalidOtp(res);
      return;
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { email } },
      { new: true, upsert: true, runValidators: true }
    );
    const token = jwt.sign(
      { sub: user._id.toString() },
      jwtSecret,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
    res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, message: "Invalid authentication request." });
      return;
    }

    console.error("Unable to verify an authentication code:", error.name);
    res.status(500).json({ success: false, message: "Unable to verify the code right now." });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email createdAt");
    if (!user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Unable to load the authenticated user:", error.name);
    res.status(500).json({ success: false, message: "Unable to load the user profile." });
  }
};

export const logout = (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, clearOptions);
  res.status(200).json({ success: true, message: "Logged out successfully." });
};
