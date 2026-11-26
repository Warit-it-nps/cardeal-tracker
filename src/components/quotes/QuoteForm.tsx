"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CarQuoteRecord,
  FreebieItemInput,
  PowertrainType,
  QuoteStatus,
} from "@/lib/finance/types";
import { calculateCarQuote } from "@/lib/finance/calculator";
import {
  POPULAR_CAR_BRANDS,
  POWERTRAIN_LABELS,
  QUOTE_STATUS_LABELS,
} from "@/lib/finance/presets";
import { DownPaymentDualInput } from "./DownPaymentDualInput";
import { FreebiesManager } from "./FreebiesManager";
import { StickySummaryBar } from "./StickySummaryBar";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { formatTHB } from "@/lib/utils";
import {
  Car,
  Calculator,
  Wallet,
  Gift,
  Globe,
  AlertTriangle,
  Info,
} from "lucide-react";

interface QuoteFormProps {
  initialQuote?: CarQuoteRecord;
  mode: "create" | "edit";
}

const INSTALLMENT_PRESETS = [48, 60, 72, 84];

export function QuoteForm({ initialQuote, mode }: QuoteFormProps) {
  const router = useRouter();
  const { upsertQuote } = useQuotes();
  const [isSaving, setIsSaving] = useState(false);

  // [1] ข้อมูลรถและผู้ขาย
  const [brand, setBrand] = useState(initialQuote?.brand ?? "BYD");
  const [model, setModel] = useState(initialQuote?.model ?? "");
  const [trim, setTrim] = useState(initialQuote?.trim ?? "");
  const [powertrain, setPowertrain] = useState<PowertrainType>(
    initialQuote?.powertrain ?? "EV"
  );
  const [salesName, setSalesName] = useState(initialQuote?.salesName ?? "");
  const [showroom, setShowroom] = useState(initialQuote?.showroom ?? "");
  const [salesContact, setSalesContact] = useState(
    initialQuote?.salesContact ?? ""
  );
  const [quoteDate, setQuoteDate] = useState(
    initialQuote?.quoteDate ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<QuoteStatus>(
    initialQuote?.status ?? "NEGOTIATING"
  );
  const [note, setNote] = useState(initialQuote?.note ?? "");

  // [2] โครงสร้างราคาและเงื่อนไขไฟแนนซ์ (Flat Rate)
  const [msrp, setMsrp] = useState<number>(initialQuote?.msrp ?? 939000);
  const [cashDiscount, setCashDiscount] = useState<number>(
    initialQuote?.cashDiscount ?? 40000
  );
  const [downPaymentSubsidy, setDownPaymentSubsidy] = useState<number>(
    initialQuote?.downPaymentSubsidy ?? 20000
  );
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(
    initialQuote?.downPaymentAmount ?? 179800
  );
  const [interestRateFlat, setInterestRateFlat] = useState<number>(
    initialQuote?.interestRateFlat ?? 1.88
  );
  const [installmentMonths, setInstallmentMonths] = useState<number>(
    initialQuote?.installmentMonths ?? 60
  );

  // [3] ค่าใช้จ่ายแฝงวันรับรถ (Delivery Day Out-of-Pocket)
  const [registrationFee, setRegistrationFee] = useState<number>(
    initialQuote?.registrationFee ?? 3500
  );
  const [insuranceFee, setInsuranceFee] = useState<number>(
    initialQuote?.insuranceFee ?? 0
  );
  const [financeOtherFee, setFinanceOtherFee] = useState<number>(
    initialQuote?.financeOtherFee ?? 1000
  );
  const [redPlateDeposit, setRedPlateDeposit] = useState<number>(
    initialQuote?.redPlateDeposit ?? 3000
  );

  // [4] ของแถมและการแชร์
  const [freebies, setFreebies] = useState<FreebieItemInput[]>(
    initialQuote?.freebies ?? [
      {
        id: "default-ins",
        itemName: "ประกันภัยชั้น 1",
        brandDetail: "ซ่อมห้าง 1 ปี",
        estimatedValue: 22000,
        isIncludedInCalc: true,
      },
      {
        id: "default-prb",
        itemName: "พ.ร.บ. รถยนต์",
        brandDetail: "คุ้มครอง 1 ปี",
        estimatedValue: 645,
        isIncludedInCalc: true,
      },
      {
        id: "default-film",
        itemName: "ฟิล์มกรองแสงรอบคัน + บานหน้า",
        brandDetail: "เซรามิค",
        estimatedValue: 8000,
        isIncludedInCalc: true,
      },
    ]
  );

  const [isPublic, setIsPublic] = useState<boolean>(
    initialQuote?.isPublic ?? true
  );
  const [shareSalesContact, setShareSalesContact] = useState<boolean>(
    initialQuote?.shareSalesContact ?? false
  );

  // Real-time Pure Calculation
  const result = useMemo(
    () =>
      calculateCarQuote({
        msrp,
        cashDiscount,
        downPaymentSubsidy,
        downPaymentAmount,
        interestRateFlat,
        installmentMonths,
        registrationFee,
        insuranceFee,
        financeOtherFee,
        redPlateDeposit,
        freebies,
      }),
    [
      msrp,
      cashDiscount,
      downPaymentSubsidy,
      downPaymentAmount,
      interestRateFlat,
      installmentMonths,
      registrationFee,
      insuranceFee,
      financeOtherFee,
      redPlateDeposit,
      freebies,
    ]
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await upsertQuote({
        id: initialQuote?.id,
        shareToken: initialQuote?.shareToken,
        brand: brand.trim() || "ไม่ระบุยี่ห้อ",
        model: model.trim() || "ไม่ระบุรุ่น",
        trim: trim.trim() || "Standard",
        powertrain,
        salesName: salesName.trim() || "ไม่ระบุชื่อเซล",
        showroom: showroom.trim() || "ไม่ระบุสาขา",
        salesContact: salesContact.trim(),
        quoteDate,
        status,
        note: note.trim(),
        msrp,
        cashDiscount,
        downPaymentSubsidy,
        downPaymentAmount,
        interestRateFlat,
        installmentMonths,
        registrationFee,
        insuranceFee,
        financeOtherFee,
        redPlateDeposit,
        freebies,
        isPublic,
        shareSalesContact,
      });
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* แจ้งเตือน Edge Cases อัตโนมัติ */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>ข้อสังเกตจากระบบคำนวณไฟแนนซ์:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {result.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ส่วนที่ 1: ข้อมูลรถและผู้ขาย */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              1. ข้อมูลรถและผู้ขาย (Car & Sales Info)
            </h2>
            <p className="text-xs text-slate-500">
              ระบุรุ่นรถ โชว์รูม และสถานะการคุยเพื่อใช้เปรียบเทียบภายหลัง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยี่ห้อรถ (Brand) *
            </label>
            <input
              list="car-brands-list"
              type="text"
              required
              placeholder="เช่น BYD, Toyota, Honda"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
            <datalist id="car-brands-list">
              {POPULAR_CAR_BRANDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รุ่นรถ (Model) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Sealion 6, Civic, Yaris Ativ"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รุ่นย่อย (Trim / Variant) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Dynamic, e:HEV EL+, Premium"
              value={trim}
              onChange={(e) => setTrim(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* ประเภทพลังงาน & สถานะ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทพลังงาน
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(POWERTRAIN_LABELS) as PowertrainType[]).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPowertrain(pt)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all ${
                    powertrain === pt
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              สถานะใบเสนอราคา
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuoteStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((st) => (
                <option key={st} value={st}>
                  {QUOTE_STATUS_LABELS[st].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ข้อมูลเซลและโชว์รูม */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อเซล (Sales Name)
            </label>
            <input
              type="text"
              placeholder="เช่น คุณเมย์"
              value={salesName}
              onChange={(e) => setSalesName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              โชว์รูม / สาขา / งานแฟร์
            </label>
            <input
              type="text"
              placeholder="เช่น พระราม 3 / Motor Expo"
              value={showroom}
              onChange={(e) => setShowroom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เบอร์โทร / Line ID
            </label>
            <input
              type="text"
              placeholder="เช่น 081-xxx-xxxx / Line"
              value={salesContact}
              onChange={(e) => setSalesContact(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่ได้รับใบเสนอราคา
            </label>
            <input
              type="date"
              value={quoteDate}
              onChange={(e) => setQuoteDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* ส่วนที่ 2: โครงสร้างราคาและเงื่อนไขไฟแนนซ์ (Flat Rate) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              2. โครงสร้างราคาและเงื่อนไขไฟแนนซ์ (Thai Flat Rate)
            </h2>
            <p className="text-xs text-slate-500">
              แยกส่วนลดเงินสด (หักราคารถก่อนคิดดอกเบี้ย) กับซับดาวน์ (ช่วยจ่ายวันรับรถ) ออกจากกันอย่างแม่นยำ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ราคารถตั้งต้น (MSRP - บาท) *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={msrp || ""}
              onChange={(e) => setMsrp(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-700 mb-1">
              ส่วนลดเงินสดหักราคารถ (Cash Discount)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={cashDiscount || ""}
              onChange={(e) =>
                setCashDiscount(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-base font-bold text-emerald-800 focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              ✓ หักจากราคารถก่อนคำนวณยอดจัด (ช่วยลดต้นและดอกเบี้ย)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-700 mb-1">
              ซับดาวน์ (Down Payment Subsidy)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={downPaymentSubsidy || ""}
              onChange={(e) =>
                setDownPaymentSubsidy(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full rounded-lg border border-amber-300 bg-amber-50/30 px-3 py-2 text-base font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              ✓ ไม่หักราคารถ แต่เอาไปช่วยลดเงินดาวน์ที่ต้องจ่ายวันรับรถ
            </p>
          </div>
        </div>

        {/* เงินดาวน์ Dual Input (% <-> บาท) */}
        <DownPaymentDualInput
          msrp={msrp}
          cashDiscount={cashDiscount}
          downPaymentAmount={downPaymentAmount}
          onChangeAmount={setDownPaymentAmount}
        />

        {/* ดอกเบี้ย & จำนวนงวด */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อัตราดอกเบี้ยต่อปี (% Flat Rate)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="25"
                value={interestRateFlat}
                onChange={(e) =>
                  setInterestRateFlat(Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-14 text-base font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">
                % / ปี
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              รองรับดอกเบี้ย 0% (โปรโมชั่นผ่อน 0%)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนงวดผ่อนชำระ (เดือน)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {INSTALLMENT_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInstallmentMonths(m)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      installmentMonths === m
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {m} งวด
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="12"
                max="120"
                value={installmentMonths}
                onChange={(e) =>
                  setInstallmentMonths(
                    Math.max(1, parseInt(e.target.value, 10) || 48)
                  )
                }
                className="w-24 rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* สรุปผลคำนวณไฟแนนซ์ย่อย */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-900 p-4 text-white">
          <div>
            <div className="text-[11px] text-slate-400">ราคารถหลังหักส่วนลด</div>
            <div className="text-sm sm:text-base font-bold">
              {formatTHB(result.netCarPrice)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ยอดจัดไฟแนนซ์</div>
            <div className="text-sm sm:text-base font-bold text-sky-300">
              {formatTHB(result.loanPrincipal)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ดอกเบี้ยรวมตลอดสัญญา</div>
            <div className="text-sm sm:text-base font-bold text-amber-300">
              {formatTHB(result.totalInterest)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-400">ค่างวดต่อเดือน</div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400">
              {formatTHB(result.monthlyPayment)}/ด.
            </div>
          </div>
        </div>
      </section>

      {/* ส่วนที่ 3: ค่าใช้จ่ายแฝงวันรับรถ (Delivery Day Out-of-Pocket) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              3. ค่าใช้จ่ายแฝงวันรับรถ (Delivery Day Out-of-Pocket)
            </h2>
            <p className="text-xs text-slate-500">
              คำนวณเงินสดที่ต้องเตรียมไปจ่ายจริงในวันรับรถ (แยกรายการมัดจำป้ายแดงที่ได้คืนภายหลัง)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ค่าจดทะเบียน (กรณีไม่แถม)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={registrationFee || ""}
              onChange={(e) =>
                setRegistrationFee(Math.max(0, parseFloat(e.target.value) || 0))
              }
              placeholder="0 (ถ้าแถมฟรี)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ค่าประกันชั้น 1 + พ.ร.บ. (กรณีจ่ายเอง)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={insuranceFee || ""}
              onChange={(e) =>
                setInsuranceFee(Math.max(0, parseFloat(e.target.value) || 0))
              }
              placeholder="0 (ถ้าแถมฟรี)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ค่าดำเนินการไฟแนนซ์ / อื่นๆ
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={financeOtherFee || ""}
              onChange={(e) =>
                setFinanceOtherFee(Math.max(0, parseFloat(e.target.value) || 0))
              }
              placeholder="เช่น ค่าอากร/ค่าจัด"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sky-700 mb-1">
              ค่ามัดจำป้ายแดง (ได้คืนทีหลัง)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={redPlateDeposit || ""}
              onChange={(e) =>
                setRedPlateDeposit(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full rounded-lg border border-sky-300 bg-sky-50/40 px-3 py-2 text-sm font-semibold text-sky-900 focus:border-sky-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-sky-600">
              * ไม่ถูกนำมารวมเป็นต้นทุนสุทธิ เพราะได้เงินคืน
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              เงินดาวน์จ่ายจริง{" "}
              <strong>{formatTHB(result.netDownPaymentOutOfPocket)}</strong> +
              ค่าใช้จ่ายวันออกรถ <strong>{formatTHB(result.otherDeliveryFeesTotal)}</strong>{" "}
              + มัดจำป้ายแดง <strong>{formatTHB(result.redPlateDeposit)}</strong>
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            รวมเงินต้องเตรียมวันรับรถ (Total Day-1 Cash):{" "}
            <span className="text-amber-700 text-base">
              {formatTHB(result.dayOneCashTotal)}
            </span>
          </div>
        </div>
      </section>

      {/* ส่วนที่ 4: ระบบของแถมและมูลค่าประเมิน */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Gift className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              4. ระบบของแถมและมูลค่าประเมิน (Freebies & Value Estimator)
            </h2>
            <p className="text-xs text-slate-500">
              ระบุยี่ห้อและมูลค่าประเมินของแถมแต่ละชิ้น พร้อมติ๊กเลือกเฉพาะของที่ได้ใช้งานจริงเพื่อหักคำนวณความคุ้มค่า
            </p>
          </div>
        </div>

        <FreebiesManager freebies={freebies} onChange={setFreebies} />
      </section>

      {/* ส่วนที่ 5: หมายเหตุและการตั้งค่าความเป็นส่วนตัว / การแชร์สาธารณะ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              5. หมายเหตุ & การแชร์ใบเสนอราคา (Privacy & Public Sharing)
            </h2>
            <p className="text-xs text-slate-500">
              เลือกเก็บไว้ดูส่วนตัว หรือแชร์ลิงก์ให้เพื่อนและคนในเว็บเข้ามาดูราคาได้โดยไม่ต้อง Login
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            บันทึกช่วยจำ / เงื่อนไขพิเศษจากเซล
          </label>
          <textarea
            rows={2}
            placeholder="เช่น ต้องออกรถภายในสิ้นเดือน, แถมกรอบป้าย + น้ำมันเต็มถัง, รอเช็คสีรถ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                เปิดแชร์ใบเสนอราคานี้เป็นสาธารณะ (Public Deal)
              </div>
              <p className="text-xs text-slate-500">
                คนทั่วไปสามารถเข้าดูใบเสนอราคานี้ผ่านลิงก์แชร์ หรือดูในหน้า &ldquo;ตลาดราคาที่แชร์&rdquo; ได้โดยไม่ต้อง Login
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-opacity ${
              isPublic
                ? "border-slate-200 hover:bg-slate-50"
                : "border-slate-100 bg-slate-50 opacity-50 pointer-events-none"
            }`}
          >
            <input
              type="checkbox"
              checked={shareSalesContact}
              disabled={!isPublic}
              onChange={(e) => setShareSalesContact(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                เปิดเผยชื่อและเบอร์ติดต่อเซลในหน้าสาธารณะ
              </div>
              <p className="text-xs text-slate-500">
                หากไม่ติ๊ก ระบบจะแสดงเฉพาะโครงสร้างราคาและสาขาโชว์รูม แต่ซ่อนชื่อและเบอร์โทรเซลไว้เพื่อความเป็นส่วนตัว
              </p>
            </div>
          </label>
        </div>

        <div className="pt-3 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>
              {isSaving
                ? "กำลังบันทึกข้อมูล..."
                : mode === "edit"
                ? "💾 บันทึกการแก้ไขใบเสนอราคา"
                : "💾 บันทึกใบเสนอราคา"}
            </span>
          </button>
        </div>
      </section>

      {/* Sticky Real-time Summary Bar */}
      <StickySummaryBar
        result={result}
        installmentMonths={installmentMonths}
        interestRateFlat={interestRateFlat}
        isSaving={isSaving}
        saveLabel={
          mode === "edit" ? "บันทึกการแก้ไขใบเสนอราคา" : "บันทึกใบเสนอราคา"
        }
      />
    </form>
  );
}
