// Input checks and Indian number formatting.

export function num(v, name) {
  const n = typeof v === 'string' ? Number(v.replace(/,/g, '')) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new TypeError(`${name} must be a number`);
  return n;
}

export function int(v, name) {
  const n = num(v, name);
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`${name} must be a whole number, 0 or more`);
  return n;
}

/**
 * Indian digit grouping: 1161695 -> "11,61,695". Rounds to `decimals` (default 0).
 * @param {number} value
 * @param {{decimals?: number, symbol?: boolean}} [options]
 */
export function formatINR(value, { decimals = 0, symbol = true } = {}) {
  const n = num(value, 'value');
  const sign = n < 0 ? '-' : '';
  const [whole, frac] = Math.abs(n).toFixed(decimals).split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${sign}${symbol ? '₹' : ''}${grouped}${frac ? '.' + frac : ''}`;
}

/**
 * Short form in lakh and crore: 1161695 -> "11.62 lakh", 29959922 -> "3 crore" (2 decimals, trailing zeros dropped).
 * @param {number} value
 */
export function inrWords(value) {
  const n = num(value, 'value');
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const trim = x => x.toFixed(2).replace(/\.?0+$/, '');
  if (a >= 1e7) return `${sign}${trim(a / 1e7)} crore`;
  if (a >= 1e5) return `${sign}${trim(a / 1e5)} lakh`;
  if (a >= 1e3) return `${sign}${trim(a / 1e3)} thousand`;
  return `${sign}${trim(a)}`;
}
