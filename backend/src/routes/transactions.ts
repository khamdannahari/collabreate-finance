import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all transactions
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { type, search } = req.query;
    const userId = req.user!.userId;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(type && { type: type as "income" | "expense" }),
        ...(search && {
          name: {
            contains: search as string,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res
      .status(500)
      .json({ message: "Error occurred while fetching transactions" });
  }
});

// Add transaction
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { name, amount, type, date } = req.body;
    const userId = req.user!.userId;

    const transaction = await prisma.transaction.create({
      data: {
        name,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        userId,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add transaction error:", error);
    res
      .status(500)
      .json({ message: "Error occurred while adding transaction" });
  }
});

// Update transaction
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, amount, type, date } = req.body;
    const userId = req.user!.userId;

    const transaction = await prisma.transaction.update({
      where: {
        id,
        userId, // Ensure user owns the transaction
      },
      data: {
        name,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
      },
    });

    res.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res
      .status(500)
      .json({ message: "Error occurred while updating transaction" });
  }
});

// Delete transaction
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.transaction.delete({
      where: {
        id,
        userId, // Ensure user owns the transaction
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete transaction error:", error);
    res
      .status(500)
      .json({ message: "Error occurred while deleting transaction" });
  }
});

export default router;
