"use client";

import React from "react";
import {
  calcDownPaymentAmountFromPercent,
  calcDownPaymentPercentFromAmount,
  getNetCarPrice,
} from "@/lib/finance/calculator";
import { formatTHB } from "@/lib/utils";

interface DownPaymentDualInputProps {
  msrp: number;
  cashDiscount: number;
  downPaymentAmount: number;
  onChangeAmount: (newAmount: number) => void;
}

const PRESET_PERCENTS = [10, 15, 20, 25, 30];

export function DownPaymentDualInput({
  msrp,
  cashDiscount,
  downPaymentAmount,
  onChangeAmount,
}: DownPaymentDualInputProps) {
  const netCarPrice = getNetCarPrice(msrp, cashDiscount);
  const currentPercent = calcDownPaymentPercentFromAmount(
    msrp,
    cashDiscount,
    downPaymentAmount
  );

  const handlePercentChange = (percentValue: number) => {
    const amount = calcDownPaymentAmountFromPercent(
      msrp,
      cashDiscount,
      percentValue
    );
    onChangeAmount(amount);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-sm font-semibold text-slate-800">
            เงินดาวน์ (Down Payment)
          </label>
          <p className="text-xs text-slate-500">
            คำนวณจากราคารถหลังหักส่วนลดเงินสด ({formatTHB(netCarPrice)})
          </p>
        </div>

        {/* ปุ่มลัดเลือก % เงินดาวน์ยอดนิยม */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_PERCENTS.map((pct) => {
            const isSelected = Math.abs(currentPercent - pct) < 0.05;
            return (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentChange(pct)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                }`}
              >
                {pct}%
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ช่องกรอกเป็นเปอร์เซ็นต์ (%) */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            กรอกเป็นเปอร์เซ็นต์ (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={Number.isFinite(currentPercent) ? currentPercent : 0}
              onChange={(e) =>
                handlePercentChange(parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400">
              %
            </span>
          </div>
        </div>

        {/* ช่องกรอกเป็นจำนวนเงิน (บาท) */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            กรอกเป็นจำนวนเงิน (บาท)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              max={netCarPrice || undefined}
              value={
                Number.isFinite(downPaymentAmount)
                  ? Math.round(downPaymentAmount)
                  : 0
              }
              onChange={(e) =>
                onChangeAmount(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">
              บาท
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
