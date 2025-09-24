import crypto from 'crypto';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

let prisma;
let idempotencyStore = new Map(); // In-memory fallback

// Initialize Prisma with error handling
try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('⚠️ Database connection failed for idempotency - using in-memory store');
  prisma = null;
}

export function idempotency() {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) return next();

    const method = req.method;
    const path = req.path;
    const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

    try {
      let existing = null;
      
      if (prisma) {
        // Try database first
        existing = await prisma.idempotencyKey.findUnique({
          where: { key }
        });
      } else {
        // Fallback to in-memory store
        existing = idempotencyStore.get(key);
      }

      if (existing) {
        // Return 409 with cached response
        return res.status(409).json({ 
          error: 'idempotency_conflict',
          message: 'Request already processed',
          originalResponse: existing.response,
          processedAt: existing.createdAt || existing.timestamp
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
  
  const data = {
    key,
    method,
    path,
    requestHash,
    status,
    response: typeof response === 'object' ? response : { data: response },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  try {
    if (prisma) {
      await prisma.idempotencyKey.create({ data });
    } else {
      // Fallback to in-memory store
      idempotencyStore.set(key, { ...data, timestamp: new Date() });
      
      // Clean up expired entries periodically
      if (idempotencyStore.size % 100 === 0) {
        const now = Date.now();
        for (const [k, v] of idempotencyStore.entries()) {
          if (v.expiresAt && v.expiresAt.getTime() < now) {
            idempotencyStore.delete(k);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to store idempotency result:', error);
    // Store in memory as fallback
    idempotencyStore.set(key, { ...data, timestamp: new Date() });
  }
}