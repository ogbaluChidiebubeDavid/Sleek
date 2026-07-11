import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  phone: z.string().min(8),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, name, email } = parsed.data;
  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone, name, email },
    update: { name, email },
  });

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) await prisma.cart.create({ data: { userId: user.id } });

  return NextResponse.json({ user: { id: user.id, phone: user.phone, name: user.name } });
}
