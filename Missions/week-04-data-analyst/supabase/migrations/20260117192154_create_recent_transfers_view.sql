-- Create recent transfers view
-- Migration: create_recent_transfers_view
-- Version: 20260117192154

-- Create a view for recent transfers (last 30 days)
CREATE OR REPLACE VIEW recent_transfers AS
SELECT 
    id,
    player_first_name,
    player_last_name,
    player_full_name,
    player_position,
    player_age,
    player_nationality_iso2,
    transfer_date,
    transfer_value_usd,
    from_club_id,
    to_club_id,
    league_id,
    from_club_name,
    to_club_name,
    league_name,
    transfer_window,
    season_year,
    created_at,
    updated_at
FROM transfers 
WHERE transfer_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY transfer_date DESC, transfer_value_usd DESC;

-- Create index for the view's underlying query
CREATE INDEX IF NOT EXISTS idx_transfers_date_value_desc ON transfers(transfer_date DESC, transfer_value_usd DESC);
