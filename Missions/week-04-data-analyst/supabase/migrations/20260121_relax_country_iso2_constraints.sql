-- Migration: 20260121_relax_country_iso2_constraints
-- Purpose: temporarily allow NULL country_iso2 values per tech lead decision

ALTER TABLE leagues
    ALTER COLUMN country_iso2 DROP NOT NULL;

ALTER TABLE clubs
    ALTER COLUMN country_iso2 DROP NOT NULL;
