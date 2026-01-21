/**
 * Health Endpoint Integration Tests
 * 
 * Tests the /api/health endpoint for database and API connectivity validation.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { GET } from '../health/route';

describe('Health Endpoint Integration Tests', () => {
  beforeAll(() => {
    // Ensure required environment variables are set for tests
    process.env.API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || 'test-api-key';
    process.env.API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
  });

  describe('GET /api/health', () => {
    it('should return health check response with all required fields', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('checks');
      expect(data).toHaveProperty('details');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
    });

    it('should include database check results', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.checks).toHaveProperty('database');
      expect(data.checks.database).toHaveProperty('status');
      expect(data.checks.database).toHaveProperty('message');
      expect(['pass', 'fail', 'warn']).toContain(data.checks.database.status);
    });

    it('should include API-Football check results', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.checks).toHaveProperty('apiFootball');
      expect(data.checks.apiFootball).toHaveProperty('status');
      expect(data.checks.apiFootball).toHaveProperty('message');
      expect(['pass', 'fail', 'warn']).toContain(data.checks.apiFootball.status);
    });

    it('should include environment check results', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.checks).toHaveProperty('environment');
      expect(data.checks.environment).toHaveProperty('status');
      expect(data.checks.environment).toHaveProperty('message');
      expect(['pass', 'fail', 'warn']).toContain(data.checks.environment.status);
    });

    it('should include system details', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.details).toHaveProperty('version');
      expect(data.details).toHaveProperty('uptime');
      expect(data.details).toHaveProperty('environment');
    });

    it('should return 200 for healthy or degraded status', async () => {
      const response = await GET();
      const data = await response.json();

      if (data.status === 'healthy' || data.status === 'degraded') {
        expect(response.status).toBe(200);
      }
    });

    it('should return 503 for unhealthy status', async () => {
      const response = await GET();
      const data = await response.json();

      if (data.status === 'unhealthy') {
        expect(response.status).toBe(503);
      }
    });

    it('should include Cache-Control headers', async () => {
      const response = await GET();
      const cacheControl = response.headers.get('Cache-Control');

      expect(cacheControl).toBeTruthy();
      expect(cacheControl).toContain('no-cache');
    });

    it('should include response time for checks', async () => {
      const response = await GET();
      const data = await response.json();

      // At least one check should have responseTime
      const hasResponseTime = 
        data.checks.database.responseTime !== undefined ||
        data.checks.apiFootball.responseTime !== undefined;

      expect(hasResponseTime).toBe(true);
    });

    it('should handle missing environment variables gracefully', async () => {
      const originalKey = process.env.API_FOOTBALL_KEY;
      delete process.env.API_FOOTBALL_KEY;

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('unhealthy');
      expect(data.checks.environment.status).toBe('fail');

      // Restore
      process.env.API_FOOTBALL_KEY = originalKey;
    });
  });
});
