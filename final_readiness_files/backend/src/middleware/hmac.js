import crypto from 'crypto';

function safeEq(a, b) {
  const A = Buffer.from(a || '', 'utf8');
  const B = Buffer.from(b || '', 'utf8');
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export function verifyHmac() {
  return function(req, res, next) {
    const secret = process.env.HMAC_SECRET;
    if (!secret) return res.status(500).json({ error: 'HMAC secret missing' });
    const sig = req.get('X-Signature');
    const ts = req.get('X-Timestamp');
    if (!sig || !ts) return res.status(401).json({ error: 'Missing signature headers' });
    const age = Math.abs(Date.now() - Number(ts));
    if (!Number.isFinite(age) || age > 5 * 60 * 1000) return res.status(401).json({ error: 'Stale/invalid timestamp' });
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const base = `${req.method}\n${req.path}\n${ts}\n${body}`;
    const expected = crypto.createHmac('sha256', secret).update(base).digest('hex');
    if (!safeEq(sig, expected)) return res.status(401).json({ error: 'Bad signature' });
    next();
  };
}
