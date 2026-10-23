// Types for india-finance-calc. Amounts are rupees, rates are percent per year.

export interface SipRow { year: number; monthly: number; invested: number; value: number; gains: number }
export function sip(input: { monthly: number; rate: number; years: number; stepUp?: number }):
  { value: number; invested: number; gains: number; finalMonthly: number; yearly: SipRow[] };

export function lumpsum(input: { amount: number; rate: number; years: number }):
  { value: number; invested: number; gains: number; multiple: number; yearly: { year: number; value: number; gains: number }[] };

export function sipForGoal(input: { goal: number; rate: number; years: number; stepUp?: number; inflation?: number }):
  { monthly: number; finalMonthly: number; invested: number; returns: number; goal: number; goalToday: number; lumpsumToday: number; yearly: SipRow[] };

export type Compounding = 'yearly' | 'half-yearly' | 'quarterly' | 'monthly';
export function compoundInterest(input: { principal: number; rate: number; years: number; compounding?: Compounding | 'daily'; monthly?: number }):
  { value: number; invested: number; interest: number; effectiveRate: number; simpleInterest: number; yearly: { year: number; invested: number; value: number }[] };

export function inflation(input: { amount: number; rate: number; years: number; mode?: 'future' | 'today' }):
  { value: number; factor: number; doublesInYears: number; extra?: number; increase?: number; lost?: number; left?: number };

export function emiAmount(principal: number, rate: number, months: number): number;
export function loanForEmi(emi: number, rate: number, months: number): number;
export function emi(input: { amount: number; rate: number; years?: number; months?: number }): {
  emi: number; months: number; totalInterest: number; totalPayable: number; interestPercent: number;
  schedule: { year: number; principal: number; interest: number; paid: number; balance: number }[];
};

export function fd(input: { amount: number; rate: number; years: number; compounding?: Compounding }):
  { maturity: number; interest: number; effectiveYield: number; yearly: { year: number; balance: number; interest: number }[] };
export function rd(input: { monthly: number; rate: number; months: number }): { maturity: number; deposited: number; interest: number };

export interface SavingsRow { year: number; deposit: number; interest: number; balance: number }
export function ppf(input: { yearly: number; rate?: number; years?: number }):
  { maturity: number; invested: number; interest: number; years: number; yearly: SavingsRow[] };
export function sukanya(input: { yearly: number; rate?: number }):
  { maturity: number; deposited: number; interest: number; yearly: SavingsRow[] };

export const TAX_YEAR: string;
export interface RegimeTax { slabTax: number; rebate: number; surcharge: number; cess: number; total: number }
export interface RegimeResult extends RegimeTax { standardDeduction: number; deductions: number; taxable: number }
export type Age = 'below60' | '60to79' | '80plus';
export function slabTax(income: number, slabs: [number, number][]): number;
export function taxNewRegime(taxable: number): RegimeTax;
export function taxOldRegime(taxable: number, age?: Age): RegimeTax;
export function incomeTax(input: {
  income: number; salaried?: boolean; age?: Age; d80c?: number; d80d?: number; hra?: number; homeLoanInterest?: number;
  nps?: number; employerNps?: number; basicPay?: number; otherDeductions?: number;
}): { taxYear: string; new: RegimeResult; old: RegimeResult; better: 'new' | 'old'; saving: number; monthlyTds: number; effectiveRate: number };

export function hraExemption(input: { basic: number; hra: number; rent: number; metro?: boolean }):
  { exempt: number; taxable: number; received: number; rentTest: number; cityTest: number; exemptMonthly: number };

export const GRATUITY_TAX_FREE_LIMIT: number;
export function gratuity(input: { salary: number; years: number; months?: number; covered?: boolean; fixedTerm?: boolean }):
  { amount: number; eligible: boolean; yearsCounted: number; taxFree: number; taxable: number };

export function formatINR(value: number, options?: { decimals?: number; symbol?: boolean }): string;
export function inrWords(value: number): string;
