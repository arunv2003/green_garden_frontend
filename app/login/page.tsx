"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customCreds?: { id: string; pass: string }) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const loginIdentifier = customCreds ? customCreds.id : identifier;
    const loginPassword = customCreds ? customCreds.pass : password;

    try {
      const res = await api.post("/auth/login", {
        identifier: loginIdentifier,
        password: loginPassword,
      });

      if (res.data.success) {
        setSession(res.data.data.token, res.data.data.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message && (err.message.includes("Network Error") || err.code === "ERR_NETWORK")) {
        setError("Network Error: Cannot reach backend server at " + (api.defaults.baseURL || "http://localhost:5007/api") + ". Please make sure the backend is running.");
      } else {
        setError(err.message || "Login failed. Please check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    handleLogin(undefined, { id, pass });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/40 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">GREEN GARDEN</h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
            Room, Guest & Stay Management System
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. secretary@greengarden.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950 transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Green Garden"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Role Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Test Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin("secretary@greengarden.com", "Secretary@123")}
              className="py-2 px-2 text-[11px] font-semibold bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/60 rounded-xl transition text-center"
            >
              Secretary
            </button>
            <button
              onClick={() => quickLogin("accountant@greengarden.com", "Accountant@123")}
              className="py-2 px-2 text-[11px] font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 rounded-xl transition text-center"
            >
              Accountant
            </button>
            <button
              onClick={() => quickLogin("rahul@gmail.com", "User@123")}
              className="py-2 px-2 text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded-xl transition text-center"
            >
              Rahul (User)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
