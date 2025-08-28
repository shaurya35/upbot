import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "store/client";

const generateOtp = () => {
  return crypto.randomInt(100000, 999999);
};

const sendOtp = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Upbot" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email verification code",

    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; font-weight: 500;">Hi there,</h2>
          <p style="font-size: 15px; color: #444;">
            Please use the code below to confirm your email address and continue on <strong>Upbot</strong>.
            This code will expire in <strong>5 minutes</strong>. If you don't think you should be receiving this email, you can safely ignore it.
          </p>
  
          <div style="text-align: center; margin: 40px 0;">
            <span style="font-size: 42px; font-weight: bold; color: #000;">${otp}</span>
          </div>
  
          <hr style="border: none; border-top: 1px solid #ccc;" />
  
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            You received this email because you requested a confirmation code from <strong>ITER Connect</strong>.
          </p>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
};

const resendOtp = async (email: string) => {
  const otp = generateOtp().toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { email },
    update: { otp, expiresAt, attempts: 0 },
    create: { email, otp, expiresAt },
  });

  await sendOtp(email, otp);
};

export { generateOtp, sendOtp, resendOtp };
