import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sip, emi, incomeTax, formatINR, inrWords, ppf, gratuity } from '../src/index.js';

test('README examples', () => {
  assert.equal(Math.round(sip({ monthly: 5000, rate: 12, years: 10 }).value), 1161695);
  assert.equal(Math.round(emi({ amount: 5000000, rate: 8.5, years: 20 }).emi), 43391);
  const t = incomeTax({ income: 1500000 });
  assert.equal(t.new.total, 97500);
  assert.equal(t.better, 'new');
});

test('formatINR groups in lakh and crore', () => {
  assert.equal(formatINR(1161695), '₹11,61,695');
  assert.equal(formatINR(29959922.4), '₹2,99,59,922');
  assert.equal(formatINR(999), '₹999');
  assert.equal(formatINR(-150000), '-₹1,50,000');
  assert.equal(formatINR(1234.5, { decimals: 2, symbol: false }), '1,234.50');
});

test('inrWords', () => {
  assert.equal(inrWords(1161695), '11.62 lakh');
  assert.equal(inrWords(30000000), '3 crore');
  assert.equal(inrWords(5000), '5 thousand');
});

test('new regime: no tax up to ₹12 lakh taxable, marginal relief just above', () => {
  assert.equal(incomeTax({ income: 1275000 }).new.total, 0);
  // ₹12.1 lakh taxable: tax is capped at the ₹10,000 earned above ₹12 lakh, plus cess.
  assert.equal(incomeTax({ income: 1285000 }).new.total, 10400);
});

test('PPF rounds to 15 + blocks of 5 years', () => {
  assert.equal(ppf({ yearly: 150000, years: 17 }).years, 15);
  assert.equal(ppf({ yearly: 150000, years: 18 }).years, 20);
});

test('gratuity needs 5 years unless fixed-term', () => {
  assert.equal(gratuity({ salary: 50000, years: 4 }).amount, 0);
  assert.ok(gratuity({ salary: 50000, years: 4, fixedTerm: true }).amount > 0);
});

test('bad input throws', () => {
  assert.throws(() => sip({ monthly: 'abc', rate: 12, years: 10 }), TypeError);
  assert.throws(() => sip({ monthly: 5000, rate: 12, years: 2.5 }), RangeError);
});
