-- Create stored procedures for player cache management
-- This supports MCS-115 Player Data Enrichment Pipeline

-- Upsert player cache function
CREATE OR REPLACE FUNCTION upsert_player_cache(
  p_player_id INTEGER,
  p_data JSONB,
  p_statistics JSONB DEFAULT '[]',
  p_cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO player_cache (
    player_id, 
    data, 
    statistics, 
    cached_at, 
    expires_at,
    hit_count,
    last_accessed
  ) VALUES (
    p_player_id,
    p_data,
    p_statistics,
    p_cached_at,
    p_expires_at,
    1,
    NOW()
  )
  ON CONFLICT (player_id) 
  DO UPDATE SET
    data = EXCLUDED.data,
    statistics = EXCLUDED.statistics,
    cached_at = EXCLUDED.cached_at,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW(),
    last_accessed = NOW(),
    hit_count = player_cache.hit_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Get player cache entry function
CREATE OR REPLACE FUNCTION get_player_cache(p_player_id INTEGER)
RETURNS TABLE (
  player_id INTEGER,
  data JSONB,
  statistics JSONB,
  cached_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  hit_count INTEGER,
  last_accessed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.player_id,
    pc.data,
    pc.statistics,
    pc.cached_at,
    pc.expires_at,
    pc.hit_count,
    pc.last_accessed
  FROM player_cache pc
  WHERE pc.player_id = p_player_id 
    AND pc.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Delete expired cache entries function
CREATE OR REPLACE FUNCTION delete_expired_player_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM player_cache 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get cache statistics function
CREATE OR REPLACE FUNCTION get_cache_statistics()
RETURNS TABLE (
  total_entries BIGINT,
  expired_entries BIGINT,
  active_entries BIGINT,
  avg_hit_count NUMERIC,
  total_hits BIGINT,
  oldest_entry TIMESTAMP WITH TIME ZONE,
  newest_entry TIMESTAMP WITH TIME ZONE,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cache_stats AS (
    SELECT 
      COUNT(*) as total_entries,
      COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_entries,
      COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries,
      COALESCE(AVG(hit_count), 0) as avg_hit_count,
      COALESCE(SUM(hit_count), 0) as total_hits,
      MIN(cached_at) as oldest_entry,
      MAX(cached_at) as newest_entry
    FROM player_cache
  )
  SELECT 
    cs.total_entries,
    cs.expired_entries,
    cs.active_entries,
    cs.avg_hit_count,
    cs.total_hits,
    cs.oldest_entry,
    cs.newest_entry,
    CASE 
      WHEN cs.total_entries > 0 THEN 
        ROUND((cs.total_hits::NUMERIC / (cs.total_entries + cs.total_hits)) * 100, 2)
      ELSE 0 
    END as cache_hit_rate
  FROM cache_stats cs;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance on player_id lookups
CREATE INDEX IF NOT EXISTS idx_player_cache_player_id_btree 
ON player_cache USING btree (player_id);

-- Create partial index for active entries only
CREATE INDEX IF NOT EXISTS idx_player_cache_active_entries 
ON player_cache (player_id, expires_at) 
WHERE expires_at > NOW();

-- Grant permissions for the stored procedures
GRANT EXECUTE ON FUNCTION upsert_player_cache TO service_role;
GRANT EXECUTE ON FUNCTION get_player_cache TO service_role;
GRANT EXECUTE ON FUNCTION delete_expired_player_cache TO service_role;
GRANT EXECUTE ON FUNCTION get_cache_statistics TO service_role;

-- Grant read permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_player_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_statistics TO authenticated;

-- Comments
COMMENT ON FUNCTION upsert_player_cache IS 'Upsert player cache entry with conflict resolution';
COMMENT ON FUNCTION get_player_cache IS 'Get player cache entry if not expired';
COMMENT ON FUNCTION delete_expired_player_cache IS 'Delete expired cache entries and return count';
COMMENT ON FUNCTION get_cache_statistics IS 'Get comprehensive cache statistics';
