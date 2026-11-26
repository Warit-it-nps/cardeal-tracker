import { QuoteCalculationInput, QuoteCalculationResult } from './types';

/**
 * ปัดเศษทศนิยม 2 ตำแหน่งอย่างแม่นยำ ป้องกันปัญหา Floating-point ของ JavaScript
 */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * ปัดเศษทศนิยม 2 ตำแหน่งสำหรับเปอร์เซ็นต์เงินดาวน์
 */
export function roundPercent(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * คำนวณราคารถหลังหักส่วนลดเงินสด (ฐานในการคำนวณเงินดาวน์และยอดจัดตามมาตรฐานไฟแนนซ์ไทย)
 */
export function getNetCarPrice(msrp: number, cashDiscount: number): number {
  const safeMsrp = Math.max(0, msrp || 0);
  const safeDiscount = Math.max(0, cashDiscount || 0);
  return roundCurrency(Math.max(0, safeMsrp - safeDiscount));
}

/**
 * Helper สำหรับ Dual-Input: เมื่อผู้ใช้พิมพ์ "% เงินดาวน์" -> คำนวณเป็น "จำนวนเงินบาท"
 */
export function calcDownPaymentAmountFromPercent(
  msrp: number,
  cashDiscount: number,
  percent: number
): number {
  const netCarPrice = getNetCarPrice(msrp, cashDiscount);
  const clampedPercent = Math.min(100, Math.max(0, percent || 0));
  return roundCurrency(netCarPrice * (clampedPercent / 100));
}

/**
 * Helper สำหรับ Dual-Input: เมื่อผู้ใช้พิมพ์ "เงินดาวน์ (บาท)" -> คำนวณเป็น "% เงินดาวน์"
 */
export function calcDownPaymentPercentFromAmount(
  msrp: number,
  cashDiscount: number,
  amount: number
): number {
  const netCarPrice = getNetCarPrice(msrp, cashDiscount);
  if (netCarPrice <= 0) return 0;
  const clampedAmount = Math.min(netCarPrice, Math.max(0, amount || 0));
  return roundPercent((clampedAmount / netCarPrice) * 100);
}

/**
 * ฟังก์ชันหลักในการคำนวณไฟแนนซ์รถยนต์แบบไทย (Flat Rate) และ True Net Cost
 * รองรับ Edge Cases ครบถ้วน: ดอกเบี้ย 0%, ซื้อสด, ส่วนลดเกินราคารถ, ซับดาวน์เกินเงินดาวน์, หารงวดไม่ลงตัว
 */
export function calculateCarQuote(
  input: QuoteCalculationInput
): QuoteCalculationResult {
  const warnings: string[] = [];

  // 1. Sanitize inputs
  const msrp = Math.max(0, input.msrp || 0);
  const cashDiscount = Math.max(0, input.cashDiscount || 0);
  const downPaymentSubsidy = Math.max(0, input.downPaymentSubsidy || 0);
  const rawDownPaymentAmount = Math.max(0, input.downPaymentAmount || 0);
  const interestRateFlat = Math.max(0, input.interestRateFlat || 0);
  const installmentMonths = Math.max(1, Math.floor(input.installmentMonths || 48));

  const registrationFee = Math.max(0, input.registrationFee || 0);
  const insuranceFee = Math.max(0, input.insuranceFee || 0);
  const financeOtherFee = Math.max(0, input.financeOtherFee || 0);
  const redPlateDeposit = Math.max(0, input.redPlateDeposit || 0);

  // 2. คำนวณราคารถหลังหักส่วนลดเงินสด (MSRP - Cash Discount)
  if (cashDiscount > msrp && msrp > 0) {
    warnings.push('ส่วนลดเงินสดสูงกว่าราคารถตั้งต้น ระบบปรับราคารถสุทธิเป็น 0 บาท');
  }
  const netCarPrice = getNetCarPrice(msrp, cashDiscount);

  // 3. ตรวจสอบเงินดาวน์ไม่ให้เกินราคารถหลังหักส่วนลด
  let effectiveDownPaymentAmount = rawDownPaymentAmount;
  if (rawDownPaymentAmount > netCarPrice) {
    effectiveDownPaymentAmount = netCarPrice;
    if (netCarPrice > 0) {
      warnings.push('เงินดาวน์สูงกว่าราคารถหลังหักส่วนลด ระบบปรับยอดจัดไฟแนนซ์เป็น 0 บาท (ซื้อสด)');
    }
  }
  effectiveDownPaymentAmount = roundCurrency(effectiveDownPaymentAmount);

  const effectiveDownPaymentPercent = calcDownPaymentPercentFromAmount(
    msrp,
    cashDiscount,
    effectiveDownPaymentAmount
  );

  // 4. ยอดจัดไฟแนนซ์ (Loan Principal) = (MSRP - Cash Discount) - เงินดาวน์
  const loanPrincipal = roundCurrency(netCarPrice - effectiveDownPaymentAmount);

  // 5. ดอกเบี้ยรวมทั้งหมด = ยอดจัด × (ดอกเบี้ย% / 100) × (จำนวนงวด / 12)
  const years = installmentMonths / 12;
  const totalInterest =
    loanPrincipal > 0
      ? roundCurrency(loanPrincipal * (interestRateFlat / 100) * years)
      : 0;

  // 6. ค่างวดต่อเดือน = (ยอดจัด + ดอกเบี้ยรวม) / จำนวนงวด
  const totalLoanPayable = roundCurrency(loanPrincipal + totalInterest);
  const monthlyPayment =
    loanPrincipal > 0
      ? roundCurrency(totalLoanPayable / installmentMonths)
      : 0;

  // ยอดผ่อนชำระรวมตามค่างวดจริง (ค่างวด × จำนวนงวด)
  const totalInstallmentPaid = roundCurrency(monthlyPayment * installmentMonths);

  // 7. ค่าใช้จ่ายวันรับรถ (Delivery Day Out-of-Pocket)
  // เงินดาวน์ที่จ่ายจริง = เงินดาวน์ - ซับดาวน์ (ห้ามติดลบ)
  let unusedSubsidySurplus = 0;
  if (downPaymentSubsidy > effectiveDownPaymentAmount) {
    unusedSubsidySurplus = roundCurrency(
      downPaymentSubsidy - effectiveDownPaymentAmount
    );
    warnings.push(
      `วงเงินซับดาวน์สูงกว่าเงินดาวน์อยู่ ฿${unusedSubsidySurplus.toLocaleString()} (ควรขอเปลี่ยนส่วนเกินเป็นส่วนลดเงินสดหรือของแถม)`
    );
  }
  const netDownPaymentOutOfPocket = roundCurrency(
    Math.max(0, effectiveDownPaymentAmount - downPaymentSubsidy)
  );

  const otherDeliveryFeesTotal = roundCurrency(
    registrationFee + insuranceFee + financeOtherFee
  );

  // เงินออกรถจริง (ไม่รวมมัดจำป้ายแดง)
  const dayOneCashExclRedPlate = roundCurrency(
    netDownPaymentOutOfPocket + otherDeliveryFeesTotal
  );

  // รวมเงินที่ต้องเตรียมวันรับรถ (Total Day-1 Cash รวมมัดจำป้ายแดง)
  const dayOneCashTotal = roundCurrency(
    dayOneCashExclRedPlate + redPlateDeposit
  );

  // 8. คำนวณมูลค่าของแถม (Freebies)
  const freebies = Array.isArray(input.freebies) ? input.freebies : [];
  const totalAllFreebiesValue = roundCurrency(
    freebies.reduce((sum, item) => sum + Math.max(0, item.estimatedValue || 0), 0)
  );
  const totalEffectiveFreebiesValue = roundCurrency(
    freebies
      .filter((item) => item.isIncludedInCalc)
      .reduce((sum, item) => sum + Math.max(0, item.estimatedValue || 0), 0)
  );

  // 9. ตัวชี้วัดสรุปผลเพื่อการตัดสินใจ (Key Metrics)
  // ยอดจ่ายจริงตลอดสัญญา (Total Cash Outflow) = เงินออกรถจริง (ไม่รวมมัดจำป้ายแดง) + (ค่างวด × จำนวนงวด)
  const totalCashOutflow = roundCurrency(
    dayOneCashExclRedPlate + totalInstallmentPaid
  );

  // ต้นทุนสุทธิหลังหักของแถม (Net Effective Cost) = Total Cash Outflow - มูลค่าของแถมที่ใช้งานจริง
  const netEffectiveCost = roundCurrency(
    totalCashOutflow - totalEffectiveFreebiesValue
  );

  const diffFromMsrp = roundCurrency(netEffectiveCost - msrp);

  return {
    netCarPrice,
    effectiveDownPaymentAmount,
    effectiveDownPaymentPercent,
    loanPrincipal,
    totalInterest,
    totalLoanPayable,
    monthlyPayment,
    totalInstallmentPaid,
    netDownPaymentOutOfPocket,
    unusedSubsidySurplus,
    otherDeliveryFeesTotal,
    dayOneCashExclRedPlate,
    dayOneCashTotal,
    redPlateDeposit,
    totalAllFreebiesValue,
    totalEffectiveFreebiesValue,
    totalCashOutflow,
    netEffectiveCost,
    diffFromMsrp,
    warnings,
  };
}
