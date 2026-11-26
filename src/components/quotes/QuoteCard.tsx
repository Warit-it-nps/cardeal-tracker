"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CarQuoteRecord } from "@/lib/finance/types";
import { POWERTRAIN_LABELS, QUOTE_STATUS_LABELS } from "@/lib/finance/presets";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { ShareQuoteModal } from "./ShareQuoteModal";
import {
  Copy,
  Edit3,
  Globe,
  Lock,
  Share2,
  Trash2,
  CheckSquare,
  Square,
  User,
  MapPin,
  Gift,
  Eye,
} from "lucide-react";

interface QuoteCardProps {
  quote: CarQuoteRecord;
  isLowestNetCost?: boolean;
  readOnlyPublicMode?: boolean;
}

export function QuoteCard({
  quote,
  isLowestNetCost = false,
  readOnlyPublicMode = false,
}: QuoteCardProps) {
  const router = useRouter();
  const {
    selectedCompareIds,
    toggleCompareSelection,
    duplicateQuote,
    deleteQuote,
  } = useQuotes();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const isSelectedForCompare = selectedCompareIds.includes(quote.id);
  const ptBadge = POWERTRAIN_LABELS[quote.powertrain] || POWERTRAIN_LABELS.EV;
  const stBadge =
    QUOTE_STATUS_LABELS[quote.status] || QUOTE_STATUS_LABELS.NEGOTIATING;

  const handleDuplicate = async () => {
    setIsCloning(true);
    try {
      const cloned = await duplicateQuote(quote.id);
      if (cloned) {
        router.push(`/quotes/${cloned.id}/edit`);
      }
    } finally {
      setIsCloning(false);
    }
  };

  const diffFromMsrp = quote.computed.diffFromMsrp;

  return (
    <>
      <div
        className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
          isSelectedForCompare
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : isLowestNetCost
            ? "border-emerald-300"
            : "border-slate-200"
        }`}
      >
        {/* ป้ายกำกับคุ้มที่สุด */}
        {isLowestNetCost && (
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
            <span>🏆 ต้นทุนสุทธิคุ้มค่าที่สุดในรายการ</span>
          </div>
        )}

        <div>
          {/* แถวบนสุด: Checkbox เทียบ + ชื่อรุ่น + ป้ายพลังงาน & สถานะ */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggleCompareSelection(quote.id)}
                className={`mt-0.5 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${
                  isSelectedForCompare
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400"
                }`}
                title="ติ๊กเลือกเพื่อนำเข้าตารางเปรียบเทียบ Side-by-Side (2-4 รายการ)"
              >
                {isSelectedForCompare ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                <span>เทียบ</span>
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {quote.brand} {quote.model}
                  </h3>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {quote.trim}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {readOnlyPublicMode && !quote.shareSalesContact
                      ? "ไม่ระบุชื่อเซล (ซ่อนโดยผู้แชร์)"
                      : quote.salesName || "ไม่ระบุเซล"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {quote.showroom || "ไม่ระบุสาขา"}
                  </span>
                  <span>• {formatThaiDate(quote.quoteDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ptBadge.badgeClass}`}
              >
                {quote.powertrain}
              </span>
              {!readOnlyPublicMode && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] ${stBadge.badgeClass}`}
                >
                  {stBadge.label}
                </span>
              )}
            </div>
          </div>

          {/* ตัวเลขราคาตั้งต้น & ส่วนลด */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100">
            <div>
              ราคาป้าย:{" "}
              <strong className="text-slate-900">
                {formatTHB(quote.msrp)}
              </strong>
            </div>
            <div>
              ลดเงินสด:{" "}
              <strong className="text-emerald-700">
                -{formatTHB(quote.cashDiscount)}
              </strong>
            </div>
            <div>
              ซับดาวน์:{" "}
              <strong className="text-amber-700">
                -{formatTHB(quote.downPaymentSubsidy)}
              </strong>
            </div>
          </div>

          {/* กล่องตัวเลขสำคัญ 2 ช่อง: ค่างวด/เดือน และ เงินออกรถวันรับรถ */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500">
                ค่างวด ({quote.installmentMonths} งวด @{quote.interestRateFlat}%)
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-slate-900">
                {formatTHB(quote.computed.monthlyPayment)}
                <span className="text-xs font-normal text-slate-500">/ด.</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                ดอกเบี้ยรวม: {formatTHB(quote.computed.totalInterest)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] text-slate-500">
                เงินออกรถวันรับรถ (Day-1)
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-amber-700">
                {formatTHB(quote.computed.dayOneCashTotal)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                ดาวน์ {quote.computed.effectiveDownPaymentPercent}% (รวมป้ายแดง{" "}
                {formatTHB(quote.redPlateDeposit)})
              </div>
            </div>
          </div>

          {/* กล่องสรุปยอดจ่ายจริงตลอดสัญญา & ต้นทุนสุทธิ (True Net Cost) */}
          <div className="mt-3 rounded-xl bg-slate-900 p-3.5 text-white space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>ยอดจ่ายจริงตลอดสัญญา (ไม่รวมป้ายแดง):</span>
              <span className="font-semibold text-white">
                {formatTHB(quote.computed.totalCashOutflow)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="inline-flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                หักของแถมที่ใช้จริง (
                {quote.freebies.filter((f) => f.isIncludedInCalc).length} รายการ):
              </span>
              <span className="font-semibold">
                -{formatTHB(quote.computed.totalEffectiveFreebiesValue)}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400">
                  ★ ต้นทุนสุทธิ (True Net Cost)
                </span>
                <div className="text-[11px] text-slate-400">
                  {diffFromMsrp <= 0
                    ? `ต่ำกว่าราคาป้าย ${formatTHB(Math.abs(diffFromMsrp))}`
                    : `สูงกว่าราคาป้าย +${formatTHB(diffFromMsrp)}`}
                </div>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {formatTHB(quote.computed.netEffectiveCost)}
              </div>
            </div>
          </div>

          {quote.note && (!readOnlyPublicMode || quote.shareSalesContact) && (
            <p className="mt-2.5 line-clamp-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
              💡 {quote.note}
            </p>
          )}
        </div>

        {/* ปุ่มคำสั่งด้านล่างการ์ด */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {readOnlyPublicMode ? (
            <>
              <Link
                href={`/share/${quote.shareToken}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                <span>ดูรายละเอียดเต็ม</span>
              </Link>

              <button
                type="button"
                disabled={isCloning}
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>
                  {isCloning ? "กำลังคัดลอก..." : "คัดลอกไปเปรียบเทียบ / แก้ไขต่อ"}
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/quotes/${quote.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>แก้ไข</span>
                </Link>

                <button
                  type="button"
                  disabled={isCloning}
                  onClick={handleDuplicate}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="คัดลอกใบเสนอราคานี้เพื่อไปเปลี่ยนชื่อเซล หรือปรับ % เงินดาวน์เปรียบเทียบ"
                >
                  <Copy className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isCloning ? "กำลังโคลน..." : "Clone เทียบเซลอื่น"}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    quote.isPublic
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {quote.isPublic ? (
                    <>
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                      <span>แชร์อยู่</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>ส่วนตัว</span>
                    </>
                  )}
                  <Share2 className="h-3 w-3 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteQuote(quote.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="ลบใบเสนอราคา"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareQuoteModal
          quote={quote}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
