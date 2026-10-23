// Deposits and small savings: FD, RD, PPF, Sukanya Samriddhi.

import { num, int } from './util.js';

const COMPOUNDING = { monthly: 12, quarterly: 4, 'half-yearly': 2, yearly: 1 };

/**
 * Fixed deposit maturity. Indian banks usually compound quarterly.
 * @param {{amount: number, rate: number, years: number, compounding?: 'monthly'|'quarterly'|'half-yearly'|'yearly'}} input
 */
export function fd({ amount, rate, years, compounding = 'quarterly' }) {
  amount = num(amount, 'amount'); rate = num(rate, 'rate'); years = num(years, 'years');
  const n = COMPOUNDING[compounding];
  if (!n) throw new RangeError(`compounding must be one of ${Object.keys(COMPOUNDING).join(', ')}`);
  const at = y => amount * (1 + rate / 100 / n) ** (n * y);
  const maturity = at(years);
  const yearly = [];
  for (let y = 1; y <= Math.floor(years); y++) yearly.push({ year: y, balance: at(y), interest: at(y) - amount });
  if (years > Math.floor(years)) yearly.push({ year: Math.round(years * 100) / 100, balance: maturity, interest: maturity - amount });
  return {
    maturity,
    interest: maturity - amount,
    effectiveYield: ((1 + rate / 100 / n) ** n - 1) * 100,
    yearly,
  };
}

/**
 * Recurring deposit (bank and post office style): monthly instalments, interest compounded quarterly.
 * @param {{monthly: number, rate: number, months: number}} input
 */
export function rd({ monthly, rate, months }) {
  monthly = num(monthly, 'monthly'); rate = num(rate, 'rate'); months = int(months, 'months');
  const q = 1 + rate / 400;
  let maturity = 0;
  for (let k = 1; k <= months; k++) maturity += monthly * q ** (k / 3);
  const deposited = monthly * months;
  return { maturity, deposited, interest: maturity - deposited };
}

/**
 * Public Provident Fund: one deposit a year at the start of the year. The account runs 15 years
 * and can be extended in blocks of 5, so `years` is rounded to 15, 20, 25 and so on.
 * @param {{yearly: number, rate?: number, years?: number}} input
 */
export function ppf({ yearly, rate = 7.1, years = 15 }) {
  yearly = num(yearly, 'yearly'); rate = num(rate, 'rate'); years = int(years, 'years');
  const counted = 15 + 5 * Math.round((years - 15) / 5);
  let balance = 0;
  const rows = [];
  for (let y = 1; y <= counted; y++) {
    const opening = balance + yearly;
    const interest = opening * rate / 100;
    balance = opening + interest;
    rows.push({ year: y, deposit: yearly, interest, balance });
  }
  const invested = yearly * counted;
  return { maturity: balance, invested, interest: balance - invested, years: counted, yearly: rows };
}

/**
 * Sukanya Samriddhi Yojana: deposits for 15 years, the account matures 21 years after opening.
 * @param {{yearly: number, rate?: number}} input
 */
export function sukanya({ yearly, rate = 8.2 }) {
  yearly = num(yearly, 'yearly'); rate = num(rate, 'rate');
  let balance = 0;
  let deposited = 0;
  const rows = [];
  for (let y = 1; y <= 21; y++) {
    const deposit = y <= 15 ? yearly : 0;
    deposited += deposit;
    const opening = balance + deposit;
    const interest = opening * rate / 100;
    balance = opening + interest;
    rows.push({ year: y, deposit, interest, balance });
  }
  return { maturity: balance, deposited, interest: balance - deposited, yearly: rows };
}
