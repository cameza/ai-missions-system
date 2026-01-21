-- Migration: Align transfers table schema with seed.ts expectations
-- Version: 20260121
-- Purpose: Rename columns and add missing fields to match seed script output

-- Rename existing columns to match seed.ts schema
ALTER TABLE transfers RENAME COLUMN player_age TO age;
ALTER TABLE transfers RENAME COLUMN player_position TO "position";
ALTER TABLE transfers RENAME COLUMN player_nationality_iso2 TO nationality;

-- Drop old constraint BEFORE renaming column to avoid issues
ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_transfer_window_check;

-- Now rename the column
ALTER TABLE transfers RENAME COLUMN transfer_window TO "window";

-- Add missing columns that seed.ts writes
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS player_id INTEGER;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS transfer_type TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS transfer_value_display TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS api_transfer_id BIGINT UNIQUE;

-- Update existing window data to match new format (YYYY-winter, YYYY-summer)
-- Assuming current year 2026 for existing 'summer' and 'winter' values
UPDATE transfers 
SET "window" = '2026-' || "window" 
WHERE "window" IN ('summer', 'winter') AND "window" NOT LIKE '____-%';

-- Now add the new constraint with updated format
ALTER TABLE transfers ADD CONSTRAINT transfers_window_check 
    CHECK ("window" IS NULL OR "window" ~ '^\d{4}-(winter|summer|mid-season)$');

-- Create index on api_transfer_id for upsert operations
CREATE INDEX IF NOT EXISTS idx_transfers_api_transfer_id ON transfers(api_transfer_id);

-- Add comment documenting the schema alignment
COMMENT ON TABLE transfers IS 'Aligned with seed.ts schema on 2026-01-21. Uses cleaner column names (age vs player_age) and includes api_transfer_id for upserts.';
