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

  useEffect(() => {
    // Authenticate using localStorage
    const savedId = localStorage.getItem("sleek_vendor_id");
    if (!savedId) {
      router.push("/vendor/signup");
      return;
    }
    setVendorId(savedId);
    fetchData(savedId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              On-Chain Wallet
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 border border-white/5 text-xs font-mono text-sleek-300">
              <Wallet className="h-4 w-4 text-sleek-400 shrink-0" />
              <span>{vendorInfo?.walletAddress ? `${vendorInfo.walletAddress.slice(0, 8)}...${vendorInfo.walletAddress.slice(-8)}` : "0x00...00"}</span>
            </div>
          </div>
        </div>

        {/* STATS TILES CARD GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <span className="text-gray-500 text-xs font-semibold block uppercase">Total Revenue</span>
            <p className="text-2xl font-bold mt-1 text-white font-mono">{formatCurrency(totalRevenue)}</p>
            <span className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" /> Paid Orders
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <span className="text-gray-500 text-xs font-semibold block uppercase">Wallet Balance</span>
            <p className="text-2xl font-bold mt-1 text-sleek-300 font-mono">
              {vendorInfo?.balance || "0.0"} <span className="text-xs font-sans font-medium text-gray-400">ETH</span>
            </p>
            <span className="text-[10px] text-gray-500 font-medium block mt-2">
              Base Sepolia Testnet
            </span>
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

      {/* Footer */}
      <footer className="text-center text-[10px] text-gray-600 border-t border-white/5 py-6 mt-12 bg-white/[0.01]">
        <p className="flex items-center justify-center gap-1">
          <Lock className="h-3.5 w-3.5" /> SECURE SMART CONTRACTS • POWERED BY SLEEK PROTOCOL
        </p>
      </footer>
    </div>
  );
}
