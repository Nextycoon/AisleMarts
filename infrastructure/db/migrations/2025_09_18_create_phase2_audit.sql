-- db/migrations/2025_09_18_create_phase2_audit.sql
-- Phase 2 Unlock Audit Table for AisleMarts Business

CREATE TABLE phase2_unlock_audit (
  id SERIAL PRIMARY KEY,
  method VARCHAR(16) NOT NULL, -- 'auto' | 'manual' | 'pending'
  performed_by VARCHAR(128),    -- admin token or 'system'
  approvals INT DEFAULT 0,
  downloads BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  extra JSONB DEFAULT '{}'     -- any extra data (e.g., emergent response)
);

CREATE INDEX idx_phase2_unlock_created_at ON phase2_unlock_audit(created_at DESC);

-- Example queries for audit reporting
-- SELECT * FROM phase2_unlock_audit ORDER BY created_at DESC LIMIT 10;
-- SELECT method, COUNT(*) FROM phase2_unlock_audit GROUP BY method;
-- SELECT * FROM phase2_unlock_audit WHERE method = 'manual' AND created_at > NOW() - INTERVAL '30 days';