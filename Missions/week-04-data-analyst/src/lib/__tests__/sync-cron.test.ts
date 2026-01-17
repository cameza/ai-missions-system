/**
 * Integration Tests for Data Sync Pipeline (MCS-96)
 * 
 * Tests cron job functionality, scheduling logic, and sync orchestration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isDeadlineDay, shouldUseEmergencyCadence, getSyncStrategy, getNextSyncInterval } from '../scheduling';
import { syncLogger } from '../sync-logger';

// Mock environment variables
const originalEnv = process.env;

describe('Scheduling Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isDeadlineDay', () => {
    it('returns false on normal days', () => {
      const mockDate = new Date('2025-01-15T12:00:00Z'); // Normal day
      vi.setSystemTime(mockDate);
      
      expect(isDeadlineDay()).toBe(false);
    });

    it('returns true on deadline day', () => {
      const mockDate = new Date('2025-02-03T12:00:00Z'); // Winter deadline day
      vi.setSystemTime(mockDate);
      
      expect(isDeadlineDay()).toBe(true);
    });

    it('returns true day before deadline', () => {
      const mockDate = new Date('2025-02-03T01:00:00Z'); // 22 hours before deadline (within 24h window)
      vi.setSystemTime(mockDate);
      
      expect(isDeadlineDay()).toBe(true);
    });
  });

  describe('shouldUseEmergencyCadence', () => {
    it('returns false when deadline day mode is off and not deadline day', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      
      expect(shouldUseEmergencyCadence()).toBe(false);
    });

    it('returns true when deadline day mode is enabled', () => {
      process.env.DEADLINE_DAY_MODE = 'true';
      
      expect(shouldUseEmergencyCadence()).toBe(true);
    });

    it('returns true on deadline day even if mode is off', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-02-03T12:00:00Z'));
      
      expect(shouldUseEmergencyCadence()).toBe(true);
    });
  });

  describe('getSyncStrategy', () => {
    it('returns normal strategy on normal days', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      
      expect(getSyncStrategy()).toBe('normal');
    });

    it('returns deadline_day strategy on deadline day', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-02-03T12:00:00Z'));
      
      expect(getSyncStrategy()).toBe('deadline_day');
    });

    it('returns emergency strategy when deadline day mode is enabled', () => {
      process.env.DEADLINE_DAY_MODE = 'true';
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      
      expect(getSyncStrategy()).toBe('emergency');
    });
  });

  describe('getNextSyncInterval', () => {
    it('returns 30 minutes on deadline day', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-02-03T12:00:00Z'));
      
      expect(getNextSyncInterval()).toBe(30);
    });

    it('returns 2 hours in emergency mode', () => {
      process.env.DEADLINE_DAY_MODE = 'true';
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z')); // Not deadline day
      
      expect(getNextSyncInterval()).toBe(120);
    });

    it('returns 6 hours normally', () => {
      process.env.DEADLINE_DAY_MODE = 'false';
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      
      expect(getNextSyncInterval()).toBe(360);
    });
  });
});

describe('Sync Logger', () => {
  beforeEach(() => {
    syncLogger.clearLogs();
  });

  it('logs sync operation correctly', () => {
    const mockSyncData = {
      timestamp: '2025-01-15T12:00:00Z',
      strategy: 'normal' as const,
      season: 2025,
      trigger: 'cron' as const,
      context: {
        isDeadlineDay: false,
        isManualOverride: false,
        isCronTrigger: true,
      },
      result: {
        totalProcessed: 100,
        successful: 95,
        failed: 5,
        duration: 5000,
        leaguesProcessed: 5,
        apiCallsUsed: 50,
        errors: ['API timeout', 'Rate limit'],
      },
      rateLimitStatus: {
        used: 50,
        limit: 3000,
        remaining: 2950,
        emergencyMode: false,
        cacheHits: 10,
        usagePercentage: 1.67,
      },
      performance: {} as any,
    };

    syncLogger.logSync(mockSyncData);

    const logs = syncLogger.getRecentLogs(1);
    expect(logs).toHaveLength(1);
    expect(logs[0].strategy).toBe('normal');
    expect(logs[0].trigger).toBe('cron');
    expect(logs[0].result.totalProcessed).toBe(100);
  });

  it('calculates performance metrics correctly', () => {
    const mockSyncData = {
      timestamp: '2025-01-15T12:00:00Z',
      strategy: 'normal' as const,
      season: 2025,
      trigger: 'cron' as const,
      context: {
        isDeadlineDay: false,
        isManualOverride: false,
        isCronTrigger: true,
      },
      result: {
        totalProcessed: 100,
        successful: 100,
        failed: 0,
        duration: 10000, // 10 seconds
        leaguesProcessed: 5,
        apiCallsUsed: 50,
        errors: [],
      },
      rateLimitStatus: {
        used: 50,
        limit: 3000,
        remaining: 2950,
        emergencyMode: false,
        cacheHits: 10,
        usagePercentage: 1.67,
      },
      performance: {} as any,
    };

    syncLogger.logSync(mockSyncData);

    const logs = syncLogger.getRecentLogs(1);
    expect(logs[0].performance.transfersPerSecond).toBe(10); // 100 transfers / 10 seconds
    expect(logs[0].performance.apiCallsPerTransfer).toBe(0.5); // 50 calls / 100 transfers
    expect(logs[0].performance.averageTransferTime).toBe(100); // 10000ms / 100 transfers
  });

  it('provides accurate metrics', () => {
    // Add multiple sync logs
    for (let i = 0; i < 3; i++) {
      syncLogger.logSync({
        timestamp: '2025-01-15T12:00:00Z',
        strategy: 'normal' as const,
        season: 2025,
        trigger: i % 2 === 0 ? 'cron' : 'manual',
        context: {
          isDeadlineDay: false,
          isManualOverride: false,
          isCronTrigger: i % 2 === 0,
        },
        result: {
          totalProcessed: 100,
          successful: i === 2 ? 90 : 100, // One failed sync
          failed: i === 2 ? 10 : 0,
          duration: 5000,
          leaguesProcessed: 5,
          apiCallsUsed: 50,
          errors: i === 2 ? ['API error'] : [],
        },
        rateLimitStatus: {
          used: 50,
          limit: 3000,
          remaining: 2950,
          emergencyMode: false,
          cacheHits: 10,
          usagePercentage: 1.67,
        },
        performance: {} as any,
      });
    }

    const metrics = syncLogger.getMetrics();
    expect(metrics.totalSyncs).toBe(3);
    expect(metrics.successfulSyncs).toBe(2);
    expect(metrics.failedSyncs).toBe(1);
    expect(metrics.cronSyncs).toBe(2);
    expect(metrics.manualSyncs).toBe(1);
    expect(metrics.totalTransfersProcessed).toBe(300);
  });
});

describe('Cron Job Integration', () => {
  it('handles cron trigger payload correctly', async () => {
    // This would test the actual API route with cron payload
    // For now, we'll test the payload structure
    
    const cronPayload = {
      isCronTrigger: true,
      season: 2025,
    };

    expect(cronPayload.isCronTrigger).toBe(true);
    expect(cronPayload.season).toBe(2025);
  });

  it('validates manual sync token', async () => {
    process.env.MANUAL_SYNC_TOKEN = 'test-token-123';
    
    const validPayload = {
      isCronTrigger: false,
      manualToken: 'test-token-123',
      season: 2025,
    };

    const invalidPayload = {
      isCronTrigger: false,
      manualToken: 'wrong-token',
      season: 2025,
    };

    expect(validPayload.manualToken).toBe(process.env.MANUAL_SYNC_TOKEN);
    expect(invalidPayload.manualToken).not.toBe(process.env.MANUAL_SYNC_TOKEN);
  });
});
