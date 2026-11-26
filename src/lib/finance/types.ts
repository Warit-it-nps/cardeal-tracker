export type PowertrainType = 'EV' | 'HEV' | 'PHEV' | 'ICE';

export type QuoteStatus =
  | 'NEGOTIATING' // กำลังคุย
  | 'TEST_DRIVE'  // นัดทดลองขับ
  | 'SHORTLISTED' // ตัวเต็ง
  | 'BOOKED'      // จองแล้ว
  | 'DROPPED';    // ตัดทิ้ง

export interface FreebieItemInput {
  id: string;
  itemName: string;          // เช่น "ประกันภัยชั้น 1"
  brandDetail: string;       // เช่น "วิริยะซ่อมห้าง"
  estimatedValue: number;    // มูลค่าประเมิน (บาท)
  isIncludedInCalc: boolean; // ติ๊กเลือกนำมาหักคำนวณความคุ้มค่าหรือไม่
  sortOrder?: number;
}

export interface QuoteCalculationInput {
  // โครงสร้างราคาและเงื่อนไขไฟแนนซ์
  msrp: number;                 // ราคารถตั้งต้น
  cashDiscount: number;         // ส่วนลดเงินสด (หักจากราคารถก่อนคำนวณยอดจัด)
  downPaymentSubsidy: number;   // ซับดาวน์ (ไม่หักราคารถ แต่หักจากเงินดาวน์ที่ต้องจ่ายวันรับรถ)
  downPaymentAmount: number;    // เงินดาวน์ (บาท)
  interestRateFlat: number;     // อัตราดอกเบี้ยต่อปี (% Flat Rate เช่น 1.99)
  installmentMonths: number;    // จำนวนงวด (เช่น 48, 60, 72, 84)

  // ค่าใช้จ่ายแฝงวันรับรถ (Delivery Day Out-of-Pocket)
  registrationFee: number;      // ค่าจดทะเบียน
  insuranceFee: number;         // ค่าประกันชั้น 1 + พ.ร.บ. (กรณีไม่แถม)
  financeOtherFee: number;      // ค่าดำเนินการไฟแนนซ์ / ค่าโอน / อื่นๆ
  redPlateDeposit: number;      // ค่ามัดจำป้ายแดง (แยกแสดง ได้คืนทีหลัง ไม่รวมเป็นต้นทุนสุทธิ)

  // รายการของแถม
  freebies: FreebieItemInput[];
}

export interface QuoteCalculationResult {
  // โครงสร้างราคาไฟแนนซ์
  netCarPrice: number;                // ราคารถสุทธิหลังหักส่วนลดเงินสด = max(0, MSRP - Cash Discount)
  effectiveDownPaymentAmount: number; // เงินดาวน์ที่ใช้คำนวณจริง (ป้องกันกรณีกรอกเงินดาวน์เกินราคารถ)
  effectiveDownPaymentPercent: number;// % เงินดาวน์เทียบกับ Net Car Price
  loanPrincipal: number;              // ยอดจัดไฟแนนซ์ = Net Car Price - เงินดาวน์

  // ดอกเบี้ยและค่างวด
  totalInterest: number;              // ดอกเบี้ยรวมทั้งหมด = ยอดจัด * (ดอกเบี้ย% / 100) * (จำนวนงวด / 12)
  totalLoanPayable: number;           // ยอดหนี้รวมดอกเบี้ย = ยอดจัด + ดอกเบี้ยรวม
  monthlyPayment: number;             // ค่างวดต่อเดือน = (ยอดจัด + ดอกเบี้ยรวม) / จำนวนงวด
  totalInstallmentPaid: number;       // ยอดผ่อนชำระรวมตลอดสัญญา = ค่างวดต่อเดือน * จำนวนงวด

  // ค่าใช้จ่ายวันรับรถ (Delivery Day)
  netDownPaymentOutOfPocket: number;  // เงินดาวน์ที่จ่ายจริงวันรับรถ = max(0, เงินดาวน์ - ซับดาวน์)
  unusedSubsidySurplus: number;       // กรณีซับดาวน์มากกว่าเงินดาวน์ (แจ้งเตือนผู้ใช้)
  otherDeliveryFeesTotal: number;     // รวมค่าจดทะเบียน + ประกัน + ค่าไฟแนนซ์อื่นๆ (ไม่รวมป้ายแดง)
  dayOneCashExclRedPlate: number;     // เงินออกรถจริง (ไม่รวมมัดจำป้ายแดง)
  dayOneCashTotal: number;            // รวมเงินที่ต้องเตรียมวันรับรถ (Total Day-1 Cash รวมมัดจำป้ายแดง)
  redPlateDeposit: number;            // ค่ามัดจำป้ายแดง (ได้รับคืนเมื่อได้ป้ายขาว)

  // ของแถมและตัวชี้วัดสรุปผล (Key Metrics)
  totalAllFreebiesValue: number;      // มูลค่าของแถมทั้งหมดรวมกัน
  totalEffectiveFreebiesValue: number;// มูลค่าของแถมเฉพาะที่ติ๊ก "นำมาคำนวณความคุ้มค่า"
  totalCashOutflow: number;           // ยอดจ่ายจริงตลอดสัญญา = เงินออกรถจริง(ไม่รวมมัดจำป้ายแดง) + (ค่างวด * จำนวนงวด)
  netEffectiveCost: number;           // ต้นทุนสุทธิหลังหักของแถม (True Net Cost) = Total Cash Outflow - มูลค่าของแถมที่ใช้จริง

  // ข้อมูลเปรียบเทียบเทียบกับราคารถตั้งต้น
  diffFromMsrp: number;               // Net Effective Cost - MSRP (ถ้าติดลบ แปลว่าคุ้มกว่าราคาป้าย)
  warnings: string[];                 // ข้อความแจ้งเตือน Edge Cases
}

export interface CarQuoteRecord extends QuoteCalculationInput {
  id: string;
  userId?: string;

  // ข้อมูลรถและผู้ขาย
  brand: string;
  model: string;
  trim: string;
  powertrain: PowertrainType;
  salesName: string;
  showroom: string;
  salesContact: string;
  quoteDate: string;
  status: QuoteStatus;
  note: string;

  // เปอร์เซ็นต์เงินดาวน์ที่บันทึกไว้
  downPaymentPercent: number;

  // การแชร์และความเป็นส่วนตัว
  isPublic: boolean;
  shareSalesContact: boolean;
  shareToken: string;

  // ตัวชี้วัดที่คำนวณแล้ว
  computed: QuoteCalculationResult;

  createdAt: string;
  updatedAt: string;
}
