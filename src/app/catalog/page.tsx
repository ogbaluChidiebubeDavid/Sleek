"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  formatCurrency,
  getWhatsAppLink,
  getDirectImageUrl,
  getTelegramWebApp,
  closeTelegramApp,
} from "@/lib/utils";
import { ShoppingCart, X, UserPlus, Trash2, User } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
  starRating?: number;
};

// Swaps a failed product image (dead link, hotlink block) for a local
// placeholder so the card keeps rendering.
const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src.endsWith("/product-placeholder.svg")) return;
  img.onerror = null;
  img.src = "/product-placeholder.svg";
};

const getColorHex = (colorName: string) => {
  const name = colorName.trim().toLowerCase();
  switch (name) {
    case "red": return "#ef4444";
    case "black": return "#111827";
    case "white": return "#ffffff";
    case "blue": return "#3b82f6";
    case "green": return "#22c55e";
    case "grey":
    case "gray": return "#9ca3af";
    case "brown": return "#78350f";
    case "yellow": return "#eab308";
    case "orange": return "#f97316";
    case "pink": return "#ec4899";
    case "purple": return "#a855f7";
    case "beige": return "#f5f5dc";
    case "suede": return "#b45309";
    default: return "#4b5563";
  }
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const rawPhone = searchParams.get("phone") || "";
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [inTelegram, setInTelegram] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<
    { product: Product; color: string; size: string; quantity: number }[]
  >([]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Record<string, { color: string; size: string }>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });
  const [selectedCartKeys, setSelectedCartKeys] = useState<Set<string>>(new Set());
  const [signupError, setSignupError] = useState("");
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [accountReady, setAccountReady] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<
    { productId: string; color: string; size: string }[]
  >([]);

  // Telegram Mini App auth can take a moment; every cart/checkout
  // operation awaits this so nothing is sent without a valid token.
  const authPromiseRef = useRef<Promise<string>>(null as any);
  const ensureToken = (): Promise<string> => {
    if (token) return Promise.resolve(token);
    if (rawPhone) return Promise.resolve("");
    if (!authPromiseRef.current) {
      const tg = getTelegramWebApp();
      if (!tg) return Promise.resolve("");
      authPromiseRef.current = fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            setToken(data.token);
            setAccountReady(!!data.hasAccount);
            return data.token as string;
          }
          console.error("Telegram auth rejected:", data.error);
          return "";
        })
        .catch((e) => {
          console.error("Telegram auth failed:", e);
          return "";
        });
    }
    return authPromiseRef.current;
  };

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  // Telegram Mini App: authenticate the signed initData and obtain a
  // session token compatible with the existing phone/token flows.
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    setInTelegram(true);
    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.error("Telegram WebApp ready/expand failed:", e);
    }
    if (!token) ensureToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore the cart from a local backup so closing the webview doesn't
  // wipe it; the server cart (loaded below) is merged on top.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sleek_cart_backup");
      if (raw) {
        const backup = JSON.parse(raw);
        if (Array.isArray(backup) && backup.length) setCart(backup);
      }
    } catch (e) {
      console.error("Cart backup restore failed:", e);
    }
  }, []);

  const backupSkippedFirstWrite = useRef(false);
  useEffect(() => {
    // Never overwrite the backup with the initial empty cart before the
    // restore effect above has had a chance to run.
    if (!backupSkippedFirstWrite.current) {
      backupSkippedFirstWrite.current = true;
      return;
    }
    try {
      localStorage.setItem("sleek_cart_backup", JSON.stringify(cart));
    } catch (e) {
      /* storage full/blocked — cart still lives on the server */
    }
  }, [cart]);

  useEffect(() => {
    if (!token && !rawPhone) return;
    const query = token ? `token=${encodeURIComponent(token)}` : `phone=${encodeURIComponent(rawPhone)}`;
    fetch(`/api/cart?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.items?.length) return;
        const serverItems = data.items.map(
          (i: { product: Product; color: string; size: string; quantity: number }) => ({
            product: i.product,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
          })
        );
        setCart((prev) => {
          const byKey = new Map(prev.map((i) => [`${i.product.id}-${i.color}-${i.size}`, i]));
          for (const item of serverItems) {
            const key = `${item.product.id}-${item.color}-${item.size}`;
            const existing = byKey.get(key);
            byKey.set(key, existing && existing.quantity >= item.quantity ? existing : item);
          }
          return [...byKey.values()];
        });
      });
  }, [token, rawPhone]);

  // Whenever the cart loads, select all items by default if not already initialized
  useEffect(() => {
    if (cart.length > 0 && selectedCartKeys.size === 0) {
      const keys = new Set<string>();
      cart.forEach((item) => {
        keys.add(`${item.product.id}-${item.color}-${item.size}`);
      });
      setSelectedCartKeys(keys);
    }
  }, [cart, selectedCartKeys.size]);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3000);
  };

  const addToCart = async (product: Product, qty = 1) => {
    const variant = selected[product.id] || {
      color: product.colors[0],
      size: product.sizes[0],
    };
    const itemKey = `${product.id}-${variant.color}-${variant.size}`;

    const tok = await ensureToken();
    if (tok || rawPhone) {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tok ? { token: tok } : { phone: rawPhone }),
          productId: product.id,
          color: variant.color,
          size: variant.size,
          quantity: qty,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save cart item:", await res.text());
        showToast("Couldn't sync cart — please try again.");
        return;
      }
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
          c === existing ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [...prev, { product, ...variant, quantity: qty }];
    });

    setSelectedCartKeys((prev) => {
      const next = new Set(prev);
      next.add(itemKey);
      return next;
    });

    setQuantities((q) => ({ ...q, [product.id]: 1 }));
    showToast(`Added ${qty} × ${product.name} (${variant.color}, Size ${variant.size}) to cart!`);
  };

  // After an order is created: seamlessly navigate to the checkout page
  // without cross-channel redirects. Cart items are preserved until payment succeeds.
  const proceedToCheckoutUrl = (checkoutUrl: string) => {
    window.location.href = checkoutUrl;
  };

  const toggleSelectItem = (key: string) => {
    setSelectedCartKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updateCartItemQuantity = async (product: Product, color: string, size: string, newQty: number) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === product.id && item.color === color && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
    );

    const tok = await ensureToken();
    if (tok || rawPhone) {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tok ? { token: tok } : { phone: rawPhone }),
          productId: product.id,
          color,
          size,
          quantity: newQty,
        }),
      });
    }
  };

  const removeCartItem = async (product: Product, color: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === product.id && item.color === color && item.size === size)
      )
    );
    const key = `${product.id}-${color}-${size}`;
    setSelectedCartKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    const tok = await ensureToken();
    if (tok || rawPhone) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tok ? { token: tok } : { phone: rawPhone }),
          productId: product.id,
          color,
          size,
        }),
      });
    }
    showToast(`Removed ${product.name} from cart.`);
  };

  // Gate: Telegram users must complete signup before checking out
  const requireAccount = (): boolean => {
    if (inTelegram && !accountReady) {
      setSignupError("");
      setSignupOpen(true);
      showToast("Please create your account first to continue.");
      return false;
    }
    return true;
  };

  const checkout = async () => {
    const tok = await ensureToken();
    if ((!tok && !rawPhone) || !cart.length) return;

    const selectedLines = cart.filter((item) => {
      const key = `${item.product.id}-${item.color}-${item.size}`;
      return selectedCartKeys.has(key);
    });

    if (selectedLines.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    // Last-chance reminder before the order is created: the user can
    // still add forgotten items, or continue into the checkout window
    // (where selection can still be changed before paying).
    setPendingCheckout(
      selectedLines.map((item) => ({
        productId: item.product.id,
        color: item.color,
        size: item.size,
      }))
    );
    setConfirmCheckout(true);
  };

  const confirmAndCheckout = async () => {
    setConfirmCheckout(false);
    const tok = await ensureToken();
    if (!pendingCheckout.length) return;

    try {
      const res = await fetch("/api/checkout-from-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tok ? { token: tok } : { phone: rawPhone }),
          selectedItems: pendingCheckout,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        proceedToCheckoutUrl(data.checkoutUrl);
      } else {
        alert(data.error || "Failed to proceed to checkout.");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  const signup = async () => {
    const tok = await ensureToken();
    if (!tok && !rawPhone) return;
    if (!name.trim()) {
      setSignupError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSignupError("Please enter a valid email address.");
      return;
    }
    if (password.trim().length < 4) {
      setSignupError("Password must be at least 4 characters.");
      return;
    }
    setSignupSubmitting(true);
    setSignupError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tok ? { token: tok } : { phone: rawPhone }),
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAccountReady(true);
      setSignupOpen(false);
      showToast(
        data.walletAddress
          ? `Account ready! Your crypto wallet: ${data.walletAddress.slice(0, 8)}...${data.walletAddress.slice(-6)}`
          : "Welcome to Sleek! Your account is ready. 🎉"
      );
    } catch (err) {
      console.error("Signup failed:", err);
      setSignupError("Signup failed — please try again.");
    } finally {
      setSignupSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((s, i) => {
    const key = `${i.product.id}-${i.color}-${i.size}`;
    if (selectedCartKeys.has(key)) {
      return s + i.product.price * i.quantity;
    }
    return s;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0b141a] text-white pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#1f2c34] px-4 py-3">
        <Image
          src="/sleek-logo.png"
          alt="Sleek Catalogue"
          width={116}
          height={38}
          priority
          className="h-8 w-auto rounded-full bg-white px-2 py-0.5"
          unoptimized
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSignupError("");
              setSignupOpen(true);
            }}
            className={`relative rounded-lg p-2 transition-all ${
              accountReady
                ? "bg-[#25D366]/20 hover:bg-[#25D366]/30"
                : "bg-white/10 hover:bg-white/20"
            }`}
            aria-label={accountReady ? "Account" : "Sign up"}
            title={accountReady ? "You're signed in" : "Sign up"}
          >
            {accountReady ? (
              <User className="h-5 w-5 text-[#25D366]" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {accountReady && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#25D366]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-lg bg-[#25D366] p-2 text-gray-950 hover:bg-[#20ba56] transition-all"
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

      <div className="bg-[#25D366]/10 border-b border-[#25D366]/20 px-4 py-3 text-sm text-[#25D366] font-medium text-center">
        Free delivery on orders over ₦80,000 this week!
      </div>

      <div className="grid grid-cols-2 gap-3.5 p-4">
        {products.map((p) => {
          const variant = selected[p.id] || {
            color: p.colors[0],
            size: p.sizes[0],
          };
          const rating = p.starRating || 4.5;
          const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

          return (
            <article
              key={p.id}
              className="rounded-2xl border border-white/5 bg-[#1f2c34]/80 backdrop-blur-sm overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div className="relative h-40 bg-[#141d26]">
                <Image src={getDirectImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover transition-transform duration-300 hover:scale-105" unoptimized onError={onImgError} />
                
                {/* Brand Badge */}
                <span className="absolute left-2 top-2 rounded bg-[#0b141a]/85 border border-[#25D366]/30 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider text-[#25D366]">
                  SLEEK FOOTWEAR CO.
                </span>
              </div>
              
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-sm font-semibold text-white truncate">{p.name}</h2>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                    <div className="flex text-amber-400 text-[10px]">
                      {stars.map((filled, i) => (
                        <span key={i}>{filled ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">({rating.toFixed(1)})</span>
                  </div>
                  
                  <p className="text-[#25D366] text-sm font-bold">{formatCurrency(p.price)}</p>
                  
                  {/* Color Picker */}
                  <div className="mt-3">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Color</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.colors.map((c) => {
                        const isSelected = variant.color === c;
                        const hex = getColorHex(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelected((s) => ({
                              ...s,
                              [p.id]: { color: c, size: s[p.id]?.size || p.sizes[0] }
                            }))}
                            className={`h-5 w-5 rounded-full border transition-all ${
                              isSelected 
                                ? 'border-[#25D366] ring-1 ring-[#25D366] scale-110' 
                                : 'border-white/10 opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={c}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Size Picker */}
                  <div className="mt-3">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Size</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.sizes.map((sz) => {
                        const isSelected = variant.size === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelected((s) => ({
                              ...s,
                              [p.id]: { color: s[p.id]?.color || p.colors[0], size: sz }
                            }))}
                            className={`h-7 w-8 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-[#25D366] text-gray-950 border-[#25D366]' 
                                : 'bg-[#2a3942] text-white border-white/5 hover:border-white/20'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-3">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Quantity</label>
                    <div className="flex items-center gap-3 mt-1 bg-[#2a3942] rounded-lg w-max px-2.5 py-1 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setQuantities((q) => ({ ...q, [p.id]: Math.max(1, (q[p.id] || 1) - 1) }))}
                        className="text-gray-400 hover:text-white px-1.5 py-0.5 text-xs font-extrabold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">
                        {quantities[p.id] || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantities((q) => ({ ...q, [p.id]: (q[p.id] || 1) + 1 }))}
                        className="text-gray-400 hover:text-white px-1.5 py-0.5 text-xs font-extrabold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => addToCart(p, quantities[p.id] || 1)}
                    className="flex-1 rounded-xl bg-[#2a3942] hover:bg-[#374248] py-2 text-xs font-bold text-white border border-white/5 transition-all active:scale-95"
                  >
                    + Cart
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const qty = quantities[p.id] || 1;
                      const variant = selected[p.id] || {
                        color: p.colors[0],
                        size: p.sizes[0],
                      };
                      await addToCart(p, qty);
                      const tok = await ensureToken();
                      try {
                        const res = await fetch("/api/checkout-from-catalog", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...(tok ? { token: tok } : { phone: rawPhone }),
                            selectedItems: [
                              { productId: p.id, color: variant.color, size: variant.size }
                            ]
                          }),
                        });
                        const data = await res.json();
                        if (data.checkoutUrl) {
                          proceedToCheckoutUrl(data.checkoutUrl);
                        } else {
                          alert(data.error || "Failed to proceed to checkout.");
                        }
                      } catch (err) {
                        console.error("Checkout failed:", err);
                        alert("Checkout failed. Please try again.");
                      }
                    }}
                    className="flex-1 rounded-xl bg-[#25D366] hover:bg-[#20ba56] py-2 text-xs font-extrabold text-gray-950 transition-all active:scale-95 shadow-md shadow-[#25D366]/10"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
          <div className="max-h-[80vh] rounded-t-2xl bg-[#1f2c34] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="font-semibold">Your cart</h2>
              <button type="button" onClick={() => setCartOpen(false)}>
                <X />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Cart is empty</p>
            ) : (
              <div className="flex flex-col overflow-y-auto max-h-[60vh] gap-4">
                <ul className="space-y-3.5">
                  {cart.map((item, idx) => {
                    const key = `${item.product.id}-${item.color}-${item.size}`;
                    const isSelected = selectedCartKeys.has(key);
                    return (
                      <li key={idx} className="flex items-center gap-3 text-sm border-b border-white/5 pb-3.5">
                        {/* Checkbox for selective payment */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(key)}
                          className="h-4 w-4 rounded border-white/10 bg-[#2a3942] text-[#25D366] focus:ring-0 shrink-0 accent-[#25D366]"
                        />

                        {/* Image */}
                        <div className="relative h-14 w-14 rounded overflow-hidden shrink-0 bg-[#141d26]">
                          <Image
                            src={getDirectImageUrl(item.product.imageUrl)}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                            onError={onImgError}
                          />
                        </div>

                        {/* Details & Operations */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{item.product.name}</p>
                          <p className="text-gray-400 text-xs">
                            {item.color}, Size {item.size}
                          </p>
                          <p className="text-[#25D366] font-bold mt-0.5">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Quantity Changer */}
                            <div className="flex items-center bg-[#2a3942] rounded-md px-1.5 py-0.5 border border-white/5 w-max">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.product, item.color, item.size, item.quantity - 1)}
                                className="text-gray-400 hover:text-white px-1.5 py-0.5 text-xs font-extrabold"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.product, item.color, item.size, item.quantity + 1)}
                                className="text-gray-400 hover:text-white px-1.5 py-0.5 text-xs font-extrabold"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeCartItem(item.product, item.color, item.size)}
                              className="text-red-400 hover:text-red-300 p-1 ml-auto"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="pt-2">
                  <p className="font-bold text-base">Total: {formatCurrency(cartTotal)}</p>
                  <button
                    type="button"
                    onClick={checkout}
                    className="mt-4 w-full rounded-xl bg-[#25D366] hover:bg-[#20ba56] py-3.5 font-extrabold text-gray-950 transition shadow-lg shadow-[#25D366]/10 active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {signupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1f2c34] p-6">
            <h2 className="text-lg font-semibold mb-4">Join Sleek</h2>
            <p className="text-sm text-gray-400 mb-4">
              Create your account to save your cart, get a crypto wallet, and track orders.
            </p>
            <input
              className="mb-2 w-full rounded-lg bg-[#2a3942] px-3 py-2 text-sm"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="mb-2 w-full rounded-lg bg-[#2a3942] px-3 py-2 text-sm"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="mb-2 w-full rounded-lg bg-[#2a3942] px-3 py-2 text-sm"
              placeholder="Password (your checkout PIN)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {signupError && (
              <p className="mb-2 text-xs text-red-400">{signupError}</p>
            )}
            <button
              type="button"
              onClick={signup}
              disabled={signupSubmitting}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-gray-950 disabled:opacity-60"
            >
              {signupSubmitting ? "Creating account..." : "Sign up"}
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

      {confirmCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1f2c34] p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Almost there! 🛒</h2>
            <p className="text-sm text-gray-300 mb-1">
              You&apos;re checking out{" "}
              <span className="font-semibold text-white">
                {pendingCheckout.length} item{pendingCheckout.length > 1 ? "s" : ""}
              </span>{" "}
              for{" "}
              <span className="font-bold text-[#25D366]">{formatCurrency(cartTotal)}</span>.
            </p>
            <p className="text-xs text-gray-500 mb-5">
              Forgot to add something? You can add more items now — and you can still
              adjust your selection on the checkout page before paying.
            </p>
            <button
              type="button"
              onClick={confirmAndCheckout}
              className="w-full rounded-xl bg-[#25D366] py-3.5 font-extrabold text-gray-950 transition active:scale-[0.98]"
            >
              Continue to Checkout
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmCheckout(false);
                setCartOpen(false);
              }}
              className="mt-2 w-full rounded-xl bg-white/10 hover:bg-white/20 py-3 text-sm font-semibold transition"
            >
              + Add More Items
            </button>
            <button
              type="button"
              onClick={() => setConfirmCheckout(false)}
              className="mt-2 w-full text-sm text-gray-400"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {inTelegram || token ? (
        <button
          type="button"
          onClick={closeTelegramApp}
          className="fixed bottom-4 right-4 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] px-4 py-3 text-sm font-semibold shadow-lg text-white transition flex items-center gap-2"
        >
          Back to Telegram
        </button>
      ) : rawPhone && !rawPhone.startsWith("tg:") ? (
        <a
          href={getWhatsAppLink()}
          className="fixed bottom-4 right-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] px-4 py-3 text-sm font-semibold shadow-lg text-white transition flex items-center gap-2"
        >
          Back to WhatsApp
        </a>
      ) : null}

      {/* Elegant toast notification overlay */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl bg-[#1f2c34] border border-[#25D366]/30 px-5 py-3.5 text-sm text-white shadow-2xl shadow-black/80 transition-all duration-300 transform translate-y-0 opacity-100 font-medium">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-gray-950 font-black text-[10px]">
            ✓
          </div>
          <span>{toast.message}</span>
        </div>
      )}
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
