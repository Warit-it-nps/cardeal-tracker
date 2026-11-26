"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { QuoteForm } from "@/components/quotes/QuoteForm";
import { ArrowLeft } from "lucide-react";

export default function EditQuotePage() {
  const params = useParams<{ id: string }>();
  const { getQuoteByIdOrToken, isLoading } = useQuotes();

  const quote = params?.id ? getQuoteByIdOrToken(params.id) : undefined;

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        กำลังโหลดข้อมูลใบเสนอราคา...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          ไม่พบใบเสนอราคาที่ต้องการแก้ไข
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปหน้า Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>กลับไปหน้ารายการใบเสนอราคา</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          แก้ไขใบเสนอราคา: {quote.brand} {quote.model} ({quote.trim})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          เซล: {quote.salesName || "-"} • โชว์รูม: {quote.showroom || "-"}
        </p>
      </div>

      <QuoteForm mode="edit" initialQuote={quote} />
    </div>
  );
}
