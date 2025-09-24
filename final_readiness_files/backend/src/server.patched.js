import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { idempotency } from './middleware/idempotency.js';
import { verifyHmac } from './middleware/hmac.js';
import { validate } from './middleware/validate.js';
import { errorHandler } from './middleware/errors.js';
import { ImpressionSchema, CTASchema, PurchaseSchema } from './schemas.js';
import { assertSupported, roundMinor } from './currency.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
const corsRegex = new RegExp(process.env.CORS_REGEX || '(localhost:\\d+|127.0.0.1:\\d+|192.168\\.\\d+\\.\\d+:\\d+|.*\\.up\\.railway\\.app)');
app.use(cors({ origin: (o, cb)=>{ if(!o) return cb(null,true); cb(null, corsRegex.test(o)); }, credentials: true }));
app.use(morgan('dev'));

app.get('/health', (req,res)=>res.json({ ok: true }));

app.post('/api/track/impression', validate(ImpressionSchema), async (req,res)=>{
  const { storyId, userId } = req.body;
  const r = await prisma.storyImpression.create({ data: { storyId, userId } });
  res.json({ ok: true, id: r.id });
});

app.post('/api/track/cta', validate(CTASchema), async (req,res)=>{
  const { storyId, productId, userId } = req.body;
  const r = await prisma.storyCTA.create({ data: { storyId, productId, userId } });
  res.json({ ok: true, id: r.id });
});

app.get('/api/stories', async (req,res)=>{
  const limit = Math.min(parseInt(req.query.limit||'24',10), 48);
  const cursor = req.query.cursor;
  const where = { expiresAt: { gt: new Date() } };
  const orderBy = [{ createdAt: 'desc' }];
  let query = { where, orderBy, take: limit + 1 };
  if (cursor) query = { ...query, cursor: { id: String(cursor) }, skip: 1 };
  const list = await prisma.story.findMany(query);
  const hasMore = list.length > limit;
  const data = hasMore ? list.slice(0, limit) : list;
  const nextCursor = hasMore ? data[data.length-1].id : null;
  res.json({ data, cursor: nextCursor });
});

async function resolveFxRate(currency) {
  if (!currency || currency.toUpperCase() === 'USD') return 1;
  const fx = await prisma.fxRate.findUnique({ where: { currency: currency.toUpperCase() } });
  return fx ? Number(fx.rateUsd) : 1;
}

app.post('/api/track/purchase',
  idempotency(),
  verifyHmac(),
  validate(PurchaseSchema),
  async (req,res)=>{
    const { orderId, userId, productId, amount, currency, referrerStoryId } = req.body;
    const CODE = assertSupported(currency);
    const localAmount = roundMinor(amount, CODE);

    let creatorId = null, rate = null, windowDays = 7;
    if (referrerStoryId) {
      const story = await prisma.story.findUnique({ where: { id: referrerStoryId } });
      if (story) creatorId = story.creatorId;
    }
    if (!creatorId && userId) {
      const since = new Date(Date.now() - windowDays*24*60*60*1000);
      const cta = await prisma.storyCTA.findFirst({
        where: { userId, productId, clickedAt: { gte: since } },
        orderBy: { clickedAt: 'desc' },
        include: { story: true }
      });
      if (cta?.story) creatorId = cta.story.creatorId;
    }
    if (creatorId) {
      const contract = await prisma.affiliateContract.findFirst({ where: { creatorId, active: true }, orderBy: { createdAt: 'desc' } });
      if (contract?.windowDays) windowDays = contract.windowDays;
      if (contract?.rateOverride != null) rate = Number(contract.rateOverride);
      if (rate == null) {
        const c = await prisma.creator.findUnique({ where: { id: creatorId } });
        rate = c ? Number(c.commissionPct) : 0.08;
      }
    } else { rate = 0.08; }

    const localCommission = roundMinor(localAmount * rate, CODE);
    const fxRateUsd = await resolveFxRate(CODE);
    const amountUsd = Math.round(localAmount * fxRateUsd * 100) / 100;
    const commissionUsd = Math.round(localCommission * fxRateUsd * 100) / 100;

    const p = await prisma.purchase.create({
      data: {
        orderId, userId, productId,
        amount: localAmount, currency: CODE,
        amountUsd, fxRateUsd, refStoryId: referrerStoryId || null,
        creatorId,
        commission: localCommission,
        commissionUsd
      }
    });
    res.json({ ok: true, id: p.id, commission: localCommission, commissionUsd, creatorId });
  }
);

// Admin helpers (optional): backfill & refresh
app.post('/admin/backfill-impressions', async (req,res)=>{
  const LOOKBACK_MIN = 30;
  const since = new Date(Date.now() - 7*24*60*60*1000);
  const ctas = await prisma.$queryRawUnsafe(`
    SELECT c.id, c.story_id, c.user_id, c.clicked_at
    FROM story_ctas c
    LEFT JOIN story_impressions i
      ON i.story_id = c.story_id
     AND i.user_id  = c.user_id
     AND i.viewed_at >= c.clicked_at - interval '${LOOKBACK_MIN} minutes'
     AND i.viewed_at <= c.clicked_at
    WHERE c.clicked_at >= $1
      AND i.id IS NULL
  `, since);
  let count = 0;
  for (const c of ctas) {
    await prisma.storyImpression.create({
      data: { storyId: c.story_id, userId: c.user_id, viewedAt: new Date(new Date(c.clicked_at).getTime() - 1000) }
    });
    count++;
  }
  res.json({ ok: true, backfilled: count });
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Backend (final readiness) on :'+port));
