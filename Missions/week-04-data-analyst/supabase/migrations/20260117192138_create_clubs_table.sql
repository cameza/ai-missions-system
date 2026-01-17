-- Create clubs table
-- Migration: create_clubs_table
-- Version: 20260117192138

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    country_iso2 TEXT NOT NULL,
    league_id UUID REFERENCES leagues(id) ON UPDATE CASCADE ON DELETE SET NULL,
    api_reference TEXT, -- External API reference for data updates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for clubs
CREATE INDEX IF NOT EXISTS idx_clubs_league_id ON clubs(league_id);
CREATE INDEX IF NOT EXISTS idx_clubs_country ON clubs(country_iso2);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_clubs_api_reference ON clubs(api_reference) WHERE api_reference IS NOT NULL;
