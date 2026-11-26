"use client";

import React from "react";
import Link from "next/link";
import { CarQuoteRecord } from "@/lib/finance/types";
import { POWERTRAIN_LABELS, QUOTE_STATUS_LABELS } from "@/lib/finance/presets";
import { formatTHB } from "@/lib/utils";
import { Trophy, Edit3, Share2, X, Check } from "lucide-react";

interface ComparisonMatrixProps {
  quotes: CarQuoteRecord[];
  onRemoveFromCompare?: (id: string) => void;
}

type WinnerMode = "MIN" | "MAX" | "NONE";

interface MatrixRowSpec {
  key: string;
  label: string;
  subLabel?: string;
  section?: string;
  mode: WinnerMode;
  isHighlightRow?: boolean;
  getValue: (q: CarQuoteRecord) => number;
  formatValue: (q: CarQuoteRecord) => string;
  formatDelta?: (delta: number) => string;
}

export function ComparisonMatrix({
  quotes,
  onRemoveFromCompare,
}: ComparisonMatrixProps) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
        <p className="text-base font-bold text-slate-800">
          ยังไม่ได้เลือกใบเสนอราคาเพื่อเปรียบเทียบ
        </p>
        <p className="text-xs text-slate-500">
          กรุณาติ๊กปุ่ม &ldquo;[☑ เทียบ]&rdquo; บนการ์ดใบเสนอราคาอย่างน้อย 2 รายการ
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
        >
          กลับไปเลือกใบเสนอราคา
        </Link>
      </div>
    );
  }

  const rows: MatrixRowSpec[] = [
    {
      key: "msrp",
      section: "1. โครงสร้างราคารถ & ส่วนลด",
      label: "ราคารถตั้งต้น (MSRP)",
      mode: "MIN",
      getValue: (q) => q.msrp,
      formatValue: (q) => formatTHB(q.msrp),
    },
    {
      key: "cashDiscount",
      label: "ส่วนลดเงินสด (หักราคารถ)",
      subLabel: "ยิ่งสูงยิ่งลดยอดจัดไฟแนนซ์",
      mode: "MAX",
      getValue: (q) => q.cashDiscount,
      formatValue: (q) => formatTHB(q.cashDiscount),
    },
    {
      key: "downPaymentSubsidy",
      label: "ซับดาวน์ (ช่วยจ่ายวันรับรถ)",
      subLabel: "ไม่หักราคารถ แต่ลดเงินสดวันออกรถ",
      mode: "MAX",
      getValue: (q) => q.downPaymentSubsidy,
      formatValue: (q) => formatTHB(q.downPaymentSubsidy),
    },
    {
      key: "netCarPrice",
      label: "ราคารถสุทธิหลังหักส่วนลดเงินสด",
      mode: "MIN",
      getValue: (q) => q.computed.netCarPrice,
      formatValue: (q) => formatTHB(q.computed.netCarPrice),
    },
    {
      key: "downPayment",
      section: "2. เงื่อนไขไฟแนนซ์ (Flat Rate)",
      label: "เงินดาวน์ตั้งต้น",
      mode: "NONE",
      getValue: (q) => q.computed.effectiveDownPaymentAmount,
      formatValue: (q) =>
        `${formatTHB(q.computed.effectiveDownPaymentAmount)} (${q.computed.effectiveDownPaymentPercent}%)`,
    },
    {
      key: "loanPrincipal",
      label: "ยอดจัดไฟแนนซ์ (Loan Principal)",
      mode: "MIN",
      getValue: (q) => q.computed.loanPrincipal,
      formatValue: (q) => formatTHB(q.computed.loanPrincipal),
    },
    {
      key: "interestRateFlat",
      label: "อัตราดอกเบี้ยต่อปี (% Flat Rate)",
      mode: "MIN",
      getValue: (q) => q.interestRateFlat,
      formatValue: (q) => `${q.interestRateFlat.toFixed(2)}% / ปี`,
      formatDelta: (d) => `+${d.toFixed(2)}%`,
    },
    {
      key: "installmentMonths",
      label: "จำนวนงวดผ่อนชำระ",
      mode: "NONE",
      getValue: (q) => q.installmentMonths,
      formatValue: (q) => `${q.installmentMonths} เดือน (${q.installmentMonths / 12} ปี)`,
    },
    {
      key: "totalInterest",
      label: "ดอกเบี้ยรวมตลอดสัญญา",
      mode: "MIN",
      getValue: (q) => q.computed.totalInterest,
      formatValue: (q) => formatTHB(q.computed.totalInterest),
    },
    {
      key: "monthlyPayment",
      label: "ค่างวดต่อเดือน (Monthly Payment)",
      mode: "MIN",
      isHighlightRow: true,
      getValue: (q) => q.computed.monthlyPayment,
      formatValue: (q) => `${formatTHB(q.computed.monthlyPayment)} /เดือน`,
    },
    {
      key: "netDownPayment",
      section: "3. ค่าใช้จ่ายวันรับรถ (Delivery Day)",
      label: "เงินดาวน์จ่ายจริง (หักซับดาวน์แล้ว)",
      mode: "MIN",
      getValue: (q) => q.computed.netDownPaymentOutOfPocket,
      formatValue: (q) => formatTHB(q.computed.netDownPaymentOutOfPocket),
    },
    {
      key: "otherFees",
      label: "ค่าจดทะเบียน + ประกันจ่ายเอง + ไฟแนนซ์",
      mode: "MIN",
      getValue: (q) => q.computed.otherDeliveryFeesTotal,
      formatValue: (q) => formatTHB(q.computed.otherDeliveryFeesTotal),
    },
    {
      key: "redPlate",
      label: "ค่ามัดจำป้ายแดง (ได้คืนทีหลัง)",
      mode: "NONE",
      getValue: (q) => q.redPlateDeposit,
      formatValue: (q) => formatTHB(q.redPlateDeposit),
    },
    {
      key: "dayOneCashTotal",
      label: "รวมเงินที่ต้องเตรียมวันรับรถ (Day-1 Cash)",
      subLabel: "รวมมัดจำป้ายแดงแล้ว",
      mode: "MIN",
      isHighlightRow: true,
      getValue: (q) => q.computed.dayOneCashTotal,
      formatValue: (q) => formatTHB(q.computed.dayOneCashTotal),
    },
    {
      key: "effectiveFreebies",
      section: "4. สรุปยอดจ่ายจริง & ต้นทุนสุทธิ (Key Decision Metrics)",
      label: "มูลค่าของแถมที่ใช้งานจริง",
      subLabel: "เฉพาะรายการที่ติ๊กนำมาคำนวณ",
      mode: "MAX",
      getValue: (q) => q.computed.totalEffectiveFreebiesValue,
      formatValue: (q) => formatTHB(q.computed.totalEffectiveFreebiesValue),
    },
    {
      key: "totalCashOutflow",
      label: "ยอดจ่ายจริงตลอดสัญญา (Total Cash Outflow)",
      subLabel: "เงินออกรถจริง (ไม่รวมป้ายแดง) + (ค่างวด × จำนวนงวด)",
      mode: "MIN",
      isHighlightRow: true,
      getValue: (q) => q.computed.totalCashOutflow,
      formatValue: (q) => formatTHB(q.computed.totalCashOutflow),
    },
    {
      key: "netEffectiveCost",
      label: "★ ต้นทุนสุทธิหลังหักของแถม (True Net Cost)",
      subLabel: "ตัวชี้วัดความคุ้มค่าสุทธิที่แท้จริง",
      mode: "MIN",
      isHighlightRow: true,
      getValue: (q) => q.computed.netEffectiveCost,
      formatValue: (q) => formatTHB(q.computed.netEffectiveCost),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-900 text-white">
            <th className="sticky left-0 z-10 w-60 min-w-[210px] bg-slate-900 p-4 font-bold">
              หัวข้อเปรียบเทียบ
              <p className="mt-1 text-[11px] font-normal text-slate-400">
                ช่องสีเขียว = คุ้มค่าที่สุดในแถวนั้น พร้อมคำนวณส่วนต่างอัตโนมัติ
              </p>
            </th>

            {quotes.map((q) => {
              const pt = POWERTRAIN_LABELS[q.powertrain];
              const st = QUOTE_STATUS_LABELS[q.status];
              return (
                <th
                  key={q.id}
                  className="min-w-[210px] border-l border-slate-800 p-4 align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${pt.badgeClass}`}
                    >
                      {q.powertrain}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/quotes/${q.id}/edit`}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="แก้ไขใบเสนอราคานี้"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/share/${q.shareToken}`}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="เปิดลิงก์แชร์"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Link>
                      {onRemoveFromCompare && quotes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveFromCompare(q.id)}
                          className="rounded-md p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-300"
                          title="นำออกจากตารางเปรียบเทียบ"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-base font-extrabold text-white">
                    {q.brand} {q.model}
                  </div>
                  <div className="text-xs font-medium text-emerald-400">
                    รุ่น {q.trim}
                  </div>
                  <div className="mt-1.5 text-[11px] font-normal text-slate-300">
                    เซล: {q.salesName || "-"} ({q.showroom || "-"})
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${st.badgeClass}`}
                    >
                      {st.label}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => {
            const values = quotes.map((q) => row.getValue(q));
            const bestVal =
              row.mode === "MIN"
                ? Math.min(...values)
                : row.mode === "MAX"
                ? Math.max(...values)
                : null;

            // ตรวจสอบว่าทุกคอลัมน์เท่ากันหมดหรือไม่
            const allEqual = values.every((v) => v === values[0]);

            return (
              <React.Fragment key={row.key}>
                {row.section && (
                  <tr className="bg-slate-100/90">
                    <td
                      colSpan={quotes.length + 1}
                      className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700"
                    >
                      {row.section}
                    </td>
                  </tr>
                )}

                <tr
                  className={
                    row.key === "netEffectiveCost"
                      ? "bg-emerald-950/5 font-bold"
                      : row.isHighlightRow
                      ? "bg-slate-50/70"
                      : "hover:bg-slate-50/40"
                  }
                >
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white p-3.5 align-middle">
                    <div
                      className={
                        row.key === "netEffectiveCost"
                          ? "text-sm font-extrabold text-emerald-800"
                          : row.isHighlightRow
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-700"
                      }
                    >
                      {row.label}
                    </div>
                    {row.subLabel && (
                      <div className="text-[11px] font-normal text-slate-500">
                        {row.subLabel}
                      </div>
                    )}
                  </td>

                  {quotes.map((q) => {
                    const val = row.getValue(q);
                    const isWinner =
                      row.mode !== "NONE" &&
                      !allEqual &&
                      bestVal !== null &&
                      Math.abs(val - bestVal) < 0.005;

                    const delta =
                      bestVal !== null && !isWinner && row.mode !== "NONE"
                        ? Math.abs(val - bestVal)
                        : 0;

                    return (
                      <td
                        key={q.id}
                        className={`border-l border-slate-200 p-3.5 align-middle transition-colors ${
                          isWinner
                            ? "bg-emerald-500/15 text-emerald-950 font-extrabold"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={
                                row.key === "netEffectiveCost"
                                  ? "text-base font-black"
                                  : row.isHighlightRow
                                  ? "text-sm font-bold"
                                  : ""
                              }
                            >
                              {row.formatValue(q)}
                            </span>

                            {isWinner && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                                <Trophy className="h-3 w-3" />
                                คุ้มสุด
                              </span>
                            )}
                          </div>

                          {/* แสดงส่วนต่างเทียบกับตัวที่คุ้มที่สุดในแถวนั้น */}
                          {delta > 0 && (
                            <span className="text-[11px] font-semibold text-rose-600">
                              {row.mode === "MIN"
                                ? row.formatDelta
                                  ? `(${row.formatDelta(delta)})`
                                  : `(+${formatTHB(delta)})`
                                : `(-${formatTHB(delta)})`}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            );
          })}

          {/* แถวเปรียบเทียบรายการของแถมทั้งหมดแบบละเอียด */}
          <tr className="bg-slate-100/90">
            <td
              colSpan={quotes.length + 1}
              className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              5. รายการของแถมแต่ละใบเสนอราคา (Freebies Breakdown)
            </td>
          </tr>
          <tr>
            <td className="sticky left-0 z-10 border-r border-slate-200 bg-white p-3.5 align-top font-semibold text-slate-700">
              รายการของแถมที่ได้รับ
              <p className="mt-1 text-[11px] font-normal text-slate-500">
                ✓ = นำมาหักคำนวณความคุ้มค่า
              </p>
            </td>
            {quotes.map((q) => (
              <td
                key={q.id}
                className="border-l border-slate-200 p-3.5 align-top"
              >
                <ul className="space-y-1.5 text-xs">
                  {q.freebies.map((f) => (
                    <li
                      key={f.id}
                      className={`flex items-start justify-between gap-2 rounded-lg p-1.5 ${
                        f.isIncludedInCalc
                          ? "bg-emerald-50/60 text-slate-800"
                          : "bg-slate-50 text-slate-400 line-through"
                      }`}
                    >
                      <span className="flex items-start gap-1">
                        {f.isIncludedInCalc && (
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <span>
                          <strong>{f.itemName}</strong>
                          {f.brandDetail ? ` (${f.brandDetail})` : ""}
                        </span>
                      </span>
                      <span className="font-semibold shrink-0">
                        {formatTHB(f.estimatedValue)}
                      </span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
