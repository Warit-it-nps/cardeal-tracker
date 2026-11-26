-- ============================================================================
-- CarDeal Tracker: Complete Supabase Schema, Triggers, Views & RLS Policies
-- ============================================================================

-- 1. Enable UUID / Crypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create ENUM types
DO $$ BEGIN
    CREATE TYPE powertrain_type AS ENUM ('EV', 'HEV', 'PHEV', 'ICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM (
        'NEGOTIATING',   -- กำลังคุย
        'TEST_DRIVE',    -- นัดทดลองขับ
        'SHORTLISTED',   -- ตัวเต็ง
        'BOOKED',        -- จองแล้ว
        'DROPPED'        -- ตัดทิ้ง
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Main Table: car_quotes
CREATE TABLE IF NOT EXISTS public.car_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- [1] ข้อมูลรถและผู้ขาย (Car & Sales Info)
    brand TEXT NOT NULL,                              -- เช่น BYD, Honda, Toyota, Tesla
    model TEXT NOT NULL,                              -- เช่น Sealion 6, Civic, Yaris Ativ
    trim TEXT NOT NULL,                               -- เช่น Dynamic, e:HEV RS, Premium
    powertrain powertrain_type NOT NULL DEFAULT 'EV',
    sales_name TEXT,                                  -- ชื่อเซล
    showroom TEXT,                                    -- โชว์รูม/สาขา (เช่น พระราม 3, Motor Expo)
    sales_contact TEXT,                               -- เบอร์โทร / Line ID
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status quote_status NOT NULL DEFAULT 'NEGOTIATING',
    note TEXT,

    -- [2] โครงสร้างราคาและเงื่อนไขไฟแนนซ์ (Flat Rate Inputs)
    msrp NUMERIC(12, 2) NOT NULL CHECK (msrp >= 0),
    cash_discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cash_discount >= 0),
    down_payment_subsidy NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (down_payment_subsidy >= 0),
    down_payment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (down_payment_amount >= 0),
    down_payment_percent NUMERIC(6, 3) NOT NULL DEFAULT 0 CHECK (down_payment_percent >= 0 AND down_payment_percent <= 100),
    interest_rate_flat NUMERIC(5, 3) NOT NULL DEFAULT 0 CHECK (interest_rate_flat >= 0), -- % ต่อปี เช่น 1.880, 2.490
    installment_months INTEGER NOT NULL DEFAULT 48 CHECK (installment_months > 0 AND installment_months <= 120),

    -- [3] ค่าใช้จ่ายแฝงวันรับรถ (Delivery Day Out-of-Pocket)
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),    -- ค่าจดทะเบียน
    insurance_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (insurance_fee >= 0),          -- ประกันชั้น 1 + พ.ร.บ. (กรณีจ่ายเอง)
    finance_other_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (finance_other_fee >= 0),  -- ค่าดำเนินการไฟแนนซ์/อื่นๆ
    red_plate_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (red_plate_deposit >= 0),  -- ค่ามัดจำป้ายแดง (ได้คืน ไม่รวมในต้นทุนสุทธิ)

    -- [4] ตัวชี้วัดสรุปผลที่คำนวณแล้ว (Cached Computed Metrics สำหรับ Sort/Filter เร็ว)
    net_car_price NUMERIC(12, 2) NOT NULL DEFAULT 0,          -- ราคารถหลังหักส่วนลดเงินสด
    loan_principal NUMERIC(12, 2) NOT NULL DEFAULT 0,         -- ยอดจัดไฟแนนซ์
    total_interest NUMERIC(12, 2) NOT NULL DEFAULT 0,         -- ดอกเบี้ยรวมตลอดสัญญา
    monthly_payment NUMERIC(12, 2) NOT NULL DEFAULT 0,        -- ค่างวดต่อเดือน
    day_one_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,           -- เงินเตรียมวันรับรถ (รวมมัดจำป้ายแดง)
    total_cash_outflow NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- ยอดจ่ายจริงตลอดสัญญา (ไม่รวมมัดจำป้ายแดง)
    total_effective_freebies NUMERIC(12, 2) NOT NULL DEFAULT 0, -- มูลค่าของแถมที่ติ๊กนำมาคำนวณ
    net_effective_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- ต้นทุนสุทธิหลังหักของแถม (True Net Cost)

    -- [5] การตั้งค่าความเป็นส่วนตัวและการแชร์ (Privacy & Sharing)
    is_public BOOLEAN NOT NULL DEFAULT FALSE,                 -- แชร์สาธารณะให้คนทั่วไปดูได้โดยไม่ต้อง Login
    share_sales_contact BOOLEAN NOT NULL DEFAULT FALSE,       -- เปิดเผยชื่อและเบอร์เซลในหน้าสาธารณะหรือไม่
    share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'), -- รหัสลิงก์แชร์ 16 ตัวอักษร

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Child Table: quote_freebies (รายการของแถมและมูลค่าประเมิน)
CREATE TABLE IF NOT EXISTS public.quote_freebies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.car_quotes(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,                                  -- เช่น ประกันภัยชั้น 1, ฟิล์มกรองแสง, Wall Charger
    brand_detail TEXT,                                        -- เช่น วิริยะซ่อมห้าง, Lamina Ceramic, ABB 7kW
    estimated_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (estimated_value >= 0),
    is_included_in_calc BOOLEAN NOT NULL DEFAULT TRUE,        -- นำมาหักคำนวณความคุ้มค่าหรือไม่
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for High Performance Filtering & Sorting
CREATE INDEX IF NOT EXISTS idx_car_quotes_user_id ON public.car_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_car_quotes_public_feed ON public.car_quotes(is_public, brand, model, net_effective_cost) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_car_quotes_share_token ON public.car_quotes(share_token);
CREATE INDEX IF NOT EXISTS idx_car_quotes_user_sorting ON public.car_quotes(user_id, net_effective_cost, monthly_payment);
CREATE INDEX IF NOT EXISTS idx_quote_freebies_quote_id ON public.quote_freebies(quote_id);

-- 6. Auto-update `updated_at` Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_car_quotes_updated_at ON public.car_quotes;
CREATE TRIGGER trg_car_quotes_updated_at
    BEFORE UPDATE ON public.car_quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.car_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_freebies ENABLE ROW LEVEL SECURITY;

-- 7.1 Policies for `car_quotes`
-- (A) SELECT: เจ้าของดูได้ทุกใบ หรือ คนทั่วไป (ทั้ง anon และ authenticated) ดูได้เฉพาะใบที่ is_public = TRUE
CREATE POLICY "Allow read own quotes or public quotes"
    ON public.car_quotes
    FOR SELECT
    TO anon, authenticated
    USING (
        is_public = TRUE
        OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

-- (B) INSERT: เฉพาะผู้ใช้ที่ Login แล้ว และบันทึกในชื่อ user_id ตัวเองเท่านั้น
CREATE POLICY "Allow authenticated users to insert own quotes"
    ON public.car_quotes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- (C) UPDATE: เฉพาะเจ้าของใบเสนอราคาเท่านั้น
CREATE POLICY "Allow owners to update own quotes"
    ON public.car_quotes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- (D) DELETE: เฉพาะเจ้าของใบเสนอราคาเท่านั้น
CREATE POLICY "Allow owners to delete own quotes"
    ON public.car_quotes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7.2 Policies for `quote_freebies`
-- (A) SELECT: ดูของแถมได้ถ้าเป็นเจ้าของใบเสนอราคาแม่ หรือใบเสนอราคาแม่เปิด is_public = TRUE
CREATE POLICY "Allow read freebies of accessible quotes"
    ON public.quote_freebies
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.car_quotes q
            WHERE q.id = quote_freebies.quote_id
              AND (q.is_public = TRUE OR (auth.uid() IS NOT NULL AND q.user_id = auth.uid()))
        )
    );

-- (B) INSERT / UPDATE / DELETE: เฉพาะเจ้าของใบเสนอราคาแม่เท่านั้น
CREATE POLICY "Allow owners to manage freebies"
    ON public.quote_freebies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.car_quotes q
            WHERE q.id = quote_freebies.quote_id
              AND q.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.car_quotes q
            WHERE q.id = quote_freebies.quote_id
              AND q.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 8. Secure View สำหรับหน้า Public Explore & Share Link (ป้องกัน PII รั่วไหล)
-- ============================================================================
CREATE OR REPLACE VIEW public.public_quotes_view
WITH (security_invoker = true) AS
SELECT
    id,
    brand,
    model,
    trim,
    powertrain,
    showroom,
    quote_date,
    status,
    CASE WHEN share_sales_contact THEN sales_name ELSE 'ไม่ระบุ (ซ่อนโดยผู้แชร์)' END AS sales_name,
    CASE WHEN share_sales_contact THEN sales_contact ELSE NULL END AS sales_contact,
    CASE WHEN share_sales_contact THEN note ELSE NULL END AS note,
    msrp,
    cash_discount,
    down_payment_subsidy,
    down_payment_amount,
    down_payment_percent,
    interest_rate_flat,
    installment_months,
    registration_fee,
    insurance_fee,
    finance_other_fee,
    red_plate_deposit,
    net_car_price,
    loan_principal,
    total_interest,
    monthly_payment,
    day_one_cash,
    total_cash_outflow,
    total_effective_freebies,
    net_effective_cost,
    share_token,
    share_sales_contact,
    created_at
FROM public.car_quotes
WHERE is_public = TRUE;

-- ============================================================================
-- 9. Table & Schema Grants for Supabase Roles (anon & authenticated)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.car_quotes TO anon;
GRANT SELECT ON public.quote_freebies TO anon;
GRANT SELECT ON public.public_quotes_view TO anon, authenticated;
GRANT ALL ON public.car_quotes TO authenticated;
GRANT ALL ON public.quote_freebies TO authenticated;
