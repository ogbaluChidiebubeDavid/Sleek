const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Fetching registered users from Prisma database...");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    console.log("Recent Users in DB:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
