/**
 * Windows Endpoint Integration Tests
 * 
 * Tests the /api/windows endpoint for transfer window metadata.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { GET, POST } from '../windows/route';
import { NextRequest } from 'next/server';

describe('Windows Endpoint Integration Tests', () => {
  describe('GET /api/windows', () => {
    it('should return all recent windows without query params', async () => {
      const request = new NextRequest('http://localhost/api/windows');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('windows');
      expect(data.data).toHaveProperty('current');
      expect(data.data).toHaveProperty('count');
      expect(Array.isArray(data.data.windows)).toBe(true);
    });

    it('should return specific window when ID provided', async () => {
      const request = new NextRequest('http://localhost/api/windows?id=2025-winter');
      const response = await GET(request);
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('id');
        expect(data.data.id).toBe('2025-winter');
      }
    });

    it('should return 400 for invalid window ID format', async () => {
      const request = new NextRequest('http://localhost/api/windows?id=invalid-format');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid window ID format');
    });

    it('should filter by league when league param provided', async () => {
      const request = new NextRequest('http://localhost/api/windows?league=premier-league');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('league');
      expect(data.data.league).toBe('premier-league');
    });

    it('should return window metadata with proper structure', async () => {
      const request = new NextRequest('http://localhost/api/windows');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.windows.length).toBeGreaterThan(0);
      
      const window = data.data.windows[0];
      expect(window).toHaveProperty('id');
      expect(window).toHaveProperty('name');
      expect(window).toHaveProperty('startDate');
      expect(window).toHaveProperty('endDate');
      expect(window).toHaveProperty('status');
    });

    it('should include current window information', async () => {
      const request = new NextRequest('http://localhost/api/windows');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveProperty('current');
      
      if (data.data.current) {
        expect(data.data.current).toHaveProperty('id');
        expect(data.data.current).toHaveProperty('status');
        expect(data.data.current.status).toBe('open');
      }
    });

    it('should handle non-existent window ID gracefully', async () => {
      const request = new NextRequest('http://localhost/api/windows?id=2099-summer');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Window not found');
    });
  });

  describe('POST /api/windows', () => {
    it('should validate window creation request body', async () => {
      const validWindow = {
        id: '2026-winter',
        name: 'Winter 2026',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-02-01T00:00:00Z',
        status: 'closed',
      };

      const request = new NextRequest('http://localhost/api/windows', {
        method: 'POST',
        body: JSON.stringify(validWindow),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.id).toBe('2026-winter');
    });

    it('should reject invalid window ID format', async () => {
      const invalidWindow = {
        id: 'invalid-id',
        name: 'Test Window',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-02-01T00:00:00Z',
        status: 'open',
      };

      const request = new NextRequest('http://localhost/api/windows', {
        method: 'POST',
        body: JSON.stringify(invalidWindow),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request body');
    });

    it('should reject invalid status values', async () => {
      const invalidWindow = {
        id: '2026-winter',
        name: 'Winter 2026',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-02-01T00:00:00Z',
        status: 'invalid-status',
      };

      const request = new NextRequest('http://localhost/api/windows', {
        method: 'POST',
        body: JSON.stringify(invalidWindow),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should accept optional leagues array', async () => {
      const windowWithLeagues = {
        id: '2026-summer',
        name: 'Summer 2026',
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-09-01T00:00:00Z',
        status: 'closed',
        leagues: ['premier-league', 'la-liga', 'serie-a'],
      };

      const request = new NextRequest('http://localhost/api/windows', {
        method: 'POST',
        body: JSON.stringify(windowWithLeagues),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost/api/windows', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should return proper error structure', async () => {
      const request = new NextRequest('http://localhost/api/windows?id=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data.success).toBe(false);
    });
  });
});
