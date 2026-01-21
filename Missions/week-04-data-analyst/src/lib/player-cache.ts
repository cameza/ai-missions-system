import { PlayerDetails, PlayerResponse, PlayerStatistics } from './player-enrichment-service';
import { DatabaseService, SupabaseDatabaseService } from './enrichment-pipeline';

export interface CachedPlayerData extends PlayerDetails {
  timestamp: number;
  statistics?: PlayerStatistics[]; // Include statistics in cache
}

export interface PlayerCacheEntry {
  player_id: number;
  data: PlayerDetails;
  statistics: PlayerStatistics[];
  cached_at: string;
}

export class PlayerCache {
  private cache: Map<number, CachedPlayerData> = new Map();
  private ttl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private maxCacheSize = 10000; // Maximum number of players to cache in memory
  
  constructor(ttlMs?: number) {
    if (ttlMs) {
      this.ttl = ttlMs;
    }
  }
  
  async get(playerId: number): Promise<CachedPlayerData | null> {
    const cached = this.cache.get(playerId);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(playerId);
      return null;
    }
    
    return cached;
  }
  
  async set(playerId: number, data: PlayerDetails, statistics?: PlayerStatistics[]): Promise<void> {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    this.cache.set(playerId, {
      ...data,
      statistics,
      timestamp: Date.now(),
    });
  }
  
  private evictOldest(): void {
    let oldestKey: number | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }
  
  // Clear expired entries
  clearExpired(): number {
    let cleared = 0;
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }
  
  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    expiredCount: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const value of this.cache.values()) {
      if (now - value.timestamp > this.ttl) {
        expiredCount++;
      }
    }
    
    return {
      size: this.cache.size,
      hitRate: 0, // This would need to be tracked separately
      expiredCount,
    };
  }
  
  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }
  
  // Check if player exists in cache (regardless of expiry)
  has(playerId: number): boolean {
    return this.cache.has(playerId);
  }
  
  // Get all cached player IDs
  getCachedPlayerIds(): number[] {
    return Array.from(this.cache.keys());
  }
  
  // Persist cache to database for long-term storage
  async persistToDatabase(dbService: DatabaseService): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    if (entries.length === 0) {
      console.log('No cache entries to persist');
      return;
    }
    
    const cacheData: PlayerCacheEntry[] = entries.map(([playerId, data]) => ({
      player_id: playerId,
      data: {
        id: data.id,
        name: data.name,
        firstname: data.firstname,
        lastname: data.lastname,
        age: data.age,
        birth: data.birth,
        nationality: data.nationality,
        height: data.height,
        weight: data.weight,
        photo: data.photo,
      },
      statistics: data.statistics || [],
      cached_at: new Date(data.timestamp).toISOString(),
    }));
    
    try {
      await this.upsertPlayerCache(dbService, cacheData);
      console.log(`Persisted ${cacheData.length} player cache entries to database`);
    } catch (error) {
      console.error('Failed to persist cache to database:', error);
      throw error;
    }
  }
  
  // Load cache from database
  async loadFromDatabase(dbService: DatabaseService): Promise<number> {
    try {
      const cacheData = await this.getPlayerCacheFromDatabase(dbService);
      
      let loadedCount = 0;
      const now = Date.now();
      
      for (const entry of cacheData) {
        const cachedAt = new Date(entry.cached_at).getTime();
        
        // Only load if not expired
        if (now - cachedAt <= this.ttl) {
          this.cache.set(entry.player_id, {
            ...entry.data,
            timestamp: cachedAt,
          });
          loadedCount++;
        }
      }
      
      console.log(`Loaded ${loadedCount} player cache entries from database`);
      return loadedCount;
    } catch (error) {
      console.error('Failed to load cache from database:', error);
      throw error;
    }
  }
  
  private async upsertPlayerCache(dbService: DatabaseService, cacheData: PlayerCacheEntry[]): Promise<void> {
    // Create or update player cache entries in database using stored procedure
    try {
      const supabase = (dbService as SupabaseDatabaseService)['supabase'];
      
      for (const entry of cacheData) {
        const { error } = await supabase
          .rpc('upsert_player_cache', {
            p_player_id: entry.player_id,
            p_data: entry.data,
            p_statistics: entry.statistics,
            p_cached_at: entry.cached_at,
            p_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          });
        
        if (error) {
          console.error(`Failed to upsert cache entry for player ${entry.player_id}:`, error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to upsert player cache:', error);
      throw error;
    }
  }
  
  private async getPlayerCacheFromDatabase(dbService: DatabaseService): Promise<PlayerCacheEntry[]> {
    // Load player cache entries from database using stored procedure
    try {
      const supabase = (dbService as SupabaseDatabaseService)['supabase'];
      
      // Get all active cache entries ordered by most recent
      const { data, error } = await supabase
        .from('player_cache')
        .select('player_id, data, statistics, cached_at')
        .gt('expires_at', new Date().toISOString()) // Only get non-expired entries
        .order('cached_at', { ascending: false })
        .limit(5000); // Limit to prevent memory issues
      
      if (error) {
        console.error('Failed to load player cache from database:', error);
        throw error;
      }
      
      return (data || []).map((row: any) => ({
        player_id: row.player_id,
        data: row.data,
        statistics: row.statistics || [],
        cached_at: row.cached_at,
      }));
    } catch (error) {
      console.error('Failed to load player cache from database:', error);
      throw error;
    }
  }
}

// Enhanced PlayerEnrichmentService with caching
export class CachedPlayerEnrichmentService {
  private playerService: any; // PlayerEnrichmentService
  private cache: PlayerCache;
  private dbService: DatabaseService;
  
  constructor(playerService: any, dbService: DatabaseService, cache?: PlayerCache) {
    this.playerService = playerService;
    this.dbService = dbService;
    this.cache = cache || new PlayerCache();
  }
  
  async fetchPlayerDetails(playerId: number, season: number): Promise<PlayerResponse> {
    // Try cache first
    const cached = await this.cache.get(playerId);
    
    if (cached) {
      console.log(`Cache hit for player ${playerId}`);
      // Return cached data with preserved statistics
      return {
        player: cached,
        statistics: cached.statistics || [], // Return cached statistics
      };
    }
    
    console.log(`Cache miss for player ${playerId}, fetching from API`);
    
    // Fetch from API
    const response = await this.playerService.fetchPlayerDetails(playerId, season);
    
    // Cache the player details with statistics
    await this.cache.set(playerId, response.player, response.statistics);
    
    return response;
  }
  
  async initializeCache(): Promise<void> {
    try {
      await this.cache.loadFromDatabase(this.dbService);
      console.log('Player cache initialized from database');
    } catch (error) {
      console.warn('Failed to initialize cache from database, starting with empty cache:', error);
    }
  }
  
  async persistCache(): Promise<void> {
    try {
      await this.cache.persistToDatabase(this.dbService);
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }
  
  getCacheStats() {
    return this.cache.getStats();
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  async clearExpiredCache(): Promise<number> {
    return this.cache.clearExpired();
  }
}
