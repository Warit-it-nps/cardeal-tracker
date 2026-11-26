"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import { QUOTE_STATUS_LABELS } from "@/lib/finance/presets";
import { QuoteStatus } from "@/lib/finance/types";
import { formatTHB } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  ArrowUpDown,
  RotateCcw,
  Scale,
} from "lucide-react";

type SortOption =
  | "NET_COST_ASC"
  | "TOTAL_OUTFLOW_ASC"
  | "MONTHLY_ASC"
  | "DAY_ONE_ASC"
  | "DATE_DESC";

export default function DashboardPage() {
  const { quotes, selectedCompareIds, resetDemoData } = useQuotes();

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NET_COST_ASC");

  // ดึงรายชื่อยี่ห้อที่มีอยู่ในระบบ
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => {
      if (q.brand) set.add(q.brand);
    });
    return Array.from(set);
  }, [quotes]);

  // กรองและเรียงลำดับใบเสนอราคา
  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        if (brandFilter !== "ALL" && q.brand !== brandFilter) return false;
        if (statusFilter !== "ALL" && q.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const keyword = searchQuery.toLowerCase();
          const matchText =
            `${q.brand} ${q.model} ${q.trim} ${q.salesName} ${q.showroom} ${q.note}`.toLowerCase();
          if (!matchText.includes(keyword)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "NET_COST_ASC":
            return a.computed.netEffectiveCost - b.computed.netEffectiveCost;
          case "TOTAL_OUTFLOW_ASC":
            return a.computed.totalCashOutflow - b.computed.totalCashOutflow;
          case "MONTHLY_ASC":
            return a.computed.monthlyPayment - b.computed.monthlyPayment;
          case "DAY_ONE_ASC":
            return a.computed.dayOneCashTotal - b.computed.dayOneCashTotal;
          case "DATE_DESC":
          default:
            return b.quoteDate.localeCompare(a.quoteDate);
        }
      });
  }, [quotes, brandFilter, statusFilter, searchQuery, sortBy]);

  // หาใบเสนอราคาที่ต้นทุนสุทธิถูกที่สุดในรายการที่กรองอยู่
  const lowestNetCostId = useMemo(() => {
    if (filteredQuotes.length < 2) return null;
    let minQuote = filteredQuotes[0];
    for (const q of filteredQuotes) {
      if (q.computed.netEffectiveCost < minQuote.computed.netEffectiveCost) {
        minQuote = q;
      }
    }
    return minQuote.id;
  }, [filteredQuotes]);

  const bestDeal = filteredQuotes.find((q) => q.id === lowestNetCostId) || filteredQuotes[0];

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            รายการใบเสนอราคาทั้งหมด ({quotes.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ติ๊กเลือก 2–4 รายการเพื่อเปิดตารางเปรียบเทียบ หรือกด Clone เพื่อคัดลอกไปแก้เงื่อนไขเซลคนอื่น
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            title="รีเซ็ตข้อมูลตัวอย่างเริ่มต้น"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>

          {selectedCompareIds.length >= 2 && (
            <Link
              href={`/compare?ids=${selectedCompareIds.join(",")}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              <Scale className="h-4 w-4" />
              <span>เทียบ {selectedCompareIds.length} รายการที่เลือก</span>
            </Link>
          )}

          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ เพิ่มใบเสนอราคาใหม่</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Banner */}
      {bestDeal && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              จำนวนใบเสนอราคาที่กรอง
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {filteredQuotes.length} ใบเสนอราคา
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-emerald-700">
              🏆 ต้นทุนสุทธิคุ้มที่สุด
            </div>
            <div className="text-lg font-extrabold text-emerald-600">
              {formatTHB(bestDeal.computed.netEffectiveCost)}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {bestDeal.brand} {bestDeal.model} ({bestDeal.salesName})
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-500">
              ค่างวดต่ำสุดในรายการ
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {formatTHB(
                Math.min(...filteredQuotes.map((q) => q.computed.monthlyPayment))
              )}
              /ด.
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-500">
              เงินออกรถวันแรกต่ำสุด
            </div>
            <div className="text-lg font-extrabold text-amber-700">
              {formatTHB(
                Math.min(...filteredQuotes.map((q) => q.computed.dayOneCashTotal))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหายี่ห้อ, รุ่นรถ, ชื่อเซล, สาขาโชว์รูม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Brand Filter */}
          <div className="sm:col-span-3">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">ทุกยี่ห้อ ({quotes.length})</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  ยี่ห้อ {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div className="sm:col-span-4 relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-emerald-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="NET_COST_ASC">
                เรียงตาม: ต้นทุนสุทธิคุ้มสุด (ต่ำ → สูง)
              </option>
              <option value="TOTAL_OUTFLOW_ASC">
                เรียงตาม: ยอดจ่ายจริงรวมถูกที่สุด
              </option>
              <option value="MONTHLY_ASC">
                เรียงตาม: ค่างวดต่อเดือนถูกที่สุด
              </option>
              <option value="DAY_ONE_ASC">
                เรียงตาม: เงินออกรถวันรับรถน้อยที่สุด
              </option>
              <option value="DATE_DESC">
                เรียงตาม: วันที่ได้รับใบเสนอราคาล่าสุด
              </option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ทั้งหมด
          </button>
          {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {QUOTE_STATUS_LABELS[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <p className="text-base font-bold text-slate-700">
            ไม่พบใบเสนอราคาที่ตรงกับเงื่อนไขการค้นหา
          </p>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
          >
            <PlusCircle className="h-4 w-4" />
            <span>สร้างใบเสนอราคาใหม่</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              isLowestNetCost={quote.id === lowestNetCostId}
            />
          ))}
        </div>
      )}

      <CompareFloatingBar />
    </div>
  );
}
