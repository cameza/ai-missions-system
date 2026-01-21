-- Create enrichment_logs table for tracking player enrichment errors and retries
-- This supports MCS-115 Player Data Enrichment Pipeline

CREATE TABLE IF NOT EXISTS enrichment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transfer reference
  transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL,
  
  -- Error information
  error TEXT NOT NULL,
  
  -- Timestamp and retry tracking
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  retry_count INTEGER NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_enrichment_logs_transfer_id (transfer_id),
  INDEX idx_enrichment_logs_player_id (player_id),
  INDEX idx_enrichment_logs_resolved (resolved),
  INDEX idx_enrichment_logs_timestamp (timestamp),
  INDEX idx_enrichment_logs_retry_count (retry_count),
  
  -- Composite index for finding failed enrichments to retry
  INDEX idx_enrichment_logs_failed_retry (
    resolved, 
    retry_count, 
    timestamp
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrichment_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER enrichment_logs_updated_at
  BEFORE UPDATE ON enrichment_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_enrichment_logs_updated_at();

-- Add RLS policies (if using Supabase Auth)
-- These policies allow the service role to manage enrichment logs
-- while restricting access for other roles

ALTER TABLE enrichment_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role full access to enrichment_logs" ON enrichment_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read-only access to their own logs if needed)
CREATE POLICY "Authenticated users read enrichment_logs" ON enrichment_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE enrichment_logs IS 'Tracks player enrichment errors and retry attempts for MCS-115';
COMMENT ON COLUMN enrichment_logs.transfer_id IS 'Reference to the transfer being enriched';
COMMENT ON COLUMN enrichment_logs.player_id IS 'API-Football player ID';
COMMENT ON COLUMN enrichment_logs.error IS 'Error message from enrichment attempt';
COMMENT ON COLUMN enrichment_logs.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN enrichment_logs.resolved IS 'Whether the enrichment error has been resolved';
