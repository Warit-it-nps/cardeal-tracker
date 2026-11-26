"use client";

import React from "react";
import Link from "next/link";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { Scale, X, ArrowRight } from "lucide-react";

export function CompareFloatingBar() {
  const { quotes, selectedCompareIds, clearCompareSelection } = useQuotes();

  if (selectedCompareIds.length === 0) return null;

  const selectedQuotes = selectedCompareIds
    .map((id) => quotes.find((q) => q.id === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-16 md:bottom-5 left-1/2 z-30 w-[94%] max-w-2xl -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900/95 p-3 sm:px-5 text-white shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-extrabold">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold">
              เลือกเปรียบเทียบแล้ว {selectedQuotes.length} / 4 ใบเสนอราคา
            </div>
            <div className="text-[11px] text-slate-300 truncate max-w-[230px] sm:max-w-sm">
              {selectedQuotes
                .map((q) => `${q?.brand} ${q?.model} (${q?.salesName || q?.showroom})`)
                .join(" vs ")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={clearCompareSelection}
            className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>

          <Link
            href={`/compare?ids=${selectedCompareIds.join(",")}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors"
          >
            <span>เปิดตารางเปรียบเทียบ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
