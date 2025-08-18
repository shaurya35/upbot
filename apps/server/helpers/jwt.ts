import jwt from "jsonwebtoken";

const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "30d" }
  );
};

const generateAccessToken = (user: any) => {
  return jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" }
  );
};

export { generateAccessToken, generateRefreshToken }