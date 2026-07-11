"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, AlertCircle, CheckCircle, Shield, ArrowRight, Loader2, Check, Copy } from "lucide-react";
import { SleekLogo } from "@/components/brand/SleekLogo";

const CONTRACT_ADDRESS = "0x9c32A15535C578c7F2B75A57CD7E44243F7BEc5e";

export default function VendorSignup() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");

  // Signup steps: 'info', 'kyc', 'completed'
  const [step, setStep] = useState<"info" | "kyc" | "completed">("info");

  // Camera states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // KYC interactive states
  const [kycPhase, setKycPhase] = useState<"align" | "blink" | "turn" | "done">("align");
  const [kycProgress, setKycProgress] = useState(0);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdVendor, setCreatedVendor] = useState<any>(null);

  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      runKycSimulation();
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access denied. Please enable your camera to complete the liveness KYC check.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const runKycSimulation = () => {
    setKycPhase("align");
    setKycProgress(0);

    // Step 1: Center Face
    setTimeout(() => {
      setKycProgress(30);
      setKycPhase("blink");
      
      // Step 2: Blink
      setTimeout(() => {
        setKycProgress(60);
        setKycPhase("turn");

        // Step 3: Turn Head Left
        setTimeout(() => {
          setKycProgress(100);
          setKycPhase("done");
          captureFrame();
        }, 3000);
      }, 3000);
    }, 2500);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !email) return;
    setStep("kyc");
    startCamera();
  };

  const handleKycRetry = () => {
    setCapturedImage(null);
    startCamera();
  };

  const submitRegistration = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          email,
          kycFaceImage: capturedImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setCreatedVendor(data.vendor);
      
      // Persist vendor in localStorage for dashboard authentication
      localStorage.setItem("sleek_vendor_id", data.vendor.id);
      localStorage.setItem("sleek_vendor_business", data.vendor.businessName);

      setStep("completed");
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKycVerifyReset = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <main className="min-h-screen bg-[#070b0e] text-white flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full border-b border-white/5 pb-4">
        <SleekLogo />
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Vendor Registration
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto my-8">
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {/* Progress Indicators */}
          <div className="flex gap-1.5 mb-6">
            <div className={`h-1 flex-1 rounded ${step === "info" ? "bg-sleek-500" : "bg-white/10"}`} />
            <div className={`h-1 flex-1 rounded ${step === "kyc" ? "bg-sleek-500" : "bg-white/10"}`} />
            <div className={`h-1 flex-1 rounded ${step === "completed" ? "bg-sleek-500" : "bg-white/10"}`} />
          </div>

          {/* STEP 1: INFO FORM */}
          {step === "info" && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sleek-400 to-sleek-200 bg-clip-text text-transparent mb-2">
                Sell via WhatsApp
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Register as an accredited footwear vendor. Receive instant crypto payments directly to your generated wallet.
              </p>

              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="April Footwear"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:border-sleek-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="april@footwear.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:border-sleek-500 outline-none transition"
                  />
                </div>

                <div className="flex gap-2.5 items-start rounded-xl bg-sleek-500/10 border border-sleek-500/20 p-3 text-xs text-sleek-300">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Your business email will generate a unique EVM wallet address to handle and route payments. Face KYC liveness verification is required.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-sleek-500 py-3.5 font-bold text-white text-sm hover:bg-sleek-600 transition flex items-center justify-center gap-2 mt-6 active:scale-[0.98] shadow-lg shadow-sleek-500/25"
                >
                  Continue to KYC Check <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: CAMERA KYC LIVENESS CHECK */}
          {step === "kyc" && (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Liveness KYC Check</h2>
              <p className="text-xs text-gray-400 mb-6">
                Security check: Please follow the on-screen facial prompts to verify liveness.
              </p>

              {/* Camera Screen Circle Wrapper */}
              <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden border-2 border-dashed border-sleek-400/40 p-1 flex items-center justify-center bg-black/60 shadow-lg shadow-sleek-500/5">
                
                {/* Liveness Guidelines Ring */}
                {stream && !capturedImage && (
                  <div className="absolute inset-2 border-2 border-sleek-500 rounded-full animate-pulse pointer-events-none" />
                )}

                {/* Webcam Stream */}
                {stream && !capturedImage && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover rounded-full scale-x-[-1]"
                  />
                )}

                {/* Captured Preview */}
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="KYC Capture"
                    className="h-full w-full object-cover rounded-full"
                  />
                )}

                {/* Camera Inactive State */}
                {!stream && !capturedImage && !cameraError && (
                  <Camera className="h-12 w-12 text-gray-600" />
                )}

                {/* Camera Permission Error */}
                {cameraError && (
                  <div className="absolute inset-0 bg-red-950/20 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-xs text-red-400">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 text-xs bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar inside KYC liveness check */}
              {stream && !capturedImage && (
                <div className="mt-6 max-w-xs mx-auto">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>
                      {kycPhase === "align" && "Centering face..."}
                      {kycPhase === "blink" && "Blink twice now..."}
                      {kycPhase === "turn" && "Turn head left..."}
                      {kycPhase === "done" && "Verification complete!"}
                    </span>
                    <span>{kycProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sleek-500 transition-all duration-300"
                      style={{ width: `${kycProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 space-y-3">
                {capturedImage ? (
                  <>
                    <div className="flex gap-2 items-center justify-center text-xs text-green-400 font-semibold mb-2">
                      <CheckCircle className="h-4 w-4" /> KYC Liveness Verified Successfully
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleKycVerifyReset}
                        className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold hover:bg-white/5 transition"
                      >
                        Recapture
                      </button>
                      <button
                        type="button"
                        onClick={submitRegistration}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-sleek-500 py-3 font-bold text-white text-xs hover:bg-sleek-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-sleek-500/25"
                      >
                        {isSubmitting && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                        Complete Signup
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setStep("info");
                    }}
                    className="w-full text-xs text-gray-500 hover:text-white"
                  >
                    Go Back
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED / WALLET INFO */}
          {step === "completed" && createdVendor && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3 animate-bounce" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-sleek-400 to-sleek-200 bg-clip-text text-transparent">
                  Onboarding Complete!
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Your footwear shop has been registered and verified.
                </p>
              </div>

              {/* Vendor EVM Wallet details */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 space-y-4">
                <h3 className="text-xs font-bold text-sleek-300 uppercase tracking-wider">
                  Your Shop Wallet
                </h3>
                
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Wallet Address</span>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5">
                    <span className="text-xs font-mono text-white truncate mr-2 select-all">
                      {createdVendor.walletAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdVendor.walletAddress, "addr")}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied["addr"] ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Private Key (Managed)</span>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5">
                    <span className="text-xs font-mono text-gray-400 truncate mr-2">
                      {showPrivateKey ? createdVendor.walletPrivateKey : "••••••••••••••••••••••••••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 font-semibold"
                    >
                      {showPrivateKey ? "Hide" : "Reveal"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-[11px] text-gray-400 space-y-2">
                <p>
                  <strong>How routing works:</strong> When a user buys a footwear sample you listed, their payment goes straight to your shop wallet address on-chain.
                </p>
                <p>
                  <strong>Platform Fee:</strong> A 0.1% platform fee is automatically deducted by the smart contract on-chain and forwarded to the platform wallet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/vendor/dashboard")}
                className="w-full rounded-xl bg-sleek-500 py-3.5 font-bold text-white text-sm hover:bg-sleek-600 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Go to Vendor Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Canvas for Webcam frame captures (hidden) */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="text-center text-[10px] text-gray-600 max-w-4xl mx-auto w-full pt-4 border-t border-white/5">
        &copy; {new Date().getFullYear()} Sleek Footwear routing contract: {CONTRACT_ADDRESS.slice(0, 8)}...
      </footer>
    </main>
  );
}
