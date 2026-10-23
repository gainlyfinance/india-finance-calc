// Investment calculators: SIP, step-up SIP, lumpsum, SIP for a goal, compound interest, inflation.
// The same formulas as the calculators on https://gainly.in

import { num, int } from './util.js';

/**
 * Monthly SIP with an optional yearly step-up. Each instalment is invested at the start of
 * the month and grows at rate/12 per month.
 * @param {{monthly: number, rate: number, years: number, stepUp?: number}} input
 */
export function sip({ monthly, rate, years, stepUp = 0 }) {
  monthly = num(monthly, 'monthly'); rate = num(rate, 'rate'); years = int(years, 'years'); stepUp = num(stepUp, 'stepUp');
  const i = rate / 12 / 100;
  let value = 0;
  let invested = 0;
  let instalment = monthly;
  let finalMonthly = monthly;
  const yearly = [];
  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      value = (value + instalment) * (1 + i);
      invested += instalment;
    }
    yearly.push({ year, monthly: instalment, invested, value, gains: value - invested });
    finalMonthly = instalment;
    instalment *= 1 + stepUp / 100;
  }
  return { value, invested, gains: value - invested, finalMonthly, yearly };
}

/**
 * One-time investment growing at a yearly rate.
 * @param {{amount: number, rate: number, years: number}} input
 */
export function lumpsum({ amount, rate, years }) {
  amount = num(amount, 'amount'); rate = num(rate, 'rate'); years = int(years, 'years');
  let value = amount;
  const yearly = [];
  for (let year = 1; year <= years; year++) {
    value *= 1 + rate / 100;
    yearly.push({ year, value, gains: value - amount });
  }
  return { value, invested: amount, gains: value - amount, multiple: amount > 0 ? value / amount : 0, yearly };
}

/**
 * Monthly SIP needed to reach a goal. With `inflation`, the goal is taken in today's rupees
 * and grown to the target year first.
 * @param {{goal: number, rate: number, years: number, stepUp?: number, inflation?: number}} input
 */
export function sipForGoal({ goal, rate, years, stepUp = 0, inflation = 0 }) {
  goal = num(goal, 'goal'); rate = num(rate, 'rate'); years = int(years, 'years');
  stepUp = num(stepUp, 'stepUp'); inflation = num(inflation, 'inflation');
  const target = goal * (1 + inflation / 100) ** years;
  const perRupee = sip({ monthly: 1, rate, years, stepUp }).value;
  const monthly = perRupee > 0 ? target / perRupee : 0;
  const run = sip({ monthly, rate, years, stepUp });
  return {
    monthly,
    finalMonthly: run.finalMonthly,
    invested: run.invested,
    returns: run.value - run.invested,
    goal: target,
    goalToday: goal,
    lumpsumToday: target / (1 + rate / 100) ** years,
    yearly: run.yearly,
  };
}

const PERIODS = { yearly: 1, 'half-yearly': 2, quarterly: 4, monthly: 12, daily: 365 };

/**
 * Compound interest on a principal, with optional monthly additions.
 * @param {{principal: number, rate: number, years: number, compounding?: 'yearly'|'half-yearly'|'quarterly'|'monthly'|'daily', monthly?: number}} input
 */
export function compoundInterest({ principal, rate, years, compounding = 'yearly', monthly = 0 }) {
  principal = num(principal, 'principal'); rate = num(rate, 'rate'); years = int(years, 'years'); monthly = num(monthly, 'monthly');
  const n = PERIODS[compounding];
  if (!n) throw new RangeError(`compounding must be one of ${Object.keys(PERIODS).join(', ')}`);
  const perPeriod = rate / 100 / n;
  const monthFactor = (1 + perPeriod) ** (n / 12);
  let added = 0;
  let fromAdditions = 0;
  let value = principal;
  const yearly = [];
  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      fromAdditions = fromAdditions * monthFactor + monthly;
      added += monthly;
    }
    value = principal * (1 + perPeriod) ** (n * year) + fromAdditions;
    yearly.push({ year, invested: principal + added, value });
  }
  const invested = principal + added;
  const interest = value - invested;
  return {
    value,
    invested,
    interest,
    effectiveRate: ((1 + perPeriod) ** n - 1) * 100,
    simpleInterest: principal * rate / 100 * years,
    yearly,
  };
}

/**
 * What prices become with inflation (`mode: 'future'`), or what a future amount is worth
 * in today's rupees (`mode: 'today'`).
 * @param {{amount: number, rate: number, years: number, mode?: 'future'|'today'}} input
 */
export function inflation({ amount, rate, years, mode = 'future' }) {
  amount = num(amount, 'amount'); rate = num(rate, 'rate'); years = int(years, 'years');
  const factor = (1 + rate / 100) ** years;
  const doublesInYears = rate > 0 ? Math.log(2) / Math.log(1 + rate / 100) : Infinity;
  if (mode === 'today') {
    const worth = amount / factor;
    return { value: worth, lost: amount - worth, left: amount > 0 ? worth / amount * 100 : 0, factor, doublesInYears };
  }
  if (mode !== 'future') throw new RangeError("mode must be 'future' or 'today'");
  const cost = amount * factor;
  return { value: cost, extra: cost - amount, increase: (factor - 1) * 100, factor, doublesInYears };
}
