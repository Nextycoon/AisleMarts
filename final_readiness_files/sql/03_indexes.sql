CREATE INDEX IF NOT EXISTS idx_story_cta_user_product ON story_ctas (user_id, product_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_impressions_story ON story_impressions (story_id);
CREATE INDEX IF NOT EXISTS idx_idem_expires ON idempotency_key (expires_at);
