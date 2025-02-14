import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile with stats
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        profileImage: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get transactions stats
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const stats = {
      totalTransactions: transactions.length,
      totalIncome: transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    };

    const savingsRate =
      stats.totalIncome > 0
        ? (
            ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) *
            100
          ).toFixed(1)
        : "0";

    res.json({
      ...user,
      stats: {
        ...stats,
        savingsRate: `${savingsRate}%`,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error occurred while fetching profile" });
  }
});

// Update profile
router.put("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, email, profileImage } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        profileImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        profileImage: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error occurred while updating profile" });
  }
});

// Add chart data endpoint
router.get("/chart-data", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    console.log("Fetching chart data for user:", userId);

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    console.log("Found transactions:", transactions.length);

    // Process transactions into chart data
    const chartData = {
      all: processTransactionsByMonth(transactions),
      monthly: processTransactionsByWeek(transactions),
      weekly: processTransactionsByDay(transactions),
    };

    res.json(chartData);
  } catch (error) {
    console.error("Chart data error:", error);
    res
      .status(500)
      .json({ message: "Error occurred while fetching chart data" });
  }
});

// Helper functions for processing transactions
function processTransactionsByMonth(transactions: any[]) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = {
    labels: months,
    income: new Array(12).fill(0),
    expenses: new Array(12).fill(0),
  };

  transactions.forEach((t) => {
    const month = new Date(t.date).getMonth();
    if (t.type === "income") {
      data.income[month] += t.amount;
    } else {
      data.expenses[month] += t.amount;
    }
  });

  return data;
}

function processTransactionsByWeek(transactions: any[]) {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const data = {
    labels: weeks,
    income: new Array(4).fill(0),
    expenses: new Array(4).fill(0),
  };

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const week = Math.floor(date.getDate() / 7);
    if (t.type === "income") {
      data.income[week] += t.amount;
    } else {
      data.expenses[week] += t.amount;
    }
  });

  return data;
}

function processTransactionsByDay(transactions: any[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = {
    labels: days,
    income: new Array(7).fill(0),
    expenses: new Array(7).fill(0),
  };

  transactions.forEach((t) => {
    const day = new Date(t.date).getDay();
    if (t.type === "income") {
      data.income[day] += t.amount;
    } else {
      data.expenses[day] += t.amount;
    }
  });

  return data;
}

export default router;
