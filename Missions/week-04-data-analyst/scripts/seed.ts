#!/usr/bin/env tsx

/**
 * Database Seeding Script
 * 
 * Populates the Supabase database with initial data for the Top 5 leagues:
 * - Premier League (39)
 * - La Liga (140) 
 * - Serie A (135)
 * - Bundesliga (78)
 * - Ligue 1 (61)
 * 
 * Execution: tsx scripts/seed.ts
 */

import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { APIFootballClient, LeagueResponse, TeamResponse, TransferResponse } from './utils/api-client';

// Top 5 League IDs (hardcoded as per Tech Lead specification)
const TOP_5_LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' }
];

export class SeedService {
  protected supabase: SupabaseClient;
  protected apiClient: APIFootballClient;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    this.apiClient = new APIFootballClient();
  }

  /**
   * Main seeding orchestration
   */
  async seedAll(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    console.log(`Target leagues: ${TOP_5_LEAGUES.map(l => l.name).join(', ')}`);

    try {
      // Phase 1: Seed leagues
      console.log('\n📋 Phase 1: Seeding leagues...');
      const seededLeagues = await this.seedLeagues();
      console.log(`✅ Seeded ${seededLeagues.length} leagues`);

      // Phase 2: Seed clubs for each league
      console.log('\n⚽ Phase 2: Seeding clubs...');
      let totalClubs = 0;
      for (const league of seededLeagues) {
        const clubs = await this.seedClubs(league.id, league.name);
        totalClubs += clubs;
        console.log(`✅ Seeded ${clubs} clubs for ${league.name}`);
      }
      console.log(`✅ Seeded ${totalClubs} total clubs`);

      // Phase 3: Seed transfers for each league
      console.log('\n🔄 Phase 3: Seeding transfers...');
      let totalTransfers = 0;
      for (const league of seededLeagues) {
        const transfers = await this.seedTransfers(league.id, league.name);
        totalTransfers += transfers;
        console.log(`✅ Seeded ${transfers} transfers for ${league.name}`);
      }
      console.log(`✅ Seeded ${totalTransfers} total transfers`);

      // Final statistics
      const finalStats = this.apiClient.getRateLimitStats();
      console.log('\n📊 Final Statistics:');
      console.log(`- Rate limit utilization: ${finalStats.hourlyUtilization.toFixed(1)}%`);
      console.log(`- Requests made: ${finalStats.requestsThisHour}`);
      
      console.log('\n🎉 Database seeding completed successfully!');

    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Phase 1: Seed leagues
   */
  async seedLeagues(): Promise<Array<{ id: number; name: string }>> {
    const seededLeagues: Array<{ id: number; name: string }> = [];

    for (const leagueInfo of TOP_5_LEAGUES) {
      try {
        console.log(`Fetching ${leagueInfo.name} data...`);
        const leagueData = await this.apiClient.getLeague(leagueInfo.id);

        const leagueRecord = {
          api_league_id: leagueData.league.id,
          name: leagueData.league.name,
          type: leagueData.league.type,
          country: leagueData.country.name,
          country_code: leagueData.country.code,
          logo_url: leagueData.league.logo,
          current_season: leagueData.seasons.find(s => s.current)?.year || 2024
        };

        const { error } = await this.supabase
          .from('leagues')
          .upsert(leagueRecord, { onConflict: 'api_league_id' });

        if (error) {
          console.error(`Failed to seed league ${leagueInfo.name}:`, error);
          throw error;
        }

        seededLeagues.push({ id: leagueData.league.id, name: leagueData.league.name });
        console.log(`✅ Seeded ${leagueData.league.name}`);

      } catch (error) {
        console.error(`❌ Failed to seed ${leagueInfo.name}:`, error);
        throw error;
      }
    }

    return seededLeagues;
  }

  /**
   * Phase 2: Seed clubs for a specific league
   */
  async seedClubs(leagueId: number, leagueName: string): Promise<number> {
    console.log(`Fetching clubs for ${leagueName}...`);
    
    try {
      const teamsData = await this.apiClient.getTeams(leagueId, 2024);
      
      for (const team of teamsData) {
        const clubRecord = {
          api_club_id: team.team.id,
          name: team.team.name,
          code: team.team.code || null,
          country: team.team.country,
          founded: team.team.founded || null,
          national_team: team.team.national,
          logo_url: team.team.logo,
          venue_name: team.venue?.name || null,
          venue_address: team.venue?.address || null,
          venue_city: team.venue?.city || null,
          venue_capacity: team.venue?.capacity || null,
          venue_surface: team.venue?.surface || null,
          venue_image: team.venue?.image || null
        };

        const { error } = await this.supabase
          .from('clubs')
          .upsert(clubRecord, { onConflict: 'api_club_id' });

        if (error) {
          console.error(`Failed to seed club ${team.team.name}:`, error);
          throw error;
        }
      }

      return teamsData.length;

    } catch (error) {
      console.error(`❌ Failed to seed clubs for ${leagueName}:`, error);
      throw error;
    }
  }

  /**
   * Phase 3: Seed transfers for a specific league
   */
  async seedTransfers(leagueId: number, leagueName: string): Promise<number> {
    console.log(`Fetching transfers for ${leagueName}...`);
    
    try {
      const transfersData = await this.apiClient.getTransfers(leagueId, 2024);
      
      for (const transfer of transfersData) {
        // Get the actual API club IDs (always use out.id as from, in.id as to)
        const fromApiClubId = transfer.transfer.teams.out.id;
        const toApiClubId = transfer.transfer.teams.in.id;

        // Resolve Supabase UUIDs for the clubs
        const { data: fromClub, error: fromError } = await this.supabase
          .from('clubs')
          .select('id')
          .eq('api_club_id', fromApiClubId)
          .single();

        const { data: toClub, error: toError } = await this.supabase
          .from('clubs')
          .select('id')
          .eq('api_club_id', toApiClubId)
          .single();

        if (fromError || !fromClub) {
          console.warn(`Could not find source club with API ID ${fromApiClubId} for transfer ${transfer.transfer.id}`);
          continue;
        }

        if (toError || !toClub) {
          console.warn(`Could not find destination club with API ID ${toApiClubId} for transfer ${transfer.transfer.id}`);
          continue;
        }

        const transferRecord = {
          api_transfer_id: transfer.transfer.id,
          player_id: transfer.transfer.player.id,
          player_name: transfer.transfer.player.name,
          from_club_id: fromClub.id, // Use Supabase UUID
          to_club_id: toClub.id, // Use Supabase UUID
          transfer_date: transfer.transfer.date,
          transfer_type: transfer.transfer.type,
          transfer_fee: null, // API doesn't provide fee data in free tier
          contract_length: null, // API doesn't provide contract data
        };

        const { error } = await this.supabase
          .from('transfers')
          .upsert(transferRecord, { onConflict: 'api_transfer_id' });

        if (error) {
          console.error(`Failed to seed transfer for ${transfer.transfer.player.name}:`, error);
          throw error;
        }
      }

      return transfersData.length;

    } catch (error) {
      console.error(`❌ Failed to seed transfers for ${leagueName}:`, error);
      throw error;
    }
  }
}

/**
 * Script execution
 */
async function main(): Promise<void> {
  try {
    const seedService = new SeedService();
    await seedService.seedAll();
    process.exit(0);
  } catch (error) {
    console.error('Seeding script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
