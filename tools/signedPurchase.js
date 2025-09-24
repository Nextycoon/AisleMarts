#!/usr/bin/env node

/**
 * Signed Purchase API Client
 * Tests HMAC-signed purchase requests for production validation
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

const HMAC_SECRET = process.env.HMAC_SECRET || 'dev-secret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function createSignature(timestamp, body) {
  const payload = `${timestamp}.${JSON.stringify(body)}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
}

async function signedPurchase(orderId, productId, amount, currency, options = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const body = {
    orderId,
    productId, 
    amount,
    currency,
    userId: options.userId || 'user_test_001',
    referrerStoryId: options.referrerStoryId || 'story_1'
  };

  const signature = createSignature(timestamp, body);
  
  const headers = {
    'Content-Type': 'application/json',
    'x-signature': `sha256=${signature}`,
    'x-timestamp': timestamp.toString()
  };

  if (options.idempotencyKey) {
    headers['idempotency-key'] = options.idempotencyKey;
  }

  try {
    console.log(`🛍️ Testing purchase: ${orderId} - ${amount} ${currency}`);
    
    const response = await fetch(`${BASE_URL}/api/track/purchase`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    console.log(`📊 Status: ${response.status}`);
    console.log('📝 Response:', JSON.stringify(responseData, null, 2));
    
    return {
      status: response.status,
      data: responseData,
      success: response.ok
    };
    
  } catch (error) {
    console.error('❌ Purchase request failed:', error.message);
    return {
      status: 0,
      error: error.message,
      success: false
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  // Parse CLI arguments
  const options = {};
  let orderId, productId, amount, currency;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--order' && args[i + 1]) {
      orderId = args[++i];
    } else if (args[i] === '--product' && args[i + 1]) {
      productId = args[++i];
    } else if (args[i] === '--amount' && args[i + 1]) {
      amount = parseFloat(args[++i]);
    } else if (args[i] === '--currency' && args[i + 1]) {
      currency = args[++i];
    } else if (args[i] === '--user' && args[i + 1]) {
      options.userId = args[++i];
    } else if (args[i] === '--story' && args[i + 1]) {
      options.referrerStoryId = args[++i];
    } else if (args[i] === '--idempotency' && args[i + 1]) {
      options.idempotencyKey = args[++i];
    }
  }

  if (!orderId || !productId || amount === undefined || !currency) {
    console.log('Usage: node signedPurchase.js --order ORDER_ID --product PRODUCT_ID --amount AMOUNT --currency CURRENCY');
    console.log('Options: --user USER_ID --story STORY_ID --idempotency KEY');
    console.log('Example: node signedPurchase.js --order o-12345 --product buds-x --amount 129.99 --currency USD');
    process.exit(1);
  }

  signedPurchase(orderId, productId, amount, currency, options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    });
}

export default signedPurchase;