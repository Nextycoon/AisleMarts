import crypto from 'crypto';

export function verifyHmac() {
  return (req, res, next) => {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const secret = process.env.HMAC_SECRET;

    // Skip HMAC verification in development if no secret is set
    if (!secret || process.env.NODE_ENV === 'development') {
      return next();
    }

    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Missing signature or timestamp' });
    }

    // Check timestamp (5-minute window)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300) {
      return res.status(401).json({ error: 'Request timestamp outside valid window' });
    }

    // Verify HMAC signature
    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Constant-time comparison
    const providedSignature = signature.replace('sha256=', '');
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  };
}