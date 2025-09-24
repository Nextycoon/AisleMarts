import crypto from 'crypto';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

function hashReq(req) {
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  return crypto.createHash('sha256').update(req.method + '|' + req.path + '|' + body).digest('hex');
}

export function idempotency({ ttlSeconds = 6 * 60 * 60 } = {}) {
  return async function(req, res, next) {
    const key = req.get('Idempotency-Key');
    if (!key) return next();
    const h = hashReq(req);
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } }).catch(() => null);
    if (existing) {
      if (existing.requestHash !== h) return res.status(409).json({ error: 'Idempotency-Key conflict' });
      res.status(existing.status);
      return res.json(existing.response);
    }
    const origJson = res.json.bind(res);
    res.json = async (payload) => {
      try {
        await prisma.idempotencyKey.create({
          data: {
            key, method: req.method, path: req.path, requestHash: h,
            status: res.statusCode || 200, response: payload,
            expiresAt: new Date(Date.now() + ttlSeconds * 1000)
          }
        });
      } catch {}
      return origJson(payload);
    };
    next();
  };
}
