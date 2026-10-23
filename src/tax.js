// Indian income tax (new and old regime), HRA exemption and gratuity.
// Rules for FY 2026-27 (tax year 2026-27 under the Income-tax Act, 2025). Check the current
// rules before relying on the numbers: slabs and limits change in each Budget.

import { num } from './util.js';

export const TAX_YEAR = 'FY 2026-27';

const NEW_SLABS = [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [Infinity, 30]];
const SURCHARGE_OLD = [[5000000, 10], [10000000, 15], [20000000, 25], [50000000, 37]];
const SURCHARGE_NEW = [[5000000, 10], [10000000, 15], [20000000, 25]];

const round10 = x => Math.round(x / 10) * 10;

export function slabTax(income, slabs) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income <= lower) break;
    tax += (Math.min(income, upper) - lower) * rate / 100;
    lower = upper;
  }
  return tax;
}

function oldSlabs(age) {
  const exempt = age === '60to79' ? 300000 : age === '80plus' ? 500000 : 250000;
  const slabs = [[exempt, 0]];
  if (exempt < 500000) slabs.push([500000, 5]);
  slabs.push([1000000, 20], [Infinity, 30]);
  return slabs;
}

function surcharge(taxable, tax, brackets, slabFn) {
  let threshold = null;
  let rate = 0;
  let previousRate = 0;
  for (const [limit, r] of brackets) {
    if (taxable > limit) { previousRate = rate; threshold = limit; rate = r; }
  }
  if (threshold === null) return 0;
  let s = tax * rate / 100;
  // Marginal relief: tax + surcharge may not exceed the tax at the threshold plus the income above it.
  const cap = slabFn(threshold) * (1 + previousRate / 100) + (taxable - threshold);
  if (tax + s > cap) s = Math.max(0, cap - tax);
  return s;
}

function finish(slab, tax, sur) {
  const cess = (tax + sur) * 0.04;
  return { slabTax: slab, rebate: slab - tax, surcharge: sur, cess, total: round10(tax + sur + cess) };
}

/** Tax under the new regime on taxable income (after the standard deduction). */
export function taxNewRegime(taxable) {
  taxable = num(taxable, 'taxable');
  const slab = slabTax(taxable, NEW_SLABS);
  let tax = slab;
  if (taxable <= 1200000) tax = Math.max(0, tax - Math.min(tax, 60000));
  else if (tax > taxable - 1200000) tax = taxable - 1200000; // marginal relief above ₹12 lakh
  return finish(slab, tax, surcharge(taxable, tax, SURCHARGE_NEW, t => slabTax(t, NEW_SLABS)));
}

/** Tax under the old regime on taxable income (after all deductions). */
export function taxOldRegime(taxable, age = 'below60') {
  taxable = num(taxable, 'taxable');
  const slabs = oldSlabs(age);
  const slab = slabTax(taxable, slabs);
  let tax = slab;
  if (taxable <= 500000) tax = Math.max(0, tax - Math.min(tax, 12500));
  return finish(slab, tax, surcharge(taxable, tax, SURCHARGE_OLD, t => slabTax(t, slabs)));
}

/**
 * Compares the new and old regime for a year's gross income.
 * Deductions other than the standard deduction and employer NPS count in the old regime only.
 * @param {{income: number, salaried?: boolean, age?: 'below60'|'60to79'|'80plus',
 *   d80c?: number, d80d?: number, hra?: number, homeLoanInterest?: number, nps?: number,
 *   employerNps?: number, basicPay?: number, otherDeductions?: number}} input
 */
export function incomeTax({
  income, salaried = true, age = 'below60', d80c = 0, d80d = 0, hra = 0, homeLoanInterest = 0,
  nps = 0, employerNps = 0, basicPay = 0, otherDeductions = 0,
}) {
  income = num(income, 'income');
  const empNps = salaried ? Math.min(num(employerNps, 'employerNps'), income) : 0;
  basicPay = num(basicPay, 'basicPay');
  const empNpsNew = basicPay > 0 ? Math.min(empNps, basicPay * 0.14) : empNps;
  const empNpsOld = basicPay > 0 ? Math.min(empNps, basicPay * 0.10) : empNps;

  const newStd = salaried ? Math.min(75000, income) : 0;
  const newTaxable = round10(Math.max(0, income - newStd - empNpsNew));
  const newRegime = { standardDeduction: newStd, deductions: empNpsNew, taxable: newTaxable, ...taxNewRegime(newTaxable) };

  const oldStd = salaried ? Math.min(50000, income) : 0;
  const oldDeductions = Math.min(num(d80c, 'd80c'), 150000) + Math.min(num(d80d, 'd80d'), 100000) + num(hra, 'hra')
    + Math.min(num(homeLoanInterest, 'homeLoanInterest'), 200000) + Math.min(num(nps, 'nps'), 50000)
    + empNpsOld + num(otherDeductions, 'otherDeductions');
  const oldTaxable = round10(Math.max(0, income - oldStd - oldDeductions));
  const oldRegime = { standardDeduction: oldStd, deductions: oldDeductions, taxable: oldTaxable, ...taxOldRegime(oldTaxable, age) };

  const better = newRegime.total <= oldRegime.total ? 'new' : 'old';
  const tax = Math.min(newRegime.total, oldRegime.total);
  return {
    taxYear: TAX_YEAR,
    new: newRegime,
    old: oldRegime,
    better,
    saving: Math.abs(newRegime.total - oldRegime.total),
    monthlyTds: tax / 12,
    effectiveRate: income > 0 ? tax / income * 100 : 0,
  };
}

/**
 * HRA exemption (old regime): the lowest of HRA received, rent minus 10% of basic + DA, and 50% (metro) or 40% of basic + DA.
 * Inputs are monthly, results yearly.
 * @param {{basic: number, hra: number, rent: number, metro?: boolean}} input
 */
export function hraExemption({ basic, hra, rent, metro = false }) {
  const salary = num(basic, 'basic') * 12;
  const received = num(hra, 'hra') * 12;
  const paid = num(rent, 'rent') * 12;
  const rentTest = Math.max(0, paid - 0.1 * salary);
  const cityTest = salary * (metro ? 50 : 40) / 100;
  const exempt = Math.min(received, rentTest, cityTest);
  return { exempt, taxable: received - exempt, received, rentTest, cityTest, exemptMonthly: exempt / 12 };
}

export const GRATUITY_TAX_FREE_LIMIT = 2000000;

/**
 * Gratuity. Under the Payment of Gratuity Act: 15/26 × last monthly basic + DA × years
 * (a final part-year over 6 months counts as a year). Not covered: 15/30 × salary × full years.
 * Eligible after 5 years (1 year for fixed-term employees).
 * @param {{salary: number, years: number, months?: number, covered?: boolean, fixedTerm?: boolean}} input
 */
export function gratuity({ salary, years, months = 0, covered = true, fixedTerm = false }) {
  salary = num(salary, 'salary'); years = Math.floor(num(years, 'years')); months = num(months, 'months');
  const counted = covered ? years + (months > 6 ? 1 : 0) : years;
  const eligible = fixedTerm ? years >= 1 : years >= 5;
  const amount = eligible ? salary * (covered ? 15 / 26 : 15 / 30) * counted : 0;
  const taxFree = Math.min(amount, GRATUITY_TAX_FREE_LIMIT);
  return { amount, eligible, yearsCounted: eligible ? counted : years, taxFree, taxable: amount - taxFree };
}
