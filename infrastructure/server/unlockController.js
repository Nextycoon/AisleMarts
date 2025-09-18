// server/unlockController.js
const express = require('express');
const fetch = require('node-fetch');
const Redis = require('ioredis');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DOWNLOAD_TARGET = Number(process.env.DOWNLOAD_TARGET || 1_000_000);
const PHASE2_FLAG_KEY = 'aislemarts:phase2:unlocked';
const APPROVAL_QUEUE = 'phase2:approvals';
const ADMIN_TOKENS = (process.env.ADMIN_TOKENS || '').split(',').map(t => t.trim()).filter(Boolean);

// helper - read downloads from metrics API
async function getDownloadCount() {
  const r = await fetch(process.env.METRICS_DOWNLOADS_ENDPOINT, {
    headers: { Authorization: `Bearer ${process.env.METRICS_API_KEY}` }
  });
  if (!r.ok) {
    throw new Error(`Metrics API error: ${r.status} ${await r.text()}`);
  }
  const j = await r.json();
  return Number(j.totalDownloads || j.downloads || 0);
}

// helper - record audit
async function recordAudit({ method, performed_by, approvals, downloads, extra }) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO phase2_unlock_audit (method, performed_by, approvals, downloads, extra) VALUES ($1,$2,$3,$4,$5)`,
      [method, performed_by, approvals, downloads, extra || {}]
    );
  } finally {
    client.release();
  }
}

// check status
router.get('/phase2/status', async (req, res) => {
  try {
    const flag = await redis.get(PHASE2_FLAG_KEY);
    const downloads = await getDownloadCount();
    res.json({ ok: true, unlocked: !!flag, downloads, required: DOWNLOAD_TARGET });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// unlock endpoint
router.post('/phase2/unlock', bodyParser.json(), async (req, res) => {
  try {
    const { adminToken, force } = req.body;
    const downloads = await getDownloadCount();

    // Auto-unlock if downloads >= threshold and not using force/manual path
    if (downloads >= DOWNLOAD_TARGET && !force) {
      await redis.set(PHASE2_FLAG_KEY, JSON.stringify({ by: 'auto', at: Date.now(), downloads }));
      await recordAudit({ method: 'auto', performed_by: 'system', approvals: 0, downloads });
      // optionally trigger Emergent unlock
      if (process.env.EMERGENT_API_KEY) {
        // call emergent (non-blocking)
        callEmergentUnlockAPI().catch(e => console.error('Emergent unlock call failed', e));
      }
      return res.json({ ok: true, method: 'auto', downloads });
    }

    // Manual flow requires adminToken
    if (!adminToken) {
      return res.status(401).json({ ok: false, error: 'adminToken required for manual unlock' });
    }
    // Validate token
    if (!ADMIN_TOKENS.includes(adminToken)) {
      return res.status(403).json({ ok: false, error: 'invalid admin token' });
    }

    // Push approval into list (use token as identity). This prevents duplicate approvals by same token.
    // We'll use a Redis set to track unique approvals.
    const approvalSetKey = `${APPROVAL_QUEUE}:set`;
    const wasAdded = await redis.sadd(approvalSetKey, adminToken);
    const approvals = await redis.scard(approvalSetKey);

    // Required approvals: 2 by default (configurable)
    const requiredApprovals = Number(process.env.REQUIRED_APPROVALS || 2);

    if (approvals >= requiredApprovals || force === true) {
      // finalize unlock
      await redis.set(PHASE2_FLAG_KEY, JSON.stringify({ by: 'manual', at: Date.now(), approvals, downloads }));
      // record audit
      await recordAudit({ method: 'manual', performed_by: adminToken, approvals, downloads });
      // clear approvals
      await redis.del(approvalSetKey);
      // optionally call Emergent at this point
      if (process.env.EMERGENT_API_KEY) {
        try {
          const emergentResult = await callEmergentUnlockAPI();
          await recordAudit({ method: 'manual', performed_by: adminToken, approvals, downloads, extra: { emergent: emergentResult } });
        } catch (e) {
          console.error('Emergent unlock call failed, but manual unlock still completed', e);
        }
      }
      return res.json({ ok: true, method: 'manual', approvals });
    }

    // pending approvals
    await recordAudit({ method: 'pending', performed_by: adminToken, approvals, downloads });
    return res.json({ ok: true, method: 'pending', approvals, requiredApprovals });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// check unlock flag (admin)
router.get('/phase2/flag', async (req, res) => {
  const flag = await redis.get(PHASE2_FLAG_KEY);
  res.json({ unlocked: !!flag, flag: flag ? JSON.parse(flag) : null });
});

// emergent unlock call (stub)
async function callEmergentUnlockAPI() {
  // Example: you may call your Emergent orchestration API to flip commands live.
  const r = await fetch(process.env.EMERGENT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EMERGENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'deploy_phase2' })
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Emergent API error ${r.status}: ${body}`);
  }
  return r.json();
}

module.exports = router;