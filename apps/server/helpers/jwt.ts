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
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" }
  );
};

const refreshAccessToken = (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string
  ) as any;
  return generateAccessToken({ id: decoded.userId, email: decoded.email });
};

const decodeToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    return decoded;
  } catch (error) {
    return null;
  }
};

export { generateAccessToken, generateRefreshToken, refreshAccessToken, decodeToken };
