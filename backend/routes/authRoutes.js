import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getCurrentUser,
  logout,
  requestOtp,
  verifyOtp
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification requests. Please try again later."
  }
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later."
  }
});

router.post("/request-otp", requestOtpLimiter, requestOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
