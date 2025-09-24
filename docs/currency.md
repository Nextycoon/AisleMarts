# Multi-Currency Support

AisleMarts supports precision currency handling with proper rounding for global commerce.

## Supported Currencies

| Currency | Code | Minor Units | Decimal Places |
|----------|------|-------------|----------------|
| US Dollar | USD | 2 | 2 |
| Euro | EUR | 2 | 2 |
| British Pound | GBP | 2 | 2 |
| Japanese Yen | JPY | 0 | 0 |

## Currency Precision

### Minor Units System
All monetary calculations use integer minor units to avoid floating-point precision issues:

```typescript
// Convert to minor units (cents, pence, etc.)
const usdCents = toMinorUnits(12.34, "USD"); // 1234n
const eurCents = toMinorUnits(45.67, "EUR"); // 4567n
const jpyMinor = toMinorUnits(1000, "JPY");  // 1000n (no sub-units)

// Convert back to display format
const usdDisplay = fromMinorUnits(1234n, "USD"); // "12.34"
const eurDisplay = fromMinorUnits(4567n, "EUR"); // "45.67" 
const jpyDisplay = fromMinorUnits(1000n, "JPY"); // "1000"
```

### Rounding Rules
- **USD/EUR/GBP**: 2 decimal places using banker's rounding
- **JPY**: 0 decimal places (whole numbers only)

```typescript
// Examples
roundMinor(12.345, "EUR"); // 12.35
roundMinor(12.344, "EUR"); // 12.34
roundMinor(1999.6, "JPY"); // 2000
roundMinor(1999.4, "JPY"); // 1999
```

## Commission Calculations

Commissions are calculated as percentages of gross amounts, properly rounded to currency precision:

```typescript
const gross = toMinorUnits(239, "USD"); // $239.00
const comm = commission(gross, 12, "USD"); // 12% = $28.68
const commDisplay = fromMinorUnits(comm, "USD"); // "28.68"

const grossJPY = toMinorUnits(10000, "JPY"); // ¥10,000
const commJPY = commission(grossJPY, 8.5, "JPY"); // 8.5% = ¥850
const commJPYDisplay = fromMinorUnits(commJPY, "JPY"); // "850"
```

## Exchange Rates & Normalization

All amounts are normalized to USD for analytics and reporting:

```typescript
const fxRates = {
  EUR: 1.087,  // 1 EUR = 1.087 USD
  GBP: 1.266,  // 1 GBP = 1.266 USD  
  JPY: 0.006667 // 1 JPY = 0.006667 USD
};

const eurAmount = 100; // €100
const usdEquivalent = convertToUSD(eurAmount, "EUR", fxRates); // $108.70
```

## Timezone-Aware Processing

Commission calculations use the transaction's timezone to pick proper FX rates:

- **FX Rate Selection**: Uses local midnight of transaction timezone
- **Attribution Windows**: 7-day windows calculated in transaction timezone
- **Reporting**: All times stored as UTC, displayed in user's timezone

## Display Formatting

Currency formatting follows locale conventions:

```typescript
formatCurrency(12.34, "USD"); // "$12.34"
formatCurrency(45.67, "EUR"); // "€45.67" 
formatCurrency(1000, "JPY");  // "¥1,000"
```

## Frontend Integration

React Native formatting preserves currency precision:

```typescript
export function formatMoney(amountMinor: bigint, currency: string) {
  const mu = MINOR_UNITS[currency] ?? 2;
  const decimal = Number(amountMinor) / Math.pow(10, mu);
  return new Intl.NumberFormat(undefined, { 
    style: "currency", 
    currency, 
    minimumFractionDigits: mu, 
    maximumFractionDigits: mu 
  }).format(decimal);
}
```

## Implementation Notes

- **No floating-point arithmetic** in monetary calculations
- **Banker's rounding** for fair commission splits
- **Timezone awareness** for global commerce accuracy
- **Consistent precision** across frontend/backend/analytics