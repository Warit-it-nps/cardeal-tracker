"use client";

import React from "react";
import Link from "next/link";
import { QuoteForm } from "@/components/quotes/QuoteForm";
import { ArrowLeft } from "lucide-react";

export default function NewQuotePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับไปหน้ารายการใบเสนอราคา</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            บันทึกและคำนวณใบเสนอราคารถยนต์ใหม่
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ตัวเลขค่างวด เงินออกรถวันรับรถ และต้นทุนสุทธิจะคำนวณอัตโนมัติแบบ Real-time ด้านล่างหน้าจอ
          </p>
        </div>
      </div>

      <QuoteForm mode="create" />
    </div>
  );
}
