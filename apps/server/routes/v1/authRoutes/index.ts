import express from "express";
import { authLimiter, otpLimiter } from "../../../middlewares/rateLimiter";

import { signin, signup, signout, verifyOtp, resendOtpHandler, refreshTokenHandler } from "../../../controllers/v1/authControllers"

const router = express.Router();

router.post("/signin", authLimiter, signin);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/signup", otpLimiter, signup);
router.post("/resend-otp", otpLimiter, resendOtpHandler);
router.post("/signout", signout);
router.post("/refresh", refreshTokenHandler)

export default router;