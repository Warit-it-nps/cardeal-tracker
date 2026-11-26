"use client";

import React, { useMemo, useState } from "react";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import { Globe, Search, ShieldCheck } from "lucide-react";

export default function PublicExplorePage() {
  const { publicQuotes } = useQuotes();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("ALL");

  const brands = useMemo(() => {
    const s = new Set<string>();
    publicQuotes.forEach((q) => {
      if (q.brand) s.add(q.brand);
    });
    return Array.from(s);
  }, [publicQuotes]);

  const filtered = useMemo(() => {
    return publicQuotes
      .filter((q) => {
        if (brand !== "ALL" && q.brand !== brand) return false;
        if (search.trim()) {
          const kw = search.toLowerCase();
          const text =
            `${q.brand} ${q.model} ${q.trim} ${q.showroom}`.toLowerCase();
          if (!text.includes(kw)) return false;
        }
        return true;
      })
      .sort(
        (a, b) => a.computed.netEffectiveCost - b.computed.netEffectiveCost
      );
  }, [publicQuotes, brand, search]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
          <Globe className="h-3.5 w-3.5" />
          <span>รวมโปรโมชั่นและใบเสนอราคารถยนต์</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold">
          รวมใบเสนอราคารถยนต์จากผู้ซื้อจริง
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          เช็กข้อมูลส่วนลดเงินสด ซับดาวน์ ดอกเบี้ย และรายการของแถมจากหลายโชว์รูม
          สามารถกดคัดลอกใบเสนอราคาที่สนใจไปปรับแก้ตัวเลขหรือนำเข้าตารางเปรียบเทียบได้ทันที
        </p>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารุ่นรถ เช่น Sealion 6, Civic, S07..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBrand("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              brand === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทุกยี่ห้อ ({publicQuotes.length})
          </button>
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                brand === b
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>
          ใบเสนอราคาที่ผู้แชร์ไม่ได้ติ๊กเปิดเผยคอนแทคเซล ระบบจะซ่อนชื่อและเบอร์โทรของเซลโดยอัตโนมัติ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            readOnlyPublicMode={true}
          />
        ))}
      </div>

      <CompareFloatingBar />
    </div>
  );
}
