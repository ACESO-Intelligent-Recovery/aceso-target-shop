"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { SYNTHETIC_USERS } from "@/lib/users";

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(SYNTHETIC_USERS[0].username);
  const [password, setPassword] = useState("synthetic-password-2026");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    // Set a lightweight mock auth cookie for journey continuity
    document.cookie = `aceso_user=${selectedUser}; path=/; max-age=86400`;

    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Shop</span>
      </Link>

      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-2xs space-y-6">
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Synthetic Sign In</h1>
          <p className="text-xs text-neutral-500">
            Select a pre-configured synthetic user account to simulate customer sessions.
          </p>
        </div>

        {/* Human-Only Policy Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Policy Guard: Human-Only Patching</span>
            <span className="text-amber-800 text-[11px] leading-relaxed">
              Authentication endpoints are strictly protected by AcesoLoop policy. AI agents will never auto-patch login or security logic.
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-700 font-semibold mb-1.5">Select Synthetic Account</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {SYNTHETIC_USERS.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.username} ({u.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-700 font-semibold mb-1.5">Synthetic Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-xs text-xs"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In as {selectedUser}</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 text-center text-[11px] text-neutral-400">
          Deterministic credentials from <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">lib/users.ts</code>
        </div>
      </div>
    </div>
  );
}
