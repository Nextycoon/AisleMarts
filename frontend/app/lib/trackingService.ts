import { enqueue } from "../lib/httpQueue";
import crypto from 'crypto-js';

// Helper to generate HMAC signature
function generateHMAC(timestamp: number, body: any): string {
  const secret = process.env.EXPO_PUBLIC_HMAC_SECRET || 'dev-secret-key-change-in-production';
  const payload = `${timestamp}.${JSON.stringify(body)}`;
  return crypto.HmacSHA256(payload, secret).toString();
}

// Helper to generate idempotency key
function generateIdempotencyKey(type: string, data: any): string {
  const unique = `${type}-${Date.now()}-${JSON.stringify(data)}`;
  return crypto.SHA256(unique).toString().substr(0, 16);
}

export async function trackPurchase(url: string, body: any) {
  const timestamp = Date.now();
  const signature = generateHMAC(timestamp, body);
  const idempotencyKey = generateIdempotencyKey('purchase', body);
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature,
    'Idempotency-Key': idempotencyKey
  };

  try {
    const response = await fetch(url, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!response.ok && response.status !== 409) {
      // If request fails (but not due to idempotency), queue it
      await enqueue(url, body, headers);
      return { queued: true, status: response.status };
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    // Network error - queue the request
    await enqueue(url, body, headers);
    return { queued: true, error: error.message };
  }
}

export async function trackCTA(url: string, body: any) {
  const timestamp = Date.now();
  const idempotencyKey = generateIdempotencyKey('cta', body);
  
  const headers = {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey
  };

  try {
    const response = await fetch(url, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!response.ok && response.status !== 409) {
      await enqueue(url, body, headers);
      return { queued: true, status: response.status };
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    await enqueue(url, body, headers);
    return { queued: true, error: error.message };
  }
}

export async function trackImpression(url: string, body: any) {
  const timestamp = Date.now();
  const idempotencyKey = generateIdempotencyKey('impression', body);
  
  const headers = {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey
  };

  try {
    const response = await fetch(url, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    if (!response.ok && response.status !== 409) {
      await enqueue(url, body, headers);
      return { queued: true, status: response.status };
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    await enqueue(url, body, headers);
    return { queued: true, error: error.message };
  }
}