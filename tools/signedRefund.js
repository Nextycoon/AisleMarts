#!/usr/bin/env node

/**
 * Signed Refund API Client  
 * Tests HMAC-signed refund requests for production validation
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

async function signedRefund(purchaseId, amount, currency, reason, options = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const body = {
    purchaseId,
    amount,
    currency,
    reason,
    userId: options.userId || 'user_test_001'
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
    console.log(`💸 Testing refund: ${purchaseId} - ${amount} ${currency}`);
    
    const response = await fetch(`${BASE_URL}/api/track/refund`, {
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
    console.error('❌ Refund request failed:', error.message);
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
  let purchaseId, amount, currency, reason;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--purchase' && args[i + 1]) {
      purchaseId = args[++i];
    } else if (args[i] === '--amount' && args[i + 1]) {
      amount = parseFloat(args[++i]);
    } else if (args[i] === '--currency' && args[i + 1]) {
      currency = args[++i];
    } else if (args[i] === '--reason' && args[i + 1]) {
      reason = args[++i];
    } else if (args[i] === '--user' && args[i + 1]) {
      options.userId = args[++i];
    } else if (args[i] === '--idempotency' && args[i + 1]) {
      options.idempotencyKey = args[++i];
    }
  }

  if (!purchaseId || amount === undefined || !currency || !reason) {
    console.log('Usage: node signedRefund.js --purchase PURCHASE_ID --amount AMOUNT --currency CURRENCY --reason REASON');
    console.log('Options: --user USER_ID --idempotency KEY');
    console.log('Example: node signedRefund.js --purchase p-12345 --amount 129.99 --currency USD --reason "defective"');
    process.exit(1);
  }

  signedRefund(purchaseId, amount, currency, reason, options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    });
}

export default signedRefund;