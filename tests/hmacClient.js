// HMAC Client for testing signed requests

import crypto from 'crypto';
import fetch from 'node-fetch';

const HMAC_SECRET = process.env.HMAC_SECRET || 'dev-secret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export function createSignature(timestamp, body) {
  const payload = `${timestamp}.${JSON.stringify(body)}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
}

export async function signedRequest(method, path, body = {}, options = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createSignature(timestamp, body);
  
  const headers = {
    'Content-Type': 'application/json',
    'x-signature': `sha256=${signature}`,
    'x-timestamp': timestamp.toString()
  };

  if (options.idempotencyKey) {
    headers['idempotency-key'] = options.idempotencyKey;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch {
    data = { rawResponse: text };
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

export async function unsignedRequest(method, path, body = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch {
    data = { rawResponse: text };
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}