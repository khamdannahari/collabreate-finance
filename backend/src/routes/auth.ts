import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password, name, email } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "Username or email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error occurred during registration" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    console.log("User found:", user ? "yes" : "no");

    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", validPassword ? "yes" : "no");

    if (!validPassword) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    // Log error in more detail
    console.error("Login error details:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ message: "Error occurred during login" });
  }
});

export default router;
