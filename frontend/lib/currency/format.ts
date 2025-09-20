import { IsoCurrency } from "./types";
import { CURRENCY_DATA } from "./regionMaps";

export function formatAmount(amount: number, code: IsoCurrency, locale?: string): string {
  // Try Intl.NumberFormat first for better formatting
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting with cultural awareness
    return formatAmountManual(amount, code);
  }
}

function formatAmountManual(amount: number, code: IsoCurrency): string {
  const currency = CURRENCY_DATA[code];
  if (!currency) {
    return `${code} ${amount.toFixed(2)}`;
  }
  
  // Apply rounding based on decimals
  const roundedAmount = Number(amount.toFixed(currency.decimals));
  
  // Format number with proper separators
  let formattedNumber: string;
  if (currency.decimals === 0) {
    formattedNumber = Math.round(roundedAmount).toString();
  } else {
    formattedNumber = roundedAmount.toFixed(currency.decimals);
  }
  
  // Apply cultural number formatting
  const parts = formattedNumber.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousands delimiter
  if (currency.delimiter && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.delimiter);
  }
  
  // Combine with separator
  if (decimalPart && currency.decimals > 0) {
    formattedNumber = integerPart + currency.separator + decimalPart;
  } else {
    formattedNumber = integerPart;
  }
  
  // Apply symbol positioning
  if (currency.format === 'before') {
    return `${currency.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${currency.symbol}`;
  }
}