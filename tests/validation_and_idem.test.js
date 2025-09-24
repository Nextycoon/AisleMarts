// Comprehensive validation tests for 4xx responses and idempotency
import { describe, test, expect } from '@jest/globals';
import { signedRequest, unsignedRequest, createSignature } from './hmacClient.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Validation & Error Handling', () => {
  
  test('Health check works', async () => {
    const response = await unsignedRequest('GET', '/health');
    expect(response.status).toBe(200);
    expect(response.data.ok).toBe(true);
  });

  test('Missing signature returns 401', async () => {
    const response = await unsignedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      productId: 'test-product', 
      amount: 100,
      currency: 'USD'
    });
    expect(response.status).toBe(401);
  });

  test('Invalid signature returns 401', async () => {
    const body = { orderId: 'test', productId: 'test', amount: 100, currency: 'USD' };
    const timestamp = Math.floor(Date.now() / 1000);
    
    const response = await fetch(`${BASE_URL}/api/track/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'sha256=invalid',
        'x-timestamp': timestamp.toString()
      },
      body: JSON.stringify(body)
    });
    
    expect(response.status).toBe(401);
  });

  test('Missing required fields return 422', async () => {
    // Missing orderId  
    let response = await signedRequest('POST', '/api/track/purchase', {
      productId: 'test-product',
      amount: 100,
      currency: 'USD'
    });
    expect(response.status).toBe(422);
    expect(response.data.error).toContain('required');

    // Missing productId
    response = await signedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      amount: 100,
      currency: 'USD'
    });
    expect(response.status).toBe(422);

    // Missing amount
    response = await signedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      productId: 'test-product',
      currency: 'USD'
    });
    expect(response.status).toBe(422);
  });

  test('Invalid field values return 422', async () => {
    // Negative amount
    let response = await signedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      productId: 'test-product',
      amount: -100,
      currency: 'USD'
    });
    expect(response.status).toBe(422);

    // Invalid currency
    response = await signedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      productId: 'test-product', 
      amount: 100,
      currency: 'INVALID'
    });
    expect(response.status).toBe(422);

    // Amount too large
    response = await signedRequest('POST', '/api/track/purchase', {
      orderId: 'test-order',
      productId: 'test-product',
      amount: 2000000, // > 1M limit
      currency: 'USD'
    });
    expect(response.status).toBe(422);
  });

  test('Idempotency key works correctly', async () => {
    const idempotencyKey = `test-idem-${Date.now()}`;
    const purchaseData = {
      orderId: `test-order-${Date.now()}`,
      productId: 'test-product',
      amount: 100,
      currency: 'USD'
    };

    // First request should succeed
    const response1 = await signedRequest('POST', '/api/track/purchase', purchaseData, {
      idempotencyKey
    });
    expect(response1.status).toBe(200);

    // Second request with same idempotency key should return cached response
    const response2 = await signedRequest('POST', '/api/track/purchase', purchaseData, {
      idempotencyKey  
    });
    expect(response2.status).toBe(200);
    expect(response2.data.purchaseId).toBe(response1.data.purchaseId);
  });

  test('Duplicate order ID returns 409', async () => {
    const orderId = `duplicate-test-${Date.now()}`;
    const purchaseData = {
      orderId,
      productId: 'test-product',
      amount: 100,
      currency: 'USD'
    };

    // First purchase should succeed
    const response1 = await signedRequest('POST', '/api/track/purchase', purchaseData);
    expect(response1.status).toBe(200);

    // Second purchase with same orderId should return 409
    const response2 = await signedRequest('POST', '/api/track/purchase', purchaseData);
    expect(response2.status).toBe(409);
    expect(response2.data.error).toContain('already exists');
  });

  test('Invalid endpoint returns 404', async () => {
    const response = await unsignedRequest('GET', '/api/invalid-endpoint');
    expect(response.status).toBe(404);
    expect(response.data.error).toContain('not found');
  });

  test('Impression validation works', async () => {
    // Valid impression
    let response = await unsignedRequest('POST', '/api/track/impression', {
      storyId: 'story_1',
      userId: 'user_1'
    });
    expect(response.status).toBe(200);

    // Missing storyId
    response = await unsignedRequest('POST', '/api/track/impression', {
      userId: 'user_1'
    });
    expect(response.status).toBe(422);

    // Empty storyId
    response = await unsignedRequest('POST', '/api/track/impression', {
      storyId: '',
      userId: 'user_1'
    });
    expect(response.status).toBe(422);
  });

  test('CTA validation works', async () => {
    // Valid CTA
    let response = await unsignedRequest('POST', '/api/track/cta', {
      storyId: 'story_1',
      productId: 'product_1',
      userId: 'user_1'
    });
    expect(response.status).toBe(200);

    // Missing storyId
    response = await unsignedRequest('POST', '/api/track/cta', {
      productId: 'product_1'
    });
    expect(response.status).toBe(422);
  });

});