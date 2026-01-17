# Transfer Hub Database Setup Guide

## Overview
This document outlines the Supabase database setup for the Transfer Hub application.

## Database Connection
- **URL**: https://your-project-id.supabase.co
- **Region**: US-East-1
- **Status**: Active and Healthy

## Environment Variables
Add these to your Vercel project settings and local `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Security Notes:**
- Get actual keys from Supabase dashboard > Settings > API
- Service role key should ONLY be used on server-side, never exposed to client
- Never commit actual keys to version control
- Rotate keys if they're accidentally exposed

## Database Schema

### Tables
1. **leagues** - League information with tier and type classification
2. **clubs** - Club data with API references for data updates
3. **transfers** - Transfer records with full player and transaction details

### Key Features
- UUID primary keys with `gen_random_uuid()`
- Transfer values stored in cents (BIGINT) to avoid floating point issues
- Denormalized club/league names for easier querying
- Foreign key relationships with proper cascade rules

### Indexes
- Basic indexes on key columns (transfer_date, league_id, club_ids, player names)
- Full-text search index on player_full_name
- Composite indexes for common filter combinations
- Partial index for high-value transfers (> $10M)

### Security
- Row Level Security (RLS) enabled on all tables
- Public read access for anonymous users
- Service role full access for data operations
- Optimized policies for performance

## Database Functions

### get_transfer_stats()
Returns aggregate statistics about transfers:
- Total transfers count
- Total transfer value
- Average transfer value
- Maximum transfer value
- Recent transfers (last 30 days)

### search_transfers()
Advanced search function with filters:
- Full-text search on player names
- Filter by league, position, value range, date range
- Pagination support
- Optimized sorting by date and value

## Views

### recent_transfers
View of transfers from the last 30 days, automatically updated.

## Migration History
All schema changes are tracked through Supabase migrations:
- `create_leagues_table` - Initial leagues table
- `create_clubs_table` - Clubs table with references
- `create_transfers_table` - Main transfers table
- `create_advanced_indexes_fixed` - Performance indexes
- `enable_rls_and_create_policies` - Security policies
- `create_recent_transfers_view` - Recent transfers view
- `create_sample_data` - Test data for development
- `create_database_functions` - Helper functions
- `fix_security_issues` - Security optimizations
- `optimize_rls_policies` - Performance optimizations

## Appendix: SQL Schema Verification

### Table Definitions
```sql
-- Leagues Table
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('1', '2', '3', '4', '5')),
    type TEXT NOT NULL CHECK (type IN ('domestic', 'continental', 'international')),
    country_iso2 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    country_iso2 TEXT NOT NULL,
    league_id UUID REFERENCES leagues(id) ON UPDATE CASCADE ON DELETE SET NULL,
    api_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_first_name TEXT NOT NULL,
    player_last_name TEXT NOT NULL,
    player_full_name TEXT NOT NULL,
    player_position TEXT,
    player_age INTEGER,
    player_nationality_iso2 TEXT,
    transfer_date DATE NOT NULL,
    transfer_value_usd BIGINT,
    from_club_id UUID REFERENCES clubs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    to_club_id UUID REFERENCES clubs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    league_id UUID REFERENCES leagues(id) ON UPDATE CASCADE ON DELETE SET NULL,
    from_club_name TEXT,
    to_club_name TEXT,
    league_name TEXT,
    transfer_window TEXT CHECK (transfer_window IN ('summer', 'winter')),
    season_year TEXT,
    api_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Index Definitions
```sql
-- Full-text search
CREATE INDEX IF NOT EXISTS idx_transfers_player_full_name_fts 
ON transfers USING GIN(to_tsvector('english', player_full_name));

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_transfers_league_date 
ON transfers(league_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_position_date 
ON transfers(player_position, transfer_date DESC) WHERE player_position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_to_club_date 
ON transfers(to_club_id, transfer_date DESC) WHERE to_club_id IS NOT NULL;

-- Partial index for high-value transfers
CREATE INDEX IF NOT EXISTS idx_transfers_high_value 
ON transfers(transfer_value_usd DESC, transfer_date DESC) 
WHERE transfer_value_usd > 1000000000; -- > $10M in cents
```

### RLS Policies
```sql
-- Optimized RLS policies
CREATE POLICY "Combined access to leagues" ON leagues FOR ALL USING (
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR 
    (SELECT auth.jwt() ->> 'role' IN ('anon', 'authenticated', 'authenticator', 'dashboard_user'))
);

CREATE POLICY "Combined access to clubs" ON clubs FOR ALL USING (
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR 
    (SELECT auth.jwt() ->> 'role' IN ('anon', 'authenticated', 'authenticator', 'dashboard_user'))
);

CREATE POLICY "Combined access to transfers" ON transfers FOR ALL USING (
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR 
    (SELECT auth.jwt() ->> 'role' IN ('anon', 'authenticated', 'authenticator', 'dashboard_user'))
);
```

### Database Functions
```sql
-- Transfer statistics function
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
```

## Performance Notes
- All indexes are optimized for common query patterns
- RLS policies use optimized auth checks
- Connection pooling enabled via pgBouncer
- Advisor checks passed for security and performance

## Next Steps
1. Add environment variables to Vercel project
2. Test database connection from application
3. Implement data ingestion pipeline
4. Set up automated data updates

## Troubleshooting
- Check Supabase dashboard for connection status
- Verify environment variables are correctly set
- Monitor database performance through advisor reports
- Review migration logs for any schema issues
