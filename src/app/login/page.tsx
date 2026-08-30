"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Phone, Lock, ArrowRight, Mail } from "lucide-react";
import { apiFetch, setToken } from "@/lib/api";
import { isStaff } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    if (isStaff()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setDevOtp(data.dev_otp || "");
      setStep("otp");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      if (data.role !== "admin" && data.role !== "superadmin") {
        throw new Error("Access denied. Admin or superadmin only.");
      }
      setToken(data.access_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full min-h-full flex flex-col overflow-hidden">
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/Gemini_Generated_Image_gn67x8gn67x8gn67.png')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-indigo-900/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Noni Tura</h1>
              <p className="text-xs text-white/70 font-medium tracking-wide">SUPER ADMIN PANEL</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#" className="hover:text-white transition-colors">Help</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
                  {step === "phone" ? (
                    <Phone className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-white" />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {step === "phone" ? "Welcome Back" : "Verify OTP"}
                </h2>
                <p className="text-white/70 text-sm">
                  {step === "phone"
                    ? "Enter your admin phone number to continue"
                    : `We sent a 6-digit code to ${phone}`}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 text-sm text-center">
                  {error}
                </div>
              )}

              {step === "phone" ? (
                <form onSubmit={sendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99999 99999"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      OTP Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all tracking-[0.3em] text-center"
                        required
                      />
                    </div>
                    {devOtp && (
                      <p className="mt-2 text-xs text-center text-emerald-300 font-medium">
                        Dev OTP: {devOtp}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      "Verifying..."
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="w-full text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Use a different phone number
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Superadmin hint */}
          <p className="mt-6 text-center text-sm text-white/60">
            Default superadmin demo phone: <span className="font-medium text-white/90">+919999999999</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} Noni Tura. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Support
            </a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
