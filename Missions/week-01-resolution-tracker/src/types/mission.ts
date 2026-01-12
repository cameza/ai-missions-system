import { z } from 'zod';

/**
 * Mission status enum representing the possible states of a mission
 */
export enum MissionStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  Blocked = 'blocked',
}

/**
 * Mission interface representing a single AI challenge mission
 * @interface Mission
 */
export interface Mission {
  /** Unique identifier for the mission (UUID) */
  id: string;
  
  /** Mission title - Required, 1-100 characters */
  title: string;
  
  /** Optional mission description - Maximum 500 characters */
  description?: string;
  
  /** Current status of the mission */
  status: MissionStatus;
  
  /** Whether the mission is currently active */
  isActive: boolean;
  
  /** Timestamp when mission was created */
  createdAt: Date;
  
  /** Timestamp when mission was last updated */
  updatedAt: Date;
}

/**
 * Zod schema for runtime validation of Mission objects
 * Handles both Date objects and string dates from localStorage
 */
export const missionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
  isActive: z.boolean(),
  createdAt: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  updatedAt: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

/**
 * Zod schema for validating Mission objects from localStorage (string dates only)
 */
export const missionStorageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
  isActive: z.boolean(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

/**
 * Type guard function to check if an object is a valid Mission
 * @param data - Object to validate
 * @returns boolean indicating if the object is a Mission
 */
export function isMission(data: unknown): data is Mission {
  try {
    missionSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type for creating a new mission (without auto-generated fields)
 */
export type CreateMissionData = Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating an existing mission (all fields optional)
 */
export type UpdateMissionData = Partial<Omit<Mission, 'id'>>;
