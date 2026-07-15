import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const addSchema = z.object({
  phone: z.string().min(8),
  productId: z.string(),
  color: z.string(),
  size: z.string(),
  quantity: z.number().int().positive().optional(),
});

const patchSchema = z.object({
  phone: z.string().min(8),
  productId: z.string(),
  color: z.string(),
  size: z.string(),
  quantity: z.number().int().positive(),
});

const deleteSchema = z.object({
  phone: z.string().min(8),
  productId: z.string(),
  color: z.string(),
  size: z.string(),
});

async function ensureUser(phone: string) {
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone } });
    await prisma.cart.create({ data: { userId: user.id } });
  }
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) await prisma.cart.create({ data: { userId: user.id } });
  return user;
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { phone },
    include: {
      cart: {
        include: { items: { include: { product: true } } },
      },
    },
  });

  return NextResponse.json({ items: user?.cart?.items || [] });
}

export async function POST(req: NextRequest) {
  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, productId, color, size, quantity = 1 } = parsed.data;
  const user = await ensureUser(phone);
  const cart = await prisma.cart.findUniqueOrThrow({ where: { userId: user.id } });

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId_color_size: {
        cartId: cart.id,
        productId,
        color,
        size,
      },
    },
    create: { cartId: cart.id, productId, color, size, quantity },
    update: { quantity: { increment: quantity } },
    include: { product: true },
  });

  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, productId, color, size, quantity } = parsed.data;
  const user = await ensureUser(phone);
  const cart = await prisma.cart.findUniqueOrThrow({ where: { userId: user.id } });

  const item = await prisma.cartItem.update({
    where: {
      cartId_productId_color_size: {
        cartId: cart.id,
        productId,
        color,
        size,
      },
    },
    data: { quantity },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const parsed = deleteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, productId, color, size } = parsed.data;
  const user = await ensureUser(phone);
  const cart = await prisma.cart.findUniqueOrThrow({ where: { userId: user.id } });

  await prisma.cartItem.delete({
    where: {
      cartId_productId_color_size: {
        cartId: cart.id,
        productId,
        color,
        size,
      },
    },
  });

  return NextResponse.json({ success: true });
}
