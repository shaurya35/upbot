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

const decodeToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    return decoded;
  } catch (error) {
    return null;
  }
};

export { generateAccessToken, generateRefreshToken, decodeToken };
