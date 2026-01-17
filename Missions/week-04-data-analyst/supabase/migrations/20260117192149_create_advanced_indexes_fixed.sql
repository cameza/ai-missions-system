-- Create advanced indexes
-- Migration: create_advanced_indexes_fixed
-- Version: 20260117192149

-- Full-text search index for player names
CREATE INDEX IF NOT EXISTS idx_transfers_player_full_name_fts ON transfers USING GIN(to_tsvector('english', player_full_name));

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_transfers_league_date ON transfers(league_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_position_date ON transfers(player_position, transfer_date DESC) WHERE player_position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_to_club_date ON transfers(to_club_id, transfer_date DESC) WHERE to_club_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_from_club_date ON transfers(from_club_id, transfer_date DESC) WHERE from_club_id IS NOT NULL;

-- Partial indexes for high-value transfers
CREATE INDEX IF NOT EXISTS idx_transfers_high_value ON transfers(transfer_value_usd DESC, transfer_date DESC) WHERE transfer_value_usd > 1000000000; -- > $10M in cents
