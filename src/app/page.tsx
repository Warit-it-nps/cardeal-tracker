"use client";

import React from "react";
import Link from "next/link";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import {
  Calculator,
  Scale,
  Globe,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const { publicQuotes, quotes } = useQuotes();
  const featuredPublic = publicQuotes.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              คำนวณไฟแนนซ์รถยนต์แบบไทย (Flat Rate) • แยกส่วนลดเงินสด vs ซับดาวน์ชัดเจน
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            เทียบใบเสนอราคารถยนต์แบบไม่โดนหลอกด้วย{" "}
            <span className="text-emerald-400 underline decoration-emerald-500/40">
              ยอดจ่ายจริงสุทธิ (True Net Cost)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            บางโชว์รูมให้ซับดาวน์เยอะแต่บวกดอกเบี้ยเพิ่ม บางที่ให้ส่วนลดเงินสดหักราคารถพร้อมของแถมจัดเต็ม{" "}
            <strong className="text-white">CarDeal Tracker</strong>{" "}
            ช่วยคุณบันทึกข้อเสนอจากหลายแบรนด์ หลายเซล คำนวณเงินออกรถวันรับรถ
            และเปรียบเทียบตาราง Side-by-Side ให้เห็นส่วนต่างเป็นตัวเงินทันที
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>เริ่มกรอกใบเสนอราคาใหม่</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-all"
            >
              <span>ดูใบเสนอราคาทั้งหมด ({quotes.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
            >
              <Scale className="h-4 w-4" />
              <span>เปิดตารางเปรียบเทียบ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 จุดเด่นหลักของสูตรคำนวณ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Calculator className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            แยกส่วนลดเงินสด vs ซับดาวน์
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ส่วนลดเงินสดจะถูกนำไปหักราคารถก่อนคิดยอดจัดและดอกเบี้ย
            ในขณะที่ซับดาวน์จะนำไปหักเงินดาวน์ที่ต้องจ่ายวันรับรถตามสูตรไฟแนนซ์จริง
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            เทียบ Side-by-Side 2–4 ใบเสนอราคา
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ไฮไลต์สีเขียวอัตโนมัติในช่องที่คุ้มที่สุดของแต่ละแถว (ดอกเบี้ยต่ำสุด,
            วันออกรถถูกสุด, ต้นทุนสุทธิคุ้มสุด) พร้อมคำนวณส่วนต่าง{" "}
            <code className="rounded bg-rose-50 px-1 text-rose-700 font-semibold">
              +฿18,500
            </code>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            เลือกเก็บส่วนตัว หรือแชร์สาธารณะได้
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            สร้างลิงก์แชร์ใบเสนอราคาให้เพื่อนหรือครอบครัวดูได้ทันทีโดยไม่ต้อง Login
            พร้อมตัวเลือกซ่อนชื่อและเบอร์โทรเซลเพื่อความเป็นส่วนตัว
          </p>
        </div>
      </section>

      {/* รายการใบเสนอราคาที่แชร์สาธารณะล่าสุด (ดูได้ไม่ต้อง Login) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                ใบเสนอราคาที่แชร์สาธารณะล่าสุด (ดูได้ทันทีไม่ต้อง Login)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              สามารถติ๊ก &ldquo;[☑ เทียบ]&rdquo; เพื่อนำดีลสาธารณะไปเปรียบเทียบกับใบเสนอราคาของคุณได้ทันที
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
          >
            <span>ดูตลาดราคาที่แชร์ทั้งหมด ({publicQuotes.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredPublic.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              readOnlyPublicMode={true}
            />
          ))}
        </div>
      </section>

      <CompareFloatingBar />
    </div>
  );
}
