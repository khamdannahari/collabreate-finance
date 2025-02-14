import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("nick123", 10);

    // Create default user
    const user = await prisma.user.upsert({
      where: { username: "nick" },
      update: {},
      create: {
        username: "nick",
        password: hashedPassword,
        name: "Nick Demo",
        email: "nick@example.com",
        profileImage:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      },
    });

    console.log("Default user created:", user);

    // Create some sample transactions
    const transactions = await Promise.all([
      prisma.transaction.create({
        data: {
          name: "Monthly Salary",
          amount: 5000000,
          type: "income",
          date: new Date("2024-03-15"),
          userId: user.id,
        },
      }),
      prisma.transaction.create({
        data: {
          name: "Monthly Shopping",
          amount: 1500000,
          type: "expense",
          date: new Date("2024-03-16"),
          userId: user.id,
        },
      }),
    ]);

    console.log("Sample transactions created:", transactions);
  } catch (error) {
    console.log("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
