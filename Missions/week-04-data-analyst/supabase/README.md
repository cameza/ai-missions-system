# Supabase Migration Scripts

This directory contains all migration scripts for the Transfer Hub database setup.

## Migration Files

### Core Schema
- `20260117192135_create_leagues_table.sql` - Create leagues table with constraints
- `20260117192138_create_clubs_table.sql` - Create clubs table with foreign keys
- `20260117192142_create_transfers_table.sql` - Create main transfers table

### Performance & Search
- `20260117192149_create_advanced_indexes_fixed.sql` - Full-text and composite indexes
- `20260117192154_create_recent_transfers_view.sql` - Recent transfers view

### Security & Access
- `20260117192152_enable_rls_and_create_policies.sql` - Initial RLS policies
- `20260117193029_optimize_rls_policies.sql` - Optimized RLS policies

### Data & Functions
- `20260117192159_create_sample_data.sql` - Sample data for development
- `20260117193016_create_database_functions.sql` - Helper functions

## Usage

### Local Development
```bash
# Apply migrations using Supabase CLI
supabase db push

# Or apply individual migrations
supabase db reset  # Apply all migrations
```

### Production
- Migrations are applied automatically through Supabase dashboard
- Each migration is versioned and tracked
- Rollback capability through migration history

## Migration Order
Migrations must be applied in the following order:
1. Core tables (leagues, clubs, transfers)
2. Indexes and views
3. RLS policies
4. Sample data
5. Functions and optimizations

## Verification
After applying migrations, verify with:
```sql
-- Check table counts
SELECT 
    'leagues' as table_name, COUNT(*) as record_count FROM leagues
UNION ALL
SELECT 'clubs' as table_name, COUNT(*) as record_count FROM clubs
UNION ALL
SELECT 'transfers' as table_name, COUNT(*) as record_count FROM transfers;

-- Test functions
SELECT * FROM get_transfer_stats();
SELECT * FROM search_transfers(search_term => 'test', limit_count => 5);
```

## Notes
- All migrations use `IF NOT EXISTS` for safe re-application
- Foreign keys use `ON UPDATE CASCADE ON DELETE SET NULL` to protect historical data
- Transfer values stored in cents (BIGINT) to avoid floating point precision issues
- RLS policies optimized for performance with single combined policies
