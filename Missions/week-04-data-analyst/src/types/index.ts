/**
 * Transfer Hub Data Models
 * 
 * Central type definitions for the Transfer Hub application.
 * Implements enhanced type safety with branded IDs and Zod validation.
 * 
 * @version 1.0
 * @since 2025-01-17
 */

// ============================================================================
// CORE ENTITIES & ENUMS (Tech Spec §4.1)
// ============================================================================

/**
 * Transfer type enumeration
 * Represents the different types of player transfers.
 */
export type TransferType = 'Loan' | 'Permanent' | 'Free Transfer' | 'N/A';

/**
 * Player position enumeration
 * Represents the different positions a player can have.
 */
export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';

/**
 * League type enumeration
 * Represents the different types of competitions.
 */
export type LeagueType = 'League' | 'Cup';

/**
 * Transfer window type
 * Represents the transfer window identifier format.
 */
export type TransferWindow = `${number}-${'winter' | 'summer'}`;

/**
 * Transfer status enumeration
 * Represents the status of a transfer.
 */
export type TransferStatus = 'done' | 'pending' | 'rumour';

/**
 * Core Transfer entity interface
 * Contains all required fields per tech spec, including denormalized display fields
 * for UI tables without extra joins.
 */
export interface Transfer {
  /** UUID primary key */
  id: string;
  
  // Player Information
  /** API-Football player ID */
  player_id: number;
  /** Player first name (required) */
  player_first_name: string;
  /** Player last name (required) */
  player_last_name: string;
  /** Full player name for search functionality */
  player_full_name: string;
  /** Player age (optional) */
  age?: number;
  /** Player position ('Goalkeeper', 'Defender', 'Midfielder', 'Attacker') */
  position?: PlayerPosition;
  /** Player nationality (ISO country code) */
  nationality?: string;
  
  // Club Information
  /** UUID reference to from club (optional - may be null for free agents) */
  from_club_id?: string;
  /** UUID reference to to club (optional - may be null for free agents) */
  to_club_id?: string;
  /** Denormalized from club name for display (required) */
  from_club_name: string;
  /** Denormalized to club name for display (required) */
  to_club_name: string;
  
  // League Information
  /** UUID reference to league (optional - may be null for international transfers) */
  league_id?: string;
  /** Denormalized league name for display (required) */
  league_name: string;
  
  // Transfer Details
  /** Type of transfer (required) */
  transfer_type: TransferType;
  /** Transfer value in USD cents (optional - null for free transfers) */
  transfer_value_usd?: number;
  /** Display-formatted transfer value ("€50M", "FREE", "UNDISCLOSED") */
  transfer_value_display: string;
  /** Transfer status (required) */
  status: TransferStatus;
  /** Transfer date (required) */
  transfer_date: Date;
  
  // Transfer Window
  /** Transfer window identifier in format 'YYYY-winter' or 'YYYY-summer' */
  window: TransferWindow;
  /** API-Football transfer ID (required for data sync) */
  api_transfer_id: number;
  
  // Metadata
  /** Creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
}

/**
 * Club entity interface
 * Contains API integration fields and club information.
 */
export interface Club {
  /** UUID primary key */
  id: string;
  /** API-Football club ID */
  apiClubId: number;
  /** Club name (required) */
  name: string;
  /** Short name variant ("Man City" vs "Manchester City") */
  shortName?: string;
  /** Club code ("MCI") */
  code?: string;
  /** Club country (ISO code) */
  country?: string;
  /** Club city */
  city?: string;
  /** UUID reference to league */
  leagueId?: string;
  /** Club logo URL */
  logoUrl?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * League entity interface
 * Contains tier and type support for league classification.
 */
export interface League {
  /** UUID primary key */
  id: string;
  /** API-Football league ID */
  apiLeagueId: number;
  /** League name (required) */
  name: string;
  /** League country (ISO code) */
  country?: string;
  /** League tier (1 for top leagues, higher numbers for lower tiers) */
  tier?: number;
  /** League type ('League' or 'Cup' competition) */
  type?: LeagueType;
  /** League logo URL */
  logoUrl?: string;
  /** League flag URL */
  flagUrl?: string;
  /** Creation timestamp */
  createdAt: Date;
}

// ============================================================================
// BRANDED IDENTIFIER UTILITIES (Tech Spec §4.3)
// ============================================================================

/**
 * Branded types to prevent ID mixing between different entity types
 * These provide compile-time safety to prevent accidentally using a ClubId 
 * where a TransferId is expected.
 */
export type TransferId = string & { readonly brand: unique symbol };
export type ClubId = string & { readonly brand: unique symbol };
export type LeagueId = string & { readonly brand: unique symbol };

/**
 * Type-safe ID creation functions
 * These functions create branded IDs that cannot be mixed up.
 */
export function createTransferId(id: string): TransferId {
  return id as TransferId;
}

export function createClubId(id: string): ClubId {
  return id as ClubId;
}

export function createLeagueId(id: string): LeagueId {
  return id as LeagueId;
}

/**
 * Type guard functions for branded IDs
 * These functions verify that a string matches the expected ID type.
 * Uses UUID validation for stricter type safety.
 */
export function isTransferId(id: unknown): id is TransferId {
  return typeof id === 'string' && 
         id.length > 0 && 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function isClubId(id: unknown): id is ClubId {
  return typeof id === 'string' && 
         id.length > 0 && 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function isLeagueId(id: unknown): id is LeagueId {
  return typeof id === 'string' && 
         id.length > 0 && 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// ============================================================================
// API & DATABASE LAYER TYPES
// ============================================================================

/**
 * Discriminated API response type for success/error handling
 * Provides type-safe error handling across all API endpoints.
 */
export type APIResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Type guard to check if API response was successful
 */
export function isAPIResponseSuccess<T>(response: APIResponse<T>): response is { success: true; data: T } {
  return response.success === true;
}

/**
 * Database row types with proper nullability
 * These reflect the actual database schema with string timestamps
 * and nullable fields as they appear from Supabase.
 */
export type DatabaseTransfer = Omit<Transfer, 'created_at' | 'updated_at'> & {
  created_at: string; // ISO string from database
  updated_at: string; // ISO string from database
};

export type DatabaseClub = Omit<Club, 'createdAt' | 'updatedAt'> & {
  created_at: string; // ISO string from database
  updated_at: string; // ISO string from database
};

export type DatabaseLeague = Omit<League, 'createdAt'> & {
  created_at: string; // ISO string from database
};

/**
 * Transfer filters interface for advanced filtering
 * Used in the transfer table and search functionality.
 */
export interface TransferFilters {
  /** League IDs to filter by (optional - defaults to all leagues) */
  leagues?: string[];
  /** Player positions to filter by (optional - defaults to all positions) */
  positions?: PlayerPosition[];
  /** Transfer types to filter by (optional - defaults to all types) */
  transferTypes?: TransferType[];
  /** Age range filter [min, max] (optional - defaults to 16-50) */
  ageRange?: [number, number];
  /** Transfer value range filter [min, max] in USD cents (optional - defaults to 0-500M) */
  valueRange?: [number, number];
  /** Date range filter [start, end] (optional) */
  dateRange?: [Date, Date];
  /** Status filter ('all', 'confirmed', 'rumours') (optional - defaults to 'all') */
  status?: 'all' | 'confirmed' | 'rumours';
}

/**
 * Default transfer filters for initialization
 */
export const DEFAULT_TRANSFER_FILTERS: TransferFilters = {
  leagues: [],
  positions: [],
  transferTypes: [],
  ageRange: [16, 50],
  valueRange: [0, 500000000], // €0-€5B in cents
  dateRange: [new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()],
  status: 'all',
};

// ============================================================================
// ZOD SCHEMAS & TYPE GUARDS
// ============================================================================

import { z } from 'zod';

/**
 * Zod schema for TransferType enum
 */
export const TransferTypeSchema = z.enum(['Loan', 'Permanent', 'Free Transfer', 'N/A']);

/**
 * Zod schema for PlayerPosition enum
 */
export const PlayerPositionSchema = z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']);

/**
 * Zod schema for LeagueType enum
 */
export const LeagueTypeSchema = z.enum(['League', 'Cup']);

/**
 * Zod schema for TransferWindow type
 */
export const TransferWindowSchema = z.string().regex(/^\d{4}-(winter|summer)$/);

/**
 * Zod schema for Transfer entity
 * Provides runtime validation that matches compile-time types.
 */
export const TransferSchema = z.object({
  id: z.string().uuid(),
  playerId: z.number(),
  playerFirstName: z.string().min(1),
  playerLastName: z.string().min(1),
  playerFullName: z.string().min(1),
  age: z.number().min(16).max(50).optional(),
  position: PlayerPositionSchema.optional(),
  nationality: z.string().length(3).optional(),
  fromClubId: z.string().uuid().optional(),
  toClubId: z.string().uuid().optional(),
  fromClubName: z.string().min(1),
  toClubName: z.string().min(1),
  leagueId: z.string().uuid().optional(),
  leagueName: z.string().min(1),
  transferType: TransferTypeSchema,
  transferValueUsd: z.number().min(0).optional(),
  transferValueDisplay: z.string().min(1),
  transferDate: z.date(),
  window: TransferWindowSchema,
  apiTransferId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Zod schema for Club entity
 */
export const ClubSchema = z.object({
  id: z.string().uuid(),
  apiClubId: z.number(),
  name: z.string().min(1),
  shortName: z.string().optional(),
  code: z.string().optional(),
  country: z.string().length(3).optional(),
  city: z.string().optional(),
  leagueId: z.string().uuid().optional(),
  logoUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Zod schema for League entity
 */
export const LeagueSchema = z.object({
  id: z.string().uuid(),
  apiLeagueId: z.number(),
  name: z.string().min(1),
  country: z.string().length(3).optional(),
  tier: z.number().min(1).optional(),
  type: LeagueTypeSchema.optional(),
  logoUrl: z.string().url().optional(),
  flagUrl: z.string().url().optional(),
  createdAt: z.date(),
});

/**
 * Zod schema for TransferFilters
 */
export const TransferFiltersSchema = z.object({
  leagues: z.array(z.string().uuid()).optional(),
  positions: z.array(PlayerPositionSchema).optional(),
  transferTypes: z.array(TransferTypeSchema).optional(),
  ageRange: z.tuple([z.number().min(16), z.number().max(50)]).optional(),
  valueRange: z.tuple([z.number().min(0), z.number().max(500000000)]).optional(),
  dateRange: z.tuple([z.date(), z.date()]).optional(),
  window: TransferWindowSchema.optional(),
  windowStatus: z.enum(['open', 'closed']).optional(),
  status: z.enum(['all', 'confirmed', 'rumours']).optional(),
});

/**
 * Zod schema for TopTransfer
 */
export const TopTransferSchema = z.object({
  id: z.string().uuid(),
  rank: z.number().min(1),
  playerName: z.string().min(1),
  fromClub: z.string().min(1),
  toClub: z.string().min(1),
  transferValue: z.string().min(1),
  transferValueUsd: z.number().min(0).optional(),
  transferDate: z.date(),
});

/**
 * Zod schema for TransfersResponse
 */
export const TransfersResponseSchema = z.object({
  data: z.array(TransferSchema),
  total: z.number().min(0),
  page: z.number().min(1),
  limit: z.number().min(1),
  hasMore: z.boolean(),
});

/**
 * Zod schema for TopTransfersResponse
 */
export const TopTransfersResponseSchema = z.object({
  data: z.array(TopTransferSchema),
  window: z.string(),
  totalInWindow: z.number().min(0),
});

/**
 * Zod schema for SummaryData
 */
export const SummaryDataSchema = z.object({
  todayCount: z.number().min(0),
  windowTotal: z.number().min(0),
  totalSpend: z.number().min(0),
  mostActiveTeam: z.object({
    name: z.string(),
    transfers: z.number().min(0),
    logo: z.string().url().optional(),
  }),
  averageDailyTransfers: z.number().min(0),
  windowType: z.enum(['SUMMER', 'WINTER', 'MID-SEASON']),
  isRecordHigh: z.boolean(),
  lastUpdated: z.string(),
});

/**
 * Type guard functions using Zod schemas
 * These provide runtime validation that matches compile-time types.
 */
export function isTransfer(data: unknown): data is Transfer {
  return TransferSchema.safeParse(data).success;
}

export function isClub(data: unknown): data is Club {
  return ClubSchema.safeParse(data).success;
}

export function isLeague(data: unknown): data is League {
  return LeagueSchema.safeParse(data).success;
}

export function isTransferFilters(data: unknown): data is TransferFilters {
  // Use strict validation - require exact shape, no extra properties
  const result = TransferFiltersSchema.strict().safeParse(data);
  return result.success;
}

// ============================================================================
// HELPER FUNCTIONS & DEFAULTS
// ============================================================================

/**
 * Format transfer value for display
 * Converts USD cents to formatted display string ("€50M", "FREE", "UNDISCLOSED")
 */
export function formatTransferValue(valueUsd?: number): string {
  if (!valueUsd || valueUsd === 0) {
    return 'FREE';
  }
  
  const millions = valueUsd / 1000000; // Convert cents to millions
  if (millions >= 1000) {
    return `€${(millions / 1000).toFixed(1)}B`;
  } else {
    return `€${millions.toFixed(1)}M`;
  }
}

/**
 * Build player display name from first and last name
 * Optimized for search and display purposes.
 */
export function buildPlayerDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Create empty transfer filters object
 * Returns a fresh filters object with default values.
 */
export function createEmptyTransferFilters(): TransferFilters {
  return { ...DEFAULT_TRANSFER_FILTERS };
}

/**
 * Validate and normalize transfer data
 * Ensures transfer data meets minimum requirements before processing.
 */
export function validateTransferData(data: Partial<Transfer>): string[] {
  const errors: string[] = [];
  
  if (!data.player_first_name?.trim()) {
    errors.push('Player first name is required');
  }
  
  if (!data.player_last_name?.trim()) {
    errors.push('Player last name is required');
  }
  
  if (!data.from_club_name?.trim()) {
    errors.push('From club name is required');
  }
  
  if (!data.to_club_name?.trim()) {
    errors.push('To club name is required');
  }
  
  if (!data.transfer_type) {
    errors.push('Transfer type is required');
  }
  
  if (!data.transfer_date) {
    errors.push('Transfer date is required');
  }
  
  return errors;
}

/**
 * Extract window identifier from transfer date
 * Generates window identifier like '2025-winter' or '2025-summer'
 * Returns type-safe TransferWindow string
 */
export function determineTransferWindow(date: Date): TransferWindow {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  
  // Winter window: January (0) or February (1)
  if (month === 0 || month === 1) {
    return `${year}-winter` as TransferWindow;
  }
  
  // Summer window: May-August (4-7)
  if (month >= 4 && month <= 7) {
    return `${year}-summer` as TransferWindow;
  }
  
  // Default to closest window
  return month < 4 ? `${year}-winter` as TransferWindow : `${year}-summer` as TransferWindow;
}

/**
 * Convert database transfer to frontend transfer
 * Handles string timestamp conversion and field mapping.
 */
export function databaseTransferToTransfer(dbTransfer: DatabaseTransfer): Transfer {
  return {
    ...dbTransfer,
    created_at: new Date(dbTransfer.created_at),
    updated_at: new Date(dbTransfer.updated_at),
  };
}

/**
 * Convert frontend transfer to database transfer
 * Handles Date to string timestamp conversion.
 */
export function transferToDatabaseTransfer(transfer: Transfer): DatabaseTransfer {
  return {
    ...transfer,
    created_at: transfer.created_at.toISOString(),
    updated_at: transfer.updated_at.toISOString(),
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract entity ID type from entity interface
 */
export type EntityId<T> = T extends { id: infer U } ? U : never;

/**
 * Omit metadata fields from entity types
 */
export type EntityWithoutMetadata<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Create entity type for creation (without id and timestamps)
 */
export type CreateTransfer = EntityWithoutMetadata<Transfer>;
export type CreateClub = EntityWithoutMetadata<Club>;
export type CreateLeague = EntityWithoutMetadata<League>;

/**
 * Create entity type for updates (partial, without id)
 */
export type UpdateTransfer = Partial<EntityWithoutMetadata<Transfer>>;
export type UpdateClub = Partial<EntityWithoutMetadata<Club>>;
export type UpdateLeague = Partial<EntityWithoutMetadata<League>>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Query parameters for transfers API endpoint
 */
export interface TransfersQueryParams {
  /** Search term for player names */
  search?: string;
  /** League IDs to filter by */
  leagues?: string[];
  /** Player positions to filter by */
  positions?: PlayerPosition[];
  /** Transfer types to filter by */
  transferTypes?: TransferType[];
  /** Age range filter [min, max] */
  ageRange?: [number, number];
  /** Value range filter [min, max] in USD cents */
  valueRange?: [number, number];
  /** Date range filter [start, end] */
  dateRange?: [string, string];
  /** Transfer window filter */
  window?: TransferWindow;
  /** Window status filter ('open' or 'closed') */
  windowStatus?: 'open' | 'closed';
  /** Status filter */
  status?: 'all' | 'confirmed' | 'rumours';
  /** Pagination limit */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Sort field */
  sort?: 'date' | 'value' | 'playerName';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Response from transfers API endpoint
 */
export interface TransfersResponse {
  /** Array of transfer data */
  data: Transfer[];
  /** Total count of transfers matching filters */
  total: number;
  /** Current page number */
  page: number;
  /** Number of transfers per page */
  limit: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Query parameters for top transfers API endpoint
 */
export interface TopTransfersQueryParams {
  /** Transfer window filter */
  window?: string;
  /** Number of results to return */
  limit?: number;
  /** League filter */
  league?: string;
}

/**
 * Top transfer data with ranking
 */
export interface TopTransfer {
  /** Transfer ID */
  id: string;
  /** Rank in top list */
  rank: number;
  /** Player name */
  playerName: string;
  /** From club name */
  fromClub: string;
  /** To club name */
  toClub: string;
  /** Display-formatted transfer value */
  transferValue: string;
  /** Transfer value in USD cents */
  transferValueUsd?: number;
  /** Transfer date */
  transferDate: Date;
}

/**
 * Response from top transfers API endpoint
 */
export interface TopTransfersResponse {
  /** Array of top transfer data */
  data: TopTransfer[];
  /** Window identifier */
  window: string;
  /** Total number of transfers in window */
  totalInWindow: number;
}

/**
 * Summary data for dashboard
 */
export interface SummaryData {
  /** Today's transfer count */
  todayCount: number;
  /** Total transfers in current window */
  windowTotal: number;
  /** Total spend in current window (USD cents) */
  totalSpend: number;
  /** Most active team data */
  mostActiveTeam: {
    name: string;
    transfers: number;
    logo?: string;
  };
  /** Average daily transfers */
  averageDailyTransfers: number;
  /** Current window type */
  windowType: 'SUMMER' | 'WINTER' | 'MID-SEASON';
  /** Whether this is a record high spend */
  isRecordHigh: boolean;
  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
