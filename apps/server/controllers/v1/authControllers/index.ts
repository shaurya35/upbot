import type { Request, Response, NextFunction } from "express";
import { prisma } from "store/client";
import { hash, compare } from "../../../helpers/bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
} from "../../../helpers/jwt";
import { generateOtp, sendOtp, resendOtp } from "../../../helpers/otp";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, company, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required!" });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists!" });
  }

  const otp = generateOtp().toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { email },
    update: { otp, expiresAt, attempts: 0 },
    create: { email, otp, expiresAt },
  });

  await sendOtp(email, otp);

  res.status(200).json({
    message: "OTP sent successfully",
    email,
    nextStep: "/verify-otp",
  });
};

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, password, name, company } = req.body;

  const otpRecord = await prisma.otpVerification.findUnique({
    where: { email },
  });

  if (!otpRecord) {
    return res.status(404).json({ message: "OTP not found or expired" });
  }

  if (otpRecord.expiresAt < new Date()) {
    await prisma.otpVerification.delete({ where: { email } });
    return res.status(410).json({ message: "OTP expired" });
  }

  if (otpRecord.attempts >= 5) {
    await prisma.otpVerification.delete({ where: { email } });
    return res.status(429).json({ message: "Too many failed attempts" });
  }

  if (otpRecord.otp !== otp) {
    await prisma.otpVerification.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });

    const remainingAttempts = 5 - (otpRecord.attempts + 1);
    return res.status(401).json({
      message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
    });
  }

  const hashedPassword = await hash(password);
  const userData: any = {
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    signupMethod: "email",
    plan: "FREE",
    emailVerified: true,
  };

  if (company) {
    userData.company = company;
  }

  const user = await prisma.user.create({
    data: userData,
  });

  await prisma.otpVerification.delete({ where: { email } });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "User created successfully",
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  });
};

const resendOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  await resendOtp(email);

  res.status(200).json({
    message: "New OTP sent successfully",
    email,
    nextStep: "/verify-otp",
  });
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValidPassword = await compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  });
};

const signout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

const refreshTokenHandler = (
  req: Request,
  res: Response,
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const newAccessToken = refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export {
  signup,
  verifyOtp,
  resendOtpHandler,
  signin,
  signout,
  refreshTokenHandler,
};
