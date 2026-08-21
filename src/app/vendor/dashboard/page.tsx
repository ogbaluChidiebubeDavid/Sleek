"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShoppingBag,
  TrendingUp,
  Wallet,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  LogOut,
  ExternalLink,
  ChevronRight,
  Loader2,
  Lock,
  Copy,
  Check,
  ChevronDown,
  Landmark,
  Building2,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SleekLogo } from "@/components/brand/SleekLogo";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
};

type OrderItem = {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  txHash: string | null;
  totalAmount: number;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  createdAt: string;
  items: OrderItem[];
};

export default function VendorDashboard() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  
  // Dashboard states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New product form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductColors, setNewProductColors] = useState("Black, White, Blue");
  const [newProductSizes, setNewProductSizes] = useState("40, 41, 42, 43, 44");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Withdraw Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null);

  // Bank Account & Paystack Payout states
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankVerifyError, setBankVerifyError] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);

  // Copy & Dropdown states
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  useEffect(() => {
    // Authenticate using localStorage
    const savedId = localStorage.getItem("sleek_vendor_id");
    if (!savedId) {
      router.push("/vendor/signup");
      return;
    }
    setVendorId(savedId);
    fetchData(savedId);

    // Fetch Nigerian banks list
    fetch("/api/vendor/banks")
      .then((r) => r.json())
      .then((data) => {
        if (data.banks && Array.isArray(data.banks)) {
          setBanks(data.banks);
        }
      })
      .catch((e) => console.error("Failed to load bank list:", e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyBank = async () => {
    if (!selectedBankCode || bankAccountNumber.trim().length !== 10) {
      setBankVerifyError("Please select a bank and enter a valid 10-digit account number.");
      return;
    }
    setIsVerifyingBank(true);
    setBankVerifyError("");
    setVerifiedAccountName("");
    try {
      const res = await fetch("/api/vendor/verify-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: bankAccountNumber.trim(),
          bankCode: selectedBankCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.accountName) {
        setVerifiedAccountName(data.accountName);
      } else {
        setBankVerifyError(data.error || "Could not verify bank account.");
      }
    } catch (err: any) {
      setBankVerifyError("Bank verification request failed.");
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !selectedBankCode || !bankAccountNumber || !verifiedAccountName) {
      alert("Please verify your account name before saving.");
      return;
    }
    const bankObj = banks.find((b) => b.code === selectedBankCode);
    const bankName = bankObj?.name || "Nigerian Bank";
    setIsSavingBank(true);
    setBankSaveSuccess("");
    try {
      const res = await fetch("/api/vendor/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          bankName,
          bankCode: selectedBankCode,
          accountNumber: bankAccountNumber.trim(),
          accountName: verifiedAccountName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBankSaveSuccess("Bank account and Paystack automated split payouts connected successfully!");
        setShowBankForm(false);
        fetchData(vendorId);
      } else {
        alert(data.error || "Failed to save bank details");
      }
    } catch (err: any) {
      alert("Failed to connect bank details. Please try again.");
    } finally {
      setIsSavingBank(false);
    }
  };

  const fetchData = async (id = vendorId) => {
    if (!id) return;
    setRefreshing(true);
    try {
      // 1. Fetch Vendor Details & Balance
      const infoRes = await fetch(`/api/vendor/info?vendorId=${id}`);
      const infoData = await infoRes.json();
      if (infoData.success) {
        setVendorInfo(infoData);
      }

      // 2. Fetch Products
      const prodRes = await fetch(`/api/vendor/products?vendorId=${id}`);
      const prodData = await prodRes.json();
      setProducts(prodData);

      // 3. Fetch Orders
      const orderRes = await fetch(`/api/vendor/orders?vendorId=${id}`);
      const orderData = await orderRes.json();
      setOrders(orderData);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !newProductName || !newProductDesc || !newProductPrice || !newProductImage) {
      alert("Please fill all required product details.");
      return;
    }
    setIsAddingProduct(true);
    try {
      const colorArray = newProductColors.split(",").map((c) => c.trim());
      const sizeArray = newProductSizes.split(",").map((s) => s.trim());

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          name: newProductName,
          description: newProductDesc,
          price: parseFloat(newProductPrice),
          imageUrl: newProductImage,
          colors: colorArray,
          sizes: sizeArray,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        // Reset form
        setNewProductName("");
        setNewProductDesc("");
        setNewProductPrice("");
        setNewProductImage("");
        // Reload products
        fetchData(vendorId);
      } else {
        alert(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !withdrawAddress || !withdrawAmount) return;
    setIsWithdrawing(true);
    setWithdrawTxHash(null);
    try {
      const res = await fetch("/api/vendor/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          toAddress: withdrawAddress,
          amountEth: withdrawAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal failed");
      }
      setWithdrawTxHash(data.txHash);
      setWithdrawAddress("");
      setWithdrawAmount("");
      // Reload dashboard data
      fetchData(vendorId);
    } catch (err: any) {
      alert(err.message || "Failed to execute withdrawal.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/vendor/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Reload orders
        fetchData(vendorId);
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const logout = () => {
    localStorage.removeItem("sleek_vendor_id");
    localStorage.removeItem("sleek_vendor_business");
    router.push("/vendor/signup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-sleek-400 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading vendor dashboard...</p>
      </div>
    );
  }

  // Statistics summaries
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "processing").length;
  const completedOrdersCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-[#070b0e] text-white flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-white/[0.01] px-6 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SleekLogo />
            <span className="hidden md:inline text-xs text-gray-500 font-semibold px-2 py-0.5 border border-white/5 bg-white/[0.01] rounded">
              Vendor Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:text-white text-gray-400 transition"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-red-950/20 border border-red-500/25 px-3 py-1.5 text-xs text-red-300 font-semibold hover:bg-red-950/40 transition active:scale-95"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Vendor Header Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sleek-400 to-sleek-200 bg-clip-text text-transparent">
              {vendorInfo?.businessName || "Your Footwear Shop"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{vendorInfo?.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1 relative">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              On-Chain Wallet
            </span>
            <div className="flex items-center gap-2">
              <div
                onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 border border-white/5 text-xs font-mono text-sleek-300 cursor-pointer hover:bg-white/[0.03] hover:border-white/10 transition select-none"
              >
                <Wallet className="h-3.5 w-3.5 text-sleek-400 shrink-0" />
                <span>{vendorInfo?.walletAddress ? `${vendorInfo.walletAddress.slice(0, 8)}...${vendorInfo.walletAddress.slice(-8)}` : "0x00...00"}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${showAssetDropdown ? "rotate-180" : ""}`} />
              </div>

              {vendorInfo?.walletAddress && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(vendorInfo.walletAddress, "header-addr");
                  }}
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:text-white text-gray-400 transition"
                  title="Copy Wallet Address"
                >
                  {copied["header-addr"] ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {showAssetDropdown && vendorInfo?.walletAddress && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c1015] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn space-y-3 text-left">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Balances</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sleek-400" /> Base ETH
                    </span>
                    <span className="font-mono text-sleek-300 font-semibold">{parseFloat(vendorInfo.balance || 0).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> USDC
                    </span>
                    <span className="font-mono text-gray-500">0.0000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> USDT
                    </span>
                    <span className="font-mono text-gray-500">0.0000</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS TILES CARD GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-gray-500 text-xs font-semibold block uppercase">Paystack / Fiat Sales</span>
              <p className="text-2xl font-bold mt-1 text-white font-mono">
                {formatCurrency(totalRevenue)}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                {vendorInfo?.paystackSubaccountCode ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    <ShieldCheck className="h-3 w-3" /> Auto Split Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                    <AlertCircle className="h-3 w-3" /> Bank Setup Needed
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 block mt-2">
              95% Vendor Payout • 5% Platform Fee
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-gray-500 text-xs font-semibold block uppercase">Crypto Balance</span>
              <p className="text-2xl font-bold mt-1 text-sleek-300 font-mono">
                {vendorInfo?.balance || "0.0"} <span className="text-xs font-sans font-medium text-gray-400">ETH</span>
              </p>
              <span className="text-[11px] text-gray-400 block mt-1">
                ~${(parseFloat(vendorInfo?.balance || 0) * 3000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full rounded-xl bg-sleek-500/10 hover:bg-sleek-500/20 border border-sleek-500/30 py-2 text-xs font-bold text-sleek-300 hover:text-white transition active:scale-95"
              >
                Withdraw Crypto
              </button>
              <span className="text-[9px] text-gray-500 text-center font-medium block">
                Base Sepolia Testnet
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <span className="text-gray-500 text-xs font-semibold block uppercase">Awaiting Package</span>
            <p className="text-2xl font-bold mt-1 text-white font-mono">{pendingOrdersCount}</p>
            <span className="text-[10px] text-yellow-500 font-medium flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3 animate-pulse" /> Pack & Ship within 3 days
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <span className="text-gray-500 text-xs font-semibold block uppercase">Completed Orders</span>
            <p className="text-2xl font-bold mt-1 text-white font-mono">{completedOrdersCount}</p>
            <span className="text-[10px] text-sleek-400 font-medium flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3" /> Delivered
            </span>
          </div>
        </div>

        {/* BANK ACCOUNT & DIRECT PAYSTACK PAYOUT CARD */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#0ba4db]/10 border border-[#0ba4db]/20 rounded-2xl">
                <Landmark className="h-6 w-6 text-[#0ba4db]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Direct Bank Account Payouts (Paystack Split)
                  {vendorInfo?.paystackSubaccountCode ? (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
                      Setup Required
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {vendorInfo?.paystackSubaccountCode
                    ? `Settlements automatically deposit directly into ${vendorInfo.bankName || "your bank account"} on every Paystack sale.`
                    : "Add your Nigerian bank account so customer Paystack payments automatically settle directly to you."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBankForm(!showBankForm)}
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0"
            >
              {showBankForm
                ? "Close Form"
                : vendorInfo?.paystackSubaccountCode
                ? "Update Bank Details"
                : "+ Connect Bank Account"}
            </button>
          </div>

          {/* Current Saved Bank Account Display */}
          {vendorInfo?.accountNumber && !showBankForm && (
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Settlement Bank</span>
                <p className="text-xs font-semibold text-white mt-0.5">{vendorInfo.bankName || "Bank"}</p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Account Number</span>
                <p className="text-xs font-mono font-semibold text-white mt-0.5">
                  •••• {vendorInfo.accountNumber.slice(-4)}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Verified Account Name</span>
                <p className="text-xs font-semibold text-green-400 mt-0.5 truncate">{vendorInfo.accountName || "Verified"}</p>
              </div>
            </div>
          )}

          {/* Expandable Bank Connection Form */}
          {showBankForm && (
            <form onSubmit={handleSaveBank} className="mt-5 pt-5 border-t border-white/5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Select */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1.5">
                    Select Nigerian Bank
                  </label>
                  <select
                    value={selectedBankCode}
                    onChange={(e) => {
                      setSelectedBankCode(e.target.value);
                      setVerifiedAccountName("");
                      setBankVerifyError("");
                    }}
                    required
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-[#0ba4db] outline-none"
                  >
                    <option value="" className="bg-[#0c1015] text-gray-400">
                      -- Select Bank --
                    </option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code} className="bg-[#0c1015] text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number & Verify */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1.5">
                    10-Digit NUBAN Account Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="0123456789"
                      value={bankAccountNumber}
                      onChange={(e) => {
                        setBankAccountNumber(e.target.value.replace(/\D/g, ""));
                        setVerifiedAccountName("");
                        setBankVerifyError("");
                      }}
                      className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-[#0ba4db] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyBank}
                      disabled={isVerifyingBank || !selectedBankCode || bankAccountNumber.length !== 10}
                      className="rounded-xl bg-[#0ba4db]/20 hover:bg-[#0ba4db]/30 border border-[#0ba4db]/40 px-4 py-2.5 text-xs font-bold text-[#0ba4db] transition disabled:opacity-40"
                    >
                      {isVerifyingBank ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Name Confirmation Badge */}
              {verifiedAccountName && (
                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-green-400 font-semibold">
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                  <span>Account Verified: {verifiedAccountName}</span>
                </div>
              )}

              {/* Error Message */}
              {bankVerifyError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{bankVerifyError}</span>
                </div>
              )}

              {/* Success Message */}
              {bankSaveSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-green-400 font-medium">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{bankSaveSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankForm(false)}
                  className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank || !verifiedAccountName}
                  className="rounded-xl bg-[#00c980] hover:bg-[#059669] px-6 py-2.5 text-xs font-bold text-white shadow-lg transition disabled:opacity-40"
                >
                  {isSavingBank ? "Connecting to Paystack..." : "Save & Activate Automated Payouts"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* WORKSPACE DIVIDER GRID: PRODUCTS VS ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: PRODUCTS LIST & PRODUCT MANAGER */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-sleek-400" /> Catalog ({products.length})
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="rounded-lg bg-sleek-500 p-1.5 text-white hover:bg-sleek-600 transition"
                aria-label="Add product"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* ADD PRODUCT MODAL/FORM */}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-sleek-300">Add Footwear Sample</h3>
                
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Shoe Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Air Max Court"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Description</label>
                  <textarea
                    required
                    placeholder="High performance sports sneakers"
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Price (₦)</label>
                    <input
                      type="number"
                      required
                      placeholder="45000"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Sizes (CSV)</label>
                    <input
                      type="text"
                      placeholder="40, 41, 42"
                      value={newProductSizes}
                      onChange={(e) => setNewProductSizes(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Colors (CSV)</label>
                  <input
                    type="text"
                    placeholder="Black, White, Red"
                    value={newProductColors}
                    onChange={(e) => setNewProductColors(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs focus:border-sleek-500 outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-semibold hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingProduct}
                    className="flex-1 rounded-lg bg-sleek-500 py-2 font-bold text-white text-xs hover:bg-sleek-600 transition flex items-center justify-center gap-1"
                  >
                    {isAddingProduct && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Add Shoe
                  </button>
                </div>
              </form>
            )}

            {/* PRODUCT ITEMS LIST */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {products.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
                  No footwear samples uploaded. Use the &apos;+&apos; button to add shoes.
                </p>
              ) : (
                products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3.5 bg-white/[0.02] border border-white/5 p-3 rounded-2xl"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-12 w-12 object-cover rounded-xl bg-gray-900 border border-white/5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-white">{p.name}</h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{p.description}</p>
                      <p className="text-xs font-bold text-sleek-400 font-mono mt-1">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: ORDERS TRACKING LIST */}
          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-sleek-400" /> Incoming Orders ({orders.length})
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-8 border border-white/5 rounded-2xl bg-white/[0.01] text-center">
                  No orders have been routed to your store yet. Keep checking!
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl space-y-4 backdrop-blur-md"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sleek-300 font-mono">
                            {order.trackingNumber}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase border ${
                              order.status === "processing"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
                                : order.status === "shipped"
                                  ? "bg-blue-500/10 text-blue-500 border-blue-500/25"
                                  : "bg-green-500/10 text-green-500 border-green-500/25"
                            }`}
                          >
                            {order.status === "processing" ? "Pending Package" : order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-mono">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider block mt-0.5">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Shipping Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                      <div>
                        <p className="font-semibold text-gray-300 mb-1">Customer Info:</p>
                        <p className="text-white font-medium">{order.shippingName}</p>
                        <p>{order.shippingEmail}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300 mb-1">Shipping Destination:</p>
                        <p className="text-white font-medium">{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingCountry}</p>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="bg-black/35 rounded-2xl p-3 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-xs">
                            <span className="text-white">
                              {item.name} ({item.color}, Size {item.size}) <span className="text-gray-500">×{item.quantity}</span>
                            </span>
                            <span className="font-medium text-gray-400">{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Blockchain Tx Hash Info */}
                    {order.txHash && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <span>Payment Hash:</span>
                        <a
                          href={`https://sepolia.basescan.org/tx/${order.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sleek-400 hover:text-sleek-300 font-mono hover:underline flex items-center gap-1"
                        >
                          {order.txHash.slice(0, 20)}... <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Action buttons */}
                    {order.status === "processing" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-sleek-500 py-2.5 font-bold text-white text-xs hover:bg-sleek-600 transition shadow shadow-sleek-500/25 active:scale-95"
                      >
                        <Truck className="h-4 w-4" /> Mark as Shipped (Notifies Buyer)
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 font-bold text-white text-xs hover:bg-green-700 transition active:scale-95"
                      >
                        <CheckCircle className="h-4 w-4" /> Mark as Delivered (Notifies Buyer)
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Withdraw Modal Overlay */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b0f14] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sleek-400 to-sleek-200 bg-clip-text text-transparent mb-2">
              Withdraw Funds
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Transfer base Sepolia ETH from your shop wallet directly to any external Web3 address.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 font-bold uppercase">Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-xs font-mono focus:border-sleek-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 font-bold uppercase">Amount (ETH)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.005"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-xs font-mono focus:border-sleek-500 outline-none transition"
                />
              </div>

              {withdrawTxHash && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3.5 text-xs text-green-400">
                  <p className="font-semibold mb-1">Transfer submitted successfully!</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${withdrawTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono hover:underline flex items-center gap-1 mt-1 text-[11px]"
                  >
                    View Tx on Basescan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawTxHash(null);
                  }}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="flex-1 rounded-xl bg-sleek-500 py-3 font-bold text-white text-xs hover:bg-sleek-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-sleek-500/25"
                >
                  {isWithdrawing && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-[10px] text-gray-600 border-t border-white/5 py-6 mt-12 bg-white/[0.01]">
        <p className="flex items-center justify-center gap-1">
          <Lock className="h-3.5 w-3.5" /> SECURE SMART CONTRACTS • POWERED BY SLEEK PROTOCOL
        </p>
      </footer>
    </div>
  );
}
