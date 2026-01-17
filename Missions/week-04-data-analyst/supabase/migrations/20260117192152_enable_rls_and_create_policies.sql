-- Enable RLS and create policies
-- Migration: enable_rls_and_create_policies
-- Version: 20260117192152

-- Enable Row Level Security on all tables
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Create policies for leagues table
CREATE POLICY "Public read access to leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Service role full access to leagues" ON leagues FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create policies for clubs table
CREATE POLICY "Public read access to clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Service role full access to clubs" ON clubs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create policies for transfers table
CREATE POLICY "Public read access to transfers" ON transfers FOR SELECT USING (true);
CREATE POLICY "Service role full access to transfers" ON transfers FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
