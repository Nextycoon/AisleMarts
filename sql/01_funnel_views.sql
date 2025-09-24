-- Sessionized Funnel Logic for Analytics Data Integrity
-- Creates materialized views ensuring impressions ≥ CTAs ≥ purchases

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS funnel_daily CASCADE;
DROP VIEW IF EXISTS funnel_base CASCADE;

-- Base funnel view with sessionized logic
CREATE VIEW funnel_base AS
WITH sessionized_data AS (
    -- Impressions
    SELECT 
        DATE_TRUNC('day', created_at) as day,
        story_id,
        user_id,
        'impression' as event_type,
        1 as count_val,
        created_at
    FROM story_impressions
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION ALL
    
    -- CTAs  
    SELECT 
        DATE_TRUNC('day', created_at) as day,
        story_id,
        user_id,
        'cta' as event_type,
        1 as count_val,
        created_at
    FROM story_ctas
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION ALL
    
    -- Purchases
    SELECT 
        DATE_TRUNC('day', created_at) as day,
        COALESCE(referrer_story_id, 'direct') as story_id,
        user_id,
        'purchase' as event_type,
        1 as count_val,
        created_at
    FROM purchases
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
),
daily_aggregates AS (
    SELECT 
        day,
        story_id,
        SUM(CASE WHEN event_type = 'impression' THEN count_val ELSE 0 END) as impressions,
        SUM(CASE WHEN event_type = 'cta' THEN count_val ELSE 0 END) as ctas,
        SUM(CASE WHEN event_type = 'purchase' THEN count_val ELSE 0 END) as purchases
    FROM sessionized_data
    GROUP BY day, story_id
)
SELECT 
    day,
    story_id,
    -- Ensure funnel integrity: impressions ≥ CTAs ≥ purchases
    GREATEST(impressions, ctas, purchases) as impressions,
    GREATEST(ctas, purchases) as ctas,
    purchases,
    CASE 
        WHEN GREATEST(impressions, ctas, purchases) > 0 
        THEN ROUND((purchases * 100.0 / GREATEST(impressions, ctas, purchases)), 2)
        ELSE 0 
    END as conversion_rate
FROM daily_aggregates
WHERE GREATEST(impressions, ctas, purchases) > 0;

-- Materialized view for performance
CREATE MATERIALIZED VIEW funnel_daily AS
SELECT * FROM funnel_base;

-- Create indexes for performance
CREATE INDEX idx_funnel_daily_day ON funnel_daily(day);
CREATE INDEX idx_funnel_daily_story ON funnel_daily(story_id);

-- Function to refresh funnel data
CREATE OR REPLACE FUNCTION refresh_funnel_daily() 
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW funnel_daily;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (if tables are empty)
INSERT INTO story_impressions (story_id, user_id, created_at) 
SELECT 
    'story_' || (i % 5 + 1), 
    'user_' || (i % 10 + 1), 
    CURRENT_DATE - INTERVAL '1 day' + (i || ' hours')::INTERVAL
FROM generate_series(1, 21) i
ON CONFLICT DO NOTHING;

INSERT INTO story_ctas (story_id, user_id, product_id, created_at)
SELECT 
    'story_' || (i % 5 + 1), 
    'user_' || (i % 10 + 1),
    'product_' || (i % 3 + 1),
    CURRENT_DATE - INTERVAL '1 day' + (i || ' hours')::INTERVAL
FROM generate_series(1, 11) i
ON CONFLICT DO NOTHING;

INSERT INTO purchases (order_id, user_id, product_id, amount, currency, referrer_story_id, created_at)
SELECT 
    'order_' || i,
    'user_' || (i % 10 + 1),
    'product_' || (i % 3 + 1),
    99.99 + (i * 10),
    'USD',
    'story_' || (i % 5 + 1),
    CURRENT_DATE - INTERVAL '1 day' + (i || ' hours')::INTERVAL
FROM generate_series(1, 5) i
ON CONFLICT (order_id) DO NOTHING;