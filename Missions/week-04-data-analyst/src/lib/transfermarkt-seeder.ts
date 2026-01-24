/**
 * Transfermarkt Seeder - Production Ready
 * 
 * Processes scraped Transfermarkt data and seeds it to Supabase
 * Adapted from scripts/seed.ts for production use
 * 
 * @version 1.0
 * @since 2026-01-24
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TransfermarktRow } from './transfermarkt-scraper';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProcessedTransfer {
  player_name: string;
  player_age: number;
  player_position: string;
  player_nationality: string;
  from_club: string;
  to_club: string;
  transfer_date: string;
  market_value: string;
  fee: string;
  fee_amount: number | null;
  from_club_country: string;
  to_club_country: string;
  competition: string;
  scraping_source: 'transfermarkt';
  scraped_at: string;
}

interface SeedingResult {
  success: boolean;
  transfersProcessed: number;
  transfersInserted: number;
  transfersUpdated: number;
  errors: string[];
  duration: number;
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

export async function seedTransfermarktData(
  transfers: TransfermarktRow[],
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<SeedingResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let transfersInserted = 0;
  let transfersUpdated = 0;

  try {
    console.log(`🌱 Starting Transfermarkt data seeding for ${transfers.length} transfers...`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process and validate each transfer
    const processedTransfers: ProcessedTransfer[] = [];
    
    for (const transfer of transfers) {
      try {
        const processed = processTransferRow(transfer);
        if (processed) {
          processedTransfers.push(processed);
        }
      } catch (error) {
        const errorMsg = `Failed to process transfer: ${transfer.player} - ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`📊 Processed ${processedTransfers.length} valid transfers`);

    // Insert/update transfers in Supabase
    for (const transfer of processedTransfers) {
      try {
        const result = await upsertTransfer(supabase, transfer);
        if (result.isNew) {
          transfersInserted++;
        } else {
          transfersUpdated++;
        }
      } catch (error) {
        const errorMsg = `Failed to upert transfer: ${transfer.player_name} - ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    
    console.log(`✅ Seeding completed in ${duration}ms`);
    console.log(`📈 Results: ${transfersInserted} inserted, ${transfersUpdated} updated, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      transfersProcessed: processedTransfers.length,
      transfersInserted,
      transfersUpdated,
      errors,
      duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = `Seeding failed: ${error}`;
    console.error(errorMsg);
    
    return {
      success: false,
      transfersProcessed: 0,
      transfersInserted: 0,
      transfersUpdated: 0,
      errors: [errorMsg],
      duration
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function processTransferRow(row: TransfermarktRow): ProcessedTransfer | null {
  try {
    // Extract age as number
    const age = parseInt(row.age) || 0;
    if (age < 16 || age > 50) {
      console.warn(`⚠️ Invalid age ${age} for player ${row.player}`);
      return null;
    }

    // Parse fee amount
    const feeAmount = parseFeeAmount(row.fee);

    // Validate required fields
    if (!row.player || !row.clubDeparted || !row.clubJoined) {
      console.warn(`⚠️ Missing required data for player ${row.player}`);
      return null;
    }

    return {
      player_name: row.player.trim(),
      player_age: age,
      player_position: row.position || 'Unknown',
      player_nationality: row.nationality || 'Unknown',
      from_club: row.clubDeparted.trim(),
      to_club: row.clubJoined.trim(),
      transfer_date: parseTransferDate(row.transferDate),
      market_value: row.marketValue || 'Unknown',
      fee: row.fee || 'Unknown',
      fee_amount: feeAmount,
      from_club_country: row.clubDepartedCountry || 'Unknown',
      to_club_country: row.clubJoinedCountry || 'Unknown',
      competition: row.clubJoinedCompetition || 'Unknown',
      scraping_source: 'transfermarkt',
      scraped_at: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error processing transfer row for ${row.player}:`, error);
    return null;
  }
}

async function upsertTransfer(
  supabase: SupabaseClient,
  transfer: ProcessedTransfer
): Promise<{ isNew: boolean; success: boolean }> {
  try {
    // Check if transfer already exists
    const { data: existing, error: fetchError } = await supabase
      .from('transfers')
      .select('id')
      .eq('player_name', transfer.player_name)
      .eq('from_club', transfer.from_club)
      .eq('to_club', transfer.to_club)
      .eq('transfer_date', transfer.transfer_date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Update existing transfer
      const { error: updateError } = await supabase
        .from('transfers')
        .update({
          market_value: transfer.market_value,
          fee: transfer.fee,
          fee_amount: transfer.fee_amount,
          scraped_at: transfer.scraped_at
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
      
      return { isNew: false, success: true };
    } else {
      // Insert new transfer
      const { error: insertError } = await supabase
        .from('transfers')
        .insert(transfer);

      if (insertError) throw insertError;
      
      return { isNew: true, success: true };
    }

  } catch (error) {
    console.error(`❌ Failed to upsert transfer ${transfer.player_name}:`, error);
    throw error;
  }
}

function parseTransferDate(dateStr: string): string {
  try {
    // Handle various date formats from Transfermarkt
    const cleanDate = dateStr.trim();
    
    // If it's already in ISO format, return as-is
    if (cleanDate.includes('T') || cleanDate.includes('-')) {
      return cleanDate;
    }

    // Parse common formats: "Jan 1, 2026", "01/01/2026", "1 Jan 2026"
    const date = new Date(cleanDate);
    
    if (isNaN(date.getTime())) {
      // If parsing fails, use current date
      console.warn(`⚠️ Could not parse date "${dateStr}", using current date`);
      return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];

  } catch (error) {
    console.warn(`⚠️ Date parsing error for "${dateStr}":`, error);
    return new Date().toISOString().split('T')[0];
  }
}

function parseFeeAmount(feeStr: string): number | null {
  try {
    if (!feeStr || feeStr.trim() === '' || feeStr.toLowerCase().includes('free')) {
      return 0;
    }

    // Remove common currency symbols and text
    const cleanFee = feeStr
      .replace(/[€£$]/g, '')
      .replace(/million|m|bn|billion|thousand|k/gi, '')
      .replace(/,/g, '')
      .trim();

    const amount = parseFloat(cleanFee);
    
    if (isNaN(amount)) {
      return null;
    }

    // Handle multipliers
    if (feeStr.toLowerCase().includes('million') || feeStr.toLowerCase().includes('m')) {
      return amount * 1000000;
    }
    if (feeStr.toLowerCase().includes('billion') || feeStr.toLowerCase().includes('bn')) {
      return amount * 1000000000;
    }
    if (feeStr.toLowerCase().includes('thousand') || feeStr.toLowerCase().includes('k')) {
      return amount * 1000;
    }

    return amount;

  } catch (error) {
    console.warn(`⚠️ Fee parsing error for "${feeStr}":`, error);
    return null;
  }
}

// ============================================================================
// TYPES EXPORT
// ============================================================================

export type { ProcessedTransfer, SeedingResult };
