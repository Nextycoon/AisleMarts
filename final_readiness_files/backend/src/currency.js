export const CURRENCY_DECIMALS = { USD: 2, EUR: 2, GBP: 2, JPY: 0 };

export function roundMinor(amount, code) {
  const d = CURRENCY_DECIMALS[code] ?? 2;
  const f = 10 ** d;
  return Math.round(Number(amount) * f) / f;
}

export function assertSupported(code) {
  const up = (code || '').toUpperCase();
  if (!['USD','EUR','GBP','JPY'].includes(up)) {
    const err = new Error('Unsupported currency');
    err.status = 422;
    throw err;
  }
  return up;
}
