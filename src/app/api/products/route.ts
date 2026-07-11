import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      colors: parseJsonArray<string>(p.colors),
      sizes: parseJsonArray<string>(p.sizes),
    }))
  );
}
