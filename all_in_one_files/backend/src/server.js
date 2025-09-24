import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
const corsRegex = new RegExp(process.env.CORS_REGEX || '(localhost:\\d+|127.0.0.1:\\d+|192.168\\.\\d+\\.\\d+:\\d+|.*\\.up\\.railway\\.app)');
app.use(cors({ origin: (o, cb)=>{ if(!o) return cb(null,true); cb(null, corsRegex.test(o)); }, credentials: true }));
app.use(morgan('dev'));

app.get('/health', (req,res)=>res.json({ ok: true }));

app.get('/api/creators', async (req,res)=>{ res.json(await prisma.creator.findMany()); });

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

app.post('/api/track/impression', async (req,res)=>{
  const { storyId, userId } = req.body || {};
  if (!storyId) return res.status(400).json({ error: 'storyId required' });
  const r = await prisma.storyImpression.create({ data: { storyId, userId } });
  res.json({ ok: true, id: r.id });
});

app.post('/api/track/cta', async (req,res)=>{
  const { storyId, productId, userId } = req.body || {};
  if (!storyId) return res.status(400).json({ error: 'storyId required' });
  const r = await prisma.storyCTA.create({ data: { storyId, productId, userId } });
  res.json({ ok: true, id: r.id });
});

app.post('/api/track/purchase', async (req,res)=>{
  const { orderId, userId, productId, amount, currency, referrerStoryId } = req.body || {};
  if (!orderId || !productId || !amount || !currency) return res.status(400).json({ error: 'missing fields' });
  const since = new Date(Date.now() - 7*24*60*60*1000);
  const cta = await prisma.storyCTA.findFirst({ where: { userId, productId, clickedAt: { gte: since } }, orderBy: { clickedAt: 'desc' }, include: { story: true } });
  const creatorId = referrerStoryId ? (await prisma.story.findUnique({ where: { id: referrerStoryId } }))?.creatorId : cta?.story?.creatorId || null;
  let rate = 0.08; if (creatorId) { const c = await prisma.creator.findUnique({ where: { id: creatorId } }); if (c?.commissionPct) rate = Number(c.commissionPct); }
  const commission = Number(amount) * rate;
  const p = await prisma.purchase.create({ data: { orderId, userId, productId, amount, currency, refStoryId: referrerStoryId || null, creatorId, commission } });
  res.json({ ok: true, id: p.id, commission, creatorId });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Backend on :'+port));
