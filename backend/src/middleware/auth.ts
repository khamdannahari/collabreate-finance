import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token not found" });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};
