import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    otpHash: {
      type: String,
      required: true
    },
    lastSentAt: {
      type: Date,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    consumed: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
);

const OtpChallenge =
  mongoose.models.OtpChallenge ||
  mongoose.model("OtpChallenge", otpChallengeSchema);

export default OtpChallenge;
