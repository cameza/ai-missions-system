-- Create database functions
-- Migration: create_database_functions
-- Version: 20260117193016

-- Create helper functions for data operations
CREATE OR REPLACE FUNCTION get_transfer_stats()
RETURNS TABLE(
    total_transfers BIGINT,
    total_value BIGINT,
    avg_value BIGINT,
    max_value BIGINT,
    recent_transfers BIGINT
) SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_transfers,
        COALESCE(SUM(transfer_value_usd), 0)::BIGINT as total_value,
        COALESCE(AVG(transfer_value_usd), 0)::BIGINT as avg_value,
        COALESCE(MAX(transfer_value_usd), 0)::BIGINT as max_value,
        COUNT(*) FILTER (WHERE transfer_date >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as recent_transfers
    FROM transfers;
END;
$$ LANGUAGE plpgsql;

-- Function to search transfers with filters
CREATE OR REPLACE FUNCTION search_transfers(
    search_term TEXT DEFAULT NULL,
    league_filter UUID DEFAULT NULL,
    position_filter TEXT DEFAULT NULL,
    min_value BIGINT DEFAULT NULL,
    max_value BIGINT DEFAULT NULL,
    date_from DATE DEFAULT NULL,
    date_to DATE DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    player_first_name TEXT,
    player_last_name TEXT,
    player_full_name TEXT,
    player_position TEXT,
    player_age INTEGER,
    transfer_date DATE,
    transfer_value_usd BIGINT,
    from_club_name TEXT,
    to_club_name TEXT,
    league_name TEXT
) SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.player_first_name,
        t.player_last_name,
        t.player_full_name,
        t.player_position,
        t.player_age,
        t.transfer_date,
        t.transfer_value_usd,
        t.from_club_name,
        t.to_club_name,
        t.league_name
    FROM transfers t
    WHERE 
        (search_term IS NULL OR to_tsvector('english', t.player_full_name) @@ plainto_tsquery('english', search_term))
        AND (league_filter IS NULL OR t.league_id = league_filter)
        AND (position_filter IS NULL OR t.player_position = position_filter)
        AND (min_value IS NULL OR t.transfer_value_usd >= min_value)
        AND (max_value IS NULL OR t.transfer_value_usd <= max_value)
        AND (date_from IS NULL OR t.transfer_date >= date_from)
        AND (date_to IS NULL OR t.transfer_date <= date_to)
    ORDER BY t.transfer_date DESC, t.transfer_value_usd DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
