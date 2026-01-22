/**
 * Team Logo Utilities
 * 
 * Provides utilities for fetching team logo URLs from API-Football team IDs.
 * Uses the existing API_TEAM_MAPPING for team identification.
 */

import { API_TEAM_MAPPING } from '@/lib/config/team-mapping';

/**
 * Gets the team logo URL for a given club name
 * 
 * @param clubName - The name of the club (e.g., "Real Madrid", "Ajax")
 * @returns The logo URL or null if team not found
 */
export function getTeamLogoUrl(clubName: string): string | null {
  if (!clubName || !clubName.trim()) {
    return null;
  }

  // Normalize the club name for comparison
  const normalizedName = clubName.trim().toLowerCase();
  
  // Find the team in our mapping with EXACT matching only
  // This prevents wrong logo assignments from fuzzy matching
  const teamEntry = Object.entries(API_TEAM_MAPPING).find(([_, team]) => {
    const mappingName = team.name.toLowerCase();
    return mappingName === normalizedName;
  });

  if (!teamEntry) {
    return null;
  }

  const teamId = teamEntry[0];
  return `https://media.api-sports.io/football/teams/${teamId}.png`;
}

/**
 * Checks if a club has a logo available
 * 
 * @param clubName - The name of the club
 * @returns True if logo is available, false otherwise
 */
export function hasTeamLogo(clubName: string): boolean {
  return getTeamLogoUrl(clubName) !== null;
}

/**
 * Gets team initials for fallback display
 * 
 * @param clubName - The name of the club
 * @returns 1-2 character initials (e.g., "RM" for "Real Madrid")
 */
export function getTeamInitials(clubName: string): string {
  if (!clubName || !clubName.trim()) {
    return '?';
  }

  const words = clubName.trim().split(' ');
  
  if (words.length === 1) {
    // For single word names (like "Ajax"), take first 2 letters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // For multi-word names, take first letter of first two words
    return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
  }
}

/**
 * Gets all supported team names
 * 
 * @returns Array of supported team names
 */
export function getSupportedTeamNames(): string[] {
  return Object.values(API_TEAM_MAPPING).map(team => team.name);
}

/**
 * Debug function to check what team would be matched
 * 
 * @param clubName - The name of the club to test
 * @returns Debug info about the matching process
 */
export function debugTeamMatching(clubName: string): { matched: boolean; teamId?: string; teamName?: string; url?: string } {
  const url = getTeamLogoUrl(clubName);
  
  if (!url) {
    return { matched: false };
  }
  
  // Extract team ID from URL
  const teamId = url.match(/teams\/(\d+)\.png/)?.[1];
  const teamEntry = teamId ? API_TEAM_MAPPING[parseInt(teamId)] : undefined;
  
  return {
    matched: true,
    teamId,
    teamName: teamEntry?.name,
    url
  };
}
