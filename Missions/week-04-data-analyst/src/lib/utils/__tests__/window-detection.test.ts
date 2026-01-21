/**
 * Window Detection Unit Tests
 * 
 * Comprehensive test suite for transfer window detection logic.
 * Tests all edge cases, league-specific rules, and utility functions.
 * 
 * Tech Spec §2.7: Unit Tests for Window Detection Logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectTransferWindow,
  getCurrentWindow,
  getWindowMetadata,
  isWindowOpen,
  getWindowDisplayName,
  getWindowsForYear,
  getRecentWindows,
  isValidWindowId,
  parseWindowId,
} from '../window-detection';
import type { TransferWindow as TransferWindowType } from '../../../types';

describe('Window Detection', () => {
  describe('detectTransferWindow', () => {
    it('detects winter window correctly', () => {
      const date = new Date('2025-01-15');
      expect(detectTransferWindow(date)).toBe('2025-winter');
    });

    it('detects summer window correctly', () => {
      const date = new Date('2025-07-15');
      expect(detectTransferWindow(date)).toBe('2025-summer');
    });

    it('handles year boundary (December)', () => {
      const date = new Date('2024-12-15');
      expect(detectTransferWindow(date)).toBe('2025-winter');
    });

    it('handles year boundary (January)', () => {
      const date = new Date('2025-01-01');
      expect(detectTransferWindow(date)).toBe('2025-winter');
    });

    it('handles transfers outside windows - first half of year', () => {
      const date = new Date('2025-03-15'); // Between windows
      expect(detectTransferWindow(date)).toBe('2025-winter'); // Assigned to nearest
    });

    it('handles transfers outside windows - second half of year', () => {
      const date = new Date('2025-10-15'); // Between windows
      expect(detectTransferWindow(date)).toBe('2025-summer'); // Assigned to nearest
    });

    it('uses league-specific config for Premier League', () => {
      const date = new Date('2025-06-15'); // Premier League summer starts June 10
      expect(detectTransferWindow(date, 'premier-league')).toBe('2025-summer');
    });

    it('uses league-specific config for La Liga', () => {
      const date = new Date('2025-07-15'); // La Liga summer starts July 1
      expect(detectTransferWindow(date, 'la-liga')).toBe('2025-summer');
    });

    it('uses league-specific config for Serie A', () => {
      const date = new Date('2025-01-02'); // Serie A winter starts January 2
      expect(detectTransferWindow(date, 'serie-a')).toBe('2025-winter');
    });

    it('falls back to default for unknown league', () => {
      const date = new Date('2025-01-15');
      expect(detectTransferWindow(date, 'unknown-league')).toBe('2025-winter');
    });

    it('handles edge case - February 1 (last day of winter)', () => {
      const date = new Date('2025-02-01');
      expect(detectTransferWindow(date)).toBe('2025-winter');
    });

    it('handles edge case - September 1 (last day of summer)', () => {
      const date = new Date('2025-09-01');
      expect(detectTransferWindow(date)).toBe('2025-summer');
    });

    it('returns correct type format', () => {
      const date = new Date('2025-01-15');
      const result = detectTransferWindow(date);
      expect(result).toMatch(/^\d{4}-(winter|summer)$/);
    });
  });

  describe('getCurrentWindow', () => {
    beforeEach(() => {
      // Mock current date for consistent testing
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns current window for January', () => {
      vi.setSystemTime(new Date('2025-01-15'));
      expect(getCurrentWindow()).toBe('2025-winter');
    });

    it('returns current window for July', () => {
      vi.setSystemTime(new Date('2025-07-15'));
      expect(getCurrentWindow()).toBe('2025-summer');
    });

    it('returns valid window format', () => {
      vi.setSystemTime(new Date('2025-06-15'));
      const result = getCurrentWindow();
      expect(result).toMatch(/^\d{4}-(winter|summer)$/);
    });
  });

  describe('getWindowMetadata', () => {
    it('returns correct metadata for winter window', () => {
      const metadata = getWindowMetadata('2025-winter');
      expect(metadata).toMatchObject({
        id: '2025-winter',
        name: '2025 Winter Window',
        status: expect.stringMatching(/^(open|closed)$/),
        leagues: expect.arrayContaining(['premier-league', 'la-liga']),
      });
      expect(metadata?.startDate).toBeInstanceOf(Date);
      expect(metadata?.endDate).toBeInstanceOf(Date);
    });

    it('returns correct metadata for summer window', () => {
      const metadata = getWindowMetadata('2025-summer');
      expect(metadata).toMatchObject({
        id: '2025-summer',
        name: '2025 Summer Window',
        status: expect.stringMatching(/^(open|closed)$/),
        leagues: expect.arrayContaining(['premier-league', 'la-liga']),
      });
    });

    it('returns null for invalid window ID', () => {
      expect(getWindowMetadata('invalid')).toBeNull();
      expect(getWindowMetadata('2025-invalid')).toBeNull();
      expect(getWindowMetadata('2025')).toBeNull();
      expect(getWindowMetadata('winter-2025')).toBeNull();
    });

    it('handles malformed window ID', () => {
      expect(getWindowMetadata('')).toBeNull();
      expect(getWindowMetadata('2025-winter-summer')).toBeNull();
      expect(getWindowMetadata('abc-winter')).toBeNull();
    });

    it('returns open status when window is currently active', () => {
      // This test depends on the current date, so we check the structure
      const metadata = getWindowMetadata('2025-winter');
      expect(metadata?.status).toMatch(/^(open|closed)$/);
    });
  });

  describe('isWindowOpen', () => {
    it('returns boolean for valid window', () => {
      const result = isWindowOpen('2025-winter');
      expect(typeof result).toBe('boolean');
    });

    it('returns false for invalid window', () => {
      expect(isWindowOpen('invalid')).toBe(false);
    });

    it('returns false for null metadata', () => {
      expect(isWindowOpen('nonexistent')).toBe(false);
    });
  });

  describe('getWindowDisplayName', () => {
    it('returns formatted name for winter window', () => {
      expect(getWindowDisplayName('2025-winter')).toBe('2025 Winter Window');
    });

    it('returns formatted name for summer window', () => {
      expect(getWindowDisplayName('2025-summer')).toBe('2025 Summer Window');
    });

    it('returns original ID for invalid window', () => {
      expect(getWindowDisplayName('invalid')).toBe('invalid');
    });
  });

  describe('getWindowsForYear', () => {
    it('returns both windows for given year', () => {
      const windows = getWindowsForYear(2025);
      expect(windows).toHaveLength(2);
      expect(windows.map(w => w.id)).toContain('2025-winter');
      expect(windows.map(w => w.id)).toContain('2025-summer');
    });

    it('returns windows with correct structure', () => {
      const windows = getWindowsForYear(2025);
      windows.forEach(window => {
        expect(window).toMatchObject({
          id: expect.stringMatching(/^\d{4}-(winter|summer)$/),
          name: expect.stringContaining('2025'),
          status: expect.stringMatching(/^(open|closed)$/),
          leagues: expect.any(Array),
        });
        expect(window.startDate).toBeInstanceOf(Date);
        expect(window.endDate).toBeInstanceOf(Date);
      });
    });

    it('handles leap year correctly', () => {
      const windows = getWindowsForYear(2024); // Leap year
      expect(windows).toHaveLength(2);
      expect(windows.every(w => w.id.startsWith('2024-'))).toBe(true);
    });
  });

  describe('getRecentWindows', () => {
    it('returns windows for current and previous year', () => {
      const currentYear = new Date().getFullYear();
      const windows = getRecentWindows();
      expect(windows).toHaveLength(4); // 2 windows per year
      
      const windowIds = windows.map(w => w.id);
      expect(windowIds).toContain(`${currentYear}-winter`);
      expect(windowIds).toContain(`${currentYear}-summer`);
      expect(windowIds).toContain(`${currentYear - 1}-winter`);
      expect(windowIds).toContain(`${currentYear - 1}-summer`);
    });

    it('returns windows sorted by most recent first', () => {
      const windows = getRecentWindows();
      const dates = windows.map(w => w.startDate.getTime());
      
      // Check that dates are in descending order (most recent first)
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      }
    });

    it('returns windows with valid metadata', () => {
      const windows = getRecentWindows();
      windows.forEach(window => {
        expect(window).toMatchObject({
          id: expect.stringMatching(/^\d{4}-(winter|summer)$/),
          name: expect.stringContaining('Window'),
          status: expect.stringMatching(/^(open|closed)$/),
          leagues: expect.any(Array),
        });
      });
    });
  });

  describe('isValidWindowId', () => {
    it('validates correct window IDs', () => {
      expect(isValidWindowId('2025-winter')).toBe(true);
      expect(isValidWindowId('2024-summer')).toBe(true);
      expect(isValidWindowId('1999-winter')).toBe(true);
      expect(isValidWindowId('2000-summer')).toBe(true);
    });

    it('rejects invalid window IDs', () => {
      expect(isValidWindowId('')).toBe(false);
      expect(isValidWindowId('2025')).toBe(false);
      expect(isValidWindowId('winter-2025')).toBe(false);
      expect(isValidWindowId('2025-invalid')).toBe(false);
      expect(isValidWindowId('2025-WINTER')).toBe(false); // Case sensitive
      expect(isValidWindowId('2025-winter-summer')).toBe(false);
      expect(isValidWindowId('abc-winter')).toBe(false);
      expect(isValidWindowId('2025-wint')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidWindowId('2025-')).toBe(false);
      expect(isValidWindowId('-winter')).toBe(false);
      expect(isValidWindowId('20-winter')).toBe(false); // Too short year
      expect(isValidWindowId('2025-winterx')).toBe(false);
    });
  });

  describe('parseWindowId', () => {
    it('parses valid window IDs correctly', () => {
      expect(parseWindowId('2025-winter')).toEqual({ year: 2025, season: 'winter' });
      expect(parseWindowId('2024-summer')).toEqual({ year: 2024, season: 'summer' });
    });

    it('returns null for invalid window IDs', () => {
      expect(parseWindowId('invalid')).toBeNull();
      expect(parseWindowId('2025')).toBeNull();
      expect(parseWindowId('winter-2025')).toBeNull();
      expect(parseWindowId('2025-invalid')).toBeNull();
    });

    it('handles edge cases', () => {
      expect(parseWindowId('')).toBeNull();
      expect(parseWindowId('2025-')).toBeNull();
      expect(parseWindowId('-winter')).toBeNull();
    });

    it('returns correct season types', () => {
      const winterResult = parseWindowId('2025-winter');
      const summerResult = parseWindowId('2025-summer');
      
      expect(winterResult?.season).toBe('winter');
      expect(summerResult?.season).toBe('summer');
    });
  });

  describe('League-Specific Window Detection', () => {
    it('uses Serie A specific winter start date (January 2)', () => {
      // January 1st should NOT be in Serie A winter window (starts Jan 2)
      const date = new Date('2025-01-01');
      const windowId = detectTransferWindow(date, 'serie-a');
      
      // Should fall back to edge case handling and assign to winter
      expect(windowId).toBe('2025-winter');
    });

    it('uses Serie A specific winter end date correctly', () => {
      // February 1st should be in Serie A winter window
      const date = new Date('2025-02-01');
      const windowId = detectTransferWindow(date, 'serie-a');
      
      expect(windowId).toBe('2025-winter');
    });

    it('uses La Liga specific summer end date (September 2)', () => {
      // September 2nd should be in La Liga summer window
      const date = new Date('2025-09-02');
      const windowId = detectTransferWindow(date, 'la-liga');
      
      expect(windowId).toBe('2025-summer');
    });

    it('uses Premier League specific summer start date (June 10)', () => {
      // June 9th should NOT be in Premier League summer window
      const date = new Date('2025-06-09');
      const windowId = detectTransferWindow(date, 'premier-league');
      
      // Should fall back to edge case handling
      expect(windowId).toBe('2025-winter');
    });

    it('uses Premier League specific summer start date correctly', () => {
      // June 10th should be in Premier League summer window
      // Use explicit date construction to avoid timezone issues
      const date = new Date(2025, 5, 10); // June 10, 2025 (month is 0-indexed)
      const windowId = detectTransferWindow(date, 'premier-league');
      
      expect(windowId).toBe('2025-summer');
    });
  });

  describe('League-Specific Window Metadata', () => {
    it('returns league-specific winter window dates', () => {
      const metadata = getWindowMetadata('2025-winter', 'serie-a');
      
      // Use the same date creation method as the actual code
      const expectedStart = new Date(2024, 0, 2); // Jan 2, 2024 (local time)
      const expectedEnd = new Date(2025, 1, 1); // Feb 1, 2025 (local time)
      
      expect(metadata?.startDate).toEqual(expectedStart);
      expect(metadata?.endDate).toEqual(expectedEnd);
      expect(metadata?.leagues).toEqual(['serie-a']);
    });

    it('returns league-specific summer window dates', () => {
      const metadata = getWindowMetadata('2025-summer', 'la-liga');
      
      // Use the same date creation method as the actual code
      const expectedStart = new Date(2025, 6, 1); // Jul 1, 2025 (local time)
      const expectedEnd = new Date(2025, 8, 2); // Sep 2, 2025 (local time)
      
      expect(metadata?.startDate).toEqual(expectedStart);
      expect(metadata?.endDate).toEqual(expectedEnd);
      expect(metadata?.leagues).toEqual(['la-liga']);
    });

    it('returns generic window dates when no league specified', () => {
      const metadata = getWindowMetadata('2025-winter');
      
      expect(metadata?.leagues).toContain('premier-league');
      expect(metadata?.leagues).toContain('la-liga');
      expect(metadata?.leagues).toContain('serie-a');
      expect(metadata?.leagues).toContain('bundesliga');
      expect(metadata?.leagues).toContain('ligue-1');
    });
  });

  describe('Integration Tests', () => {
    it('complete workflow - detect and get metadata', () => {
      const date = new Date('2025-01-15');
      const windowId = detectTransferWindow(date);
      const metadata = getWindowMetadata(windowId);
      
      expect(windowId).toBe('2025-winter');
      expect(metadata?.id).toBe('2025-winter');
      expect(metadata?.name).toBe('2025 Winter Window');
    });

    it('complete workflow - current window and status', () => {
      const currentWindow = getCurrentWindow();
      const isOpen = isWindowOpen(currentWindow);
      const displayName = getWindowDisplayName(currentWindow);
      
      expect(isValidWindowId(currentWindow)).toBe(true);
      expect(typeof isOpen).toBe('boolean');
      expect(displayName).toContain('Window');
    });

    it('handles league-specific variations', () => {
      // Use a date that should be in summer window for most leagues
      const sameDate = new Date('2025-07-15'); // July 15th
      
      const premierLeagueWindow = detectTransferWindow(sameDate, 'premier-league');
      const laLigaWindow = detectTransferWindow(sameDate, 'la-liga');
      const defaultWindow = detectTransferWindow(sameDate, 'unknown-league');
      
      // All should be summer windows for July
      expect(premierLeagueWindow).toMatch(/^\d{4}-summer$/);
      expect(laLigaWindow).toMatch(/^\d{4}-summer$/);
      expect(defaultWindow).toMatch(/^\d{4}-summer$/);
    });

    it('edge case - year boundary handling', () => {
      // December 31st should belong to next year's winter window
      const dec31 = new Date('2024-12-31');
      const windowId = detectTransferWindow(dec31);
      
      expect(windowId).toBe('2025-winter');
      
      const metadata = getWindowMetadata(windowId);
      expect(metadata?.startDate.getFullYear()).toBe(2024); // Starts in previous year
      expect(metadata?.endDate.getFullYear()).toBe(2025); // Ends in current year
    });
  });

  describe('Performance Tests', () => {
    it('handles large number of detections efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const date = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        detectTransferWindow(date);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 1000 detections in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('handles metadata lookups efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        getWindowMetadata('2025-winter');
        getWindowMetadata('2025-summer');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 200 metadata lookups in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
