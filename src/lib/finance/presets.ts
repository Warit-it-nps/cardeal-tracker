import { CarQuoteRecord, FreebieItemInput, PowertrainType, QuoteStatus } from './types';
import { calculateCarQuote, calcDownPaymentPercentFromAmount } from './calculator';

export const POPULAR_CAR_BRANDS = [
  'BYD',
  'Toyota',
  'Honda',
  'Tesla',
  'Deepal',
  'MG',
  'GWM',
  'AION',
  'NETA',
  'Zeekr',
  'XPENG',
  'Mazda',
  'Isuzu',
  'Mitsubishi',
  'Nissan',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Volvo',
];

export const POWERTRAIN_LABELS: Record<PowertrainType, { label: string; badgeClass: string }> = {
  EV: { label: 'EV ไฟฟ้า 100%', badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  PHEV: { label: 'PHEV ปลั๊กอินไฮบริด', badgeClass: 'bg-teal-500/15 text-teal-700 border-teal-500/30' },
  HEV: { label: 'HEV ไฮบริด', badgeClass: 'bg-sky-500/15 text-sky-700 border-sky-500/30' },
  ICE: { label: 'น้ำมันล้วน (ICE)', badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { label: string; badgeClass: string }> = {
  SHORTLISTED: { label: '⭐ ตัวเต็ง', badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-400/40 font-semibold' },
  NEGOTIATING: { label: '💬 กำลังคุย', badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-400/30' },
  TEST_DRIVE: { label: '🛞 นัดทดลองขับ', badgeClass: 'bg-purple-500/10 text-purple-700 border-purple-400/30' },
  BOOKED: { label: '✅ จองแล้ว', badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 font-semibold' },
  DROPPED: { label: '❌ ตัดทิ้ง', badgeClass: 'bg-slate-200 text-slate-600 border-slate-300' },
};

export const FREEBIE_PRESETS: Omit<FreebieItemInput, 'id'>[] = [
  { itemName: 'ประกันภัยชั้น 1', brandDetail: 'ซ่อมห้าง 1 ปี', estimatedValue: 22000, isIncludedInCalc: true },
  { itemName: 'พ.ร.บ. รถยนต์', brandDetail: 'คุ้มครอง 1 ปี', estimatedValue: 645, isIncludedInCalc: true },
  { itemName: 'ฟรีค่าจดทะเบียน', brandDetail: 'บริการจดทะเบียนป้ายขาว', estimatedValue: 3500, isIncludedInCalc: true },
  { itemName: 'ฟิล์มกรองแสงรอบคัน + บานหน้า', brandDetail: 'เซรามิค (Lamina / 3M / Hi-Kool)', estimatedValue: 8000, isIncludedInCalc: true },
  { itemName: 'Wall Charger + ฟรีค่าติดตั้ง', brandDetail: '7kW พร้อมสายไฟมาตรฐาน', estimatedValue: 25000, isIncludedInCalc: true },
  { itemName: 'ฟรีค่าแรงและอะไหล่เช็คระยะ', brandDetail: 'แพ็กเกจบำรุงรักษาตามระยะ', estimatedValue: 15000, isIncludedInCalc: true },
  { itemName: 'กล้องบันทึกหน้ารถ', brandDetail: 'หน้า-หลัง Full HD', estimatedValue: 3500, isIncludedInCalc: true },
  { itemName: 'เคลือบแก้ว / เซรามิค', brandDetail: 'รับประกันชั้นเคลือบ', estimatedValue: 5000, isIncludedInCalc: false },
  { itemName: 'พรมเข้ารูป + กรอบป้าย + ของจุกจิก', brandDetail: 'ผ้ายางปูพื้น / ร่ม / หมอน', estimatedValue: 2000, isIncludedInCalc: false },
];

function buildMockQuote(
  raw: Omit<CarQuoteRecord, 'computed' | 'downPaymentPercent' | 'createdAt' | 'updatedAt'>
): CarQuoteRecord {
  const downPaymentPercent = calcDownPaymentPercentFromAmount(
    raw.msrp,
    raw.cashDiscount,
    raw.downPaymentAmount
  );
  const computed = calculateCarQuote(raw);
  return {
    ...raw,
    downPaymentPercent,
    computed,
    createdAt: raw.quoteDate,
    updatedAt: raw.quoteDate,
  };
}

/**
 * ข้อมูลตัวอย่างเริ่มต้น (Sample Deals) เพื่อให้ผู้ใช้เห็นการทำงานของระบบเปรียบเทียบและหน้า Public Explore ทันที
 */
export const INITIAL_DEMO_QUOTES: CarQuoteRecord[] = [
  buildMockQuote({
    id: 'quote-byd-sealion6-rama3',
    brand: 'BYD',
    model: 'Sealion 6 DM-i',
    trim: 'Dynamic',
    powertrain: 'PHEV',
    salesName: 'คุณเมย์ (เซลตัวเต็ง)',
    showroom: 'BYD พระราม 3',
    salesContact: '081-234-5678 / Line: @maybyd',
    quoteDate: '2026-11-25',
    status: 'SHORTLISTED',
    note: 'ข้อเสนอในงาน Motor Expo เน้นส่วนลดเงินสดหักราคารถ + แถมประกันชั้น 1 วิริยะซ่อมห้าง',
    msrp: 939000,
    cashDiscount: 50000,
    downPaymentSubsidy: 20000,
    downPaymentAmount: 177800, // 20% ของ 889,000
    interestRateFlat: 1.88,
    installmentMonths: 60,
    registrationFee: 0,
    insuranceFee: 0,
    financeOtherFee: 1500,
    redPlateDeposit: 3000,
    isPublic: true,
    shareSalesContact: true,
    shareToken: 'sealion6-rama3-deal',
    freebies: [
      { id: 'f1', itemName: 'ประกันภัยชั้น 1', brandDetail: 'วิริยะซ่อมห้าง 1 ปี', estimatedValue: 23000, isIncludedInCalc: true },
      { id: 'f2', itemName: 'พ.ร.บ. รถยนต์', brandDetail: 'คุ้มครอง 1 ปี', estimatedValue: 645, isIncludedInCalc: true },
      { id: 'f3', itemName: 'ฟรีค่าจดทะเบียน', brandDetail: 'จดทะเบียนป้ายขาว', estimatedValue: 3500, isIncludedInCalc: true },
      { id: 'f4', itemName: 'ฟิล์มกรองแสงรอบคัน + บานหน้า', brandDetail: '3M Ceramic Ultra Clear', estimatedValue: 9500, isIncludedInCalc: true },
      { id: 'f5', itemName: 'Wall Charger + ฟรีค่าติดตั้ง', brandDetail: 'ZHIDA 7kW', estimatedValue: 22000, isIncludedInCalc: true },
      { id: 'f6', itemName: 'พรมเข้ารูป + กรอบป้าย + ของจุกจิก', brandDetail: 'ชุดของแถมโชว์รูม', estimatedValue: 2500, isIncludedInCalc: false },
    ],
  }),
  buildMockQuote({
    id: 'quote-byd-sealion6-bangna',
    brand: 'BYD',
    model: 'Sealion 6 DM-i',
    trim: 'Dynamic',
    powertrain: 'PHEV',
    salesName: 'คุณต้น (บางนา)',
    showroom: 'BYD บางนา กม.4',
    salesContact: '089-876-5432',
    quoteDate: '2026-11-25',
    status: 'NEGOTIATING',
    note: 'เน้นซับดาวน์เยอะ (60,000 บาท) เพื่อใช้งบออกรถน้อย แต่ดอกเบี้ยสูงกว่าเป็น 2.39% และไม่หักราคารถต้น',
    msrp: 939000,
    cashDiscount: 10000,
    downPaymentSubsidy: 60000,
    downPaymentAmount: 185800, // 20% ของ 929,000
    interestRateFlat: 2.39,
    installmentMonths: 60,
    registrationFee: 3500,
    insuranceFee: 0,
    financeOtherFee: 2500,
    redPlateDeposit: 3000,
    isPublic: true,
    shareSalesContact: false,
    shareToken: 'sealion6-bangna-subdown',
    freebies: [
      { id: 'f7', itemName: 'ประกันภัยชั้น 1', brandDetail: 'คุ้มภัยโตเกียวมารีน', estimatedValue: 21000, isIncludedInCalc: true },
      { id: 'f8', itemName: 'พ.ร.บ. รถยนต์', brandDetail: 'คุ้มครอง 1 ปี', estimatedValue: 645, isIncludedInCalc: true },
      { id: 'f9', itemName: 'ฟิล์มกรองแสงรอบคัน + บานหน้า', brandDetail: 'Lamina Ceramic', estimatedValue: 7500, isIncludedInCalc: true },
      { id: 'f10', itemName: 'เคลือบแก้ว / เซรามิค', brandDetail: 'คูปองเคลือบสี 3 ครั้ง', estimatedValue: 6000, isIncludedInCalc: false },
    ],
  }),
  buildMockQuote({
    id: 'quote-honda-civic-ehev',
    brand: 'Honda',
    model: 'Civic',
    trim: 'e:HEV EL+',
    powertrain: 'HEV',
    salesName: 'คุณแนน ฮอนด้า',
    showroom: 'Honda สุขุมวิท',
    salesContact: '082-555-1999 / Line: nanhonda',
    quoteDate: '2026-11-24',
    status: 'TEST_DRIVE',
    note: 'ดอกเบี้ยพิเศษ 1.69% เมื่อดาวน์ 25% แถมฟรี Honda Ultimate Care ขยายเวลารับประกัน',
    msrp: 1099000,
    cashDiscount: 35000,
    downPaymentSubsidy: 15000,
    downPaymentAmount: 266000, // 25% ของ 1,064,000
    interestRateFlat: 1.69,
    installmentMonths: 60,
    registrationFee: 3200,
    insuranceFee: 0,
    financeOtherFee: 0,
    redPlateDeposit: 3000,
    isPublic: true,
    shareSalesContact: true,
    shareToken: 'honda-civic-ehev-deal',
    freebies: [
      { id: 'f11', itemName: 'ประกันภัยชั้น 1', brandDetail: 'กรุงเทพประกันภัย ซ่อมห้าง', estimatedValue: 24500, isIncludedInCalc: true },
      { id: 'f12', itemName: 'พ.ร.บ. รถยนต์', brandDetail: 'คุ้มครอง 1 ปี', estimatedValue: 645, isIncludedInCalc: true },
      { id: 'f13', itemName: 'ฟรีค่าแรงและอะไหล่เช็คระยะ', brandDetail: 'Honda Ultimate Care 5 ปี', estimatedValue: 18500, isIncludedInCalc: true },
      { id: 'f14', itemName: 'ฟิล์มกรองแสงรอบคัน + บานหน้า', brandDetail: 'Hi-Kool Ceramic Black', estimatedValue: 8000, isIncludedInCalc: true },
      { id: 'f15', itemName: 'กล้องบันทึกหน้ารถ', brandDetail: 'Honda แท้ หน้า-หลัง', estimatedValue: 4500, isIncludedInCalc: true },
    ],
  }),
  buildMockQuote({
    id: 'quote-deepal-s07',
    brand: 'Deepal',
    model: 'S07',
    trim: 'Standard Range',
    powertrain: 'EV',
    salesName: 'คุณบาส Deepal',
    showroom: 'Deepal วิภาวดี',
    salesContact: '086-999-8877',
    quoteDate: '2026-11-23',
    status: 'SHORTLISTED',
    note: 'โปรส่วนลดเงินสด 120,000 บาท หรือเลือกรับดอกเบี้ย 0% (ใบนี้คำนวณแบบรับส่วนลดเงินสดเต็ม)',
    msrp: 1399000,
    cashDiscount: 120000,
    downPaymentSubsidy: 30000,
    downPaymentAmount: 255800, // 20% ของ 1,279,000
    interestRateFlat: 1.88,
    installmentMonths: 60,
    registrationFee: 0,
    insuranceFee: 0,
    financeOtherFee: 1000,
    redPlateDeposit: 3000,
    isPublic: true,
    shareSalesContact: true,
    shareToken: 'deepal-s07-vibhavadi',
    freebies: [
      { id: 'f16', itemName: 'ประกันภัยชั้น 1', brandDetail: 'ซ่อมห้าง 1 ปี', estimatedValue: 26000, isIncludedInCalc: true },
      { id: 'f17', itemName: 'Wall Charger + ฟรีค่าติดตั้ง', brandDetail: 'Home Charger 7kW', estimatedValue: 25000, isIncludedInCalc: true },
      { id: 'f18', itemName: 'ฟรีค่าจดทะเบียน', brandDetail: 'จดทะเบียนป้ายขาว', estimatedValue: 3500, isIncludedInCalc: true },
      { id: 'f19', itemName: 'ฟรีค่าแรงและอะไหล่เช็คระยะ', brandDetail: 'บำรุงรักษา 8 ปี', estimatedValue: 20000, isIncludedInCalc: true },
    ],
  }),
];
