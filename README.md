# CarDeal Tracker — ระบบบันทึกและเปรียบเทียบใบเสนอราคารถยนต์

เว็บแอปพลิเคชันสำหรับผู้ซื้อรถที่ต้องการบันทึกข้อเสนอจากหลายแบรนด์ หลายรุ่น และหลายโชว์รูม เพื่อคำนวณ **"ยอดจ่ายจริงสุทธิ (True Net Cost)"** ตามสูตรไฟแนนซ์รถยนต์แบบไทย (Flat Rate) พร้อมเปรียบเทียบความคุ้มค่าแบบตาราง Side-by-Side และแชร์ใบเสนอราคาให้คนอื่นดูได้โดยไม่ต้อง Login

---

## โครงสร้างไฟล์หลักที่พัฒนาแล้วเสร็จ

- **Database Schema & RLS Policies:** [`supabase/schema.sql`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/supabase/schema.sql)
- **Finance Calculation Engine (Pure TS):**
  - [`src/lib/finance/types.ts`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/lib/finance/types.ts)
  - [`src/lib/finance/calculator.ts`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/lib/finance/calculator.ts)
  - [`src/lib/finance/presets.ts`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/lib/finance/presets.ts)
- **Supabase & Hybrid Local-Cloud Store:**
  - [`src/lib/supabase/client.ts`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/lib/supabase/client.ts)
  - [`src/lib/supabase/server.ts`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/lib/supabase/server.ts)
  - [`src/components/providers/QuotesProvider.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/components/providers/QuotesProvider.tsx)
- **UI Components & Pages:**
  - หน้าแรก & ดีลสาธารณะล่าสุด: [`src/app/page.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/app/page.tsx)
  - หน้า Dashboard (กรอง/เรียงลำดับ/Clone/เลือกเทียบ): [`src/app/dashboard/page.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/app/dashboard/page.tsx)
  - หน้ากรอกและคำนวณใบเสนอราคาสดพร้อม Sticky Summary Bar: [`src/components/quotes/QuoteForm.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/components/quotes/QuoteForm.tsx)
  - หน้าเปรียบเทียบ Side-by-Side Matrix (ไฮไลต์สีเขียว + คำนวณส่วนต่าง): [`src/components/compare/ComparisonMatrix.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/components/compare/ComparisonMatrix.tsx)
  - หน้าตลาดใบเสนอราคาสาธารณะ (ไม่ต้อง Login): [`src/app/explore/page.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/app/explore/page.tsx)
  - หน้าลิงก์แชร์ใบเสนอราคา (`/share/[token]`): [`src/app/share/[token]/page.tsx`](file:///Users/waritnuamngam/StudioProjects/Ai-code/project-car/src/app/share/[token]/page.tsx)

---

## วิธีรันใช้งาน

1. รันโหมดพัฒนา (ใช้งานได้ทันทีแม้ยังไม่ได้ใส่ค่า Supabase โดยระบบจะบันทึกใน LocalStorage พร้อมข้อมูลตัวอย่าง 4 โชว์รูม):
   ```bash
   npm run dev
   ```
2. เมื่อต้องการเชื่อมต่อ **Supabase + Google Login**:
   - คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วกรอก `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - นำสคริปต์ใน `supabase/schema.sql` ไปรันใน Supabase SQL Editor
