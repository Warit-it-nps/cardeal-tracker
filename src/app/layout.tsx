import type { Metadata } from "next";
import "./globals.css";
import { QuotesProvider } from "@/components/providers/QuotesProvider";
import { Navbar } from "@/components/layout/Navbar";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cardeal-tracker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CarDeal Tracker — คำนวณค่างวดรถ & เปรียบเทียบใบเสนอราคารถยนต์",
    template: "%s | CarDeal Tracker",
  },
  description:
    "เครื่องมือบันทึกและเปรียบเทียบใบเสนอราคารถยนต์ คำนวณค่างวดไฟแนนซ์ ส่วนลดเงินสด ซับดาวน์ เงินออกรถวันรับรถ และมูลค่าของแถม เพื่อหายอดจ่ายจริงสุทธิที่คุ้มค่าที่สุด",
  keywords: [
    "เปรียบเทียบใบเสนอราคารถยนต์",
    "คำนวณค่างวดรถยนต์",
    "คำนวณไฟแนนซ์รถ",
    "ซับดาวน์คืออะไร",
    "ส่วนลดเงินสด vs ซับดาวน์",
    "เปรียบเทียบโปรโมชั่นรถไฟฟ้า EV",
    "คำนวณเงินดาวน์รถ",
    "ใบเสนอราคารถใหม่",
    "Motor Expo",
    "BYD",
    "Toyota",
    "Honda",
    "Tesla",
    "Deepal",
  ],
  authors: [{ name: "CarDeal Tracker" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    siteName: "CarDeal Tracker",
    title: "CarDeal Tracker — คำนวณค่างวดรถ & เปรียบเทียบใบเสนอราคารถยนต์",
    description:
      "บันทึกข้อเสนอจากหลายโชว์รูม คำนวณค่างวด ส่วนลดเงินสด ซับดาวน์ และของแถม เพื่อเทียบยอดจ่ายจริงตลอดสัญญา",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarDeal Tracker — คำนวณค่างวดรถ & เปรียบเทียบใบเสนอราคารถยนต์",
    description:
      "บันทึกข้อเสนอจากหลายโชว์รูม คำนวณค่างวด ส่วนลดเงินสด ซับดาวน์ และของแถม เพื่อเทียบยอดจ่ายจริงตลอดสัญญา",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CarDeal Tracker",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "th-TH",
    description:
      "ระบบบันทึก คำนวณไฟแนนซ์ และเปรียบเทียบใบเสนอราคารถยนต์ แยกส่วนลดเงินสด ซับดาวน์ เงินออกรถวันรับรถ และมูลค่าของแถม",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "THB",
    },
  };

  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 font-sans antialiased pb-20 md:pb-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
