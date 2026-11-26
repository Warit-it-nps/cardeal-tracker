"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CarFront, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    const supabase = createClient();
    if (!supabase) {
      setErrorMsg("ระบบเชื่อมต่อบัญชีผู้ใช้ยังไม่พร้อมใช้งานในขณะนี้");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CarFront className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            เข้าสู่ระบบ CarDeal Tracker
          </h1>
          <p className="text-xs text-slate-500">
            เข้าสู่ระบบเพื่อบันทึกและซิงค์ใบเสนอราคารถยนต์ของคุณในทุกอุปกรณ์
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
        >
          <LogIn className="h-4 w-4 text-emerald-400" />
          <span>
            {loading ? "กำลังเชื่อมต่อบัญชี Google..." : "ดำเนินการต่อด้วยบัญชี Google"}
          </span>
        </button>

        {errorMsg && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
            {errorMsg}
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับไปหน้าใบเสนอราคาของฉัน</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
