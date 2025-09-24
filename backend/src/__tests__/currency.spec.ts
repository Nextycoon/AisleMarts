import { toMinorUnits, fromMinorUnits, commission } from "../shared/currency";

describe("Currency handling", () => {
  test("JPY rounds 0dp", () => {
    const result = fromMinorUnits(toMinorUnits(1999.6, "JPY"), "JPY");
    expect(result).toBe("2000");
  });

  test("EUR rounds 2dp", () => {
    const result = fromMinorUnits(toMinorUnits(12.345, "EUR"), "EUR");  
    expect(result).toBe("12.35");
  });

  test("USD rounds 2dp", () => {
    const result = fromMinorUnits(toMinorUnits(99.999, "USD"), "USD");
    expect(result).toBe("100.00");
  });

  test("GBP rounds 2dp", () => {
    const result = fromMinorUnits(toMinorUnits(25.126, "GBP"), "GBP");
    expect(result).toBe("25.13");
  });

  test("commission respects minor units", () => {
    const gross = toMinorUnits(239, "USD");
    const c = commission(gross, 12, "USD");
    const result = fromMinorUnits(c, "USD");
    expect(result).toBe("28.68");
  });

  test("JPY commission has 0 decimals", () => {
    const gross = toMinorUnits(10000, "JPY"); 
    const c = commission(gross, 8.5, "JPY");
    const result = fromMinorUnits(c, "JPY");
    expect(result).toBe("850"); // No decimals for JPY
  });

  test("EUR commission has 2 decimals", () => {
    const gross = toMinorUnits(100.50, "EUR");
    const c = commission(gross, 7.25, "EUR");  
    const result = fromMinorUnits(c, "EUR");
    expect(result).toBe("7.29"); // Proper banker's rounding
  });
});