/**
 * Sync Transfers Endpoint Integration Tests
 * 
 * Tests the /api/sync/transfers endpoint for transfer synchronization.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { GET, POST, processSyncRequest } from '../sync/transfers/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('../../../../lib/sync-orchestrator', () => ({
  createSyncOrchestrator: vi.fn(() => ({
    executeSync: vi.fn(async () => ({
      strategy: 'normal',
      totalProcessed: 100,
      successful: 95,
      failed: 5,
      duration: 5000,
      leaguesProcessed: 5,
      apiCallsUsed: 10,
      errors: ['Sample error'],
    })),
    getSyncStatus: vi.fn(() => ({
      rateLimit: {
        used: 10,
        limit: 3000,
        remaining: 2990,
        emergencyMode: false,
        cacheHits: 5,
        usagePercentage: 0.33,
      },
    })),
  })),
}));

vi.mock('../../../../lib/error-handler', () => ({
  globalErrorLogger: {
    logError: vi.fn(async (error) => ({
      id: 'test-error-id',
      message: error.message,
      category: 'api_error',
      severity: 'error',
      timestamp: new Date().toISOString(),
    })),
    getRecentErrors: vi.fn(() => []),
    getErrorStats: vi.fn(() => ({
      total: 0,
      byCategory: {},
      bySeverity: {},
    })),
  },
  withRetry: vi.fn(async (fn) => await fn()),
}));

vi.mock('../../../../lib/scheduling', () => ({
  getSyncStrategy: vi.fn(() => 'normal'),
  isDeadlineDay: vi.fn(() => false),
  getNextSyncInterval: vi.fn(() => '6 hours'),
}));

vi.mock('../../../../lib/sync-logger', () => ({
  syncLogger: {
    getMetrics: vi.fn(() => ({
      totalSyncs: 10,
      successfulSyncs: 9,
      failedSyncs: 1,
    })),
    getRecentLogs: vi.fn(() => []),
  },
  logSyncOperation: vi.fn(),
}));

vi.mock('../../../../lib/manual-sync-rate-limit', () => ({
  acquireManualSyncSlot: vi.fn(async () => ({
    allowed: true,
    source: 'test',
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Sync Transfers Endpoint Integration Tests', () => {
  beforeAll(() => {
    process.env.MANUAL_SYNC_TOKEN = 'test-manual-token';
    process.env.SYNC_API_KEY = 'test-sync-key';
  });

  describe('GET /api/sync/transfers', () => {
    it('should return sync status and configuration', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('recentErrors');
      expect(data).toHaveProperty('errorStats');
      expect(data).toHaveProperty('syncMetrics');
      expect(data).toHaveProperty('timestamp');
    });

    it('should include rate limit status', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.status).toHaveProperty('rateLimit');
      expect(data.status.rateLimit).toHaveProperty('used');
      expect(data.status.rateLimit).toHaveProperty('limit');
      expect(data.status.rateLimit).toHaveProperty('remaining');
    });

    it('should include sync metrics', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.syncMetrics).toHaveProperty('totalSyncs');
      expect(data.syncMetrics).toHaveProperty('successfulSyncs');
      expect(data.syncMetrics).toHaveProperty('failedSyncs');
    });
  });

  describe('POST /api/sync/transfers', () => {
    it('should reject requests without manual token for non-cron triggers', async () => {
      const request = new NextRequest('http://localhost/api/sync/transfers', {
        method: 'POST',
        body: JSON.stringify({
          strategy: 'normal',
          season: 2025,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Manual sync token is required');
    });

    it('should reject requests with invalid manual token', async () => {
      const request = new NextRequest('http://localhost/api/sync/transfers', {
        method: 'POST',
        body: JSON.stringify({
          strategy: 'normal',
          season: 2025,
          manualToken: 'invalid-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid manual sync token');
    });

    it('should accept valid manual sync requests', async () => {
      const request = new NextRequest('http://localhost/api/sync/transfers', {
        method: 'POST',
        body: JSON.stringify({
          strategy: 'normal',
          season: 2025,
          manualToken: 'test-manual-token',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('strategy');
      expect(data).toHaveProperty('result');
    });

    it('should accept cron-triggered sync requests', async () => {
      const response = await processSyncRequest(
        {
          strategy: 'normal',
          season: 2025,
          isCronTrigger: true,
        },
        { forceCron: true }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return sync results with proper structure', async () => {
      const response = await processSyncRequest(
        {
          strategy: 'normal',
          season: 2025,
          manualToken: 'test-manual-token',
        },
        { skipManualRateLimit: true }
      );

      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('strategy');
      expect(data).toHaveProperty('season');
      expect(data).toHaveProperty('result');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('rateLimitStatus');

      expect(data.result).toHaveProperty('totalProcessed');
      expect(data.result).toHaveProperty('successful');
      expect(data.result).toHaveProperty('failed');
      expect(data.result).toHaveProperty('duration');
    });

    it('should handle different sync strategies', async () => {
      const strategies = ['normal', 'deadline_day', 'emergency'] as const;

      for (const strategy of strategies) {
        const response = await processSyncRequest(
          {
            strategy,
            season: 2025,
            isCronTrigger: true,
          },
          { forceCron: true, forceStrategy: strategy }
        );

        const data = await response.json();

        expect(data.strategy).toBe(strategy);
      }
    });

    it('should validate request body schema', async () => {
      const request = new NextRequest('http://localhost/api/sync/transfers', {
        method: 'POST',
        body: JSON.stringify({
          strategy: 'invalid-strategy',
          season: 'not-a-number',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should include context information in response', async () => {
      const response = await processSyncRequest(
        {
          strategy: 'normal',
          season: 2025,
          isDeadlineDay: true,
          isCronTrigger: true,
        },
        { forceCron: true }
      );

      const data = await response.json();

      expect(data).toHaveProperty('context');
      expect(data.context).toHaveProperty('isDeadlineDay');
      expect(data.context).toHaveProperty('isManualOverride');
      expect(data.context).toHaveProperty('isCronTrigger');
    });
  });

  describe('Error Handling', () => {
    it('should handle sync orchestrator errors gracefully', async () => {
      const { createSyncOrchestrator } = await import('../../../../lib/sync-orchestrator');
      
      vi.mocked(createSyncOrchestrator).mockReturnValueOnce({
        executeSync: vi.fn(async () => {
          throw new Error('Sync orchestrator error');
        }),
        getSyncStatus: vi.fn(() => ({
          rateLimit: {
            used: 0,
            limit: 3000,
            remaining: 3000,
            emergencyMode: false,
            cacheHits: 0,
            usagePercentage: 0,
          },
        })),
      } as any);

      const response = await processSyncRequest(
        {
          season: 2025,
          isCronTrigger: true,
        },
        { forceCron: true }
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });
});
