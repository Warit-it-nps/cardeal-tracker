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
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  const { publicQuotes, quotes, loadSampleData } = useQuotes();
  const featuredPublic = publicQuotes.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              คำนวณไฟแนนซ์รถยนต์ • แยกส่วนลดเงินสด ซับดาวน์ และของแถมชัดเจน
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            เปรียบเทียบใบเสนอราคารถยนต์{" "}
            <span className="text-emerald-400 underline decoration-emerald-500/40">
              เช็กยอดจ่ายจริงก่อนตัดสินใจจอง
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            เคยไหม? ได้ใบเสนอราคามาหลายโชว์รูม บางที่ลดเงินสด บางที่ให้ซับดาวน์แต่ดอกเบี้ยแพงกว่า{" "}
            <strong className="text-white">CarDeal Tracker</strong>{" "}
            ช่วยคำนวณค่างวด เงินที่ต้องเตรียมวันรับรถ และต้นทุนสุทธิหลังหักของแถม
            พร้อมวางเทียบกันเป็นตารางให้เห็นชัดว่าข้อเสนอไหนคุ้มที่สุด
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>คำนวณใบเสนอราคาใหม่</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-all"
            >
              <span>ใบเสนอราคาของฉัน ({quotes.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
            >
              <Scale className="h-4 w-4" />
              <span>ตารางเปรียบเทียบ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 จุดเด่นหลัก */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Calculator className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            แยกส่วนลดเงินสด vs ซับดาวน์
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ส่วนลดเงินสดจะนำไปหักราคารถก่อนคิดยอดจัดและดอกเบี้ย
            ส่วนซับดาวน์จะนำไปหักเงินดาวน์ที่ต้องจ่ายวันรับรถตามวิธีคิดของไฟแนนซ์จริง
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Scale className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            วางเทียบกันสูงสุด 4 ใบเสนอราคา
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            เทียบข้ามรุ่นหรือรุ่นเดียวกันคนละโชว์รูม ไฮไลต์ช่องที่คุ้มที่สุดให้อัตโนมัติ
            ทั้งค่างวดต่อเดือน เงินออกรถวันแรก และยอดจ่ายรวมตลอดสัญญา
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            ส่งลิงก์ให้ครอบครัวช่วยดูได้ง่าย
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            เลือกเก็บใบเสนอราคาไว้ดูส่วนตัว หรือสร้างลิงก์แชร์ส่งต่อให้เพื่อนและครอบครัวเปิดดูรายละเอียดได้ทันที
          </p>
        </div>
      </section>

      {/* รายการใบเสนอราคาที่แชร์ล่าสุด */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                รวมโปรโมชั่นและใบเสนอราคาจากผู้ซื้อจริง
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              ดูแนวทางส่วนลด ดอกเบี้ย และรายการของแถมที่สมาชิกแบ่งปันไว้ในระบบ
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
          >
            <span>ดูทั้งหมด ({publicQuotes.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredPublic.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">
              ยังไม่มีรายการใบเสนอราคาที่แชร์ในขณะนี้
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/quotes/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4" />
                <span>บันทึกใบเสนอราคาใบแรก</span>
              </Link>
              <button
                type="button"
                onClick={loadSampleData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>ดูตัวอย่างการเปรียบเทียบ 4 โชว์รูม</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPublic.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                readOnlyPublicMode={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* SEO Knowledge Section: คำถามพบบ่อยในการคำนวณไฟแนนซ์รถยนต์ */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            วิธีดูใบเสนอราคารถยนต์ให้ได้ข้อเสนอที่คุ้มค่าที่สุด
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900">
              1. ส่วนลดเงินสด vs ซับดาวน์ ต่างกันอย่างไร?
            </h3>
            <p>
              <strong>ส่วนลดเงินสด</strong> จะนำไปหักออกจากราคารถตั้งต้นก่อนคำนวณเงินดาวน์และยอดจัดไฟแนนซ์ ทำให้ยอดจัดลดลงและเสียดอกเบี้ยน้อยลง ส่วน{" "}
              <strong>ซับดาวน์</strong> คือวงเงินที่โชว์รูมช่วยออกเงินดาวน์ในวันรับรถ แต่ยอดจัดไฟแนนซ์ยังคิดจากราคารถเต็ม
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900">
              2. ทำไมไม่ควรเทียบแค่ค่างวดต่อเดือน?
            </h3>
            <p>
              ใบเสนอราคาที่ค่างวดถูกกว่าอาจเกิดจากการยืดจำนวนงวด (เช่น 72 หรือ 84 งวด) หรือใช้เงินดาวน์วันออกรถสูงกว่า การดูที่{" "}
              <strong>ยอดจ่ายจริงตลอดสัญญา</strong> จึงช่วยให้เห็นต้นทุนรวมทั้งหมดอย่างแท้จริง
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900">
              3. ประเมินมูลค่าของแถมอย่างไรไม่ให้เสียเปรียบ?
            </h3>
            <p>
              ควรนับมูลค่าเฉพาะของแถมที่ได้ใช้งานจริง เช่น ประกันภัยชั้น 1, พ.ร.บ., ฟรีค่าจดทะเบียน, ฟิล์มกรองแสง หรือ Wall Charger สำหรับรถไฟฟ้า EV เพื่อนำมาหักลบหาต้นทุนสุทธิที่แม่นยำ
            </p>
          </div>
        </div>
      </section>

      <CompareFloatingBar />
    </div>
  );
}
