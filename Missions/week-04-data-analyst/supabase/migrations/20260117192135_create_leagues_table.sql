-- NOTE: intentionally lean schema; additional API-specific columns are NOT present.

CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('1', '2', '3', '4', '5')),
    type TEXT NOT NULL CHECK (type IN ('domestic', 'continental', 'international')),
    country_iso2 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for leagues
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues(country_iso2);
CREATE INDEX IF NOT EXISTS idx_leagues_tier ON leagues(tier);
CREATE INDEX IF NOT EXISTS idx_leagues_type ON leagues(type);
