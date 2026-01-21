import { PlayerEnrichmentService, EnrichedPlayerData, PlayerResponse, APIRateLimiter } from './player-enrichment-service';
import { createClient } from '@supabase/supabase-js';

// Types for enrichment pipeline
export interface EnrichmentProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  lastProcessedId?: string;
  startTime: Date;
  errors: EnrichmentError[];
}

export interface EnrichmentError {
  transferId: string;
  playerId: number;
  error: string;
  timestamp: Date;
  retryCount?: number;
}

export interface TransferRecord {
  id: string;
  api_transfer_id: number;
  player_first_name: string;
  player_last_name: string;
  player_full_name: string;
  position?: string | null;
  age?: number | null;
  nationality?: string | null;
  player_photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrichmentLog {
  id: string;
  transfer_id: string;
  player_id: number;
  error: string;
  timestamp: Date;
  retry_count: number;
  resolved: boolean;
}

// Default values for missing data
const DEFAULT_VALUES = {
  position: null,
  age: null,
  nationality: 'UNK',
};

export class EnrichmentPipeline {
  private playerService: any; // More generic to accept both PlayerEnrichmentService and CachedPlayerEnrichmentService
  private dbService: DatabaseService;
  private batchSize = 50; // Process 50 players at a time
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second base delay
  
  constructor(playerService: any, dbService: DatabaseService) {
    this.playerService = playerService;
    this.dbService = dbService;
  }
  
  async enrichTransfers(season: number, resumeFromId?: string): Promise<EnrichmentProgress> {
    const progress: EnrichmentProgress = {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      startTime: new Date(),
      errors: [],
    };
    
    try {
      // Get unenriched transfers for the specific season
      const transfers = await this.dbService.getUnenrichedTransfers(resumeFromId, season);
      progress.total = transfers.length;
      
      console.log(`Found ${transfers.length} unenriched transfers for season ${season}`);
      
      if (transfers.length === 0) {
        return progress;
      }
      
      // Process transfers in batches
      for (let i = 0; i < transfers.length; i += this.batchSize) {
        const batch = transfers.slice(i, i + this.batchSize);
        
        console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(transfers.length / this.batchSize)}`);
        
        // Process each transfer in the batch
        for (const transfer of batch) {
          await this.processTransfer(transfer, season, progress);
          
          // Add delay between transfers to respect rate limits
          if (this.batchSize > 1) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between transfers
          }
        }
        
        // Add delay between batches
        if (i + this.batchSize < transfers.length) {
          console.log(`Batch completed, waiting 1 second before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      
    } catch (error) {
      console.error('Critical error in enrichment pipeline:', error);
      throw error;
    }
    
    return progress;
  }
  
  private async processTransfer(
    transfer: TransferRecord, 
    season: number, 
    progress: EnrichmentProgress
  ): Promise<void> {
    try {
      // Check if already enriched (in case of resume)
      if (transfer.position && transfer.age && transfer.nationality && transfer.nationality !== 'UNK') {
        progress.succeeded++;
        progress.processed++;
        return;
      }
      
      const playerData = await this.playerService.fetchPlayerDetails(
        transfer.api_transfer_id,
        season
      );
      
      const enrichedData = this.playerService.enrichPlayerData(playerData);
      
      // Apply defaults for missing data
      const finalData = {
        position: enrichedData.position ?? DEFAULT_VALUES.position,
        age: enrichedData.age ?? DEFAULT_VALUES.age,
        nationality: enrichedData.nationality || DEFAULT_VALUES.nationality,
        player_photo_url: enrichedData.playerPhotoUrl,
      };
      
      await this.dbService.updateTransfer(transfer.id, finalData);
      
      progress.succeeded++;
      progress.processed++;
      progress.lastProcessedId = transfer.id;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to enrich transfer ${transfer.id} (player ${transfer.api_transfer_id}):`, errorMessage);
      
      // Log error for retry analysis
      const enrichmentError: EnrichmentError = {
        transferId: transfer.id,
        playerId: transfer.api_transfer_id,
        error: errorMessage,
        timestamp: new Date(),
      };
      
      progress.errors.push(enrichmentError);
      
      // Log to database for monitoring
      await this.logEnrichmentError(transfer.id, transfer.api_transfer_id, errorMessage);
      
      progress.failed++;
      progress.processed++;
      progress.lastProcessedId = transfer.id;
    }
  }
  
  async retryFailedTransfers(season: number, maxRetries?: number): Promise<EnrichmentProgress> {
    const retries = maxRetries || this.maxRetries;
    console.log(`Retrying failed enrichments (max ${retries} retries)`);
    
    // Get failed enrichments from logs
    const failedLogs = await this.dbService.getFailedEnrichments(retries);
    
    if (failedLogs.length === 0) {
      console.log('No failed enrichments to retry');
      return {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        startTime: new Date(),
        errors: [],
      };
    }
    
    const progress: EnrichmentProgress = {
      total: failedLogs.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      startTime: new Date(),
      errors: [],
    };
    
    for (const log of failedLogs) {
      try {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, log.retry_count);
        if (delay > 0) {
          await this.delay(delay);
        }
        
        // Get transfer record
        const transfer = await this.dbService.getTransferById(log.transfer_id);
        if (!transfer) {
          console.warn(`Transfer ${log.transfer_id} not found for retry`);
          continue;
        }
        
        // Retry enrichment
        await this.processTransfer(transfer, season, progress);
        
        // Mark log as resolved
        await this.dbService.resolveEnrichmentLog(log.id);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Retry failed for transfer ${log.transfer_id}:`, errorMessage);
        
        // Update retry count
        await this.dbService.incrementEnrichmentRetry(log.id);
        
        progress.failed++;
        progress.processed++;
      }
    }
    
    return progress;
  }
  
  private async logEnrichmentError(transferId: string, playerId: number, error: string): Promise<void> {
    try {
      // Generate a unique ID for the log entry
      const logId = crypto.randomUUID();
      await this.dbService.insertEnrichmentLog({
        id: logId,
        transfer_id: transferId,
        player_id: playerId,
        error,
        timestamp: new Date(),
        retry_count: 0,
        resolved: false,
      });
    } catch (logError) {
      console.error('Failed to log enrichment error:', logError);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Utility method to get enrichment statistics
  async getEnrichmentStats(): Promise<{
    totalTransfers: number;
    enrichedTransfers: number;
    enrichmentRate: number;
    failedEnrichments: number;
  }> {
    return this.dbService.getEnrichmentStats();
  }
}

// Database service interface and implementation
export interface DatabaseService {
  getUnenrichedTransfers(resumeFromId?: string, season?: number): Promise<TransferRecord[]>;
  updateTransfer(id: string, data: Partial<TransferRecord>): Promise<void>;
  insertEnrichmentLog(log: EnrichmentLog): Promise<void>;
  getFailedEnrichments(maxRetries: number): Promise<EnrichmentLog[]>;
  getTransferById(id: string): Promise<TransferRecord | null>;
  resolveEnrichmentLog(logId: string): Promise<void>;
  incrementEnrichmentRetry(logId: string): Promise<void>;
  getEnrichmentStats(): Promise<{
    totalTransfers: number;
    enrichedTransfers: number;
    enrichmentRate: number;
    failedEnrichments: number;
  }>;
}

export class SupabaseDatabaseService implements DatabaseService {
  private supabase: any; // Use any to avoid type issues with Supabase
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  async getUnenrichedTransfers(resumeFromId?: string, season?: number): Promise<TransferRecord[]> {
    let query = this.supabase
      .from('transfers')
      .select('*')
      .or('position.is.null,age.is.null,nationality.is.null,nationality.eq.UNK')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true }) // Secondary sort by ID for consistent ordering
      .limit(1000);
    
    // Add season filter if provided
    if (season) {
      query = query.eq('season', season);
    }
    
    // Use created_at for resume instead of UUID comparison
    if (resumeFromId) {
      // First get the created_at timestamp of the resume point
      const { data: resumeTransfer } = await this.supabase
        .from('transfers')
        .select('created_at, id')
        .eq('id', resumeFromId)
        .single();
      
      if (resumeTransfer) {
        // Resume from transfers created after the resume point
        query = query.gt('created_at', resumeTransfer.created_at);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching unenriched transfers:', error);
      throw error;
    }
    
    return data || [];
  }
  
  async updateTransfer(id: string, enrichedData: Partial<TransferRecord>): Promise<void> {
    const { error } = await this.supabase
      .from('transfers')
      .update({
        ...enrichedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating transfer ${id}:`, error);
      throw error;
    }
  }
  
  async insertEnrichmentLog(log: EnrichmentLog): Promise<void> {
    const { error } = await this.supabase
      .from('enrichment_logs')
      .insert({
        id: log.id,
        transfer_id: log.transfer_id,
        player_id: log.player_id,
        error: log.error,
        timestamp: log.timestamp.toISOString(),
        retry_count: log.retry_count,
        resolved: log.resolved,
      });
    
    if (error) {
      console.error('Error inserting enrichment log:', error);
      throw error;
    }
  }
  
  async getFailedEnrichments(maxRetries: number): Promise<EnrichmentLog[]> {
    const { data, error } = await this.supabase
      .from('enrichment_logs')
      .select('*')
      .eq('resolved', false)
      .lt('retry_count', maxRetries)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching failed enrichments:', error);
      throw error;
    }
    
    return (data || []).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  }
  
  async getTransferById(id: string): Promise<TransferRecord | null> {
    const { data, error } = await this.supabase
      .from('transfers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error(`Error fetching transfer ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  async resolveEnrichmentLog(logId: string): Promise<void> {
    const { error } = await this.supabase
      .from('enrichment_logs')
      .update({ resolved: true })
      .eq('id', logId);
    
    if (error) {
      console.error(`Error resolving enrichment log ${logId}:`, error);
      throw error;
    }
  }
  
  async incrementEnrichmentRetry(logId: string): Promise<void> {
    // First get current retry count
    const { data: currentLog } = await this.supabase
      .from('enrichment_logs')
      .select('retry_count')
      .eq('id', logId)
      .single();
    
    if (currentLog) {
      const { error } = await this.supabase
        .from('enrichment_logs')
        .update({ retry_count: currentLog.retry_count + 1 })
        .eq('id', logId);
      
      if (error) {
        console.error(`Error incrementing retry count for log ${logId}:`, error);
        throw error;
      }
    }
  }
  
  async getEnrichmentStats(): Promise<{
    totalTransfers: number;
    enrichedTransfers: number;
    enrichmentRate: number;
    failedEnrichments: number;
  }> {
    // Get total transfers
    const { count: totalTransfers, error: totalError } = await this.supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get enriched transfers (have position, age, and valid nationality)
    const { count: enrichedTransfers, error: enrichedError } = await this.supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true })
      .not('position', 'is', null)
      .not('age', 'is', null)
      .not('nationality', 'is', null)
      .neq('nationality', 'UNK');
    
    if (enrichedError) throw enrichedError;
    
    // Get failed enrichments
    const { count: failedEnrichments, error: failedError } = await this.supabase
      .from('enrichment_logs')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
    
    if (failedError) throw failedError;
    
    const enrichmentRate = totalTransfers && totalTransfers > 0 
      ? (enrichedTransfers || 0) / totalTransfers 
      : 0;
    
    return {
      totalTransfers: totalTransfers || 0,
      enrichedTransfers: enrichedTransfers || 0,
      enrichmentRate,
      failedEnrichments: failedEnrichments || 0,
    };
  }
}
