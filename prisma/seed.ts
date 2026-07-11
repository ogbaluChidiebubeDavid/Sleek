import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";

const prisma = new PrismaClient();

const products = [
  {
    name: "AirStride Runner",
    description: "Lightweight performance runners with breathable mesh.",
    price: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "sneakers",
    colors: JSON.stringify(["Black", "White", "Red"]),
    sizes: JSON.stringify(["40", "41", "42", "43", "44"]),
    featured: true,
  },
  {
    name: "Urban Classic Low",
    description: "Everyday street sneakers with premium leather finish.",
    price: 38500,
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0faedce5d586?w=400&h=400&fit=crop",
    category: "sneakers",
    colors: JSON.stringify(["Navy", "Grey", "White"]),
    sizes: JSON.stringify(["39", "40", "41", "42", "43"]),
    featured: true,
  },
  {
    name: "TrailGrip Hiker",
    description: "All-terrain boots built for comfort and grip.",
    price: 52000,
    imageUrl:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop",
    category: "boots",
    colors: JSON.stringify(["Brown", "Black", "Olive"]),
    sizes: JSON.stringify(["40", "41", "42", "43", "44", "45"]),
    featured: true,
  },
  {
    name: "CloudStep Slip-On",
    description: "Minimal slip-ons with memory foam insole.",
    price: 29500,
    imageUrl:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop",
    category: "casual",
    colors: JSON.stringify(["Beige", "Black"]),
    sizes: JSON.stringify(["38", "39", "40", "41", "42"]),
    featured: true,
  },
  {
    name: "CourtPro Basketball",
    description: "High-top court shoes with ankle support.",
    price: 48000,
    imageUrl:
      "https://images.unsplash.com/photo-1605348532761-676ed6b5c2a9?w=400&h=400&fit=crop",
    category: "sports",
    colors: JSON.stringify(["White/Red", "Black/Gold"]),
    sizes: JSON.stringify(["41", "42", "43", "44", "45"]),
    featured: true,
  },
  {
    name: "Velvet Heel Classic",
    description: "Elegant heels for formal occasions.",
    price: 35000,
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd1?w=400&h=400&fit=crop",
    category: "heels",
    colors: JSON.stringify(["Black", "Nude", "Burgundy"]),
    sizes: JSON.stringify(["37", "38", "39", "40", "41"]),
    featured: false,
  },
  {
    name: "FlexFit Training",
    description: "Cross-training shoes with stable sole.",
    price: 41000,
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
    category: "sports",
    colors: JSON.stringify(["Blue", "Black", "Neon"]),
    sizes: JSON.stringify(["40", "41", "42", "43", "44"]),
    featured: false,
  },
  {
    name: "Desert Sandal",
    description: "Open-toe sandals for warm weather.",
    price: 22000,
    imageUrl:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop",
    category: "sandals",
    colors: JSON.stringify(["Tan", "Black"]),
    sizes: JSON.stringify(["39", "40", "41", "42", "43"]),
    featured: false,
  },
];

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.conversationState.deleteMany();

  // Create a default verified Vendor (April Footwear)
  const wallet = ethers.Wallet.createRandom();
  const vendor = await prisma.vendor.create({
    data: {
      email: "april@footwear.com",
      password: "vendorpassword123",
      phone: "2348146272564",
      businessName: "April Footwear",
      walletAddress: wallet.address,
      walletPrivateKey: wallet.privateKey,
      kycStatus: "verified",
    },
  });

  console.log(`Created default Vendor: ${vendor.businessName} (${vendor.walletAddress})`);

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        starRating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
        vendorId: vendor.id,
      },
    });
  }

  console.log(`Seeded ${products.length} footwear products associated with Vendor April.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
