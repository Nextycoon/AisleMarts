/**
 * AisleMarts Production-Hardened Express Server
 * Series A Ready - Ultimate Operational Kit Integration
 * 
 * Features:
 * - HMAC signature verification
 * - Idempotency protection  
 * - Zod validation with proper 4xx responses
 * - Multi-currency support (USD/EUR/GBP/JPY)
 * - Analytics data integrity
 * - All middleware integrated
 */

import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
import { verifyHmac } from './middleware/hmac.js';
import { idempotency, storeIdempotencyResult } from './middleware/idempotency.js';
import { schemas, validate } from './middleware/validate.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { 
  roundMinor, 
  assertSupported, 
  convertToUSD, 
  formatCurrency 
} from './currency.js';
import {
  ImpressionSchema,
  CTASchema, 
  PurchaseSchema,
  RefundSchema
} from './schemas.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(idempotency());

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    ok: true,
    service: '🏆 AisleMarts Series A Ready',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'analytics_funnel_integrity',
      'proper_4xx_responses', 
      'multi_currency_support',
      'hmac_security',
      'idempotency_protection'
    ]
  });
});

// Creators API
app.get('/api/creators', async (req, res) => {
  try {
    const creators = await prisma.creators.findMany({
      orderBy: { tier: 'desc' }
    });
    
    res.json({
      creators: creators.map(c => ({
        id: c.id,
        username: c.username,
        displayName: c.displayName,
        avatar: c.avatar,
        tier: c.tier,
        verificationLevel: c.verificationLevel,
        isActive: c.isActive
      }))
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// Stories API with cursor pagination
app.get('/api/stories', async (req, res) => {
  try {
    const { cursor, limit = 25 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 25, 100);
    
    if (limitNum <= 0) {
      return res.status(400).json({ error: 'Limit must be positive' });
    }

    const whereClause = cursor ? { id: { gt: parseInt(cursor) } } : {};
    
    const stories = await prisma.stories.findMany({
      where: whereClause,
      take: limitNum,
      orderBy: { id: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            tier: true,
            verificationLevel: true
          }
        }
      }
    });

    const nextCursor = stories.length === limitNum 
      ? stories[stories.length - 1].id 
      : null;

    res.json({
      stories: stories.map(s => ({
        id: s.id,
        creatorId: s.creatorId, 
        type: s.type,
        content: s.content,
        mediaUrl: s.mediaUrl,
        productId: s.productId,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        creator: s.creator
      })),
      nextCursor,
      hasMore: nextCursor !== null
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Commerce tracking endpoints (HMAC protected)

// Track impression
app.post('/api/track/impression', validate(ImpressionSchema), async (req, res) => {
  try {
    const { storyId, userId } = req.body;
    
    const impression = await prisma.story_impressions.create({
      data: {
        story_id: storyId,
        user_id: userId || 'anonymous',
        created_at: new Date()
      }
    });

    const response = {
      success: true,
      impressionId: impression.id,
      storyId,
      timestamp: impression.created_at
    };

    // Store idempotency result
    if (req.idempotencyKey) {
      await storeIdempotencyResult(
        req.idempotencyKey,
        req.method,
        req.path, 
        req.idempotencyMeta.requestHash,
        200,
        response
      );
    }

    res.json(response);
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
});

// Track CTA
app.post('/api/track/cta', validate(CTASchema), async (req, res) => {
  try {
    const { storyId, productId, userId } = req.body;
    
    const cta = await prisma.story_ctas.create({
      data: {
        story_id: storyId,
        product_id: productId,
        user_id: userId || 'anonymous',
        created_at: new Date()
      }
    });

    const response = {
      success: true,
      ctaId: cta.id,
      storyId,
      productId,
      timestamp: cta.created_at
    };

    if (req.idempotencyKey) {
      await storeIdempotencyResult(
        req.idempotencyKey,
        req.method,
        req.path,
        req.idempotencyMeta.requestHash,
        200,
        response
      );
    }

    res.json(response);
  } catch (error) {
    console.error('Error tracking CTA:', error);
    res.status(500).json({ error: 'Failed to track CTA' });
  }
});

// Track purchase (HMAC required)
app.post('/api/track/purchase', 
  verifyHmac(), 
  validate(PurchaseSchema), 
  async (req, res) => {
    try {
      const { orderId, userId, productId, amount, currency, referrerStoryId } = req.body;
      
      // Validate and normalize currency
      const normalizedCurrency = assertSupported(currency);
      const roundedAmount = roundMinor(amount, normalizedCurrency);
      
      // Convert to USD for normalization
      const usdAmount = convertToUSD(roundedAmount, normalizedCurrency);
      
      // Check if purchase already exists (idempotency at DB level)
      const existingPurchase = await prisma.purchases.findUnique({
        where: { order_id: orderId }
      });

      if (existingPurchase) {
        return res.status(409).json({
          error: 'Purchase already exists',
          purchaseId: existingPurchase.id,
          orderId: existingPurchase.order_id
        });
      }

      // Create purchase record
      const purchase = await prisma.purchases.create({
        data: {
          order_id: orderId,
          user_id: userId || 'anonymous',
          product_id: productId,
          amount: roundedAmount,
          currency: normalizedCurrency,
          amount_usd: usdAmount,
          referrer_story_id: referrerStoryId,
          created_at: new Date()
        }
      });

      // Calculate commission if there's attribution
      let commission = null;
      if (referrerStoryId) {
        // Get creator tier for commission calculation
        const story = await prisma.stories.findFirst({
          where: { id: referrerStoryId },
          include: { creator: true }
        });

        if (story?.creator) {
          const commissionRates = {
            gold: 0.12,
            blue: 0.10, 
            grey: 0.07,
            unverified: 0.05
          };
          
          const rate = commissionRates[story.creator.tier] || 0.05;
          const commissionAmount = roundMinor(roundedAmount * rate, normalizedCurrency);
          const commissionUSD = convertToUSD(commissionAmount, normalizedCurrency);
          
          commission = {
            amount: commissionAmount,
            currency: normalizedCurrency,
            amountUSD: commissionUSD,
            rate: rate,
            creatorTier: story.creator.tier,
            creatorId: story.creator.id
          };
        }
      }

      const response = {
        success: true,
        purchaseId: purchase.id,
        orderId,
        amount: roundedAmount,
        currency: normalizedCurrency,
        amountUSD: usdAmount,
        commission,
        timestamp: purchase.created_at,
        attribution: referrerStoryId ? { storyId: referrerStoryId } : null
      };

      if (req.idempotencyKey) {
        await storeIdempotencyResult(
          req.idempotencyKey,
          req.method,
          req.path,
          req.idempotencyMeta.requestHash,
          200,
          response
        );
      }

      res.json(response);
    } catch (error) {
      if (error.message.includes('Unsupported currency')) {
        return res.status(422).json({ error: error.message });
      }
      console.error('Error tracking purchase:', error);
      res.status(500).json({ error: 'Failed to track purchase' });
    }
  }
);

// Track refund (HMAC required)
app.post('/api/track/refund', 
  verifyHmac(), 
  validate(RefundSchema), 
  async (req, res) => {
    try {
      const { purchaseId, amount, currency, reason, userId } = req.body;
      
      // Validate currency
      const normalizedCurrency = assertSupported(currency);
      const roundedAmount = roundMinor(amount, normalizedCurrency);
      
      // Find original purchase
      const purchase = await prisma.purchases.findUnique({
        where: { id: purchaseId }
      });

      if (!purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }

      // Create refund record
      const refund = await prisma.purchase_refunds.create({
        data: {
          purchase_id: purchaseId,
          amount: roundedAmount,
          currency: normalizedCurrency,
          amount_usd: convertToUSD(roundedAmount, normalizedCurrency),
          reason,
          user_id: userId || purchase.user_id,
          created_at: new Date()
        }
      });

      const response = {
        success: true,
        refundId: refund.id,
        purchaseId,
        amount: roundedAmount,
        currency: normalizedCurrency,
        reason,
        timestamp: refund.created_at
      };

      if (req.idempotencyKey) {
        await storeIdempotencyResult(
          req.idempotencyKey,
          req.method,
          req.path,
          req.idempotencyMeta.requestHash,
          200,
          response
        );
      }

      res.json(response);
    } catch (error) {
      if (error.message.includes('Unsupported currency')) {
        return res.status(422).json({ error: error.message });
      }
      console.error('Error tracking refund:', error);
      res.status(500).json({ error: 'Failed to track refund' });
    }
  }
);

// Analytics dashboard
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get recent stats
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as impressions_7d,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as impressions_24h
      FROM story_impressions
      UNION ALL
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') 
      FROM story_ctas
      UNION ALL  
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day')
      FROM purchases
    `;

    // Get funnel data if views exist
    let funnelData = [];
    try {
      funnelData = await prisma.$queryRaw`
        SELECT * FROM funnel_daily 
        WHERE day >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY day DESC
        LIMIT 7
      `;
    } catch {
      // Funnel views not created yet
    }

    res.json({
      success: true,
      stats: {
        impressions7d: parseInt(stats[0]?.impressions_7d || 0),
        impressions24h: parseInt(stats[0]?.impressions_24h || 0),
        ctas7d: parseInt(stats[1]?.impressions_7d || 0),
        ctas24h: parseInt(stats[1]?.impressions_24h || 0),
        purchases7d: parseInt(stats[2]?.impressions_7d || 0),
        purchases24h: parseInt(stats[2]?.impressions_24h || 0)
      },
      funnel: funnelData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AisleMarts Production Server running on port ${PORT}`);
  console.log('🏆 Features: HMAC Security + Idempotency + Multi-Currency + Analytics Integrity');
  console.log('💎 Series A Ready - Ultimate Operational Kit Integrated');
});

export default app;