"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { ComparisonMatrix } from "@/components/compare/ComparisonMatrix";
import { CarQuoteRecord } from "@/lib/finance/types";
import { formatTHB } from "@/lib/utils";
import {
  ArrowLeft,
  PlusCircle,
  Trophy,
  CheckSquare,
  Square,
} from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const { quotes, publicQuotes, selectedCompareIds, toggleCompareSelection } = useQuotes();

  const allAccessibleQuotes = useMemo(() => {
    const map = new Map<string, CarQuoteRecord>();
    for (const q of quotes) map.set(q.id, q);
    for (const pq of publicQuotes) {
      if (!map.has(pq.id)) map.set(pq.id, pq);
    }
    return Array.from(map.values());
  }, [quotes, publicQuotes]);

  const idsFromUrl = searchParams.get("ids")
    ? searchParams
        .get("ids")!
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const activeIds =
    selectedCompareIds.length > 0
      ? selectedCompareIds
      : idsFromUrl.length > 0
      ? idsFromUrl
      : allAccessibleQuotes.slice(0, 3).map((q) => q.id);

  const comparedQuotes = useMemo(() => {
    return activeIds
      .map((id) => allAccessibleQuotes.find((q) => q.id === id))
      .filter((q): q is CarQuoteRecord => Boolean(q));
  }, [activeIds, allAccessibleQuotes]);

  // คำนวณผู้ชนะด้านต้นทุนสุทธิ (True Net Cost Winner)
  const winnerSummary = useMemo(() => {
    if (comparedQuotes.length < 2) return null;
    const sorted = [...comparedQuotes].sort(
      (a, b) => a.computed.netEffectiveCost - b.computed.netEffectiveCost
    );
    const best = sorted[0];
    const second = sorted[1];
    const savingVsSecond =
      second.computed.netEffectiveCost - best.computed.netEffectiveCost;
    return { best, second, savingVsSecond };
  }, [comparedQuotes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับไปหน้า Dashboard</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            ตารางเปรียบเทียบใบเสนอราคา (Side-by-Side Comparison)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            เปรียบเทียบพร้อมกันสูงสุด 4 รายการ (ทั้งต่างรุ่น หรือรุ่นเดียวกันคนละโชว์รูม)
          </p>
        </div>

        <Link
          href="/quotes/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ เพิ่มใบเสนอราคาใหม่</span>
        </Link>
      </div>

      {/* ตัวเลือกสลับใบเสนอราคาเข้า-ออกตารางอย่างรวดเร็ว */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <div className="text-xs font-bold text-slate-700">
          คลิกเลือกใบเสนอราคาที่ต้องการนำมาเทียบเคียงในตาราง (เลือกได้ 2–4 รายการ):
        </div>
        <div className="flex flex-wrap gap-2">
          {allAccessibleQuotes.map((q) => {
            const isSelected = activeIds.includes(q.id);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => toggleCompareSelection(q.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span>
                  {q.brand} {q.model} ({q.salesName || q.showroom})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* แบนเนอร์สรุปผลการตัดสินใจ */}
      {winnerSummary && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                ข้อเสนอที่คุ้มค่าที่สุดจากที่เลือก (Best True Net Cost)
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">
                {winnerSummary.best.brand} {winnerSummary.best.model} •{" "}
                {winnerSummary.best.trim} ({winnerSummary.best.salesName || winnerSummary.best.showroom})
              </div>
              <p className="text-xs text-slate-600">
                ต้นทุนสุทธิหลังหักของแถมอยู่ที่{" "}
                <strong className="text-emerald-700">
                  {formatTHB(winnerSummary.best.computed.netEffectiveCost)}
                </strong>{" "}
                ประหยัดกว่าอันดับ 2 ({winnerSummary.second.salesName || winnerSummary.second.showroom}) ถึง{" "}
                <strong className="text-emerald-700">
                  {formatTHB(winnerSummary.savingVsSecond)}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ตาราง Matrix */}
      <ComparisonMatrix
        quotes={comparedQuotes}
        onRemoveFromCompare={(id) => toggleCompareSelection(id)}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          กำลังโหลดตารางเปรียบเทียบ...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
