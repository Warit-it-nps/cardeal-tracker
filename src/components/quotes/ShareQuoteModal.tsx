"use client";

import React, { useState } from "react";
import { CarQuoteRecord } from "@/lib/finance/types";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { Globe, Lock, Copy, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ShareQuoteModalProps {
  quote: CarQuoteRecord;
  onClose: () => void;
}

export function ShareQuoteModal({ quote, onClose }: ShareQuoteModalProps) {
  const { togglePublicShare } = useQuotes();
  const [isPublic, setIsPublic] = useState(quote.isPublic);
  const [shareSalesContact, setShareSalesContact] = useState(
    quote.shareSalesContact
  );
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${quote.shareToken}`
      : `/share/${quote.shareToken}`;

  const handleTogglePublic = async (nextPublic: boolean) => {
    setIsPublic(nextPublic);
    await togglePublicShare(quote.id, nextPublic, shareSalesContact);
  };

  const handleToggleContact = async (nextContact: boolean) => {
    setShareSalesContact(nextContact);
    await togglePublicShare(quote.id, isPublic, nextContact);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ตั้งค่าการแชร์ใบเสนอราคา
            </h3>
            <p className="text-xs text-slate-500">
              {quote.brand} {quote.model} • {quote.trim}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div
            onClick={() => handleTogglePublic(!isPublic)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
              isPublic
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isPublic
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isPublic ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {isPublic ? "สาธารณะ (แชร์ได้ไม่ต้อง Login)" : "ส่วนตัว (Private)"}
                </span>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => handleTogglePublic(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                {isPublic
                  ? "ทุกคนที่มีลิงก์หรือเข้าหน้า Public Explore สามารถดูโครงสร้างราคานี้ได้โดยไม่ต้องล็อกอิน"
                  : "เฉพาะคุณเท่านั้นที่มองเห็นใบเสนอราคานี้"}
              </p>
            </div>
          </div>

          {isPublic && (
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={shareSalesContact}
                onChange={(e) => handleToggleContact(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  แสดงชื่อเซล ({quote.salesName || "-"}) และเบอร์ติดต่อในหน้าแชร์
                </div>
                <p className="text-[11px] text-slate-500">
                  หากไม่ติ๊ก ระบบจะซ่อนชื่อและช่องทางติดต่อเซลโดยอัตโนมัติ
                </p>
              </div>
            </label>
          )}
        </div>

        {isPublic && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              ลิงก์สำหรับส่งให้เพื่อนดู (ไม่ต้อง Login):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-1 flex justify-end">
              <Link
                href={`/share/${quote.shareToken}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <span>เปิดดูหน้าแชร์สาธารณะ</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
