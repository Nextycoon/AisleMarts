-- Multi-currency FX rates seeding
-- Seeds FX rates for EUR, GBP, JPY with USD normalization

-- Create FxRate table if it doesn't exist
CREATE TABLE IF NOT EXISTS "FxRate" (
    id SERIAL PRIMARY KEY,
    "fromCurrency" VARCHAR(3) NOT NULL,
    "toCurrency" VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("fromCurrency", "toCurrency")
);

-- Clear existing rates
DELETE FROM "FxRate";

-- Seed current FX rates (approximate)
INSERT INTO "FxRate" ("fromCurrency", "toCurrency", rate) VALUES
-- USD as base
('USD', 'USD', 1.000000),
('USD', 'EUR', 0.920000),
('USD', 'GBP', 0.790000), 
('USD', 'JPY', 150.000000),

-- EUR conversions  
('EUR', 'USD', 1.087000),
('EUR', 'EUR', 1.000000),
('EUR', 'GBP', 0.859000),
('EUR', 'JPY', 163.040000),

-- GBP conversions
('GBP', 'USD', 1.266000),
('GBP', 'EUR', 1.164000),
('GBP', 'GBP', 1.000000),
('GBP', 'JPY', 189.870000),

-- JPY conversions  
('JPY', 'USD', 0.006667),
('JPY', 'EUR', 0.006135),
('JPY', 'GBP', 0.005268),
('JPY', 'JPY', 1.000000);

-- Function to get exchange rate
CREATE OR REPLACE FUNCTION get_fx_rate(from_curr VARCHAR(3), to_curr VARCHAR(3))
RETURNS DECIMAL(10,6) AS $$
DECLARE
    rate_val DECIMAL(10,6);
BEGIN
    SELECT rate INTO rate_val 
    FROM "FxRate" 
    WHERE "fromCurrency" = from_curr AND "toCurrency" = to_curr;
    
    IF rate_val IS NULL THEN
        -- Return 1.0 for same currency or if rate not found
        IF from_curr = to_curr THEN
            RETURN 1.000000;
        ELSE
            RAISE EXCEPTION 'FX rate not found for % to %', from_curr, to_curr;
        END IF;
    END IF;
    
    RETURN rate_val;
END;
$$ LANGUAGE plpgsql;