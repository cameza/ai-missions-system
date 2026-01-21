/**
 * Player Enrichment Pipeline Tests
 * 
 * Unit tests for the player data enrichment pipeline
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { PlayerEnrichmentService } from '../player-enrichment-service';
import { EnrichmentPipeline, SupabaseDatabaseService } from '../enrichment-pipeline';
import { CachedPlayerEnrichmentService } from '../player-cache';

// Mock the current date for deterministic age calculations
const mockDate = new Date('2025-01-19T12:00:00Z');
vi.setSystemTime(mockDate);

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              gt: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
      }))
    }))
  }))
}));

// Mock fetch for API calls
global.fetch = vi.fn() as Mock;

describe('PlayerEnrichmentService', () => {
  let service: PlayerEnrichmentService;
  let mockRateLimiter: any;

  beforeEach(() => {
    mockRateLimiter = {
      throttledRequest: vi.fn((fn) => fn())
    };
    service = new PlayerEnrichmentService('test-api-key', mockRateLimiter);
  });

  describe('normalizePosition', () => {
    it('should extract most common position from statistics', () => {
      const statistics: any[] = [
        { team: { id: 1, name: 'Team A' }, league: { id: 1, name: 'League A' }, games: { position: 'Defender' } },
        { team: { id: 2, name: 'Team B' }, league: { id: 1, name: 'League A' }, games: { position: 'Defender' } },
        { team: { id: 3, name: 'Team C' }, league: { id: 1, name: 'League A' }, games: { position: 'Midfielder' } },
      ];

      const result = service.normalizePosition(statistics);
      expect(result).toBe('Defender');
    });

    it('should return null for empty statistics', () => {
      const statistics: any[] = [];
      const result = service.normalizePosition(statistics);
      expect(result).toBeNull();
    });

    it('should handle unknown positions', () => {
      const statistics: any[] = [
        { team: { id: 1, name: 'Team A' }, league: { id: 1, name: 'League A' }, games: { position: 'Unknown' } },
      ];

      const result = service.normalizePosition(statistics);
      expect(result).toBeNull();
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age', () => {
      const birthDate = '2000-01-01';
      let expectedAge = mockDate.getFullYear() - 2000;
      
      // Adjust if birthday hasn't occurred yet this year
      const birthdayThisYear = new Date(mockDate.getFullYear(), 0, 1);
      if (mockDate < birthdayThisYear) {
        expectedAge--;
      }

      const result = service.calculateAge(birthDate);
      expect(result).toBe(expectedAge);
    });

    it('should handle leap years correctly', () => {
      const birthDate = '2000-02-29';
      const result = service.calculateAge(birthDate);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('normalizeNationality', () => {
    it('should map common countries to ISO codes', () => {
      expect(service.normalizeNationality('England')).toBe('ENG');
      expect(service.normalizeNationality('Spain')).toBe('ESP');
      expect(service.normalizeNationality('France')).toBe('FRA');
      expect(service.normalizeNationality('Germany')).toBe('GER');
    });

    it('should fallback to first 3 letters for unknown countries', () => {
      expect(service.normalizeNationality('Unknown')).toBe('UNK');
      expect(service.normalizeNationality('Testland')).toBe('TES');
    });

    it('should handle short country names', () => {
      expect(service.normalizeNationality('USA')).toBe('USA');
    });
  });

  describe('enrichPlayerData', () => {
    it('should enrich player data correctly', () => {
      const playerResponse = {
        player: {
          id: 123,
          name: 'John Doe',
          firstname: 'John',
          lastname: 'Doe',
          age: 25,
          birth: {
            date: '1999-01-01',
            place: 'London',
            country: 'England'
          },
          nationality: 'England',
          height: '180cm',
          weight: '75kg',
          photo: 'https://example.com/photo.jpg'
        },
        statistics: [
          { team: { id: 1, name: 'Team A' }, league: { id: 1, name: 'League A' }, games: { position: 'Defender' } },
          { team: { id: 2, name: 'Team B' }, league: { id: 1, name: 'League A' }, games: { position: 'Defender' } },
        ]
      };

      const result = service.enrichPlayerData(playerResponse);

      expect(result).toEqual({
        position: 'Defender',
        age: 25,
        nationality: 'ENG',
        playerPhotoUrl: 'https://example.com/photo.jpg'
      });
    });

    it('should handle missing data gracefully', () => {
      const playerResponse = {
        player: {
          id: 123,
          name: 'John Doe',
          firstname: 'John',
          lastname: 'Doe',
          age: 0, // Use 0 instead of null for type compatibility
          birth: {
            date: '1999-01-01',
            place: 'London',
            country: 'England'
          },
          nationality: 'Unknown Country',
          height: '180cm',
          weight: '75kg',
          photo: 'https://example.com/photo.jpg'
        },
        statistics: []
      };

      const result = service.enrichPlayerData(playerResponse);

      expect(result).toEqual({
        position: null,
        age: 26, // Calculated from birth date based on mock date
        nationality: 'UNK',
        playerPhotoUrl: 'https://example.com/photo.jpg'
      });
    });
  });
});

describe('EnrichmentPipeline', () => {
  let pipeline: EnrichmentPipeline;
  let mockPlayerService: any;
  let mockDbService: any;

  beforeEach(() => {
    mockPlayerService = {
      fetchPlayerDetails: vi.fn(),
      enrichPlayerData: vi.fn()
    };

    mockDbService = {
      getUnenrichedTransfers: vi.fn(),
      updateTransfer: vi.fn(),
      insertEnrichmentLog: vi.fn()
    };

    pipeline = new EnrichmentPipeline(mockPlayerService, mockDbService);
  });

  describe('enrichTransfers', () => {
    it('should process transfers successfully', async () => {
      const mockTransfers = [
        {
          id: 'transfer-1',
          api_transfer_id: 123,
          player_first_name: 'John',
          player_last_name: 'Doe',
          player_full_name: 'John Doe',
          position: null,
          age: null,
          nationality: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockPlayerResponse = {
        player: {
          id: 123,
          name: 'John Doe',
          age: 25,
          nationality: 'England',
          birth: { date: '1999-01-01' },
          photo: 'photo.jpg'
        },
        statistics: [
          { games: { position: 'Defender' } }
        ]
      };

      mockDbService.getUnenrichedTransfers.mockResolvedValue(mockTransfers);
      mockPlayerService.fetchPlayerDetails.mockResolvedValue(mockPlayerResponse);
      mockPlayerService.enrichPlayerData.mockReturnValue({
        position: 'Defender',
        age: 25,
        nationality: 'ENG',
        playerPhotoUrl: 'photo.jpg'
      });
      mockDbService.updateTransfer.mockResolvedValue(undefined);

      const result = await pipeline.enrichTransfers(2024);

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPlayerService.fetchPlayerDetails).toHaveBeenCalledWith(123, 2024);
      expect(mockDbService.updateTransfer).toHaveBeenCalledWith('transfer-1', {
        position: 'Defender',
        age: 25,
        nationality: 'ENG',
        player_photo_url: 'photo.jpg' // Use snake_case to match database field
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockTransfers = [
        {
          id: 'transfer-1',
          api_transfer_id: 123,
          player_first_name: 'John',
          player_last_name: 'Doe',
          player_full_name: 'John Doe',
          position: null,
          age: null,
          nationality: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockDbService.getUnenrichedTransfers.mockResolvedValue(mockTransfers);
      mockPlayerService.fetchPlayerDetails.mockRejectedValue(new Error('API Error'));
      mockDbService.insertEnrichmentLog.mockResolvedValue(undefined);

      const result = await pipeline.enrichTransfers(2024);

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('API Error');
    });

    it('should return early if no transfers need enrichment', async () => {
      mockDbService.getUnenrichedTransfers.mockResolvedValue([]);

      const result = await pipeline.enrichTransfers(2024);

      expect(result.total).toBe(0);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockPlayerService.fetchPlayerDetails).not.toHaveBeenCalled();
    });
  });
});

describe('CachedPlayerEnrichmentService', () => {
  let cachedService: CachedPlayerEnrichmentService;
  let mockPlayerService: any;
  let mockDbService: any;
  let mockCache: any;

  beforeEach(() => {
    mockPlayerService = {
      fetchPlayerDetails: vi.fn()
    };

    mockDbService = {
      getUnenrichedTransfers: vi.fn(),
      updateTransfer: vi.fn()
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      getStats: vi.fn(() => ({ size: 10, hitRate: 0.8, expiredCount: 2 }))
    };

    cachedService = new CachedPlayerEnrichmentService(mockPlayerService, mockDbService, mockCache);
  });

  describe('fetchPlayerDetails', () => {
    it('should return cached data when available', async () => {
      const cachedPlayer = {
        id: 123,
        name: 'John Doe',
        age: 25,
        nationality: 'England',
        birth: { date: '1999-01-01' },
        photo: 'photo.jpg'
      };

      mockCache.get.mockResolvedValue(cachedPlayer);

      const result = await cachedService.fetchPlayerDetails(123, 2024);

      expect(result).toEqual({
        player: cachedPlayer,
        statistics: []
      });
      expect(mockCache.get).toHaveBeenCalledWith(123);
      expect(mockPlayerService.fetchPlayerDetails).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache miss', async () => {
      const apiResponse = {
        player: {
          id: 123,
          name: 'John Doe',
          age: 25,
          nationality: 'England',
          birth: { date: '1999-01-01' },
          photo: 'photo.jpg'
        },
        statistics: [
          { games: { position: 'Defender' } }
        ]
      };

      mockCache.get.mockResolvedValue(null);
      mockPlayerService.fetchPlayerDetails.mockResolvedValue(apiResponse);
      mockCache.set.mockResolvedValue(undefined);

      const result = await cachedService.fetchPlayerDetails(123, 2024);

      expect(result).toEqual(apiResponse);
      expect(mockCache.get).toHaveBeenCalledWith(123);
      expect(mockPlayerService.fetchPlayerDetails).toHaveBeenCalledWith(123, 2024);
      expect(mockCache.set).toHaveBeenCalledWith(123, apiResponse.player, apiResponse.statistics); // Include statistics
    });
  });
});
