"use client";

import React from "react";
import { FreebieItemInput } from "@/lib/finance/types";
import { FREEBIE_PRESETS } from "@/lib/finance/presets";
import { formatTHB } from "@/lib/utils";
import { Gift, Plus, Trash2, CheckSquare, Square } from "lucide-react";

interface FreebiesManagerProps {
  freebies: FreebieItemInput[];
  onChange: (nextFreebies: FreebieItemInput[]) => void;
}

export function FreebiesManager({ freebies, onChange }: FreebiesManagerProps) {
  const handleAddPreset = (preset: Omit<FreebieItemInput, "id">) => {
    const newItem: FreebieItemInput = {
      ...preset,
      id: `freebie-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    onChange([...freebies, newItem]);
  };

  const handleAddEmpty = () => {
    const newItem: FreebieItemInput = {
      id: `freebie-${Date.now()}`,
      itemName: "",
      brandDetail: "",
      estimatedValue: 0,
      isIncludedInCalc: true,
    };
    onChange([...freebies, newItem]);
  };

  const handleUpdate = (
    id: string,
    field: keyof FreebieItemInput,
    value: string | number | boolean
  ) => {
    onChange(
      freebies.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemove = (id: string) => {
    onChange(freebies.filter((item) => item.id !== id));
  };

  const totalAll = freebies.reduce(
    (sum, f) => sum + (Number(f.estimatedValue) || 0),
    0
  );
  const totalEffective = freebies
    .filter((f) => f.isIncludedInCalc)
    .reduce((sum, f) => sum + (Number(f.estimatedValue) || 0), 0);

  return (
    <div className="space-y-4">
      {/* ปุ่ม Preset กดเลือกเร็ว */}
      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-2">
          <Gift className="h-4 w-4 text-emerald-600" />
          <span>กดปุ่มลัดเพื่อเพิ่มของแถมยอดนิยม (พร้อมราคาประเมินมาตรฐาน):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FREEBIE_PRESETS.map((preset) => (
            <button
              key={preset.itemName}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
            >
              <Plus className="h-3 w-3 text-emerald-600" />
              <span>{preset.itemName}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                ({formatTHB(preset.estimatedValue)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* รายการของแถมปัจจุบัน */}
      {freebies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          ยังไม่มีรายการของแถม กดปุ่มลัดด้านบนหรือกด &ldquo;+ เพิ่มรายการของแถมเอง&rdquo;
        </div>
      ) : (
        <div className="space-y-2.5">
          {freebies.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-xl border p-3 transition-colors ${
                item.isIncludedInCalc
                  ? "border-slate-200 bg-white"
                  : "border-slate-200/70 bg-slate-50/80 opacity-75"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-500 sm:hidden">
                    รายการของแถม #{idx + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อของแถม (เช่น ประกันชั้น 1)"
                    value={item.itemName}
                    onChange={(e) =>
                      handleUpdate(item.id, "itemName", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="ยี่ห้อ/รายละเอียด (เช่น วิริยะ / 3M)"
                    value={item.brandDetail}
                    onChange={(e) =>
                      handleUpdate(item.id, "brandDetail", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="มูลค่า (บาท)"
                      value={item.estimatedValue || ""}
                      onChange={(e) =>
                        handleUpdate(
                          item.id,
                          "estimatedValue",
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 pr-8 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400">
                      ฿
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(
                        item.id,
                        "isIncludedInCalc",
                        !item.isIncludedInCalc
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      item.isIncludedInCalc
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                    title="เลือกเฉพาะของแถมที่ได้ใช้งานจริงเพื่อนำไปหักลบเป็นต้นทุนสุทธิ"
                  >
                    {item.isIncludedInCalc ? (
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>
                      {item.isIncludedInCalc ? "หักคำนวณคุ้มค่า" : "ไม่นำมาหัก"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="ลบรายการ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แถบปุ่มเพิ่มรายการเอง + สรุปยอดของแถม */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleAddEmpty}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>เพิ่มรายการของแถมเอง</span>
        </button>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-500">
            มูลค่าของแถมทั้งหมด:{" "}
            <strong className="text-slate-700">{formatTHB(totalAll)}</strong>
          </span>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-200">
            ของแถมที่นำมาหักต้นทุนสุทธิ: -{formatTHB(totalEffective)}
          </span>
        </div>
      </div>
    </div>
  );
}
