/**
 * Transfer Window Detection Utilities
 * 
 * Detects transfer windows based on transfer date and league.
 * Handles edge cases including year boundaries and transfers outside official windows.
 */

import { getLeagueWindowConfig, DEFAULT_WINDOW_CONFIG, TransferWindow } from '../config/transfer-windows';
import type { TransferWindow as TransferWindowType } from '../../types';

/**
 * Detects the transfer window for a given transfer date and league.
 * 
 * @param transferDate - The date of the transfer
 * @param leagueId - Optional league ID for league-specific window rules
 * @returns Window ID in format "YYYY-winter" or "YYYY-summer"
 */
export function detectTransferWindow(
  transferDate: Date,
  leagueId?: string
): TransferWindowType {
  const year = transferDate.getFullYear();
  const month = transferDate.getMonth() + 1; // 1-indexed
  const day = transferDate.getDate();
  
  // Get league-specific config or use default
  const config = getLeagueWindowConfig(leagueId);
  
  // Check winter window (crosses year boundary - December to February)
  // Use league-specific start date for winter window
  const winterStartPreviousYear = new Date(year - 1, config.winterWindow.startMonth - 1, config.winterWindow.startDay);
  const winterEndCurrentYear = new Date(year, config.winterWindow.endMonth - 1, config.winterWindow.endDay);
  
  if (transferDate >= winterStartPreviousYear && transferDate <= winterEndCurrentYear) {
    return `${year}-winter` as TransferWindowType;
  }
  
  // Check summer window (same year)
  const summerStart = new Date(year, config.summerWindow.startMonth - 1, config.summerWindow.startDay);
  const summerEnd = new Date(year, config.summerWindow.endMonth - 1, config.summerWindow.endDay);
  
  if (transferDate >= summerStart && transferDate <= summerEnd) {
    return `${year}-summer` as TransferWindowType;
  }
  
  // Edge case: Transfer outside official windows
  // For year boundary transfers in December, assign to next year's winter
  if (month === 12) {
    return `${year + 1}-winter` as TransferWindowType;
  }
  
  // For transfers in Jan/Feb outside official window, assign to current year's winter
  if (month === 1 || month === 2) {
    return `${year}-winter` as TransferWindowType;
  }
  
  // For other months, assign to nearest window
  if (month >= 3 && month <= 6) {
    return `${year}-winter` as TransferWindowType; // First half of year -> winter
  } else {
    return `${year}-summer` as TransferWindowType; // Second half of year -> summer
  }
}

/**
 * Gets the current transfer window based on today's date.
 * 
 * @returns Current window ID in format "YYYY-winter" or "YYYY-summer"
 */
export function getCurrentWindow(): TransferWindowType {
  return detectTransferWindow(new Date());
}

/**
 * Gets metadata for a specific transfer window.
 * 
 * @param windowId - Window ID in format "YYYY-winter" or "YYYY-summer"
 * @param leagueId - Optional league ID for league-specific window dates
 * @returns Transfer window metadata or null if invalid
 */
export function getWindowMetadata(windowId: string, leagueId?: string): TransferWindow | null {
  const parts = windowId.split('-');
  
  if (parts.length !== 2) {
    return null;
  }
  
  const [yearStr, season] = parts;
  const year = parseInt(yearStr);
  
  if (isNaN(year) || !season || !['winter', 'summer'].includes(season)) {
    return null;
  }
  
  // Get league-specific config or use default
  const config = getLeagueWindowConfig(leagueId);
  const isWinter = season === 'winter';
  const windowConfig = isWinter ? config.winterWindow : config.summerWindow;
  
  let startDate: Date;
  let endDate: Date;
  
  if (isWinter) {
    // Winter window crosses year boundary - use league-specific start
    startDate = new Date(year - 1, windowConfig.startMonth - 1, windowConfig.startDay);
    endDate = new Date(year, windowConfig.endMonth - 1, windowConfig.endDay);
  } else {
    // Summer window is within same year
    startDate = new Date(year, windowConfig.startMonth - 1, windowConfig.startDay);
    endDate = new Date(year, windowConfig.endMonth - 1, windowConfig.endDay);
  }
  
  const now = new Date();
  const status: 'open' | 'closed' = now >= startDate && now <= endDate ? 'open' : 'closed';
  
  return {
    id: windowId,
    name: `${year} ${season.charAt(0).toUpperCase() + season.slice(1)} Window`,
    startDate,
    endDate,
    status,
    leagues: leagueId ? [leagueId] : ['premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1'], // All supported leagues or specific league
  };
}

/**
 * Checks if a transfer window is currently open.
 * 
 * @param windowId - Window ID in format "YYYY-winter" or "YYYY-summer"
 * @returns True if window is open, false otherwise
 */
export function isWindowOpen(windowId: string): boolean {
  const metadata = getWindowMetadata(windowId);
  return metadata?.status === 'open' || false;
}

/**
 * Gets a human-readable display name for a transfer window.
 * 
 * @param windowId - Window ID in format "YYYY-winter" or "YYYY-summer"
 * @returns Display name (e.g., "2025 Winter Window")
 */
export function getWindowDisplayName(windowId: string): string {
  const metadata = getWindowMetadata(windowId);
  return metadata?.name || windowId;
}

/**
 * Gets all transfer windows for a given year.
 * 
 * @param year - The year to get windows for
 * @returns Array of transfer window metadata
 */
export function getWindowsForYear(year: number): TransferWindow[] {
  const windows = [`${year}-winter`, `${year}-summer`];
  return windows
    .map(id => getWindowMetadata(id))
    .filter((window): window is TransferWindow => window !== null);
}

/**
 * Gets recent transfer windows (current year and previous year).
 * 
 * @returns Array of recent transfer window metadata
 */
export function getRecentWindows(): TransferWindow[] {
  const currentYear = new Date().getFullYear();
  const windows = [
    `${currentYear}-winter`,
    `${currentYear}-summer`,
    `${currentYear - 1}-winter`,
    `${currentYear - 1}-summer`,
  ];
  
  return windows
    .map(id => getWindowMetadata(id))
    .filter((window): window is TransferWindow => window !== null)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Most recent first
}

/**
 * Validates if a window ID is in the correct format.
 * 
 * @param windowId - Window ID to validate
 * @returns True if valid format, false otherwise
 */
export function isValidWindowId(windowId: string): boolean {
  const pattern = /^\d{4}-(winter|summer)$/;
  return pattern.test(windowId);
}

/**
 * Extracts year and season from a window ID.
 * 
 * @param windowId - Window ID in format "YYYY-winter" or "YYYY-summer"
 * @returns Object with year and season, or null if invalid
 */
export function parseWindowId(windowId: string): { year: number; season: 'winter' | 'summer' } | null {
  if (!isValidWindowId(windowId)) {
    return null;
  }
  
  const [yearStr, season] = windowId.split('-');
  const year = parseInt(yearStr);
  
  return {
    year,
    season: season as 'winter' | 'summer',
  };
}
