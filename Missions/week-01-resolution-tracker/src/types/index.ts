// Re-export all mission types
export type { Mission, CreateMissionData, UpdateMissionData } from './mission';
export { MissionStatus } from './mission';

// Re-export all progress types
export type { ProgressUpdate, CreateProgressUpdateData } from './progress';
export { progressUpdateSchema, progressUpdateStorageSchema, isProgressUpdate } from './progress';

// Import interfaces for use in this file
import type { Mission } from './mission';
import type { ProgressUpdate } from './progress';

// View types for application navigation
export type ViewType = 'dashboard' | 'mission-detail' | 'create-mission';

// Application state interface
export interface AppState {
  // Data State
  missions: Mission[];
  progressUpdates: Record<string, ProgressUpdate[]>;
  
  // UI State
  currentView: ViewType;
  selectedMissionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Form State
  isCreatingMission: boolean;
  editingMissionId: string | null;
}
