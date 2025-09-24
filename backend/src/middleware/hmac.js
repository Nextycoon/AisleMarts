import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || 'dev-secret-key-change-in-production';
const MAX_SKEW_MS = 5 * 60 * 1000; // 5 minutes

// constant-time compare
function safeEqual(a, b) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyHmac() {
  return (req, res, next) => {
    // Check for required headers first
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const idempotencyKey = req.headers['idempotency-key'];

    if (!signature || !timestamp) {
      return res.status(400).json({ error: 'missing_auth_headers' });
    }

    if (!idempotencyKey) {
      return res.status(400).json({ error: 'missing_header', header: 'idempotency-key' });
    }

    try {
      const ts = Number(timestamp);
      if (!Number.isFinite(ts)) {
        return res.status(400).json({ error: 'bad_timestamp' });
      }

      // Check timestamp skew (±5 minutes)
      if (Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
        return res.status(401).json({ error: 'timestamp_out_of_window' });
      }

      // Verify HMAC signature
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
      const toSign = `${ts}.${payload}`;
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(toSign).digest('hex');

      if (!safeEqual(signature, expected)) {
        return res.status(401).json({ error: 'invalid_signature' });
      }

      next();
    } catch (e) {
      return res.status(400).json({ error: 'hmac_verification_error' });
    }
  };
}