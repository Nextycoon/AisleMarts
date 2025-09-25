-- Database schema for server-side ranker
-- Per-story aggregate stats (clicks/views/purchases) + creator metadata

CREATE TABLE IF NOT EXISTS story_stats (
  story_id      TEXT PRIMARY KEY,
  creator_id    TEXT NOT NULL,
  views         BIGINT NOT NULL DEFAULT 0,
  clicks        BIGINT NOT NULL DEFAULT 0,
  purchases     BIGINT NOT NULL DEFAULT 0,
  last_event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_stats_creator ON story_stats (creator_id);
CREATE INDEX IF NOT EXISTS idx_story_stats_updated ON story_stats (updated_at DESC);

-- Recent candidate set (recency window)
CREATE MATERIALIZED VIEW IF NOT EXISTS story_candidates AS
SELECT s.story_id, s.creator_id, s.updated_at
FROM story_stats s
WHERE s.updated_at >= now() - interval '14 days';