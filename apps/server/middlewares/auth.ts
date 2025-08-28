import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };
    if (!decoded.userId) {
      return res
        .status(401)
        .json({ error: "Invalid token: userId is missing" });
    }
    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export { isLoggedIn };
