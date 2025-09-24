CREATE MATERIALIZED VIEW IF NOT EXISTS story_sessions AS
WITH e AS (
  SELECT 'impression' AS etype, story_id, user_id, viewed_at AS ts FROM story_impressions
  UNION ALL
  SELECT 'cta' AS etype, story_id, user_id, clicked_at AS ts FROM story_ctas
  UNION ALL
  SELECT 'purchase' AS etype, ref_story_id AS story_id, user_id, created_at AS ts FROM purchases
)
, buckets AS (
  SELECT
    etype, story_id, user_id,
    date_trunc('minute', ts) - MOD(EXTRACT(EPOCH FROM ts)::int, 1800) * interval '1 second' AS bucket_ts
  FROM e
  WHERE story_id IS NOT NULL
)
SELECT DISTINCT etype, story_id, user_id, bucket_ts
FROM buckets
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_sessions_bucket ON story_sessions(bucket_ts);

CREATE MATERIALIZED VIEW IF NOT EXISTS funnel_daily AS
WITH base AS (
  SELECT date_trunc('day', bucket_ts)::date AS day, story_id, user_id,
         MAX(CASE WHEN etype='impression' THEN 1 ELSE 0 END) AS has_impression,
         MAX(CASE WHEN etype='cta' THEN 1 ELSE 0 END)         AS has_cta,
         MAX(CASE WHEN etype='purchase' THEN 1 ELSE 0 END)    AS has_purchase
  FROM story_sessions
  GROUP BY 1,2,3
)
SELECT
  day,
  COUNT(*) FILTER (WHERE has_impression=1) AS impressions,
  COUNT(*) FILTER (WHERE has_cta=1)        AS ctas,
  COUNT(*) FILTER (WHERE has_purchase=1)   AS purchases
FROM base
GROUP BY 1
ORDER BY 1 DESC
WITH NO DATA;
