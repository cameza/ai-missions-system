-- Create sample data
-- Migration: create_sample_data
-- Version: 20260117192159

-- Insert sample leagues
INSERT INTO leagues (name, tier, type, country_iso2) VALUES
('Premier League', '1', 'domestic', 'GB'),
('La Liga', '1', 'domestic', 'ES'),
('Serie A', '1', 'domestic', 'IT'),
('Bundesliga', '1', 'domestic', 'DE'),
('Ligue 1', '1', 'domestic', 'FR'),
('Champions League', '1', 'continental', 'EU')
ON CONFLICT DO NOTHING;

-- Insert sample clubs
INSERT INTO clubs (name, short_name, country_iso2, league_id, api_reference) VALUES
('Manchester United', 'MUN', 'GB', (SELECT id FROM leagues WHERE name = 'Premier League'), 'club_1'),
('Real Madrid', 'RMA', 'ES', (SELECT id FROM leagues WHERE name = 'La Liga'), 'club_2'),
('Barcelona', 'BAR', 'ES', (SELECT id FROM leagues WHERE name = 'La Liga'), 'club_3'),
('AC Milan', 'MIL', 'IT', (SELECT id FROM leagues WHERE name = 'Serie A'), 'club_4'),
('Bayern Munich', 'FCB', 'DE', (SELECT id FROM leagues WHERE name = 'Bundesliga'), 'club_5'),
('Paris Saint-Germain', 'PSG', 'FR', (SELECT id FROM leagues WHERE name = 'Ligue 1'), 'club_6')
ON CONFLICT DO NOTHING;

-- Insert sample transfers
INSERT INTO transfers (
    player_first_name, player_last_name, player_full_name, player_position, player_age,
    player_nationality_iso2, transfer_date, transfer_value_usd, from_club_id, to_club_id, league_id,
    from_club_name, to_club_name, league_name, transfer_window, season_year, api_source
) VALUES
('Cristiano', 'Ronaldo', 'Cristiano Ronaldo', 'FW', 36, 'PT', '2021-08-27', 15000000000, 
 (SELECT id FROM clubs WHERE name = 'Juventus'), (SELECT id FROM clubs WHERE name = 'Manchester United'), 
 (SELECT id FROM leagues WHERE name = 'Premier League'), 'Juventus', 'Manchester United', 'Premier League', 'summer', '2021-22', 'transfermarkt'),
('Lionel', 'Messi', 'Lionel Messi', 'FW', 34, 'AR', '2021-08-10', 0, 
 (SELECT id FROM clubs WHERE name = 'Barcelona'), (SELECT id FROM clubs WHERE name = 'Paris Saint-Germain'), 
 (SELECT id FROM leagues WHERE name = 'Ligue 1'), 'Barcelona', 'Paris Saint-Germain', 'Ligue 1', 'summer', '2021-22', 'transfermarkt')
ON CONFLICT DO NOTHING;
