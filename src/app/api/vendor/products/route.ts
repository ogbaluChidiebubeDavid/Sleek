import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      products.map((p) => ({
        ...p,
        colors: parseJsonArray<string>(p.colors),
        sizes: parseJsonArray<string>(p.sizes),
      }))
    );
  } catch (error) {
    console.error("[Vendor Products GET API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { vendorId, name, description, price, imageUrl, colors, sizes } = await req.json();

    if (!vendorId || !name || !description || !price || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Default colors & sizes if not provided
    const colorArray = colors && Array.isArray(colors) ? colors : ["Black", "White"];
    const sizeArray = sizes && Array.isArray(sizes) ? sizes : ["40", "41", "42", "43", "44"];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category: "sneakers",
        colors: JSON.stringify(colorArray),
        sizes: JSON.stringify(sizeArray),
        featured: true, // Default to true so it shows up in AI chat carousel
        vendorId,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        colors: colorArray,
        sizes: sizeArray,
      },
    });
  } catch (error: any) {
    console.error("[Vendor Products POST API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
