-- Create transfers table
-- Migration: create_transfers_table
-- Version: 20260117192142

CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_first_name TEXT NOT NULL,
    player_last_name TEXT NOT NULL,
    player_full_name TEXT NOT NULL,
    player_position TEXT,
    player_age INTEGER,
    player_nationality_iso2 TEXT,
    
    -- Transfer details
    transfer_date DATE NOT NULL,
    transfer_value_usd BIGINT, -- Store in cents to avoid floating point
    from_club_id UUID REFERENCES clubs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    to_club_id UUID REFERENCES clubs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    league_id UUID REFERENCES leagues(id) ON UPDATE CASCADE ON DELETE SET NULL,
    
    -- Denormalized fields for easier querying
    from_club_name TEXT,
    to_club_name TEXT,
    league_name TEXT,
    
    -- Metadata
    transfer_window TEXT CHECK (transfer_window IN ('summer', 'winter')),
    season_year TEXT,
    api_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes for transfers
CREATE INDEX IF NOT EXISTS idx_transfers_transfer_date ON transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_transfers_league_id ON transfers(league_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_club_id ON transfers(from_club_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_club_id ON transfers(to_club_id);
CREATE INDEX IF NOT EXISTS idx_transfers_player_last_name ON transfers(player_last_name);
CREATE INDEX IF NOT EXISTS idx_transfers_player_first_name ON transfers(player_first_name);
