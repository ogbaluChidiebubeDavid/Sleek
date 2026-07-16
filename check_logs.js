const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Retrieving last 10 webhook logs...');
  const logs = await prisma.webhookLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  logs.forEach((log, index) => {
    console.log(`\n--- Log #${index + 1} (${log.createdAt}) ---`);
    console.log('Headers:', log.headers.slice(0, 150));
    try {
      const parsed = JSON.parse(log.payload);
      console.log('Payload:', JSON.stringify(parsed, null, 2).slice(0, 1000));
    } catch {
      console.log('Payload (Raw):', log.payload.slice(0, 1000));
    }
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
