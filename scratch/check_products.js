const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all products...");
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: true }
  });
  console.log(`Total Products: ${products.length}`);
  products.forEach(p => {
    console.log(`- [${p.id}] ${p.name} | Price: ${p.price} | Featured: ${p.featured} | Vendor: ${p.vendor?.businessName || 'None'} | Created: ${p.createdAt}`);
  });

  console.log("\nFetching all vendors...");
  const vendors = await prisma.vendor.findMany();
  console.log(`Total Vendors: ${vendors.length}`);
  vendors.forEach(v => {
    console.log(`- [${v.id}] ${v.businessName} (${v.email}) | Wallet: ${v.walletAddress}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
