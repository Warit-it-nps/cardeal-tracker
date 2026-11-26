"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { POWERTRAIN_LABELS } from "@/lib/finance/presets";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import {
  ArrowLeft,
  Copy,
  Check,
  Globe,
  Gift,
  Scale,
  User,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";

export default function PublicShareDetailPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const {
    getQuoteByIdOrToken,
    duplicateQuote,
    toggleCompareSelection,
    selectedCompareIds,
  } = useQuotes();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const quote = params?.token ? getQuoteByIdOrToken(params.token) : undefined;

  if (!quote || !quote.isPublic) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          ไม่พบลิงก์ใบเสนอราคานี้ หรือเจ้าของตั้งค่าเป็นส่วนตัวแล้ว
        </h2>
        <p className="text-xs text-slate-500">
          คุณยังสามารถดูใบเสนอราคาที่แชร์สาธารณะรายการอื่นๆ ได้ในหน้าตลาดราคาที่แชร์
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ดูใบเสนอราคาที่แชร์ทั้งหมด</span>
        </Link>
      </div>
    );
  }

  const pt = POWERTRAIN_LABELS[quote.powertrain];
  const isSelectedForCompare = selectedCompareIds.includes(quote.id);

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const handleCloneToMyQuotes = async () => {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ดูใบเสนอราคาที่แชร์รายการอื่น</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>คัดลอกลิงก์แล้ว</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>คัดลอกลิงก์แชร์</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleCompareSelection(quote.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              isSelectedForCompare
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>
              {isSelectedForCompare
                ? "✓ เลือกในตารางเทียบแล้ว"
                : "+ นำไปเปรียบเทียบ"}
            </span>
          </button>

          <button
            type="button"
            disabled={isCloning}
            onClick={handleCloneToMyQuotes}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>
              {isCloning
                ? "กำลังคัดลอก..."
                : "คัดลอกใบนี้ไปปรับตัวเลขของฉัน"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Public Quote Sheet */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <Globe className="h-3 w-3" />
                  รายละเอียดใบเสนอราคา
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pt.badgeClass}`}
                >
                  {pt.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {quote.brand} {quote.model} — รุ่น {quote.trim}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  โชว์รูม: {quote.showroom || "ไม่ระบุ"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  เซล:{" "}
                  {quote.shareSalesContact
                    ? quote.salesName || "ไม่ระบุ"
                    : "ซ่อนโดยผู้แชร์"}
                </span>
                {quote.shareSalesContact && quote.salesContact && (
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    ติดต่อ: {quote.salesContact}
                  </span>
                )}
                <span>• วันที่ใบเสนอราคา: {formatThaiDate(quote.quoteDate)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/90 border border-slate-700 p-4 text-right">
              <div className="text-xs text-emerald-400 font-semibold">
                ★ ต้นทุนสุทธิหลังหักของแถม (True Net Cost)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatTHB(quote.computed.netEffectiveCost)}
              </div>
              <div className="text-[11px] text-slate-400">
                จากราคาป้าย MSRP {formatTHB(quote.msrp)}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50">
          <div className="p-4">
            <div className="text-xs text-slate-500">
              ค่างวดต่อเดือน ({quote.installmentMonths} งวด)
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">
              {formatTHB(quote.computed.monthlyPayment)}
              <span className="text-xs font-normal text-slate-500">/ด.</span>
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-500">
              เงินเตรียมวันรับรถ (Day-1 Cash)
            </div>
            <div className="mt-1 text-xl font-extrabold text-amber-700">
              {formatTHB(quote.computed.dayOneCashTotal)}
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-500">
              ดอกเบี้ยรวม ({quote.interestRateFlat}% Flat)
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">
              {formatTHB(quote.computed.totalInterest)}
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-500">
              ยอดจ่ายจริงตลอดสัญญา
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">
              {formatTHB(quote.computed.totalCashOutflow)}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              โครงสร้างราคา & การคำนวณไฟแนนซ์
            </h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">ราคารถตั้งต้น (MSRP):</dt>
                <dd className="font-semibold">{formatTHB(quote.msrp)}</dd>
              </div>
              <div className="flex justify-between text-emerald-700">
                <dt>หักส่วนลดเงินสด (ลดราคารถ):</dt>
                <dd className="font-semibold">-{formatTHB(quote.cashDiscount)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <dt>ราคารถสุทธิหลังหักส่วนลด:</dt>
                <dd>{formatTHB(quote.computed.netCarPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">
                  เงินดาวน์ ({quote.computed.effectiveDownPaymentPercent}%):
                </dt>
                <dd className="font-semibold">
                  -{formatTHB(quote.computed.effectiveDownPaymentAmount)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                <dt>ยอดจัดไฟแนนซ์ (Loan Principal):</dt>
                <dd>{formatTHB(quote.computed.loanPrincipal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>
                  ดอกเบี้ยรวม ({quote.interestRateFlat}% ×{" "}
                  {quote.installmentMonths / 12} ปี):
                </dt>
                <dd className="font-semibold">
                  +{formatTHB(quote.computed.totalInterest)}
                </dd>
              </div>
            </dl>

            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 pt-3">
              ค่าใช้จ่ายวันรับรถ (Delivery Day Out-of-Pocket)
            </h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">เงินดาวน์ตั้งต้น:</dt>
                <dd>{formatTHB(quote.computed.effectiveDownPaymentAmount)}</dd>
              </div>
              <div className="flex justify-between text-amber-700">
                <dt>หักซับดาวน์ (โชว์รูมช่วยดาวน์):</dt>
                <dd className="font-semibold">
                  -{formatTHB(quote.downPaymentSubsidy)}
                </dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>เงินดาวน์ที่ต้องจ่ายจริง:</dt>
                <dd>{formatTHB(quote.computed.netDownPaymentOutOfPocket)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>ค่าจดทะเบียน + ประกันจ่ายเอง + ค่าไฟแนนซ์:</dt>
                <dd>+{formatTHB(quote.computed.otherDeliveryFeesTotal)}</dd>
              </div>
              <div className="flex justify-between text-sky-700">
                <dt>ค่ามัดจำป้ายแดง (ได้คืนทีหลัง):</dt>
                <dd>+{formatTHB(quote.redPlateDeposit)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-amber-800">
                <dt>รวมเงินต้องเตรียมวันรับรถ:</dt>
                <dd>{formatTHB(quote.computed.dayOneCashTotal)}</dd>
              </div>
            </dl>
          </div>

          {/* Freebies List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-emerald-600" />
                <span>รายการของแถม ({quote.freebies.length} รายการ)</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                มูลค่าที่ใช้จริง: {formatTHB(quote.computed.totalEffectiveFreebiesValue)}
              </span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm">
              {quote.freebies.map((f) => (
                <li
                  key={f.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    f.isIncludedInCalc
                      ? "border-emerald-200 bg-emerald-50/40 text-slate-900"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <div>
                    <div className="font-bold">{f.itemName}</div>
                    {f.brandDetail && (
                      <div className="text-xs text-slate-500">
                        {f.brandDetail}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatTHB(f.estimatedValue)}</div>
                    <div className="text-[10px]">
                      {f.isIncludedInCalc ? "✓ นำมาหักต้นทุนสุทธิ" : "ไม่นำมาหัก"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {quote.note && quote.shareSalesContact && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">
                  หมายเหตุจากผู้บันทึกใบเสนอราคา:
                </div>
                <p>{quote.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
