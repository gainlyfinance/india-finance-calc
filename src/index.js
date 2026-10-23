// india-finance-calc: Indian personal finance formulas, from the calculators on https://gainly.in

export { sip, lumpsum, sipForGoal, compoundInterest, inflation } from './invest.js';
export { emi, emiAmount, loanForEmi } from './loans.js';
export { fd, rd, ppf, sukanya } from './deposits.js';
export { incomeTax, taxNewRegime, taxOldRegime, slabTax, hraExemption, gratuity, TAX_YEAR, GRATUITY_TAX_FREE_LIMIT } from './tax.js';
export { formatINR, inrWords } from './util.js';
