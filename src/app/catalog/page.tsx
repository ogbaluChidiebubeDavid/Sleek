"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { formatCurrency, getWhatsAppLink } from "@/lib/utils";
import { ShoppingCart, X, UserPlus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<
    { product: Product; color: string; size: string; quantity: number }[]
  >([]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Record<string, { color: string; size: string }>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    if (!phone) return;
    fetch(`/api/cart?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) {
          setCart(
            data.items.map(
              (i: { product: Product; color: string; size: string; quantity: number }) => ({
                product: i.product,
                color: i.color,
                size: i.size,
                quantity: i.quantity,
              })
            )
          );
        }
      });
  }, [phone]);

  const addToCart = async (product: Product) => {
    const variant = selected[product.id] || {
      color: product.colors[0],
      size: product.sizes[0],
    };
    if (phone) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          productId: product.id,
          color: variant.color,
          size: variant.size,
        }),
      });
    }
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.product.id === product.id &&
          c.color === variant.color &&
          c.size === variant.size
      );
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, ...variant, quantity: 1 }];
    });
  };

  const checkout = async () => {
    if (!phone || !cart.length) return;
    const res = await fetch("/api/checkout-from-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  };

  const signup = async () => {
    if (!phone) return;
    await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, email }),
    });
    setSignupOpen(false);
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0b141a] text-white pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#1f2c34] px-4 py-3">
        <h1 className="font-semibold">Sleek Catalogue</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="rounded-lg bg-white/10 p-2"
            aria-label="Sign up"
          >
            <UserPlus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-lg bg-brand-500 p-2 text-gray-950"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="bg-brand-500/10 border-b border-brand-500/20 px-4 py-3 text-sm text-brand-200">
        Free delivery on orders over ₦80,000 this week!
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="rounded-xl border border-white/5 bg-[#1f2c34] overflow-hidden"
          >
            <div className="relative h-36">
              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
            </div>
            <div className="p-3">
              <h2 className="text-sm font-medium truncate">{p.name}</h2>
              <p className="text-brand-400 text-sm font-semibold">{formatCurrency(p.price)}</p>
              <select
                className="mt-2 w-full rounded bg-[#2a3942] px-2 py-1 text-xs"
                value={selected[p.id]?.color || p.colors[0]}
                onChange={(e) =>
                  setSelected((s) => ({
                    ...s,
                    [p.id]: {
                      color: e.target.value,
                      size: s[p.id]?.size || p.sizes[0],
                    },
                  }))
                }
              >
                {p.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="mt-1 w-full rounded bg-[#2a3942] px-2 py-1 text-xs"
                value={selected[p.id]?.size || p.sizes[0]}
                onChange={(e) =>
                  setSelected((s) => ({
                    ...s,
                    [p.id]: {
                      color: s[p.id]?.color || p.colors[0],
                      size: e.target.value,
                    },
                  }))
                }
              >
                {p.sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    Size {sz}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addToCart(p)}
                className="mt-2 w-full rounded bg-brand-500 py-1.5 text-xs font-semibold text-gray-950"
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
          <div className="max-h-[80vh] rounded-t-2xl bg-[#1f2c34] p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Your cart</h2>
              <button type="button" onClick={() => setCartOpen(false)}>
                <X />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Cart is empty</p>
            ) : (
              <>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <div className="relative h-14 w-14 rounded overflow-hidden shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-400 text-xs">
                          {item.color}, {item.size} ×{item.quantity}
                        </p>
                        <p className="text-brand-400">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-bold">Total: {formatCurrency(cartTotal)}</p>
                <button
                  type="button"
                  onClick={checkout}
                  className="mt-4 w-full rounded-xl bg-brand-500 py-3 font-semibold text-gray-950"
                >
                  Checkout on WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {signupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1f2c34] p-6">
            <h2 className="text-lg font-semibold mb-4">Join Sleek</h2>
            <p className="text-sm text-gray-400 mb-4">
              Save your cart and get exclusive footwear promotions.
            </p>
            <input
              className="mb-2 w-full rounded-lg bg-[#2a3942] px-3 py-2 text-sm"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="mb-4 w-full rounded-lg bg-[#2a3942] px-3 py-2 text-sm"
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={signup}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-gray-950"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setSignupOpen(false)}
              className="mt-2 w-full text-sm text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <a
        href={getWhatsAppLink()}
        className="fixed bottom-4 right-4 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold shadow-lg"
      >
        Back to chat
      </a>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b141a] p-8 text-white">Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
