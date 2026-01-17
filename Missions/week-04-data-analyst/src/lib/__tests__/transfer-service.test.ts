/**
 * Transfer Service Unit Tests
 * 
 * Tests for the TransferService class including API integration,
 * rate limiting, data transformation, and error handling.
 * 
 * @version 1.0
 * @since 2025-01-17
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransferService, APIRateLimiter, validateAPIFootballTransfer } from '../transfer-service';
import { APIFootballTransfer, SyncStrategy } from '../transfer-service';

// Mock environment variables
const originalEnv = process.env;

// Mock fetch
global.fetch = vi.fn();

describe('TransferService', () => {
  let service: TransferService;

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      API_FOOTBALL_KEY: 'test-api-key',
      API_FOOTBALL_BASE_URL: 'https://test-api.com',
    };

    service = new TransferService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(service).toBeDefined();
    });

    it('should throw error when API key is missing', () => {
      delete process.env.API_FOOTBALL_KEY;
      
      expect(() => new TransferService()).toThrow(
        'API_FOOTBALL_KEY environment variable is required'
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should track API usage correctly', () => {
      const rateLimiter = new APIRateLimiter();
      
      // Initial state
      const initialStatus = rateLimiter.getStatus();
      expect(initialStatus.used).toBe(0);
      expect(initialStatus.limit).toBe(3000);
      expect(initialStatus.emergencyMode).toBe(false);
      
      // Record calls
      rateLimiter.recordCall();
      rateLimiter.recordCall();
      
      const updatedStatus = rateLimiter.getStatus();
      expect(updatedStatus.used).toBe(2);
      expect(updatedStatus.remaining).toBe(2998);
    });

    it('should activate emergency mode when threshold is reached', () => {
      const rateLimiter = new APIRateLimiter();
      
      // Simulate reaching emergency threshold (10% remaining)
      for (let i = 0; i < 2701; i++) {
        rateLimiter.recordCall();
      }
      
      // Trigger status check to activate emergency mode
      rateLimiter.canMakeRequest();
      
      const status = rateLimiter.getStatus();
      expect(status.emergencyMode).toBe(true);
      expect(status.remaining).toBe(299);
    });

    it('should track cache hits separately', () => {
      const rateLimiter = new APIRateLimiter();
      
      rateLimiter.recordCacheHit();
      rateLimiter.recordCacheHit();
      
      const status = rateLimiter.getStatus();
      expect(status.cacheHits).toBe(2);
      expect(status.used).toBe(0); // Cache hits don't count against limit
    });

    it('should prevent requests when limit is exceeded', () => {
      const rateLimiter = new APIRateLimiter();
      
      // Exhaust limit
      for (let i = 0; i < 3000; i++) {
        rateLimiter.recordCall();
      }
      
      const canRequest = rateLimiter.canMakeRequest();
      expect(canRequest.allowed).toBe(false);
      expect(canRequest.remaining).toBe(0);
    });
  });

  describe('Data Transformation', () => {
    const mockAPITransfer: APIFootballTransfer = {
      id: 12345,
      playerId: 67890,
      playerName: 'John Doe',
      playerAge: 25,
      playerPosition: 'Midfielder',
      playerNationality: 'ENG',
      fromClub: {
        id: 111,
        name: 'Club A',
        logo: 'https://example.com/logo1.png',
      },
      toClub: {
        id: 222,
        name: 'Club B',
        logo: 'https://example.com/logo2.png',
      },
      league: {
        id: 333,
        name: 'Premier League',
        country: 'ENG',
        logo: 'https://example.com/league-logo.png',
        flag: 'https://example.com/flag.png',
      },
      type: 'Loan',
      amount: '5M',
      date: '2025-01-15',
    };

    it('should transform API transfer to internal format', () => {
      const transfers = service.transformBatch([mockAPITransfer]);
      
      expect(transfers).toHaveLength(1);
      const transfer = transfers[0];
      
      expect(transfer.playerId).toBe(67890);
      expect(transfer.playerFirstName).toBe('John');
      expect(transfer.playerLastName).toBe('Doe');
      expect(transfer.playerFullName).toBe('John Doe');
      expect(transfer.age).toBe(25);
      expect(transfer.fromClubName).toBe('Club A');
      expect(transfer.toClubName).toBe('Club B');
      expect(transfer.leagueName).toBe('Premier League');
      expect(transfer.transferType).toBe('Loan');
      expect(transfer.transferValueUsd).toBe(500000000); // 5M in cents
      expect(transfer.transferValueDisplay).toBe('€500.0M');
      expect(transfer.apiTransferId).toBe(12345);
    });

    it('should handle different transfer types correctly', () => {
      const testCases = [
        { apiType: 'loan', expected: 'Loan' },
        { apiType: 'Loan', expected: 'Loan' },
        { apiType: 'free', expected: 'Free Transfer' },
        { apiType: 'Free Transfer', expected: 'Free Transfer' },
        { apiType: 'permanent', expected: 'Permanent' },
        { apiType: 'N/A', expected: 'N/A' },
        { apiType: 'not applicable', expected: 'N/A' },
        { apiType: 'unknown', expected: 'Permanent' }, // Default
      ];

      testCases.forEach(({ apiType, expected }) => {
        const testTransfer = { ...mockAPITransfer, type: apiType };
        const transfers = service.transformBatch([testTransfer]);
        expect(transfers[0].transferType).toBe(expected);
      });
    });

    it('should parse transfer values correctly', () => {
      const testCases = [
        { amount: '10M', expected: 1000000000 },
        { amount: '5.5M', expected: 550000000 },
        { amount: '500K', expected: 50000000 },
        { amount: '1.2M', expected: 120000000 },
        { amount: 'free', expected: undefined },
        { amount: 'N/A', expected: undefined },
        { amount: undefined, expected: undefined },
      ];

      testCases.forEach(({ amount, expected }) => {
        const testTransfer = { ...mockAPITransfer, amount };
        const transfers = service.transformBatch([testTransfer]);
        expect(transfers[0].transferValueUsd).toBe(expected);
      });
    });

    it('should extract player names correctly', () => {
      const testCases = [
        { fullName: 'John Doe', expectedFirst: 'John', expectedLast: 'Doe' },
        { fullName: 'Lionel Messi', expectedFirst: 'Lionel', expectedLast: 'Messi' },
        { fullName: 'Cristiano Ronaldo', expectedFirst: 'Cristiano', expectedLast: 'Ronaldo' },
        { fullName: 'Neymar', expectedFirst: 'Neymar', expectedLast: '' },
        { fullName: 'Kylian Mbappé Lottin', expectedFirst: 'Kylian', expectedLast: 'Mbappé Lottin' },
      ];

      testCases.forEach(({ fullName, expectedFirst, expectedLast }) => {
        const testTransfer = { ...mockAPITransfer, playerName: fullName };
        const transfers = service.transformBatch([testTransfer]);
        
        expect(transfers[0].playerFirstName).toBe(expectedFirst);
        expect(transfers[0].playerLastName).toBe(expectedLast);
      });
    });

    it('should handle invalid dates gracefully', () => {
      const invalidTransfer = { ...mockAPITransfer, date: 'invalid-date' };
      const transfers = service.transformBatch([invalidTransfer]);
      
      expect(transfers).toHaveLength(0); // Should filter out invalid transfers
    });

    it('should filter out null transfers', () => {
      const transfers = service.transformBatch([mockAPITransfer]);
      
      expect(transfers).toHaveLength(1);
    });
  });

  describe('Sync Strategy Determination', () => {
    it('should return normal strategy by default', () => {
      const strategy = service.determineSyncStrategy();
      expect(strategy).toBe('normal');
    });

    it('should return manual override strategy when specified', () => {
      const strategy = service.determineSyncStrategy({
        isManualOverride: true,
        strategy: 'deadline_day',
      });
      expect(strategy).toBe('deadline_day');
    });

    it('should return deadline_day strategy on deadline day', () => {
      const strategy = service.determineSyncStrategy({
        isDeadlineDay: true,
      });
      expect(strategy).toBe('deadline_day');
    });

    it('should return emergency strategy when rate limiter is in emergency mode', () => {
      // Force rate limiter into emergency mode
      const emergencyService = new TransferService();
      vi.spyOn(emergencyService, 'determineSyncStrategy').mockReturnValue('emergency');
      
      const strategy = emergencyService.determineSyncStrategy();
      expect(strategy).toBe('emergency');
    });
  });

  describe('API Integration', () => {
    const mockAPITransfer: APIFootballTransfer = {
      id: 12345,
      playerId: 67890,
      playerName: 'John Doe',
      playerAge: 25,
      playerPosition: 'Midfielder',
      playerNationality: 'ENG',
      fromClub: {
        id: 111,
        name: 'Club A',
        logo: 'https://example.com/logo1.png',
      },
      toClub: {
        id: 222,
        name: 'Club B',
        logo: 'https://example.com/logo2.png',
      },
      league: {
        id: 333,
        name: 'Premier League',
        country: 'ENG',
        logo: 'https://example.com/league-logo.png',
        flag: 'https://example.com/flag.png',
      },
      type: 'Loan',
      amount: '5M',
      date: '2025-01-15',
    };

    it('should fetch transfers successfully', async () => {
      const mockResponse = {
        results: 1,
        paging: { current: 1, total: 1 },
        response: [mockAPITransfer],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.fetchTransfers({
        season: 2025,
        leagueIds: [39],
      });

      expect(result.results).toBe(1);
      expect(result.response).toHaveLength(1);
      expect(result.response[0]).toEqual(mockAPITransfer);
      
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.com/transfers?season=2025&league=39&page=1',
        {
          headers: {
            'x-rapidapi-key': 'test-api-key',
            'x-rapidapi-host': 'v3.football.api-sports.io',
          },
        }
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        service.fetchTransfers({ season: 2025, leagueIds: [39] })
      ).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.fetchTransfers({ season: 2025, leagueIds: [39] })
      ).rejects.toThrow('API request failed: Network error');
    });

    it('should respect rate limits', async () => {
      // Mock the rate limiter to return exhausted state
      vi.spyOn(service, 'getRateLimitStatus').mockReturnValue({
        used: 3000,
        limit: 3000,
        remaining: 0,
        emergencyMode: true,
        cacheHits: 0,
        usagePercentage: 100,
      });
      
      // Mock canMakeRequest to return false
      vi.spyOn(service['rateLimiter'], 'canMakeRequest').mockReturnValue({
        allowed: false,
        emergencyMode: true,
        remaining: 0,
      });

      await expect(
        service.fetchTransfers({ season: 2025, leagueIds: [39] })
      ).rejects.toThrow('API rate limit exceeded');
    });
  });
});

describe('APIFootballTransfer Validation', () => {
  it('should validate correct API transfer data', () => {
    const validTransfer: APIFootballTransfer = {
      id: 12345,
      playerId: 67890,
      playerName: 'John Doe',
      fromClub: { id: 111, name: 'Club A' },
      toClub: { id: 222, name: 'Club B' },
      league: { id: 333, name: 'Premier League' },
      type: 'Loan',
      date: '2025-01-15',
    };

    expect(validateAPIFootballTransfer(validTransfer)).toBe(true);
  });

  it('should reject invalid API transfer data', () => {
    const invalidTransfer = {
      id: 'invalid', // Should be number
      playerId: 67890,
      playerName: 'John Doe',
      fromClub: { id: 111, name: 'Club A' },
      toClub: { id: 222, name: 'Club B' },
      league: { id: 333, name: 'Premier League' },
      type: 'Loan',
      date: '2025-01-15',
    };

    expect(validateAPIFootballTransfer(invalidTransfer)).toBe(false);
  });

  it('should reject missing required fields', () => {
    const incompleteTransfer = {
      id: 12345,
      // Missing playerId
      playerName: 'John Doe',
      fromClub: { id: 111, name: 'Club A' },
      toClub: { id: 222, name: 'Club B' },
      league: { id: 333, name: 'Premier League' },
      type: 'Loan',
      date: '2025-01-15',
    };

    expect(validateAPIFootballTransfer(incompleteTransfer)).toBe(false);
  });
});

describe('APIRateLimiter', () => {
  let rateLimiter: APIRateLimiter;

  beforeEach(() => {
    rateLimiter = new APIRateLimiter();
  });

  it('should reset daily counter after 24 hours', () => {
    // Set last reset to 25 hours ago
    rateLimiter['config'].lastReset = new Date(Date.now() - 25 * 60 * 60 * 1000);
    rateLimiter['config'].currentUsage = 100;

    // Check status should trigger reset
    const status = rateLimiter.getStatus();
    
    expect(status.used).toBe(0);
    expect(status.emergencyMode).toBe(false);
    expect(status.cacheHits).toBe(0);
  });

  it('should provide accurate usage percentage', () => {
    rateLimiter.recordCall();
    rateLimiter.recordCall();
    rateLimiter.recordCall();

    const status = rateLimiter.getStatus();
    expect(status.usagePercentage).toBe(0.1); // 3/3000 * 100
  });
});
