// Loan calculators: EMI with a yearly repayment schedule, and the loan an EMI can repay.

import { num } from './util.js';

/** Monthly EMI for a reducing-balance loan. */
export function emiAmount(principal, rate, months) {
  principal = num(principal, 'principal'); rate = num(rate, 'rate'); months = num(months, 'months');
  if (months <= 0) return 0;
  const r = rate / 12 / 100;
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return principal * r * f / (f - 1);
}

/** Loan amount a given monthly EMI can repay (present value of an annuity). */
export function loanForEmi(emi, rate, months) {
  emi = num(emi, 'emi'); rate = num(rate, 'rate'); months = num(months, 'months');
  if (months <= 0 || emi <= 0) return 0;
  const r = rate / 12 / 100;
  if (r === 0) return emi * months;
  const f = (1 + r) ** months;
  return emi * (f - 1) / (r * f);
}

/**
 * EMI, total interest and a year-by-year schedule. Give `years` (may be fractional) or `months`.
 * @param {{amount: number, rate: number, years?: number, months?: number}} input
 */
export function emi({ amount, rate, years, months }) {
  amount = num(amount, 'amount'); rate = num(rate, 'rate');
  const n = months !== undefined ? Math.round(num(months, 'months')) : Math.round(num(years, 'years') * 12);
  const monthly = emiAmount(amount, rate, n);
  const r = rate / 12 / 100;
  let balance = amount;
  let totalInterest = 0;
  let yp = 0;
  let yi = 0;
  const schedule = [];
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const principal = Math.min(monthly - interest, balance);
    balance -= principal;
    yp += principal;
    yi += interest;
    totalInterest += interest;
    if (m % 12 === 0 || m === n) {
      schedule.push({ year: Math.ceil(m / 12), principal: yp, interest: yi, paid: yp + yi, balance: Math.max(0, balance) });
      yp = 0;
      yi = 0;
    }
  }
  return {
    emi: monthly,
    months: n,
    totalInterest,
    totalPayable: amount + totalInterest,
    interestPercent: amount > 0 ? totalInterest / amount * 100 : 0,
    schedule,
  };
}
