-- Incremental upsert for last N minutes (run every 5–10 min)
WITH inc AS (
  SELECT story_id,
         COUNT(*) FILTER (WHERE type='impression') AS v,
         COUNT(*) FILTER (WHERE type='cta')        AS c,
         COUNT(*) FILTER (WHERE type='purchase')   AS p,
         MAX(ts)                                   AS mx
  FROM events
  WHERE ts >= now() - interval '10 minutes'
  GROUP BY story_id
)
INSERT INTO story_stats(story_id, creator_id, views, clicks, purchases, last_event_at, updated_at)
SELECT e.story_id,
       COALESCE(m.creator_id,'unknown') AS creator_id,
       inc.v, inc.c, inc.p, inc.mx, now()
FROM inc
LEFT JOIN story_meta m ON m.story_id = inc.story_id
ON CONFLICT (story_id) DO UPDATE SET
  views = story_stats.views + EXCLUDED.views,
  clicks = story_stats.clicks + EXCLUDED.clicks,
  purchases = story_stats.purchases + EXCLUDED.purchases,
  last_event_at = GREATEST(story_stats.last_event_at, EXCLUDED.last_event_at),
  updated_at = now();