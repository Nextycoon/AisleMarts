INSERT INTO fx_rates(currency, rate_usd, updated_at) VALUES
  ('USD', 1.0000, NOW())
ON CONFLICT (currency) DO UPDATE SET rate_usd=EXCLUDED.rate_usd, updated_at=NOW();

INSERT INTO fx_rates(currency, rate_usd, updated_at) VALUES
  ('EUR', 1.0700, NOW()),
  ('GBP', 1.2600, NOW()),
  ('JPY', 0.0067, NOW())
ON CONFLICT (currency) DO UPDATE SET rate_usd=EXCLUDED.rate_usd, updated_at=NOW();
