-- Nightly decay (keeps UCB1 responsive; prevents stale dominance)
-- Exponential decay towards zero with floor (keeps items alive)
-- gamma in (0,1). Example: 0.95 retains ~60% after ~10 days.
DO $$
DECLARE gamma NUMERIC := 0.95;
BEGIN
  UPDATE story_stats
  SET views      = GREATEST(0, FLOOR(views * gamma)),
      clicks     = GREATEST(0, FLOOR(clicks * gamma)),
      purchases  = GREATEST(0, FLOOR(purchases * gamma)),
      updated_at = now();
END $$;