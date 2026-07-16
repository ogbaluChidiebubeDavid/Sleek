const { PrismaClient } = require("c:/Users/USER/Desktop/whatsapp e-commerce/node_modules/@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.webhookLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    console.log("Recent Webhook Logs count:", logs.length);
    for (const log of logs) {
      console.log(`Log ID: ${log.id}, Created: ${log.createdAt}`);
      console.log("Payload:", JSON.stringify(log.payload, null, 2));
    }
  } catch (err: any) {
    console.error("Error reading logs:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
