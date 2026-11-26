"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { CarQuoteRecord, FreebieItemInput } from "@/lib/finance/types";
import {
  calculateCarQuote,
  calcDownPaymentPercentFromAmount,
} from "@/lib/finance/calculator";
import { INITIAL_DEMO_QUOTES } from "@/lib/finance/presets";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { generateShareToken } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const LOCAL_STORAGE_KEY = "cardeal_tracker_quotes_v2";
const LEGACY_LOCAL_STORAGE_KEY = "cardeal_tracker_quotes_v1";
const COMPARE_STORAGE_KEY = "cardeal_tracker_compare_ids_v2";

interface QuotesContextValue {
  quotes: CarQuoteRecord[];
  publicQuotes: CarQuoteRecord[];
  selectedCompareIds: string[];
  user: User | null;
  isCloudConnected: boolean;
  isLoading: boolean;
  dbError: string | null;
  upsertQuote: (
    quoteInput: Omit<
      CarQuoteRecord,
      | "id"
      | "computed"
      | "downPaymentPercent"
      | "createdAt"
      | "updatedAt"
      | "shareToken"
    > & {
      id?: string;
      shareToken?: string;
    }
  ) => Promise<CarQuoteRecord>;
  deleteQuote: (id: string) => Promise<void>;
  duplicateQuote: (id: string) => Promise<CarQuoteRecord | null>;
  togglePublicShare: (
    id: string,
    isPublic: boolean,
    shareSalesContact: boolean
  ) => Promise<void>;
  toggleCompareSelection: (id: string) => void;
  clearCompareSelection: () => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  getQuoteByIdOrToken: (idOrToken: string) => CarQuoteRecord | undefined;
  signOut: () => Promise<void>;
}

const QuotesContext = createContext<QuotesContextValue | undefined>(undefined);

function isUuid(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    val
  );
}

function hydrateQuoteRecord(q: CarQuoteRecord): CarQuoteRecord {
  return {
    ...q,
    computed: calculateCarQuote(q),
    downPaymentPercent: calcDownPaymentPercentFromAmount(
      q.msrp,
      q.cashDiscount,
      q.downPaymentAmount
    ),
  };
}

function readLocalQuotes(): CarQuoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(hydrateQuoteRecord);
  } catch {
    return [];
  }
}

function writeLocalQuotes(records: CarQuoteRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to persist to localStorage:", e);
  }
}

function mergeCloudAndLocalQuotes(
  cloudQuotes: CarQuoteRecord[],
  localQuotes: CarQuoteRecord[]
): CarQuoteRecord[] {
  const map = new Map<string, CarQuoteRecord>();
  // ใส่ข้อมูลจาก Cloud ก่อน
  for (const cq of cloudQuotes) {
    map.set(cq.id, cq);
  }
  // รวมข้อมูลที่บันทึกไว้ในเครื่อง (Local) ที่ยังไม่ได้อยู่ใน Cloud ไม่ให้หายเด็ดขาด
  for (const lq of localQuotes) {
    if (!map.has(lq.id)) {
      map.set(lq.id, lq);
    }
  }
  return Array.from(map.values());
}

function mapSupabaseRowToRecord(row: Record<string, any>): CarQuoteRecord {
  const freebies: FreebieItemInput[] = Array.isArray(row.quote_freebies)
    ? row.quote_freebies.map((f: Record<string, any>) => ({
        id: String(f.id),
        itemName: String(f.item_name || ""),
        brandDetail: String(f.brand_detail || ""),
        estimatedValue: Number(f.estimated_value || 0),
        isIncludedInCalc: Boolean(f.is_included_in_calc),
        sortOrder: Number(f.sort_order || 0),
      }))
    : [];

  const baseInput = {
    msrp: Number(row.msrp || 0),
    cashDiscount: Number(row.cash_discount || 0),
    downPaymentSubsidy: Number(row.down_payment_subsidy || 0),
    downPaymentAmount: Number(row.down_payment_amount || 0),
    interestRateFlat: Number(row.interest_rate_flat || 0),
    installmentMonths: Number(row.installment_months || 60),
    registrationFee: Number(row.registration_fee || 0),
    insuranceFee: Number(row.insurance_fee || 0),
    financeOtherFee: Number(row.finance_other_fee || 0),
    redPlateDeposit: Number(row.red_plate_deposit || 0),
    freebies,
  };

  const computed = calculateCarQuote(baseInput);
  const downPaymentPercent = calcDownPaymentPercentFromAmount(
    baseInput.msrp,
    baseInput.cashDiscount,
    baseInput.downPaymentAmount
  );

  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    brand: String(row.brand || ""),
    model: String(row.model || ""),
    trim: String(row.trim || ""),
    powertrain: (row.powertrain as CarQuoteRecord["powertrain"]) || "EV",
    salesName: String(row.sales_name || ""),
    showroom: String(row.showroom || ""),
    salesContact: String(row.sales_contact || ""),
    quoteDate: String(row.quote_date || new Date().toISOString().slice(0, 10)),
    status: (row.status as CarQuoteRecord["status"]) || "NEGOTIATING",
    note: String(row.note || ""),
    ...baseInput,
    downPaymentPercent,
    isPublic: Boolean(row.is_public),
    shareSalesContact: Boolean(row.share_sales_contact),
    shareToken: String(row.share_token || generateShareToken()),
    computed,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<CarQuoteRecord[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const isCloudConnected = isSupabaseConfigured();

  const syncWithSupabase = useCallback(async (currentUser: User | null) => {
    const localItems = readLocalQuotes();
    const supabase = createClient();
    if (!supabase) {
      setQuotes(localItems);
      return false;
    }

    // 1. หากผู้ใช้ Login แล้ว และมีรายการที่เคยบันทึกไว้ในเครื่อง (Local id: quote-...) ให้ส่งขึ้น Supabase อัตโนมัติ
    if (currentUser) {
      const unsyncedLocals = localItems.filter((item) => !isUuid(item.id));
      for (const item of unsyncedLocals) {
        const dbPayload: Record<string, any> = {
          user_id: currentUser.id,
          brand: item.brand,
          model: item.model,
          trim: item.trim,
          powertrain: item.powertrain,
          sales_name: item.salesName,
          showroom: item.showroom,
          sales_contact: item.salesContact,
          quote_date: item.quoteDate,
          status: item.status,
          note: item.note,
          msrp: item.msrp,
          cash_discount: item.cashDiscount,
          down_payment_subsidy: item.downPaymentSubsidy,
          down_payment_amount: item.downPaymentAmount,
          down_payment_percent: item.downPaymentPercent,
          interest_rate_flat: item.interestRateFlat,
          installment_months: item.installmentMonths,
          registration_fee: item.registrationFee,
          insurance_fee: item.insuranceFee,
          finance_other_fee: item.financeOtherFee,
          red_plate_deposit: item.redPlateDeposit,
          net_car_price: item.computed.netCarPrice,
          loan_principal: item.computed.loanPrincipal,
          total_interest: item.computed.totalInterest,
          monthly_payment: item.computed.monthlyPayment,
          day_one_cash: item.computed.dayOneCashTotal,
          total_cash_outflow: item.computed.totalCashOutflow,
          total_effective_freebies: item.computed.totalEffectiveFreebiesValue,
          net_effective_cost: item.computed.netEffectiveCost,
          is_public: item.isPublic,
          share_sales_contact: item.shareSalesContact,
          share_token: item.shareToken,
        };

        const { data: savedRow, error: insertErr } = await supabase
          .from("car_quotes")
          .insert(dbPayload)
          .select()
          .single();

        if (!insertErr && savedRow) {
          const newId = String(savedRow.id);
          if (item.freebies.length > 0) {
            await supabase.from("quote_freebies").insert(
              item.freebies.map((f, idx) => ({
                quote_id: newId,
                item_name: f.itemName,
                brand_detail: f.brandDetail,
                estimated_value: f.estimatedValue,
                is_included_in_calc: f.isIncludedInCalc,
                sort_order: idx,
              }))
            );
          }
          // แทนที่ ID เดิมที่เป็น quote-... ด้วย UUID ที่บันทึกใน Cloud สำเร็จแล้ว
          item.id = newId;
          item.userId = currentUser.id;
        }
      }
      writeLocalQuotes(localItems);
    }

    // 2. ดึงข้อมูลล่าสุดจาก Supabase
    const { data: rows, error } = await supabase
      .from("car_quotes")
      .select("*, quote_freebies(*)")
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.code === "42P01" ||
        error.message?.includes("car_quotes") ||
        error.message?.includes("relation")
      ) {
        setDbError(
          "ยังไม่ได้สร้างตารางในฐานข้อมูล Supabase กรุณานำโค้ดในไฟล์ supabase/schema.sql ไปรันใน Supabase SQL Editor"
        );
      } else if (error.code === "42501") {
        setDbError(
          "ตารางใน Supabase ยังไม่ได้เปิดสิทธิ์ GRANT ให้ผู้ใช้เข้าถึง กรุณารันคำสั่ง GRANT ใน Supabase SQL Editor"
        );
      } else {
        setDbError(error.message);
      }
      // กรณี DB มีปัญหา ให้แสดงข้อมูลใน LocalStorage ทันที ห้ามทับเป็นค่าว่าง
      setQuotes(localItems);
      return false;
    }

    setDbError(null);
    const cloudQuotes = (rows || []).map(mapSupabaseRowToRecord);

    // 3. ผสานข้อมูล Cloud + ข้อมูล Local ที่ยังไม่ได้ซิงค์ เพื่อไม่ให้ข้อมูลที่ผู้ใช้เพิ่งกรอกหายเด็ดขาด
    const merged = mergeCloudAndLocalQuotes(
      cloudQuotes,
      readLocalQuotes()
    );
    setQuotes(merged);
    writeLocalQuotes(merged);
    return true;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // โหลดจาก LocalStorage ขึ้นมาแสดงทันทีในเสี้ยววินาทีแรก (ไม่ให้หน้าว่างหรือข้อมูลหาย)
        const initialLocal = readLocalQuotes();
        if (mounted && initialLocal.length > 0) {
          setQuotes(initialLocal);
        }

        const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
        if (savedCompare) {
          const parsedCompare = JSON.parse(savedCompare);
          if (Array.isArray(parsedCompare)) {
            setSelectedCompareIds(parsedCompare.slice(0, 4));
          }
        }

        const supabase = createClient();
        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const sessionUser = session?.user ?? null;
          if (mounted) {
            setUser(sessionUser);
          }

          await syncWithSupabase(sessionUser);

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            const nextUser = newSession?.user ?? null;
            if (mounted) {
              setUser(nextUser);
              await syncWithSupabase(nextUser);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (e) {
        console.error("Failed to initialize quotes store:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [syncWithSupabase]);

  const persistLocal = useCallback((nextQuotes: CarQuoteRecord[]) => {
    setQuotes(nextQuotes);
    writeLocalQuotes(nextQuotes);
  }, []);

  const upsertQuote: QuotesContextValue["upsertQuote"] = useCallback(
    async (quoteInput) => {
      const now = new Date().toISOString();
      const computed = calculateCarQuote(quoteInput);
      const downPaymentPercent = calcDownPaymentPercentFromAmount(
        quoteInput.msrp,
        quoteInput.cashDiscount,
        computed.effectiveDownPaymentAmount
      );

      const currentList = readLocalQuotes().length > 0 ? readLocalQuotes() : quotes;
      const existing = quoteInput.id
        ? currentList.find((q) => q.id === quoteInput.id)
        : undefined;

      const record: CarQuoteRecord = {
        ...quoteInput,
        id: existing?.id || quoteInput.id || `quote-${Date.now()}`,
        userId: user?.id || existing?.userId,
        downPaymentAmount: computed.effectiveDownPaymentAmount,
        downPaymentPercent,
        shareToken:
          existing?.shareToken || quoteInput.shareToken || generateShareToken(),
        computed,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      // บันทึกลง Supabase ถ้าระบบเชื่อมต่อแล้วและผู้ใช้ล็อกอินอยู่
      const supabase = createClient();
      if (supabase && user) {
        const dbPayload: Record<string, any> = {
          ...(existing && isUuid(existing.id) ? { id: existing.id } : {}),
          user_id: user.id,
          brand: record.brand,
          model: record.model,
          trim: record.trim,
          powertrain: record.powertrain,
          sales_name: record.salesName,
          showroom: record.showroom,
          sales_contact: record.salesContact,
          quote_date: record.quoteDate,
          status: record.status,
          note: record.note,
          msrp: record.msrp,
          cash_discount: record.cashDiscount,
          down_payment_subsidy: record.downPaymentSubsidy,
          down_payment_amount: record.downPaymentAmount,
          down_payment_percent: record.downPaymentPercent,
          interest_rate_flat: record.interestRateFlat,
          installment_months: record.installmentMonths,
          registration_fee: record.registrationFee,
          insurance_fee: record.insuranceFee,
          finance_other_fee: record.financeOtherFee,
          red_plate_deposit: record.redPlateDeposit,
          net_car_price: record.computed.netCarPrice,
          loan_principal: record.computed.loanPrincipal,
          total_interest: record.computed.totalInterest,
          monthly_payment: record.computed.monthlyPayment,
          day_one_cash: record.computed.dayOneCashTotal,
          total_cash_outflow: record.computed.totalCashOutflow,
          total_effective_freebies:
            record.computed.totalEffectiveFreebiesValue,
          net_effective_cost: record.computed.netEffectiveCost,
          is_public: record.isPublic,
          share_sales_contact: record.shareSalesContact,
          share_token: record.shareToken,
        };

        const { data: savedRow, error } = await supabase
          .from("car_quotes")
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          setDbError(error.message);
        } else if (savedRow) {
          setDbError(null);
          record.id = String(savedRow.id);
          await supabase
            .from("quote_freebies")
            .delete()
            .eq("quote_id", record.id);
          if (record.freebies.length > 0) {
            await supabase.from("quote_freebies").insert(
              record.freebies.map((f, idx) => ({
                quote_id: record.id,
                item_name: f.itemName,
                brand_detail: f.brandDetail,
                estimated_value: f.estimatedValue,
                is_included_in_calc: f.isIncludedInCalc,
                sort_order: idx,
              }))
            );
          }
        }
      }

      const nextQuotes = existing
        ? currentList.map((q) => (q.id === existing.id ? record : q))
        : [record, ...currentList];

      persistLocal(nextQuotes);
      return record;
    },
    [quotes, user, persistLocal]
  );

  const deleteQuote = useCallback(
    async (id: string) => {
      const supabase = createClient();
      if (supabase && user && isUuid(id)) {
        await supabase.from("car_quotes").delete().eq("id", id);
      }
      const nextQuotes = quotes.filter((q) => q.id !== id);
      persistLocal(nextQuotes);
      setSelectedCompareIds((prev) => {
        const next = prev.filter((item) => item !== id);
        try {
          localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [quotes, user, persistLocal]
  );

  const duplicateQuote = useCallback(
    async (id: string): Promise<CarQuoteRecord | null> => {
      const source = quotes.find((q) => q.id === id);
      if (!source) return null;

      const cloned = await upsertQuote({
        brand: source.brand,
        model: source.model,
        trim: source.trim,
        powertrain: source.powertrain,
        salesName: `${source.salesName || "เซล"} (สำเนาเปรียบเทียบ)`,
        showroom: source.showroom,
        salesContact: source.salesContact,
        quoteDate: new Date().toISOString().slice(0, 10),
        status: "NEGOTIATING",
        note: source.note,
        msrp: source.msrp,
        cashDiscount: source.cashDiscount,
        downPaymentSubsidy: source.downPaymentSubsidy,
        downPaymentAmount: source.downPaymentAmount,
        interestRateFlat: source.interestRateFlat,
        installmentMonths: source.installmentMonths,
        registrationFee: source.registrationFee,
        insuranceFee: source.insuranceFee,
        financeOtherFee: source.financeOtherFee,
        redPlateDeposit: source.redPlateDeposit,
        isPublic: false,
        shareSalesContact: false,
        freebies: source.freebies.map((f, index) => ({
          ...f,
          id: `freebie-${Date.now()}-${index}`,
        })),
      });

      return cloned;
    },
    [quotes, upsertQuote]
  );

  const togglePublicShare = useCallback(
    async (id: string, isPublic: boolean, shareSalesContact: boolean) => {
      const target = quotes.find((q) => q.id === id);
      if (!target) return;
      await upsertQuote({
        ...target,
        isPublic,
        shareSalesContact,
      });
    },
    [quotes, upsertQuote]
  );

  const toggleCompareSelection = useCallback((id: string) => {
    setSelectedCompareIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          next = [...prev.slice(1), id];
        } else {
          next = [...prev, id];
        }
      }
      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearCompareSelection = useCallback(() => {
    setSelectedCompareIds([]);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  }, []);

  const loadSampleData = useCallback(() => {
    persistLocal(INITIAL_DEMO_QUOTES);
    const defaultCompare = [
      INITIAL_DEMO_QUOTES[0]?.id,
      INITIAL_DEMO_QUOTES[1]?.id,
    ].filter(Boolean);
    setSelectedCompareIds(defaultCompare);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(defaultCompare));
    } catch {}
  }, [persistLocal]);

  const clearAllData = useCallback(() => {
    persistLocal([]);
    setSelectedCompareIds([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch {}
  }, [persistLocal]);

  const getQuoteByIdOrToken = useCallback(
    (idOrToken: string) => {
      return quotes.find(
        (q) => q.id === idOrToken || q.shareToken === idOrToken
      );
    },
    [quotes]
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    await syncWithSupabase(null);
  }, [syncWithSupabase]);

  const publicQuotes = quotes.filter((q) => q.isPublic);

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        publicQuotes,
        selectedCompareIds,
        user,
        isCloudConnected,
        isLoading,
        dbError,
        upsertQuote,
        deleteQuote,
        duplicateQuote,
        togglePublicShare,
        toggleCompareSelection,
        clearCompareSelection,
        loadSampleData,
        clearAllData,
        getQuoteByIdOrToken,
        signOut,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const ctx = useContext(QuotesContext);
  if (!ctx) {
    throw new Error("useQuotes must be used within a QuotesProvider");
  }
  return ctx;
}
