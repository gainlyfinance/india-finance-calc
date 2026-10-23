// Checks every function against 600 results from the calculators that run gainly.in
// (test/golden.json, made by tools/golden.php from the site's PHP code).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as F from '../src/index.js';

const cases = JSON.parse(readFileSync(new URL('./golden.json', import.meta.url), 'utf8'));

function close(actual, expected, what) {
  const tol = Math.max(0.01, Math.abs(expected) * 1e-9);
  assert.ok(Math.abs(actual - expected) <= tol, `${what}: got ${actual}, site has ${expected}`);
}

const checks = {
  sip(i, o) {
    const r = F.sip(i);
    close(r.value, o.headline[1], 'value'); close(r.invested, o['Total invested'], 'invested');
  },
  lumpsum(i, o) {
    const r = F.lumpsum(i);
    close(r.value, o.headline[1], 'value'); close(r.gains, o['Estimated returns'], 'gains');
  },
  sipGoal(i, o) {
    const r = F.sipForGoal(i);
    close(r.monthly, o.headline[1], 'monthly'); close(r.invested, o['Total you invest'], 'invested');
    close(r.lumpsumToday, o['Or invest once today (lumpsum)'], 'lumpsum');
  },
  emi(i, o) {
    const r = F.emi(i);
    close(r.emi, o.headline[1], 'emi'); close(r.totalInterest, o['Total interest'], 'interest');
  },
  fd(i, o) {
    const r = F.fd(i);
    close(r.maturity, o.headline[1], 'maturity'); close(r.effectiveYield, o['Effective yearly yield'], 'yield');
  },
  rd(i, o) { close(F.rd(i).maturity, o.headline[1], 'maturity'); },
  ppf(i, o) {
    const r = F.ppf(i);
    close(r.maturity, o['Maturity value'], 'maturity'); close(r.invested, o['Total invested'], 'invested');
  },
  sukanya(i, o) { close(F.sukanya(i).maturity, o['Maturity value'], 'maturity'); },
  compound(i, o) {
    const r = F.compoundInterest(i);
    close(r.value, o.headline[1], 'value'); close(r.interest, o['Interest earned'], 'interest');
  },
  inflation(i, o) {
    const r = F.inflation({ amount: i.amount, rate: i.inflation, years: i.years, mode: i.mode });
    close(r.value, o.headline[1], 'value');
    close(r.doublesInYears * 12, o['Prices double in'], 'doubling months');
  },
  hra(i, o) {
    const r = F.hraExemption({ basic: i.basic, hra: i.hra, rent: i.rent, metro: i.city === 'metro' });
    close(r.exempt, o['Exempt HRA (lowest of the three)'], 'exempt'); close(r.taxable, o['Taxable HRA'], 'taxable');
  },
  gratuity(i, o) {
    const r = F.gratuity({ salary: i.wages, years: i.years, months: i.months, covered: i.covered === 'yes', fixedTerm: i.type === 'fixed' });
    close(r.amount, o.headline[1], 'gratuity'); close(r.taxable, o['Taxable part'], 'taxable');
  },
  incomeTax(i, o) {
    const r = F.incomeTax({ ...i, salaried: i.incomeType === 'salary' });
    close(r.new.total, o['Tax under new regime'], 'new regime'); close(r.old.total, o['Tax under old regime'], 'old regime');
  },
};

for (const name of Object.keys(checks)) {
  test(`${name} matches gainly.in`, () => {
    const mine = cases.filter(c => c[0] === name);
    assert.ok(mine.length > 0, 'no cases');
    for (const [, input, output] of mine) {
      try { checks[name](input, output); } catch (e) { e.message += `\ninput: ${JSON.stringify(input)}`; throw e; }
    }
  });
}
