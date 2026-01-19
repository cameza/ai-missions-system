#!/usr/bin/env tsx

/**
 * Seed Validation Script
 * 
 * Tests the seeding implementation with just one league (Premier League)
 * to validate data structure and foreign key relationships before full run.
 */

import 'dotenv/config';
import { SeedService } from './seed';

class ValidationSeedService extends SeedService {
  /**
   * Seed only Premier League for validation
   */
  async seedValidationLeague(): Promise<void> {
    console.log('🧪 Running validation seed with Premier League only...');

    try {
      // Phase 1: Seed Premier League only
      console.log('\n📋 Phase 1: Seeding Premier League...');
      const premierLeague = { id: 39, name: 'Premier League' };
      
      const leagueData = await this.apiClient.getLeague(premierLeague.id);
      
      const leagueRecord = {
        api_league_id: leagueData.league.id,
        name: leagueData.league.name,
        type: leagueData.league.type,
        country: leagueData.country.name,
        country_code: leagueData.country.code,
        logo_url: leagueData.league.logo,
        current_season: leagueData.seasons.find((s: any) => s.current)?.year || 2024
      };

      const { error: leagueError } = await this.supabase
        .from('leagues')
        .upsert(leagueRecord, { onConflict: 'api_league_id' });

      if (leagueError) {
        console.error('Failed to seed Premier League:', leagueError);
        throw leagueError;
      }
      console.log(`✅ Seeded ${leagueData.league.name}`);

      // Phase 2: Seed Premier League clubs
      console.log('\n⚽ Phase 2: Seeding Premier League clubs...');
      const clubsCount = await this.seedClubs(premierLeague.id, premierLeague.name);
      console.log(`✅ Seeded ${clubsCount} clubs`);

      // Phase 3: Seed Premier League transfers
      console.log('\n🔄 Phase 3: Seeding Premier League transfers...');
      const transfersCount = await this.seedTransfers(premierLeague.id, premierLeague.name);
      console.log(`✅ Seeded ${transfersCount} transfers`);

      // Validation queries
      console.log('\n🔍 Validating seeded data...');
      await this.validateData();

      console.log('\n🎉 Validation seed completed successfully!');

    } catch (error) {
      console.error('\n❌ Validation seed failed:', error);
      throw error;
    }
  }

  /**
   * Validate seeded data integrity
   */
  private async validateData(): Promise<void> {
    // Check leagues
    const { data: leagues, error: leaguesError } = await this.supabase
      .from('leagues')
      .select('*')
      .eq('api_league_id', 39);

    if (leaguesError) {
      throw leaguesError;
    }
    console.log(`✅ Found ${leagues.length} Premier League record(s)`);

    // Check clubs
    const { data: clubs, error: clubsError } = await this.supabase
      .from('clubs')
      .select('*')
      .limit(5);

    if (clubsError) {
      throw clubsError;
    }
    console.log(`✅ Sample clubs data: ${(clubs as any[]).map((c: any) => c.name).join(', ')}`);

    // Check transfers
    const { data: transfers, error: transfersError } = await this.supabase
      .from('transfers')
      .select('*')
      .limit(5);

    if (transfersError) {
      throw transfersError;
    }
    console.log(`✅ Sample transfers: ${(transfers as any[]).map((t: any) => `${t.player_name} (${t.transfer_type})`).join(', ')}`);

    // Check foreign key relationships
    const { data: transferRelations, error: relationError } = await this.supabase
      .from('transfers')
      .select(`
        player_name,
        from_club:clubs!from_club_id(name),
        to_club:clubs!to_club_id(name)
      `)
      .limit(3);

    if (relationError) {
      console.warn('Foreign key validation warning:', relationError);
    } else {
      console.log('✅ Foreign key relationships working');
      (transferRelations as any[]).forEach((tr: any) => {
        console.log(`  - ${tr.player_name}: ${tr.from_club?.name || 'Unknown'} → ${tr.to_club?.name || 'Unknown'}`);
      });
    }
  }
}

/**
 * Validation script execution
 */
async function main(): Promise<void> {
  try {
    const validationService = new ValidationSeedService();
    await validationService.seedValidationLeague();
    process.exit(0);
  } catch (error) {
    console.error('Validation script failed:', error);
    process.exit(1);
  }
}

// Run the validation script
if (require.main === module) {
  main();
}
