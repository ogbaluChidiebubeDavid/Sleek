"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { formatCurrency, getTelegramWebApp, closeTelegramApp } from "@/lib/utils";
import {
  Wallet,
  Key,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  User,
  Mail,
  MapPin,
  Loader2,
  Lock,
  Phone,
  CreditCard,
  Star,
} from "lucide-react";
import { ethers } from "ethers";

type OrderItem = {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  product: {
    vendor: {
      walletAddress: string;
      businessName: string;
    } | null;
  };
};

type Order = {
  id: string;
  trackingNumber: string;
  totalAmount: number;
  paymentStatus: string;
  items: OrderItem[];
  user: {
    phone: string;
    email: string | null;
    name: string | null;
    password: string | null;
    shippingPhone: string | null;
    shippingName: string | null;
    shippingEmail: string | null;
    shippingAddress: string | null;
    shippingCity: string | null;
    shippingCountry: string | null;
    walletAddress: string | null;
    walletPrivateKey: string | null;
  };
};

// NGN value of 1 ETH used to quote crypto prices (env-configurable).
const ETH_RATE_NGN = Number(process.env.NEXT_PUBLIC_ETH_RATE_NGN) || 4500000;
// Platform fee taken on crypto payments: 0.5% to the platform wallet,
// the rest to the vendor. Set NEXT_PUBLIC_PLATFORM_WALLET to the
// platform's receiving address on Base.
const PLATFORM_FEE_BPS = 50; // basis points (50 = 0.5%)
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET || "";
// Real funds by default: Base mainnet. Set NEXT_PUBLIC_RPC_URL to a
// Sepolia RPC to go back to testnet.
const PUBLIC_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org";
const IS_TESTNET = PUBLIC_RPC.includes("sepolia");
const BASESCAN = `${IS_TESTNET ? "sepolia." : ""}basescan.org`;
// The split-payment router is only deployed on Sepolia. On mainnet we
// pay the vendor directly unless NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS
// points at a mainnet deployment.
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS ||
  (IS_TESTNET ? "0x9c32A15535C578c7F2B75A57CD7E44243F7BEc5e" : "");
const CONTRACT_ABI = [
  "function pay(address payable vendor, string calldata orderId) external payable",
];

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const phone = searchParams.get("phone") || "";
  const tokenParam = searchParams.get("token") || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Onboarding & Login states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Shipping & Signup Info
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [password, setPassword] = useState(""); // PIN for new users
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");

  // Wallet states
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [ethBalance, setEthBalance] = useState("0.0");
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  // Payment execution states
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "signing" | "broadcasting" | "confirming" | "completing" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Step state: 'shipping' or 'payment'
  const [step, setStep] = useState<"shipping" | "payment">("shipping");

  // Payment method chooser
  const [method, setMethod] = useState<"crypto" | "paystack" | "stars">("crypto");
  const [inTelegram, setInTelegram] = useState(false);
  const [altPaying, setAltPaying] = useState(false);

  useEffect(() => {
    setInTelegram(!!getTelegramWebApp());
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        // Guard against error payloads (e.g. /checkout/demo) that lack items
        if (!data || !Array.isArray(data.items)) {
          setOrder(null);
          setLoading(false);
          return;
        }
        setOrder(data);
        if (data.user) {
          setShippingName(data.user.shippingName || data.user.name || "");
          setShippingEmail(data.user.shippingEmail || data.user.email || "");
          setShippingPhone(data.user.shippingPhone || data.user.phone || "");
          setShippingAddress(data.user.shippingAddress || "");
          setShippingCity(data.user.shippingCity || "");
          setShippingCountry(data.user.shippingCountry || "Nigeria");

          // Existing users go straight to the payment chooser — the PIN
          // is only requested when they choose to pay with crypto.
          if (data.user.password) {
            // Address + balance are safe to show pre-auth; the private key
            // stays locked until the PIN is verified at crypto checkout.
            if (data.user.walletAddress) {
              setWalletAddress(data.user.walletAddress);
              checkBalance(data.user.walletAddress);
            }
            setStep("payment");
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
        setLoading(false);
      });
  }, [orderId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const generateWallet = () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setEthBalance("0.0");
      return wallet;
    } catch (e) {
      console.error("Failed to generate wallet:", e);
      return null;
    }
  };

  const checkBalance = async (addressToCheck = walletAddress) => {
    if (!addressToCheck) return;
    setIsCheckingBalance(true);
    try {
      const provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
      const bal = await provider.getBalance(addressToCheck);
      setEthBalance(ethers.formatEther(bal));
    } catch (e) {
      console.error("Failed to check balance:", e);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleRequestFaucet = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    try {
      const r = await fetch("/api/payments/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });
      const data = await r.json();
      if (data.success) {
        setTimeout(() => checkBalance(walletAddress), 2000);
      } else {
        alert(data.error || "Faucet limit reached. Please fund externally.");
      }
    } catch (e) {
      console.error("Faucet request error:", e);
      alert("Faucet request failed. Please try again.");
    } finally {
      setIsFunding(false);
    }
  };

  const handleUnlock = () => {
    if (!order?.user) return;
    setPinError("");

    if (pinInput === order.user.password) {
      setIsUnlocked(true);
      if (order.user.walletAddress && order.user.walletPrivateKey) {
        setWalletAddress(order.user.walletAddress);
        setPrivateKey(order.user.walletPrivateKey);
        checkBalance(order.user.walletAddress);
      }
    } else {
      setPinError("Invalid Password PIN. Please try again.");
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingEmail || !shippingPhone || !password || !shippingAddress || !shippingCity || !shippingCountry) {
      alert("Please fill all onboarding and shipping details.");
      return;
    }
    // Generate a fresh wallet for new user onboarding
    const newWallet = generateWallet();
    if (newWallet) {
      setStep("payment");
    }
  };

  // Persist shipping details before redirecting to an external/alternative
  // payment method (Paystack, Telegram Stars) — those paths don't pass
  // through crypto-complete where shipping is normally saved.
  const saveShipping = async () => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tokenParam ? { token: tokenParam } : { phone }),
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingCountry,
          password: password || undefined,
        }),
      });
    } catch (err) {
      console.error("Saving shipping details failed:", err);
    }
  };

  const payWithPaystack = async () => {
    if (!order) return;
    setAltPaying(true);
    await saveShipping();
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          provider: "paystack",
          email: shippingEmail || order.user.email || "",
        }),
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return; // page navigates away
      }
      alert(
        data.error ||
          "Could not start Paystack checkout. Check that PAYSTACK_SECRET_KEY is configured."
      );
    } catch (err) {
      console.error("Paystack init failed:", err);
      alert("Paystack checkout failed. Please try again.");
    }
    setAltPaying(false);
  };

  const payWithTelegramStars = async () => {
    const tg = getTelegramWebApp();
    if (!tg || !order) return;
    setAltPaying(true);
    await saveShipping();
    try {
      const res = await fetch("/api/payments/telegram-stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!data.invoiceLink) {
        alert(data.error || "Could not create Telegram invoice.");
        setAltPaying(false);
        return;
      }
      tg.openInvoice(data.invoiceLink, (status: string) => {
        if (status === "paid") {
          router.push(`/checkout/success?orderId=${orderId}`);
        } else {
          if (status === "failed") alert("Payment failed. Please try again.");
          setAltPaying(false);
        }
      });
    } catch (err) {
      console.error("Telegram Stars init failed:", err);
      alert("Telegram payment failed. Please try again.");
      setAltPaying(false);
    }
  };

  const executePayment = async () => {
    if (!order) return;

    // Group the order into per-recipient payouts: every vendor gets the
    // (fee-free) value of their own items; items without a vendor are
    // platform-sold and go to the platform wallet.
    const payouts = new Map<string, number>();
    for (const item of order.items) {
      const vendorAddress = item.product?.vendor?.walletAddress;
      const recipient =
        vendorAddress || (PLATFORM_WALLET ? PLATFORM_WALLET : null);
      if (!recipient) {
        alert("Vendor wallet address not found. Contact support.");
        return;
      }
      payouts.set(recipient, (payouts.get(recipient) || 0) + item.price * item.quantity);
    }

    const priceInEth = (order.totalAmount / ETH_RATE_NGN).toFixed(6);

    if (parseFloat(ethBalance) < parseFloat(priceInEth)) {
      // Surfaced by guardrail UI, but checked as a safety backup here too
      return;
    }

    setPaymentStatus("signing");
    setErrorMessage("");

    try {
      const provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
      const userWallet = new ethers.Wallet(privateKey, provider);

      setPaymentStatus("broadcasting");
      const totalWei = ethers.parseEther(priceInEth);

      // 0.5% platform fee is deducted from vendor-owned amounts only.
      const feeWeiOf = (wei: bigint, isPlatform: boolean) =>
        !isPlatform && PLATFORM_WALLET && wei > BigInt(10000)
          ? (wei * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000)
          : BigInt(0);

      let tx;
      if (CONTRACT_ADDRESS) {
        // Split-payment router handles the fee split on-chain.
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userWallet);
        tx = await contract.pay(payouts.keys().next().value, orderId, {
          value: totalWei,
        });
      } else {
        // No router on this network — pay every recipient directly:
        // each vendor their share minus the 0.5% fee, the platform its
        // own sales plus the collected fees.
        let lastTx;
        let distributed = BigInt(0);
        for (const [recipient, ngnAmount] of payouts) {
          if (!ethers.isAddress(recipient)) {
            throw new Error(`Invalid recipient address: ${recipient}`);
          }
          const grossWei = ethers.parseEther(
            (ngnAmount / ETH_RATE_NGN).toFixed(6)
          );
          const netWei = grossWei - feeWeiOf(grossWei, recipient === PLATFORM_WALLET);
          if (netWei <= BigInt(0)) continue;
          const vendorTx = await userWallet.sendTransaction({
            to: recipient,
            value: netWei,
          });
          await vendorTx.wait();
          distributed += netWei;
          lastTx = vendorTx;
        }
        // Anything lost to wei-level rounding goes to the platform.
        const dust = totalWei - distributed;
        if (dust > BigInt(10000) && PLATFORM_WALLET && ethers.isAddress(PLATFORM_WALLET)) {
          const dustTx = await userWallet.sendTransaction({
            to: PLATFORM_WALLET,
            value: dust,
          });
          await dustTx.wait();
        }
        tx = lastTx!;
      }

      setPaymentStatus("confirming");
      setTxHash(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("On-chain transaction reverted by EVM.");
      }

      setPaymentStatus("completing");
      const completeRes = await fetch("/api/payments/crypto-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          txHash: tx.hash,
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingCountry,
          userWalletAddress: walletAddress,
          userPrivateKey: privateKey,
          password: order?.user?.password ? order.user.password : password,
        }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completeData.error || "Failed to finalize order on server.");
      }

      setPaymentStatus("success");

      // Auto-exit webview: return to the Telegram chat when running as a
      // Telegram Mini App, otherwise deep-link back to the WhatsApp chat
      if (getTelegramWebApp()) {
        closeTelegramApp();
      } else {
        const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348146272564";
        const deepLink = `whatsapp://send?phone=${waNumber}&text=track%20${order.trackingNumber}`;

        try {
          window.location.href = deepLink;
        } catch (err) {
          console.error("Deep link redirect failed:", err);
        }
      }

      // Proceed to success page as a secondary backup/confirmation view
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${orderId}`);
      }, 800);
    } catch (error: any) {
      console.error("[Checkout Payment Error]", error);
      setPaymentStatus("error");
      setErrorMessage(error.reason || error.message || "An unknown error occurred during transaction execution.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-[#00c980] animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading checkout details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-6 text-center">
        <div>
          <p className="text-red-400 font-bold mb-2">Order Not Found</p>
          <p className="text-gray-500 text-sm">Verify your checkout link or contact support.</p>
        </div>
      </div>
    );
  }

  const isNewUser = !order.user?.password;
  const priceInEth = (order.totalAmount / ETH_RATE_NGN).toFixed(6);
  const isInsufficientFunds = parseFloat(ethBalance) < parseFloat(priceInEth);

  return (
    <div className="min-h-screen bg-[#070b0e] text-white px-4 py-8 max-w-lg mx-auto flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <span className="inline-flex h-8 items-center overflow-hidden rounded-full bg-white px-2">
                <Image src="/sleek-logo.png" alt="Sleek" width={875} height={285} className="h-4.5 w-auto object-contain" />
              </span>
              <span className="bg-gradient-to-r from-[#00c980] to-[#059669] bg-clip-text text-transparent">
                Checkout
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Ref: {order.trackingNumber}
            </p>
          </div>
          <span className="rounded-full bg-[#00c980]/10 px-3 py-1 text-xs text-[#00c980] font-medium border border-[#00c980]/20">
            {IS_TESTNET ? "Base Sepolia" : "Base Mainnet"}
          </span>
        </div>

        {/* Footwear Order Summary */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mb-6 backdrop-blur-md">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your Order
          </h2>
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.color} • Size {item.size} • Qty {item.quantity}
                  </p>
                </div>
                <span className="font-medium text-gray-300">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between font-semibold pt-3 border-t border-white/5">
              <span className="text-white">Total Amount</span>
              <div className="text-right">
                <p className="text-[#00c980] font-bold">{formatCurrency(order.totalAmount)}</p>
                <p className="text-xs text-gray-400 font-mono">{priceInEth} ETH</p>
              </div>
            </li>
            {method === "crypto" && PLATFORM_WALLET && (
              <li className="flex justify-between text-[11px] text-gray-500">
                <span>Includes 0.5% platform fee</span>
                <span>{formatCurrency(order.totalAmount * 0.005)}</span>
              </li>
            )}
          </ul>
        </div>

        {/* STEP 1: SIGNUP & ONBOARDING (New User) — existing users skip
            straight to the payment chooser below. */}
        {isNewUser && step === "shipping" && (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#00c980]" /> Create Smart Account & Shipping
            </h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="April O'Neil"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="april@footwear.com"
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Shipping Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                Password PIN (For subsequent transaction verification)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Set a secure checkout PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Street Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="12 Main Street, Ikeja"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                />
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">City</label>
                <input
                  type="text"
                  required
                  placeholder="Lagos"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:border-[#00c980] outline-none transition text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Country</label>
                <input
                  type="text"
                  required
                  placeholder="Nigeria"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:border-[#00c980] outline-none transition text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 rounded-xl bg-[#00c980] py-3.5 font-bold text-white text-sm hover:bg-[#059669] transition shadow-lg shadow-[#00c980]/20 active:scale-[0.98]"
            >
              Generate Smart Wallet & Pay
            </button>
          </form>
        )}

        {/* STEP 2: WALLET CREATION & ON-CHAIN PAYMENT */}
        {step === "payment" && (
          <div className="space-y-6">
            {/* PAYMENT METHOD CHOOSER */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Choose how to pay
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setMethod("crypto")}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    method === "crypto"
                      ? "border-[#00c980] bg-[#00c980]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <Wallet className="h-5 w-5 mb-1.5 text-[#00c980]" />
                  <p className="text-xs font-bold text-white">Crypto Wallet</p>
                  <p className="text-[10px] text-gray-400">ETH on Base</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("paystack")}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    method === "paystack"
                      ? "border-[#00c980] bg-[#00c980]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1.5 text-[#0ba4db]" />
                  <p className="text-xs font-bold text-white">Paystack</p>
                  <p className="text-[10px] text-gray-400">Card • Transfer • USSD</p>
                </button>
                {inTelegram && (
                  <button
                    type="button"
                    onClick={() => setMethod("stars")}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      method === "stars"
                        ? "border-[#00c980] bg-[#00c980]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    }`}
                  >
                    <Star className="h-5 w-5 mb-1.5 text-[#2AABEE]" />
                    <p className="text-xs font-bold text-white">Telegram Stars</p>
                    <p className="text-[10px] text-gray-400">Pay from Telegram</p>
                  </button>
                )}
              </div>
            </div>

            {method === "paystack" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#0ba4db]" /> Paystack Checkout
                </h3>
                <p className="text-xs text-gray-400">
                  Pay {order ? formatCurrency(order.totalAmount) : ""} in Naira with card,
                  bank transfer, or USSD. You&apos;ll be redirected to Paystack&apos;s secure page and
                  returned here after payment.
                </p>
                <button
                  type="button"
                  onClick={payWithPaystack}
                  disabled={altPaying}
                  className="w-full rounded-xl bg-[#0ba4db] py-3.5 font-bold text-white text-sm hover:bg-[#0990c2] transition disabled:opacity-50 shadow-lg shadow-[#0ba4db]/20"
                >
                  {altPaying ? "Redirecting..." : `Pay ${order ? formatCurrency(order.totalAmount) : ""} with Paystack`}
                </button>
              </div>
            )}

            {method === "stars" && inTelegram && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#2AABEE]" /> Telegram Stars
                </h3>
                <p className="text-xs text-gray-400">
                  Pay instantly with the Stars balance in your Telegram account — no card
                  or wallet needed. Telegram handles the payment natively.
                </p>
                <button
                  type="button"
                  onClick={payWithTelegramStars}
                  disabled={altPaying}
                  className="w-full rounded-xl bg-[#2AABEE] py-3.5 font-bold text-white text-sm hover:bg-[#229ED9] transition disabled:opacity-50 shadow-lg shadow-[#2AABEE]/20"
                >
                  {altPaying ? "Opening invoice..." : "Pay with Telegram Stars"}
                </button>
              </div>
            )}

            {/* Crypto requires the wallet PIN to authorize the on-chain
                transaction — other payment methods don't. */}
            {method === "crypto" && !isNewUser && !isUnlocked && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#00c980]" /> Authorize Crypto Payment
                </h3>
                <p className="text-xs text-gray-400">
                  Enter your password PIN to unlock your wallet and confirm this transaction.
                </p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password PIN</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Enter your PIN password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 pl-10 text-sm focus:border-[#00c980] outline-none transition text-white"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                {pinError && (
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> {pinError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="w-full mt-2 rounded-xl bg-[#00c980] py-3.5 font-bold text-white text-sm hover:bg-[#059669] transition shadow-lg shadow-[#00c980]/20 active:scale-[0.98]"
                >
                  Verify PIN & Unlock Wallet
                </button>
              </div>
            )}

            {method === "crypto" && (isNewUser || isUnlocked) && (
            <>
            {/* BALANCE GUARDRAIL - INSUFFICIENT FUNDS PANEL */}
            {isInsufficientFunds ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Insufficient Funds - Please top up your wallet</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Your wallet balance is lower than the total checkout cost of <strong>{priceInEth} ETH</strong>. Transfer funds or request test tokens below.
                    </p>
                  </div>
                </div>

                {/* Top Up Details & QR code */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 text-center space-y-4">
                  <div className="flex justify-center bg-white p-2 rounded-xl w-36 h-36 mx-auto shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=070b0e&data=${walletAddress}`}
                      alt="Wallet Address QR"
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  </div>

                  <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                        Funding Address ({IS_TESTNET ? "Base Sepolia" : "Base Mainnet"})
                      </span>
                    <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5">
                      <span className="text-xs font-mono text-[#00c980] truncate mr-2 select-all">
                        {walletAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(walletAddress, "addr")}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied["addr"] ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="text-left">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Current Balance</span>
                      <p className="text-lg font-bold font-mono text-white">{ethBalance} ETH</p>
                    </div>
                    <div className="flex gap-2">
                      {IS_TESTNET && (
                      <button
                        type="button"
                        onClick={() => handleRequestFaucet()}
                        disabled={isFunding}
                        className="rounded-lg bg-[#00c980]/15 border border-[#00c980]/30 px-3 py-1.5 text-xs text-[#00c980] font-semibold hover:bg-[#00c980]/30 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isFunding && <Loader2 className="h-3 w-3 animate-spin text-[#00c980]" />}
                        Get Faucet ETH
                      </button>
                      )}
                      <button
                        type="button"
                        onClick={() => checkBalance()}
                        disabled={isCheckingBalance}
                        className="rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 hover:text-white transition disabled:opacity-50"
                        aria-label="Refresh balance"
                      >
                        <RefreshCw className={`h-4 w-4 ${isCheckingBalance ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isNewUser) {
                        setStep("shipping");
                      } else {
                        setIsUnlocked(false);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 py-3.5 text-sm font-semibold hover:bg-white/5 transition text-center"
                  >
                    Back to Info
                  </button>
                  <button
                    type="button"
                    onClick={() => checkBalance()}
                    className="flex-1 rounded-xl bg-[#00c980] py-3.5 font-bold text-white text-sm hover:bg-[#059669] transition text-center shadow-lg shadow-[#00c980]/20"
                  >
                    Refresh Balance
                  </button>
                </div>
              </div>
            ) : (
              // BALANCES ARE SUFFICIENT - PROCEED TO TRANSACTION ROUTING
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#00c980]" /> Privy/Dynamic Embedded Wallet
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Your email-linked smart account has been dynamically initialized on {IS_TESTNET ? "Base Sepolia (testnet)" : "Base Mainnet"}.
                  </p>

                  {/* Wallet Info Card */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 space-y-4">
                    {/* Wallet Address */}
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                        Wallet Address
                      </span>
                      <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5">
                        <span className="text-xs font-mono text-[#00c980] truncate mr-2 select-all">
                          {walletAddress}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(walletAddress, "addr")}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied["addr"] ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Private Key - Keep Safe warnings */}
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                        Private Key
                      </span>
                      <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5">
                        <span className="text-xs font-mono text-gray-400 truncate mr-2">
                          {showPrivateKey ? privateKey : "••••••••••••••••••••••••••••••••••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 font-semibold"
                        >
                          {showPrivateKey ? "Hide" : "Reveal"}
                        </button>
                      </div>
                      {showPrivateKey && (
                        <div className="mt-2 flex gap-2 items-start rounded-lg bg-red-950/20 border border-red-500/20 p-2.5 text-[10px] text-red-300">
                          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          <p>
                            Keep this private key secure! It holds your actual cryptocurrency funds. Do not share it with anyone.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Balance Info */}
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">
                          Live Balance
                        </span>
                        <p className="text-2xl font-bold font-mono text-white">
                          {ethBalance} <span className="text-xs text-gray-400 font-sans">ETH</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {IS_TESTNET && (
                        <button
                          type="button"
                          onClick={() => handleRequestFaucet()}
                          disabled={isFunding}
                          className="rounded-lg bg-[#00c980]/15 border border-[#00c980]/30 px-3 py-1.5 text-xs text-[#00c980] font-semibold hover:bg-[#00c980]/30 transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isFunding && <Loader2 className="h-3 w-3 animate-spin text-[#00c980]" />}
                          Get Faucet ETH
                        </button>
                        )}
                        <button
                          type="button"
                          onClick={() => checkBalance()}
                          disabled={isCheckingBalance}
                          className="rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 hover:text-white transition disabled:opacity-50"
                          aria-label="Refresh balance"
                        >
                          <RefreshCw className={`h-4 w-4 ${isCheckingBalance ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funding Instructions */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-xs text-gray-400 space-y-2">
                  <h4 className="font-semibold text-gray-300">How to pay:</h4>
                  <p>
                    Your wallet balance is fully funded. Click the button below to authorize the routing contract to deduct the 0.5% platform fee and send the remaining 99.5% to the vendor(s) on-chain.
                  </p>
                </div>

                {/* Payment Actions / Loader states */}
                <div className="space-y-4">
                  {paymentStatus === "idle" ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isNewUser) {
                            setStep("shipping");
                          } else {
                            setIsUnlocked(false);
                          }
                        }}
                        className="rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={executePayment}
                        className="flex-1 rounded-xl bg-[#00c980] py-3.5 font-bold text-white text-sm hover:bg-[#059669] transition text-center shadow-lg shadow-[#00c980]/20"
                      >
                        Authorize & Pay {priceInEth} ETH
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-[#0c1217] p-5 text-center space-y-4">
                      {paymentStatus !== "success" && paymentStatus !== "error" && (
                        <Loader2 className="h-8 w-8 text-[#00c980] animate-spin mx-auto" />
                      )}

                      {paymentStatus === "signing" && (
                        <p className="text-sm text-gray-300">Preparing transaction details and signing transaction...</p>
                      )}
                      {paymentStatus === "broadcasting" && (
                        <p className="text-sm text-gray-300">Broadcasting transaction to the Base blockchain...</p>
                      )}
                      {paymentStatus === "confirming" && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300">Waiting for on-chain block confirmations...</p>
                          <a
                            href={`https://${BASESCAN}/tx/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#00c980] font-mono hover:underline inline-block truncate max-w-xs"
                          >
                            Tx: {txHash}
                          </a>
                        </div>
                      )}
                      {paymentStatus === "completing" && (
                        <p className="text-sm text-gray-300">Syncing with server, dispatching WhatsApp & HTML Email receipts...</p>
                      )}

                      {paymentStatus === "error" && (
                        <div className="space-y-3">
                          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                          <p className="text-sm font-bold text-red-400">Transaction Failed</p>
                          <p className="text-xs text-gray-500 max-h-24 overflow-y-auto font-mono text-left bg-black/40 p-2.5 rounded border border-white/5">
                            {errorMessage}
                          </p>
                          <button
                            type="button"
                            onClick={() => setPaymentStatus("idle")}
                            className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20 transition"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            </>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-gray-600 mt-8 border-t border-white/5 pt-4">
        <p className="flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" /> Secure End-to-End Encryption
        </p>
        <p className="mt-1">
          Sleek split payment router • Platform fee: 0.5% • Settlement: 99.5% vendor(s).
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b0e] text-white flex items-center justify-center">
          Loading checkout content...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
