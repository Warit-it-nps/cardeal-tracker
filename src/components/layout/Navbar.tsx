"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront,
  LayoutDashboard,
  PlusCircle,
  Scale,
  Globe,
  LogIn,
  LogOut,
  Cloud,
  HardDrive,
} from "lucide-react";
import { useQuotes } from "@/components/providers/QuotesProvider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { selectedCompareIds, user, isCloudConnected, signOut } = useQuotes();

  const navItems = [
    {
      href: "/dashboard",
      label: "ใบเสนอราคาของฉัน",
      icon: LayoutDashboard,
    },
    {
      href: "/quotes/new",
      label: "คำนวณ / เพิ่มใบเสนอราคา",
      icon: PlusCircle,
    },
    {
      href: "/compare",
      label: "เปรียบเทียบ",
      icon: Scale,
      badge: selectedCompareIds.length,
    },
    {
      href: "/explore",
      label: "ตลาดราคาที่แชร์ (Public)",
      icon: Globe,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <CarFront className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  CarDeal <span className="text-emerald-600">Tracker</span>
                </span>
                <p className="hidden text-[11px] text-slate-500 sm:block">
                  ระบบคำนวณยอดจ่ายจริงสุทธิ & เปรียบเทียบใบเสนอราคารถยนต์
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                user && isCloudConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-600"
              )}
              title={
                user && isCloudConnected
                  ? "เชื่อมต่อ Supabase Cloud แล้ว"
                  : "บันทึกข้อมูลอัตโนมัติในเบราว์เซอร์ (เข้าใช้งานได้ทันทีไม่ต้องตั้งค่า DB)"
              }
            >
              {user && isCloudConnected ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Supabase Sync</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                  <span>Local Ready</span>
                </>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-block text-xs font-medium text-slate-600 max-w-[140px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                <span>Google Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around border-t border-slate-200 bg-white/95 py-1.5 px-2 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                isActive ? "text-emerald-600 font-semibold" : "text-slate-500"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 truncate max-w-[76px]">
                {item.href === "/quotes/new"
                  ? "เพิ่มใบเสนอ"
                  : item.href === "/explore"
                  ? "ราคาที่แชร์"
                  : item.href === "/dashboard"
                  ? "ใบเสนอราคา"
                  : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
