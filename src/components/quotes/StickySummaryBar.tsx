"use client";

import React, { useState } from "react";
import { QuoteCalculationResult } from "@/lib/finance/types";
import { formatTHB } from "@/lib/utils";
import { ChevronUp, ChevronDown, Save, Sparkles } from "lucide-react";

interface StickySummaryBarProps {
  result: QuoteCalculationResult;
  installmentMonths: number;
  interestRateFlat: number;
  isSaving?: boolean;
  onSave?: () => void;
  saveLabel?: string;
}

export function StickySummaryBar({
  result,
  installmentMonths,
  interestRateFlat,
  isSaving,
  onSave,
  saveLabel = "บันทึกใบเสนอราคา",
}: StickySummaryBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sticky bottom-14 md:bottom-0 z-20 mt-8 rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-2xl overflow-hidden">
      {/* แผงขยายแสดงสูตรและโครงสร้างตัวเลขอย่างละเอียด */}
      {expanded && (
        <div className="border-b border-slate-800 bg-slate-950/90 p-4 sm:p-5 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              เจาะลึกโครงสร้างตัวเลขไฟแนนซ์ (Real-time Breakdown)
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-white"
            >
              ซ่อนรายละเอียด ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-medium">1. โครงสร้างยอดจัด & ดอกเบี้ย</div>
              <div className="flex justify-between">
                <span className="text-slate-400">ราคารถหลังหักส่วนลดเงินสด:</span>
                <span>{formatTHB(result.netCarPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  หักเงินดาวน์ ({result.effectiveDownPaymentPercent}%):
                </span>
                <span>-{formatTHB(result.effectiveDownPaymentAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white border-t border-slate-800 pt-1">
                <span>ยอดจัดไฟแนนซ์ (Principal):</span>
                <span>{formatTHB(result.loanPrincipal)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>
                  ดอกเบี้ยรวม ({interestRateFlat}% × {installmentMonths} งวด):
                </span>
                <span>+{formatTHB(result.totalInterest)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-medium">2. ค่าใช้จ่ายวันรับรถ (Day-1 Cash)</div>
              <div className="flex justify-between">
                <span className="text-slate-400">เงินดาวน์จ่ายจริง (หักซับดาวน์):</span>
                <span>{formatTHB(result.netDownPaymentOutOfPocket)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ค่าจดทะเบียน+ประกัน+ไฟแนนซ์:</span>
                <span>+{formatTHB(result.otherDeliveryFeesTotal)}</span>
              </div>
              <div className="flex justify-between text-sky-300">
                <span>มัดจำป้ายแดง (ได้คืนทีหลัง):</span>
                <span>+{formatTHB(result.redPlateDeposit)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white border-t border-slate-800 pt-1">
                <span>รวมเงินต้องเตรียมวันรับรถ:</span>
                <span>{formatTHB(result.dayOneCashTotal)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-medium">3. ยอดจ่ายจริง & ต้นทุนสุทธิ</div>
              <div className="flex justify-between">
                <span className="text-slate-400">เงินออกรถ (ไม่รวมป้ายแดง):</span>
                <span>{formatTHB(result.dayOneCashExclRedPlate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">รวมค่างวด ({installmentMonths} งวด):</span>
                <span>+{formatTHB(result.totalInstallmentPaid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span>ยอดจ่ายจริงตลอดสัญญา:</span>
                <span>{formatTHB(result.totalCashOutflow)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-1 font-semibold">
                <span>หักของแถมที่ใช้จริง:</span>
                <span>-{formatTHB(result.totalEffectiveFreebiesValue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* แถบสรุปหลักที่แสดงตลอดเวลา */}
      <div className="p-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 flex-1">
          <div>
            <div className="text-[11px] text-slate-400">
              ค่างวด/เดือน ({installmentMonths} งวด)
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {formatTHB(result.monthlyPayment)}
              <span className="text-xs font-normal text-slate-400">/ด.</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">เงินเตรียมวันรับรถ (Day-1)</div>
            <div className="text-base sm:text-lg font-bold text-amber-300">
              {formatTHB(result.dayOneCashTotal)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">ยอดจ่ายจริงตลอดสัญญา</div>
            <div className="text-base sm:text-lg font-bold text-slate-200">
              {formatTHB(result.totalCashOutflow)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-emerald-400 font-medium">
              ★ ต้นทุนสุทธิ (หักของแถม)
            </div>
            <div className="text-base sm:text-xl font-extrabold text-emerald-400">
              {formatTHB(result.netEffectiveCost)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-800 pt-2.5 sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            {expanded ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>ซ่อนสูตร</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>ดูโครงสร้างคำนวณ</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            onClick={onSave}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "กำลังบันทึก..." : saveLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
