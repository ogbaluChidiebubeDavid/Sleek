const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Retrieving last 4 webhook logs in full...');
  const logs = await prisma.webhookLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  logs.forEach((log, index) => {
    console.log(`\n--- Log #${index + 1} (${log.createdAt}) ---`);
    console.log('Headers:', log.headers);
    try {
      const parsed = JSON.parse(log.payload);
      console.log('Payload:', JSON.stringify(parsed, null, 2));
    } catch {
      console.log('Payload (Raw):', log.payload);
    }
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
