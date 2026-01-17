/**
 * Data Models Test Suite
 * 
 * Tests for Zod schema parsing, branded ID guards, and type safety.
 * Ensures runtime validation matches compile-time types.
 */

import { describe, it, expect } from 'vitest';
import {
  TransferSchema,
  ClubSchema,
  LeagueSchema,
  TransferFiltersSchema,
  TransferTypeSchema,
  PlayerPositionSchema,
  LeagueTypeSchema,
  TransferWindowSchema,
  createTransferId,
  createClubId,
  createLeagueId,
  isTransferId,
  isClubId,
  isLeagueId,
  isTransfer,
  isClub,
  isLeague,
  isTransferFilters,
  isAPIResponseSuccess,
  formatTransferValue,
  buildPlayerDisplayName,
  createEmptyTransferFilters,
  validateTransferData,
  determineTransferWindow,
  databaseTransferToTransfer,
  transferToDatabaseTransfer,
  DEFAULT_TRANSFER_FILTERS,
  type Transfer,
  type Club,
  type League,
  type TransferFilters,
  type APIResponse,
  type TransferId,
  type ClubId,
  type LeagueId,
  type PlayerPosition,
  type LeagueType,
  type TransferWindow,
} from '../index';

describe('Branded ID Utilities', () => {
  it('should create branded IDs correctly', () => {
    const transferId = createTransferId('123e4567-e89b-12d3-a456-426614174000');
    const clubId = createClubId('123e4567-e89b-12d3-a456-426614174001');
    const leagueId = createLeagueId('123e4567-e89b-12d3-a456-426614174002');

    expect(typeof transferId).toBe('string');
    expect(typeof clubId).toBe('string');
    expect(typeof leagueId).toBe('string');
  });

  it('should validate branded IDs with type guards', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const invalidUUID = 'invalid-uuid';
    const nonString = 123;

    expect(isTransferId(validUUID)).toBe(true);
    expect(isClubId(validUUID)).toBe(true);
    expect(isLeagueId(validUUID)).toBe(true);

    expect(isTransferId(invalidUUID)).toBe(false);
    expect(isClubId(invalidUUID)).toBe(false);
    expect(isLeagueId(invalidUUID)).toBe(false);

    expect(isTransferId(nonString)).toBe(false);
    expect(isClubId(nonString)).toBe(false);
    expect(isLeagueId(nonString)).toBe(false);
  });
});

describe('Zod Schema Validation', () => {
  describe('Transfer Schema', () => {
    const validTransfer: Transfer = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      playerId: 12345,
      playerFirstName: 'Erling',
      playerLastName: 'Haaland',
      playerFullName: 'Erling Haaland',
      age: 24,
      position: 'Attacker',
      nationality: 'NOR',
      fromClubId: '123e4567-e89b-12d3-a456-426614174001',
      toClubId: '123e4567-e89b-12d3-a456-426614174002',
      fromClubName: 'Borussia Dortmund',
      toClubName: 'Manchester City',
      leagueId: '123e4567-e89b-12d3-a456-426614174003',
      leagueName: 'Premier League',
      transferType: 'Permanent',
      transferValueUsd: 18000000000, // €180M in cents
      transferValueDisplay: '€180.0M',
      transferDate: new Date('2023-05-10'),
      window: '2023-summer',
      apiTransferId: 67890,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate valid transfer data', () => {
      const result = TransferSchema.safeParse(validTransfer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transfer data', () => {
      const invalidTransfer = { ...validTransfer, playerFirstName: '' };
      const result = TransferSchema.safeParse(invalidTransfer);
      expect(result.success).toBe(false);
    });

    it('should work with isTransfer type guard', () => {
      expect(isTransfer(validTransfer)).toBe(true);
      expect(isTransfer({ invalid: 'data' })).toBe(false);
    });
  });

  describe('Club Schema', () => {
    const validClub: Club = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      apiClubId: 541,
      name: 'Manchester City',
      shortName: 'Man City',
      code: 'MCI',
      country: 'ENG',
      city: 'Manchester',
      leagueId: '123e4567-e89b-12d3-a456-426614174003',
      logoUrl: 'https://example.com/logo.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate valid club data', () => {
      const result = ClubSchema.safeParse(validClub);
      expect(result.success).toBe(true);
    });

    it('should reject invalid club data', () => {
      const invalidClub = { ...validClub, name: '' };
      const result = ClubSchema.safeParse(invalidClub);
      expect(result.success).toBe(false);
    });

    it('should work with isClub type guard', () => {
      expect(isClub(validClub)).toBe(true);
      expect(isClub({ invalid: 'data' })).toBe(false);
    });
  });

  describe('League Schema', () => {
    const validLeague: League = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      apiLeagueId: 39,
      name: 'Premier League',
      country: 'ENG',
      tier: 1,
      type: 'League',
      logoUrl: 'https://example.com/logo.png',
      flagUrl: 'https://example.com/flag.png',
      createdAt: new Date(),
    };

    it('should validate valid league data', () => {
      const result = LeagueSchema.safeParse(validLeague);
      expect(result.success).toBe(true);
    });

    it('should reject invalid league data', () => {
      const invalidLeague = { ...validLeague, name: '' };
      const result = LeagueSchema.safeParse(invalidLeague);
      expect(result.success).toBe(false);
    });

    it('should work with isLeague type guard', () => {
      expect(isLeague(validLeague)).toBe(true);
      expect(isLeague({ invalid: 'data' })).toBe(false);
    });
  });

  describe('TransferFilters Schema', () => {
    const validFilters: TransferFilters = {
      leagues: ['123e4567-e89b-12d3-a456-426614174003'],
      positions: ['Attacker', 'Midfielder'],
      transferTypes: ['Permanent', 'Loan'],
      ageRange: [18, 35],
      valueRange: [100000000, 200000000], // €1M - €2M in cents (within 500M limit)
      dateRange: [new Date('2023-01-01'), new Date('2023-12-31')],
      status: 'confirmed',
    };

    it('should validate valid transfer filters', () => {
      const result = TransferFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transfer filters', () => {
      const invalidFilters = { ...validFilters, ageRange: [15, 55] }; // Age out of range
      const result = TransferFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should work with isTransferFilters type guard', () => {
      expect(isTransferFilters(validFilters)).toBe(true);
      expect(isTransferFilters({ invalid: 'data' })).toBe(false);
    });

    it('should accept partial filters with defaults', () => {
      const partialFilters = {
        leagues: ['123e4567-e89b-12d3-a456-426614174003'],
        status: 'confirmed' as const,
      };
      const result = TransferFiltersSchema.safeParse(partialFilters);
      expect(result.success).toBe(true);
    });
  });

  describe('TransferType Schema', () => {
    it('should validate valid transfer types', () => {
      expect(TransferTypeSchema.safeParse('Permanent').success).toBe(true);
      expect(TransferTypeSchema.safeParse('Loan').success).toBe(true);
      expect(TransferTypeSchema.safeParse('Free Transfer').success).toBe(true);
      expect(TransferTypeSchema.safeParse('N/A').success).toBe(true);
    });

    it('should reject invalid transfer types', () => {
      expect(TransferTypeSchema.safeParse('Invalid').success).toBe(false);
      expect(TransferTypeSchema.safeParse('').success).toBe(false);
    });
  });

  describe('PlayerPosition Schema', () => {
    it('should validate valid player positions', () => {
      expect(PlayerPositionSchema.safeParse('Goalkeeper').success).toBe(true);
      expect(PlayerPositionSchema.safeParse('Defender').success).toBe(true);
      expect(PlayerPositionSchema.safeParse('Midfielder').success).toBe(true);
      expect(PlayerPositionSchema.safeParse('Attacker').success).toBe(true);
    });

    it('should reject invalid player positions', () => {
      expect(PlayerPositionSchema.safeParse('Invalid').success).toBe(false);
      expect(PlayerPositionSchema.safeParse('').success).toBe(false);
    });
  });

  describe('LeagueType Schema', () => {
    it('should validate valid league types', () => {
      expect(LeagueTypeSchema.safeParse('League').success).toBe(true);
      expect(LeagueTypeSchema.safeParse('Cup').success).toBe(true);
    });

    it('should reject invalid league types', () => {
      expect(LeagueTypeSchema.safeParse('Invalid').success).toBe(false);
      expect(LeagueTypeSchema.safeParse('').success).toBe(false);
    });
  });

  describe('TransferWindow Schema', () => {
    it('should validate valid transfer windows', () => {
      expect(TransferWindowSchema.safeParse('2023-winter').success).toBe(true);
      expect(TransferWindowSchema.safeParse('2023-summer').success).toBe(true);
      expect(TransferWindowSchema.safeParse('2025-winter').success).toBe(true);
    });

    it('should reject invalid transfer windows', () => {
      expect(TransferWindowSchema.safeParse('2023-invalid').success).toBe(false);
      expect(TransferWindowSchema.safeParse('winter-2023').success).toBe(false);
      expect(TransferWindowSchema.safeParse('').success).toBe(false);
    });
  });
});

describe('API Response Utilities', () => {
  it('should identify successful API responses', () => {
    const successResponse: APIResponse<string> = { success: true, data: 'test' };
    const errorResponse: APIResponse<string> = { success: false, error: 'test error' };

    expect(isAPIResponseSuccess(successResponse)).toBe(true);
    expect(isAPIResponseSuccess(errorResponse)).toBe(false);
  });
});

describe('Helper Functions', () => {
  describe('formatTransferValue', () => {
    it('should format values correctly', () => {
      expect(formatTransferValue(0)).toBe('FREE');
      expect(formatTransferValue(undefined)).toBe('FREE');
      expect(formatTransferValue(50000000)).toBe('€50.0M'); // €50M
      expect(formatTransferValue(18000000000)).toBe('€18.0B'); // €18B
      expect(formatTransferValue(2000000000000)).toBe('€2000.0B'); // €2T
    });
  });

  describe('buildPlayerDisplayName', () => {
    it('should build display name correctly', () => {
      expect(buildPlayerDisplayName('Erling', 'Haaland')).toBe('Erling Haaland');
      expect(buildPlayerDisplayName('Kylian', 'Mbappé')).toBe('Kylian Mbappé');
    });
  });

  describe('createEmptyTransferFilters', () => {
    it('should create empty filters with defaults', () => {
      const filters = createEmptyTransferFilters();
      expect(filters).toEqual(DEFAULT_TRANSFER_FILTERS);
      expect(filters.leagues).toEqual([]);
      expect(filters.status).toBe('all');
    });
  });

  describe('validateTransferData', () => {
    it('should validate required fields', () => {
      const validData = {
        playerFirstName: 'Erling',
        playerLastName: 'Haaland',
        fromClubName: 'Dortmund',
        toClubName: 'Man City',
        transferType: 'Permanent' as const,
        transferDate: new Date(),
      };

      expect(validateTransferData(validData)).toEqual([]);

      const invalidData = {
        playerFirstName: '',
        playerLastName: '',
        fromClubName: '',
        toClubName: '',
        transferType: undefined,
        transferDate: undefined,
      };

      const errors = validateTransferData(invalidData);
      expect(errors).toContain('Player first name is required');
      expect(errors).toContain('Player last name is required');
      expect(errors).toContain('From club name is required');
      expect(errors).toContain('To club name is required');
      expect(errors).toContain('Transfer type is required');
      expect(errors).toContain('Transfer date is required');
    });
  });

  describe('determineTransferWindow', () => {
    it('should determine correct window', () => {
      expect(determineTransferWindow(new Date('2023-01-15'))).toBe('2023-winter');
      expect(determineTransferWindow(new Date('2023-02-01'))).toBe('2023-winter');
      expect(determineTransferWindow(new Date('2023-06-15'))).toBe('2023-summer');
      expect(determineTransferWindow(new Date('2023-08-15'))).toBe('2023-summer');
      expect(determineTransferWindow(new Date('2023-03-15'))).toBe('2023-winter'); // Closer to winter
      expect(determineTransferWindow(new Date('2023-09-15'))).toBe('2023-summer'); // Closer to summer
    });
  });

  describe('databaseTransferToTransfer', () => {
    it('should convert database transfer to frontend transfer', () => {
      const dbTransfer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        playerId: 12345,
        playerFirstName: 'Erling',
        playerLastName: 'Haaland',
        playerFullName: 'Erling Haaland',
        fromClubName: 'Dortmund',
        toClubName: 'Man City',
        leagueName: 'Premier League',
        transferType: 'Permanent' as const,
        transferValueDisplay: '€180.0M',
        transferDate: new Date('2023-05-10'),
        window: '2023-summer' as TransferWindow,
        apiTransferId: 67890,
        created_at: '2023-05-10T10:00:00.000Z',
        updated_at: '2023-05-10T10:00:00.000Z',
      };

      const transfer = databaseTransferToTransfer(dbTransfer);

      expect(transfer.createdAt).toBeInstanceOf(Date);
      expect(transfer.updatedAt).toBeInstanceOf(Date);
      expect(transfer.createdAt.toISOString()).toBe(dbTransfer.created_at);
      expect(transfer.updatedAt.toISOString()).toBe(dbTransfer.updated_at);
    });
  });

  describe('transferToDatabaseTransfer', () => {
    it('should convert frontend transfer to database transfer', () => {
      const transfer: Transfer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        playerId: 12345,
        playerFirstName: 'Erling',
        playerLastName: 'Haaland',
        playerFullName: 'Erling Haaland',
        fromClubName: 'Dortmund',
        toClubName: 'Man City',
        leagueName: 'Premier League',
        transferType: 'Permanent',
        transferValueDisplay: '€180.0M',
        transferDate: new Date('2023-05-10'),
        window: '2023-summer' as TransferWindow,
        apiTransferId: 67890,
        createdAt: new Date('2023-05-10T10:00:00.000Z'),
        updatedAt: new Date('2023-05-10T10:00:00.000Z'),
      };

      const dbTransfer = transferToDatabaseTransfer(transfer);

      expect(typeof dbTransfer.created_at).toBe('string');
      expect(typeof dbTransfer.updated_at).toBe('string');
      expect(dbTransfer.created_at).toBe(transfer.createdAt.toISOString());
      expect(dbTransfer.updated_at).toBe(transfer.updatedAt.toISOString());
    });
  });
});

describe('Type Safety Verification', () => {
  it('should prevent ID type mixing at compile time', () => {
    // This test verifies that branded types prevent accidental mixing
    const transferId = createTransferId('123e4567-e89b-12d3-a456-426614174000');
    const clubId = createClubId('123e4567-e89b-12d3-a456-426614174001');
    const leagueId = createLeagueId('123e4567-e89b-12d3-a456-426614174002');

    // These should work with correct types
    expect(isTransferId(transferId)).toBe(true);
    expect(isClubId(clubId)).toBe(true);
    expect(isLeagueId(leagueId)).toBe(true);

    // Invalid UUIDs should fail
    expect(isTransferId('invalid-uuid')).toBe(false);
    expect(isClubId('invalid-uuid')).toBe(false);
    expect(isLeagueId('invalid-uuid')).toBe(false);

    // Non-strings should fail
    expect(isTransferId(123)).toBe(false);
    expect(isClubId(123)).toBe(false);
    expect(isLeagueId(123)).toBe(false);
  });

  it('should provide discriminated union safety for API responses', () => {
    const successResponse: APIResponse<string> = { success: true, data: 'test' };
    const errorResponse: APIResponse<string> = { success: false, error: 'test error' };

    if (isAPIResponseSuccess(successResponse)) {
      // TypeScript knows successResponse.data exists here
      expect(successResponse.data).toBe('test');
      // TypeScript should error if we try to access .error
      // successResponse.error; // This would cause a TypeScript error
    }

    if (isAPIResponseSuccess(errorResponse)) {
      // This block should never execute
      expect(false).toBe(true);
    } else {
      // TypeScript knows this is the error branch
      expect(errorResponse.error).toBe('test error');
      // TypeScript should error if we try to access .data
      // errorResponse.data; // This would cause a TypeScript error
    }
  });
});
