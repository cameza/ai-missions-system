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
import fs from 'node:fs';
import path from 'node:path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import countries, { type LocaleData } from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { APIFootballClient } from './utils/api-client';

// Top 5 League IDs (hardcoded as per Tech Lead specification)
const TOP_5_LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' }
];

const DEFAULT_TRANSFER_CSV_PATH = path.resolve(
  process.cwd(),
  'Temp_Ref/latest-transfers-top10-pages-1-to-10.csv'
);

countries.registerLocale(enLocale as LocaleData);

const COUNTRY_OVERRIDES: Record<string, string> = {
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  'cote d\'ivoire': 'CI',
  "côte d'ivoire": 'CI',
  türkiye: 'TR',
  turkey: 'TR',
  'korea, south': 'KR',
  'korea, north': 'KP',
  'dr congo': 'CD',
  'democratic republic of the congo': 'CD',
  'republic of the congo': 'CG',
  iran: 'IR',
  russia: 'RU',
  'bosnia-herzegovina': 'BA',
  'czech republic': 'CZ',
  'united states': 'US',
  usa: 'US',
  uae: 'AE',
  'united arab emirates': 'AE'
};

const COUNTRY_FALLBACK = 'UN';

interface CsvTransferRow {
  page: string;
  player: string;
  position: string;
  age: string;
  nationality: string;
  club_departed: string;
  club_departed_country: string;
  club_departed_competition: string;
  club_joined: string;
  club_joined_country: string;
  club_joined_competition: string;
  transfer_date: string;
  market_value: string;
  fee: string;
}

interface TransferInsert {
  player_id: number | null;
  player_first_name: string;
  player_last_name: string;
  player_full_name: string;
  age: number | null;
  position: string | null;
  nationality: string | null;
  from_club_id: string | null;
  to_club_id: string | null;
  from_club_name: string;
  to_club_name: string;
  league_id: string | null;
  league_name: string;
  transfer_type: string;
  transfer_value_usd: number | null;
  transfer_value_display: string;
  status: string;
  transfer_date: string;
  window: string;
  api_transfer_id: number;
}

function splitPlayerName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first: 'Unknown', last: 'Unknown' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: parts[0] };
  }
  const first = parts.shift() ?? 'Unknown';
  const last = parts.join(' ') || first;
  return { first, last };
}

function parseTransferDate(raw?: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [dayStr, monthStr, yearStr] = parts;
    const day = Number.parseInt(dayStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const year = Number.parseInt(yearStr, 10);
    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year)
    ) {
      return null;
    }
    return new Date(Date.UTC(year, month - 1, day));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseAge(raw?: string): number | null {
  if (!raw) return null;
  const age = Number.parseInt(raw.trim(), 10);
  return Number.isNaN(age) ? null : age;
}

function sanitizeText(value?: string, fallback = 'Unknown'): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '-') {
    return fallback;
  }
  return trimmed;
}

function sanitizeLeagueName(value?: string): string {
  return sanitizeText(value, 'Unknown League');
}

function getPrimaryNationality(raw?: string): string | null {
  if (!raw) return null;
  const first = raw.split(',')[0]?.trim();
  if (!first) return null;
  return getCountryIsoCode(first);
}

function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCountryIsoCode(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[A-Z]{2}-[A-Z]{2,3}$/i.test(trimmed)) {
    return trimmed.slice(0, 2).toUpperCase();
  }

  const normalized = removeDiacritics(trimmed.toLowerCase()).replace(/\u2019/g, "'");
  const override = COUNTRY_OVERRIDES[normalized];
  if (override) return override;

  const titleVersion = toTitleCase(normalized);
  const iso =
    countries.getAlpha2Code(titleVersion, 'en') ??
    countries.getAlpha2Code(normalized, 'en');
  return iso ?? null;
}

function determineTransferType(raw?: string): string {
  const text = raw?.toLowerCase() ?? '';
  if (text.includes('loan')) return 'Loan';
  if (text.includes('free')) return 'Free Transfer';
  if (!text || text === '-' || text === '?') return 'Permanent';
  return 'Permanent';
}

function normalizeDisplayValue(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-' || trimmed === '?') return null;
  return trimmed.replace(/\s+/g, ' ');
}

function extractEuroAmount(value?: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/,/g, '').toLowerCase();
  const match = normalized.match(/€\s*([0-9]+(?:\.[0-9]+)?)([mk])?/i);
  if (!match) return null;
  let amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) return null;
  const suffix = match[2]?.toLowerCase();
  if (suffix === 'm') amount *= 1_000_000;
  if (suffix === 'k') amount *= 1_000;
  return amount;
}

function parseMonetaryValue(primary?: string, fallback?: string): { display: string; cents: number | null } {
  const primaryAmount = extractEuroAmount(primary);
  if (primaryAmount !== null) {
    return {
      display: normalizeDisplayValue(primary) ?? 'Undisclosed',
      cents: Math.round(primaryAmount * 100),
    };
  }

  const fallbackAmount = extractEuroAmount(fallback);
  if (fallbackAmount !== null) {
    return {
      display: normalizeDisplayValue(fallback) ?? 'Undisclosed',
      cents: Math.round(fallbackAmount * 100),
    };
  }

  const display = normalizeDisplayValue(primary) ?? normalizeDisplayValue(fallback) ?? 'Undisclosed';
  return { display, cents: null };
}

function determineWindowLabel(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month <= 2) return `${year}-winter`;
  if (month >= 6 && month <= 9) return `${year}-summer`;
  return `${year}-mid-season`;
}

function generateStableTransferId(row: Partial<CsvTransferRow>): number {
  const base = [
    row.player ?? '',
    row.transfer_date ?? '',
    row.club_departed ?? '',
    row.club_joined ?? '',
    row.fee ?? '',
  ].join('|');
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const positive = Math.abs(hash);
  return positive === 0 ? 1 : positive;
}

export class SeedService {
  protected supabase: SupabaseClient;
  protected apiClient: APIFootballClient;
  protected clubCache = new Map<string, { id: string; name: string }>();
  protected leagueCache = new Map<string, { id: string; name: string }>();

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

      // Phase 3: Seed transfers from CSV
      console.log('\n🔄 Phase 3: Seeding transfers from Transfermarkt CSV...');
      const totalTransfers = await this.seedTransfersFromCsv();
      console.log(`✅ Seeded ${totalTransfers} transfers from scraped dataset`);

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
          country_iso2: getCountryIsoCode(leagueData.country.code ?? leagueData.country.name),
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
          country_iso2: getCountryIsoCode(team.team.country),
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

  protected async seedTransfersFromCsv(): Promise<number> {
    const csvPath = this.getTransferCsvPath();
    console.log(`Loading transfer data from ${csvPath}`);

    const rows = await this.loadCsvRows(csvPath);
    console.log(`→ Parsed ${rows.length} rows from CSV`);

    let upserted = 0;
    for (const row of rows) {
      try {
        const transferRecord = await this.mapCsvRowToTransfer(row);
        if (!transferRecord) {
          continue;
        }

        const { error } = await this.supabase
          .from('transfers')
          .upsert(transferRecord, { onConflict: 'api_transfer_id' });

        if (error) {
          console.error(`Failed to upsert transfer ${row.player} (${row.transfer_date}):`, error.message);
          continue;
        }

        upserted += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Skipping transfer ${row.player}: ${message}`);
      }
    }

    return upserted;
  }

  private getTransferCsvPath(): string {
    const customPath = process.env.TRANSFER_CSV_PATH;
    if (customPath) {
      return path.resolve(customPath);
    }
    return DEFAULT_TRANSFER_CSV_PATH;
  }

  private async loadCsvRows(csvPath: string): Promise<CsvTransferRow[]> {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Transfer CSV not found at ${csvPath}`);
    }

    const fileContent = await fs.promises.readFile(csvPath, 'utf8');
    const parsed = Papa.parse<CsvTransferRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parsed.errors.length) {
      const firstError = parsed.errors[0];
      throw new Error(`Failed to parse CSV: ${firstError.message}`);
    }

    return parsed.data.filter((row) => row.player?.trim());
  }

  private async mapCsvRowToTransfer(row: CsvTransferRow): Promise<TransferInsert | null> {
    const transferDate = parseTransferDate(row.transfer_date);
    if (!transferDate) {
      console.warn(`Skipping row with invalid date: ${row.transfer_date}`);
      return null;
    }

    const { first, last } = splitPlayerName(row.player);
    const age = parseAge(row.age);
    const nationalityIso = getPrimaryNationality(row.nationality) ?? null;
    const fromCountryIso = row.club_departed_country
      ? getCountryIsoCode(row.club_departed_country)
      : nationalityIso ?? COUNTRY_FALLBACK;
    const toCountryIso = row.club_joined_country
      ? getCountryIsoCode(row.club_joined_country)
      : nationalityIso ?? COUNTRY_FALLBACK;

    const leagueName = sanitizeLeagueName(
      row.club_joined_competition || row.club_departed_competition
    );
    const league = await this.resolveLeague(leagueName, toCountryIso);

    const fromClub = await this.resolveClub(
      sanitizeText(row.club_departed, 'Without Club'),
      fromCountryIso,
      league?.id ?? null
    );
    const toClub = await this.resolveClub(
      sanitizeText(row.club_joined, 'Without Club'),
      toCountryIso,
      league?.id ?? null
    );

    const { display, cents } = parseMonetaryValue(row.fee, row.market_value);
    const transferType = determineTransferType(row.fee);
    const windowLabel = determineWindowLabel(transferDate);
    const apiTransferId = generateStableTransferId(row);

    const transferRecord: TransferInsert = {
      player_id: null,
      player_first_name: first,
      player_last_name: last,
      player_full_name: row.player.trim() || `${first} ${last}`,
      age: age ?? null,
      position: sanitizeText(row.position, 'Unknown'),
      nationality: nationalityIso,
      from_club_id: fromClub?.id ?? null,
      to_club_id: toClub?.id ?? null,
      from_club_name: sanitizeText(row.club_departed, fromClub?.name ?? 'Unknown'),
      to_club_name: sanitizeText(row.club_joined, toClub?.name ?? 'Unknown'),
      league_id: league?.id ?? null,
      league_name: league?.name ?? leagueName,
      transfer_type: transferType,
      transfer_value_usd: cents,
      transfer_value_display: display ?? 'Undisclosed',
      status: 'done',
      transfer_date: transferDate.toISOString().split('T')[0],
      window: windowLabel,
      api_transfer_id: apiTransferId,
    };

    return transferRecord;
  }

  private async resolveLeague(
    name: string,
    countryIso: string | null
  ): Promise<{ id: string; name: string } | null> {
    const normalized = sanitizeLeagueName(name);
    if (!normalized || normalized === 'Unknown League') {
      return null;
    }

    const iso = countryIso ?? COUNTRY_FALLBACK;
    const cacheKey = `${normalized.toLowerCase()}|${iso}`;
    const cached = this.leagueCache.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('leagues')
      .select('id, name')
      .eq('name', normalized)
      .maybeSingle();

    if (error) {
      console.warn(`Failed to fetch league ${normalized}:`, error.message);
    }

    if (data) {
      this.leagueCache.set(cacheKey, data);
      return data;
    }

    const insertPayload = {
      name: normalized,
      tier: '1',
      type: 'domestic',
      country_iso2: iso,
    } as const;

    const { data: inserted, error: insertError } = await this.supabase
      .from('leagues')
      .insert(insertPayload)
      .select('id, name')
      .single();

    if (insertError) {
      console.warn(`Failed to create league ${normalized}:`, insertError.message);
      return null;
    }

    this.leagueCache.set(cacheKey, inserted);
    return inserted;
  }

  private async resolveClub(
    name: string,
    countryIso: string | null,
    leagueId: string | null
  ): Promise<{ id: string; name: string } | null> {
    const normalized = name.trim();
    if (!normalized || normalized.toLowerCase() === 'without club') {
      return null;
    }

    const iso = countryIso ?? COUNTRY_FALLBACK;
    const cacheKey = `${normalized.toLowerCase()}|${iso}`;
    const cached = this.clubCache.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('clubs')
      .select('id, name')
      .eq('name', normalized)
      .maybeSingle();

    if (error) {
      console.warn(`Failed to fetch club ${normalized}:`, error.message);
    }

    if (data) {
      this.clubCache.set(cacheKey, data);
      return data;
    }

    const insertPayload = {
      name: normalized,
      short_name: null,
      country_iso2: iso,
      league_id: leagueId,
      api_reference: null,
    } as const;

    const { data: inserted, error: insertError } = await this.supabase
      .from('clubs')
      .insert(insertPayload)
      .select('id, name')
      .single();

    if (insertError) {
      console.warn(`Failed to create club ${normalized}:`, insertError.message);
      return null;
    }

    this.clubCache.set(cacheKey, inserted);
    return inserted;
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
