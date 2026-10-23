# india-finance-calc

Indian personal finance formulas for JavaScript and TypeScript: SIP and step-up SIP, lumpsum, SIP for a goal, EMI with a repayment schedule, FD, RD, PPF, Sukanya Samriddhi, income tax (new vs old regime, FY 2026-27), HRA exemption, gratuity, compound interest, inflation, and lakh/crore formatting.

No dependencies. Works in Node 18+, browsers, Deno and Bun.

These are the same formulas that run the free calculators on **[gainly.in](https://gainly.in)** (in English, Gujarati and Hindi). Every function is tested against 600 results from the site.

## Install

```sh
npm install github:gainlyfinance/india-finance-calc
```

## Use

```js
import { sip, emi, incomeTax, formatINR, inrWords } from 'india-finance-calc';

const s = sip({ monthly: 5000, rate: 12, years: 10 });
formatINR(s.value);          // "₹11,61,695"
inrWords(s.value);           // "11.62 lakh"

sip({ monthly: 10000, rate: 12, years: 15, stepUp: 10 }).value;   // 8683849.4…

emi({ amount: 5000000, rate: 8.5, years: 20 }).emi;               // 43391.16…

const t = incomeTax({ income: 1500000 });   // salaried, below 60, no other deductions
t.new.total;   // 97500
t.old.total;   // 257400
t.better;      // "new"
```

Amounts are in rupees, rates are percent per year. Results are plain numbers, so round or format them as you like.

## Functions

| Function | What it works out | Try it on gainly.in |
|---|---|---|
| `sip({ monthly, rate, years, stepUp? })` | Future value of a monthly SIP, with a yearly step-up | [SIP calculator](https://gainly.in/sip-calculator) |
| `lumpsum({ amount, rate, years })` | Growth of a one-time investment | [Lumpsum calculator](https://gainly.in/lumpsum-calculator) |
| `sipForGoal({ goal, rate, years, stepUp?, inflation? })` | Monthly SIP needed for a target | [SIP goal calculator](https://gainly.in/sip-goal-calculator) |
| `emi({ amount, rate, years })` | EMI, total interest, yearly schedule | [EMI calculator](https://gainly.in/emi-calculator) |
| `emiAmount(p, rate, months)`, `loanForEmi(emi, rate, months)` | The EMI formula and its reverse | [Home loan EMI](https://gainly.in/home-loan-emi-calculator) |
| `fd({ amount, rate, years, compounding? })` | FD maturity (quarterly by default) | [FD calculator](https://gainly.in/fd-calculator) |
| `rd({ monthly, rate, months })` | RD maturity, quarterly compounding | [RD calculator](https://gainly.in/rd-calculator) |
| `ppf({ yearly, rate?, years? })` | PPF maturity, 15 years plus 5-year blocks | [PPF calculator](https://gainly.in/ppf-calculator) |
| `sukanya({ yearly, rate? })` | Sukanya Samriddhi at 21 years | [Sukanya calculator](https://gainly.in/sukanya-samriddhi-calculator) |
| `incomeTax({ income, salaried?, age?, d80c?, … })` | Tax in both regimes, which is lower | [Income tax calculator](https://gainly.in/income-tax-calculator) |
| `taxNewRegime(taxable)`, `taxOldRegime(taxable, age?)` | Slab tax, rebate, surcharge with marginal relief, 4% cess | |
| `hraExemption({ basic, hra, rent, metro? })` | Exempt and taxable HRA (monthly in, yearly out) | [HRA calculator](https://gainly.in/hra-calculator) |
| `gratuity({ salary, years, months?, covered?, fixedTerm? })` | Gratuity and its tax-free part | [Gratuity calculator](https://gainly.in/gratuity-calculator) |
| `compoundInterest({ principal, rate, years, compounding?, monthly? })` | Compound vs simple interest | [Compound interest](https://gainly.in/compound-interest-calculator) |
| `inflation({ amount, rate, years, mode? })` | Future cost, or today's value of a future amount | [Inflation calculator](https://gainly.in/inflation-calculator) |
| `formatINR(n, { decimals?, symbol? })` | `₹11,61,695` style grouping | |
| `inrWords(n)` | `11.62 lakh`, `3 crore` | |

TypeScript types are included (`index.d.ts`).

## Rules used

- **Income tax:** FY 2026-27 (tax year 2026-27). New regime: slabs from ₹4 lakh, ₹75,000 standard deduction, rebate up to ₹60,000 with marginal relief above ₹12 lakh. Old regime: ₹50,000 standard deduction, 80C up to ₹1.5 lakh, 80D, HRA, home loan interest up to ₹2 lakh, 80CCD(1B), rebate up to ₹12,500 below ₹5 lakh. Surcharge with marginal relief, 4% health and education cess, total rounded to ₹10. Slabs change in each Budget, so check `TAX_YEAR` before you rely on it.
- **Gratuity:** 15/26 of the last monthly basic + DA for each year of service under the Payment of Gratuity Act (15/30 if not covered), tax-free up to ₹20 lakh.
- **SIP:** instalments at the start of each month, monthly rate = yearly rate / 12.

## Tests

```sh
npm test
```

`test/golden.json` holds 600 random cases worked out by the gainly.in calculators themselves (`tools/golden.php`). The tests check that this package gives the same answer to the paisa.

## Not advice

These are estimates for information only. They are not investment, tax or legal advice. Returns on market-linked investments are not guaranteed.

## License

MIT. Made by [Gainly](https://gainly.in), free finance calculators for India. If this package helps you, a link back to [gainly.in](https://gainly.in) is appreciated.
