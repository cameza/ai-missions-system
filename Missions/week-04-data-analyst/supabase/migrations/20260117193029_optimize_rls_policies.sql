-- Optimize RLS policies
-- Migration: optimize_rls_policies
-- Version: 20260117193029

-- Drop existing policies to fix performance issues
DROP POLICY IF EXISTS "Public read access to leagues" ON leagues;
DROP POLICY IF EXISTS "Service role full access to leagues" ON leagues;
DROP POLICY IF EXISTS "Public read access to clubs" ON clubs;
DROP POLICY IF EXISTS "Service role full access to clubs" ON clubs;
DROP POLICY IF EXISTS "Public read access to transfers" ON transfers;
DROP POLICY IF EXISTS "Service role full access to transfers" ON transfers;

-- Create optimized single policies
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
