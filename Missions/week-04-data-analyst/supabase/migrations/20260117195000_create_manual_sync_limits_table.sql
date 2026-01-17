-- Migration: create_manual_sync_limits_table
-- Purpose: Persist manual sync rate-limiting timestamps

CREATE TABLE IF NOT EXISTS public.manual_sync_limits (
    token TEXT PRIMARY KEY,
    last_triggered TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintain updated_at column
CREATE OR REPLACE FUNCTION public.set_manual_sync_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_manual_sync_limits_updated_at ON public.manual_sync_limits;
CREATE TRIGGER trg_manual_sync_limits_updated_at
BEFORE UPDATE ON public.manual_sync_limits
FOR EACH ROW
EXECUTE FUNCTION public.set_manual_sync_limits_updated_at();
