import type { Metadata } from "next";
import "./globals.css";
import { QuotesProvider } from "@/components/providers/QuotesProvider";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "CarDeal Tracker — ระบบบันทึกและเปรียบเทียบใบเสนอราคารถยนต์",
  description:
    "คำนวณยอดจ่ายจริงสุทธิ (True Net Cost) แยกส่วนลดเงินสด ซับดาวน์ ดอกเบี้ย Flat Rate และมูลค่าของแถม พร้อมตารางเปรียบเทียบหลายโชว์รูมแบบโปร่งใส",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 font-sans antialiased pb-20 md:pb-10">
        <QuotesProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </QuotesProvider>
      </body>
    </html>
  );
}
