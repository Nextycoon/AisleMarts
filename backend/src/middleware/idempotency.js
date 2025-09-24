import crypto from 'crypto';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export function idempotency() {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) return next();

    const method = req.method;
    const path = req.path;
    const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

    try {
      // Check if we've seen this key before
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key }
      });

      if (existing) {
        // Return 409 with cached response
        return res.status(409).json({ 
          error: 'idempotency_conflict',
          message: 'Request already processed',
          originalResponse: existing.response,
          processedAt: existing.createdAt
        });
      }

      // Store the key and continue
      req.idempotencyKey = key;
      req.idempotencyMeta = { method, path, requestHash };
      next();
    } catch (error) {
      console.error('Idempotency error:', error);
      next();
    }
  };
}

export async function storeIdempotencyResult(key, method, path, requestHash, status, response) {
  if (!key) return;
  
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await prisma.idempotencyKey.create({
      data: {
        key,
        method,
        path,
        requestHash,
        status,
        response: typeof response === 'object' ? response : { data: response },
        expiresAt
      }
    });
  } catch (error) {
    console.error('Failed to store idempotency result:', error);
  }
}