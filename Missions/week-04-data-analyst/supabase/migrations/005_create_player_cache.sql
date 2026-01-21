-- Create player_cache table for persistent player data caching
-- This supports MCS-115 Player Data Enrichment Pipeline cache durability

CREATE TABLE IF NOT EXISTS player_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Player identification
  player_id INTEGER NOT NULL UNIQUE,
  
  -- Player details (JSON)
  data JSONB NOT NULL,
  
  -- Player statistics (JSON)
  statistics JSONB NOT NULL DEFAULT '[]',
  
  -- Cache metadata
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_player_cache_player_id (player_id),
  INDEX idx_player_cache_expires_at (expires_at),
  INDEX idx_player_cache_cached_at (cached_at),
  INDEX idx_player_cache_last_accessed (last_accessed),
  
  -- GIN index for JSON data queries
  INDEX idx_player_cache_data_gin (data) USING GIN,
  INDEX idx_player_cache_statistics_gin (statistics) USING GIN
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_accessed = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER player_cache_updated_at
  BEFORE UPDATE ON player_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_player_cache_updated_at();

-- Create trigger to increment hit count on access
CREATE OR REPLACE FUNCTION increment_player_cache_hit_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hit_count = OLD.hit_count + 1;
  NEW.last_accessed = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER player_cache_hit_count
  BEFORE UPDATE ON player_cache
  FOR EACH ROW
  WHEN (OLD.last_accessed < NOW() - INTERVAL '1 minute')
  EXECUTE FUNCTION increment_player_cache_hit_count();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_player_cache()
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

-- Function to get cache statistics
CREATE OR REPLACE FUNCTION get_player_cache_stats()
RETURNS TABLE (
  total_entries INTEGER,
  expired_entries INTEGER,
  avg_hit_count NUMERIC,
  oldest_entry TIMESTAMP WITH TIME ZONE,
  newest_entry TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_entries,
    ROUND(AVG(hit_count), 2) as avg_hit_count,
    MIN(cached_at) as oldest_entry,
    MAX(cached_at) as newest_entry
  FROM player_cache;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies (if using Supabase Auth)
ALTER TABLE player_cache ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role full access to player_cache" ON player_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read-only access)
CREATE POLICY "Authenticated users read player_cache" ON player_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE player_cache IS 'Persistent cache for player data to reduce API calls in MCS-115';
COMMENT ON COLUMN player_cache.player_id IS 'API-Football player ID';
COMMENT ON COLUMN player_cache.data IS 'Player details as JSON';
COMMENT ON COLUMN player_cache.statistics IS 'Player statistics as JSON array';
COMMENT ON COLUMN player_cache.cached_at IS 'When the entry was cached';
COMMENT ON COLUMN player_cache.expires_at IS 'When the entry expires';
COMMENT ON COLUMN player_cache.hit_count IS 'Number of times this entry was accessed';
COMMENT ON COLUMN player_cache.last_accessed IS 'Last time this entry was accessed';

-- Create a scheduled job to clean up expired entries (if supported)
-- This would typically be set up through Supabase's cron jobs or external scheduler
