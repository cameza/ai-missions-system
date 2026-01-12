import { z } from 'zod';

/**
 * ProgressUpdate interface representing a single progress update for a mission
 * @interface ProgressUpdate
 */
export interface ProgressUpdate {
  /** Unique identifier for the progress update (UUID) */
  id: string;
  
  /** ID of the mission this update belongs to */
  missionId: string;
  
  /** Content of the progress update - Required, 1-1000 characters */
  content: string;
  
  /** Timestamp when the update was created */
  timestamp: Date;
}

/**
 * Zod schema for runtime validation of ProgressUpdate objects
 * Handles both Date objects and string dates from localStorage
 */
export const progressUpdateSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  timestamp: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

/**
 * Zod schema for validating ProgressUpdate objects from localStorage (string dates only)
 */
export const progressUpdateStorageSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  timestamp: z.string().transform((val) => new Date(val)),
});

/**
 * Type guard function to check if an object is a valid ProgressUpdate
 * @param data - Object to validate
 * @returns boolean indicating if the object is a ProgressUpdate
 */
export function isProgressUpdate(data: unknown): data is ProgressUpdate {
  try {
    progressUpdateSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type for creating a new progress update (without auto-generated fields)
 */
export type CreateProgressUpdateData = Omit<ProgressUpdate, 'id' | 'timestamp'>;
