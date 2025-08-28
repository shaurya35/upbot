import express from "express";

import { signin, signup, signout, verifyOtp, refreshTokenHandler } from "../../../controllers/v1/authControllers"

const router = express.Router();

router.post("/signin", signin);
router.post("/verify-otp", verifyOtp)
router.post("/signup", signup);
router.post("/signout", signout);
router.post("/refresh", refreshTokenHandler)

export default router;