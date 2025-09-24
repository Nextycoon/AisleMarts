// Multi-currency rounding tests for EUR/GBP/JPY
import { describe, test, expect } from '@jest/globals';
import { signedRequest } from './hmacClient.js';

describe('Multi-Currency Support', () => {

  test('USD rounding (2 decimal places)', async () => {
    const response = await signedRequest('POST', '/api/track/purchase', {
      orderId: `usd-test-${Date.now()}`,
      productId: 'test-product',
      amount: 129.999, // Should round to 130.00
      currency: 'USD'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.amount).toBe(130.00);
    expect(response.data.currency).toBe('USD');
    expect(response.data.amountUSD).toBe(130.00); // Same as USD
  });

  test('EUR rounding (2 decimal places)', async () => {
    const response = await signedRequest('POST', '/api/track/purchase', {
      orderId: `eur-test-${Date.now()}`,
      productId: 'test-product',
      amount: 129.999, // Should round to 130.00
      currency: 'EUR'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.amount).toBe(130.00);
    expect(response.data.currency).toBe('EUR');
    expect(response.data.amountUSD).toBeGreaterThan(140); // EUR > USD
  });

  test('GBP rounding (2 decimal places)', async () => {
    const response = await signedRequest('POST', '/api/track/purchase', {
      orderId: `gbp-test-${Date.now()}`,
      productId: 'test-product', 
      amount: 49.005, // Should round to 49.01 (banker's rounding)
      currency: 'GBP'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.amount).toBe(49.01);
    expect(response.data.currency).toBe('GBP');
    expect(response.data.amountUSD).toBeGreaterThan(60); // GBP > USD
  });

  test('JPY rounding (0 decimal places)', async () => {
    const response = await signedRequest('POST', '/api/track/purchase', {
      orderId: `jpy-test-${Date.now()}`,
      productId: 'test-product',
      amount: 999.6, // Should round to 1000
      currency: 'JPY'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.amount).toBe(1000);
    expect(response.data.currency).toBe('JPY');
    expect(response.data.amountUSD).toBeLessThan(10); // JPY << USD
  });

  test('Unsupported currency returns 422', async () => {
    const response = await signedRequest('POST', '/api/track/purchase', {
      orderId: `invalid-currency-${Date.now()}`,
      productId: 'test-product',
      amount: 100,
      currency: 'XYZ'
    });
    
    expect(response.status).toBe(422);
    expect(response.data.error).toContain('Unsupported currency');
  });

  test('Currency normalization to USD', async () => {
    // Test EUR conversion
    const eurResponse = await signedRequest('POST', '/api/track/purchase', {
      orderId: `eur-conversion-${Date.now()}`,
      productId: 'test-product',
      amount: 100,
      currency: 'EUR'
    });
    
    expect(eurResponse.status).toBe(200);
    expect(eurResponse.data.amountUSD).toBeCloseTo(108.7, 1); // ~1.087 rate

    // Test GBP conversion  
    const gbpResponse = await signedRequest('POST', '/api/track/purchase', {
      orderId: `gbp-conversion-${Date.now()}`,
      productId: 'test-product',
      amount: 100,
      currency: 'GBP'
    });
    
    expect(gbpResponse.status).toBe(200);
    expect(gbpResponse.data.amountUSD).toBeCloseTo(126.6, 1); // ~1.266 rate

    // Test JPY conversion
    const jpyResponse = await signedRequest('POST', '/api/track/purchase', {
      orderId: `jpy-conversion-${Date.now()}`,
      productId: 'test-product',
      amount: 15000, // 15000 JPY
      currency: 'JPY'
    });
    
    expect(jpyResponse.status).toBe(200);
    expect(jpyResponse.data.amountUSD).toBeCloseTo(100, 1); // ~150 rate
  });

  test('Refund currency validation', async () => {
    // First create a purchase
    const purchaseResponse = await signedRequest('POST', '/api/track/purchase', {
      orderId: `refund-test-${Date.now()}`,
      productId: 'test-product',
      amount: 100,
      currency: 'EUR'
    });
    
    expect(purchaseResponse.status).toBe(200);
    
    // Test refund with valid currency
    const refundResponse = await signedRequest('POST', '/api/track/refund', {
      purchaseId: purchaseResponse.data.purchaseId,
      amount: 50,
      currency: 'EUR',
      reason: 'partial_refund'
    });
    
    expect(refundResponse.status).toBe(200);
    expect(refundResponse.data.currency).toBe('EUR');
    
    // Test refund with invalid currency
    const invalidRefundResponse = await signedRequest('POST', '/api/track/refund', {
      purchaseId: purchaseResponse.data.purchaseId,
      amount: 25,
      currency: 'INVALID',
      reason: 'test'
    });
    
    expect(invalidRefundResponse.status).toBe(422);
  });

  test('All supported currencies work', async () => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
    
    for (const currency of currencies) {
      const response = await signedRequest('POST', '/api/track/purchase', {
        orderId: `${currency.toLowerCase()}-support-${Date.now()}`,
        productId: 'test-product',
        amount: 100,
        currency
      });
      
      expect(response.status).toBe(200);
      expect(response.data.currency).toBe(currency);
      expect(response.data.amountUSD).toBeGreaterThan(0);
    }
  });

});