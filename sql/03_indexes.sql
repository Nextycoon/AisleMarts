-- Performance indexes for Series A production readiness

-- Story impressions indexes  
CREATE INDEX IF NOT EXISTS idx_story_impressions_story_id ON story_impressions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_impressions_created_at ON story_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_story_impressions_user_story ON story_impressions(user_id, story_id);

-- Story CTAs indexes
CREATE INDEX IF NOT EXISTS idx_story_ctas_story_id ON story_ctas(story_id);
CREATE INDEX IF NOT EXISTS idx_story_ctas_created_at ON story_ctas(created_at);
CREATE INDEX IF NOT EXISTS idx_story_ctas_user_story ON story_ctas(user_id, story_id);
CREATE INDEX IF NOT EXISTS idx_story_ctas_product_id ON story_ctas(product_id);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_referrer_story ON purchases(referrer_story_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_currency ON purchases(currency);

-- Creators indexes
CREATE INDEX IF NOT EXISTS idx_creators_tier ON creators(tier);
CREATE INDEX IF NOT EXISTS idx_creators_verification_level ON creators(verification_level);

-- Purchase refunds indexes  
CREATE INDEX IF NOT EXISTS idx_purchase_refunds_purchase_id ON purchase_refunds(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_refunds_created_at ON purchase_refunds(created_at);

-- Idempotency keys indexes
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON "IdempotencyKey"(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON "IdempotencyKey"("expiresAt");

-- FX rates indexes
CREATE INDEX IF NOT EXISTS idx_fx_rates_from_to ON "FxRate"("fromCurrency", "toCurrency");

-- Composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_impressions_analytics ON story_impressions(story_id, created_at, user_id);
CREATE INDEX IF NOT EXISTS idx_ctas_analytics ON story_ctas(story_id, created_at, user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_analytics ON purchases(referrer_story_id, created_at, user_id, currency);