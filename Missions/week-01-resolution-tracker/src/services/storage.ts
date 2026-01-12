import type { Mission, ProgressUpdate } from '../types';
import { 
  missionSchema, 
  missionStorageSchema
} from '../types/mission';
import { 
  progressUpdateSchema, 
  progressUpdateStorageSchema 
} from '../types/progress';

// Type guards
function isMission(data: unknown): data is Mission {
  try {
    missionSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

function isProgressUpdate(data: unknown): data is ProgressUpdate {
  try {
    progressUpdateSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * StorageService class for managing localStorage operations
 * Provides CRUD operations with validation, error handling, and monitoring
 */
export class StorageService {
  private readonly MISSIONS_KEY = 'ai-missions:tracker:missions';
  private readonly PROGRESS_KEY = 'ai-missions:tracker:progress';
  private readonly VERSION_KEY = 'ai-missions:tracker:version';
  private readonly CURRENT_VERSION = '1.0';
  
  /**
   * Save missions to localStorage with validation
   * @param missions - Array of missions to save
   * @throws Error if storage quota exceeded or validation fails
   */
  saveMissions(missions: Mission[]): void {
    try {
      // Validate all missions before saving
      const validatedMissions = missions.map(mission => {
        if (!isMission(mission)) {
          throw new Error(`Invalid mission data: ${JSON.stringify(mission)}`);
        }
        return missionSchema.parse(mission);
      });
      
      const data = JSON.stringify(validatedMissions);
      localStorage.setItem(this.MISSIONS_KEY, data);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some missions.');
      }
      if (error instanceof Error) {
        throw error; // Re-throw validation errors
      }
      throw new Error('Failed to save missions');
    }
  }
  
  /**
   * Load missions from localStorage with validation
   * @returns Array of validated missions or empty array if none found
   */
  loadMissions(): Mission[] {
    try {
      const data = localStorage.getItem(this.MISSIONS_KEY);
      if (!data) return [];
      
      const missions = JSON.parse(data);
      
      // Validate each mission using storage schema (handles string dates)
      const validatedMissions = missions
        .map((mission: unknown) => {
          try {
            return missionStorageSchema.parse(mission);
          } catch {
            console.warn('Invalid mission data found, filtering out:', mission);
            return null;
          }
        })
        .filter((mission: unknown): mission is Mission => mission !== null);
      
      return validatedMissions;
    } catch (error) {
      console.error('Failed to load missions:', error);
      return [];
    }
  }
  
  /**
   * Save progress updates to localStorage with validation
   * @param updates - Record of mission IDs to their progress updates
   * @throws Error if storage quota exceeded or validation fails
   */
  saveProgressUpdates(updates: Record<string, ProgressUpdate[]>): void {
    try {
      // Validate all progress updates before saving
      const validatedUpdates: Record<string, ProgressUpdate[]> = {};
      
      Object.entries(updates).forEach(([missionId, missionUpdates]) => {
        if (Array.isArray(missionUpdates)) {
          validatedUpdates[missionId] = missionUpdates.map(update => {
            if (!isProgressUpdate(update)) {
              throw new Error(`Invalid progress update data: ${JSON.stringify(update)}`);
            }
            return progressUpdateSchema.parse(update);
          });
        }
      });
      
      const data = JSON.stringify(validatedUpdates);
      localStorage.setItem(this.PROGRESS_KEY, data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some progress updates.');
      }
      if (error instanceof Error) {
        throw error; // Re-throw validation errors
      }
      throw new Error('Failed to save progress updates');
    }
  }
  
  /**
   * Load progress updates from localStorage with validation
   * @returns Record of validated progress updates or empty object if none found
   */
  loadProgressUpdates(): Record<string, ProgressUpdate[]> {
    try {
      const data = localStorage.getItem(this.PROGRESS_KEY);
      if (!data) return {};
      
      const updates = JSON.parse(data);
      
      // Validate each progress update using storage schema (handles string dates)
      const validatedUpdates: Record<string, ProgressUpdate[]> = {};
      
      Object.entries(updates).forEach(([missionId, missionUpdates]) => {
        if (Array.isArray(missionUpdates)) {
          validatedUpdates[missionId] = missionUpdates
            .map((update: unknown) => {
              try {
                return progressUpdateStorageSchema.parse(update);
              } catch {
                console.warn('Invalid progress update data found, filtering out:', update);
                return null;
              }
            })
            .filter((update: unknown): update is ProgressUpdate => update !== null);
        }
      });
      
      return validatedUpdates;
    } catch (error) {
      console.error('Failed to load progress updates:', error);
      return {};
    }
  }
  
  /**
   * Clear all stored data
   */
  clear(): void {
    localStorage.removeItem(this.MISSIONS_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.VERSION_KEY);
  }
  
  /**
   * Get storage usage statistics
   * @returns Object with used, available, and percentage storage
   */
  getStorageUsage(): { used: number; available: number; percentage: number } {
    const missionsData = localStorage.getItem(this.MISSIONS_KEY) || '';
    const progressData = localStorage.getItem(this.PROGRESS_KEY) || '';
    const used = new Blob([missionsData, progressData]).size;
    const estimated = 5 * 1024 * 1024; // 5MB estimated localStorage limit
    return {
      used,
      available: estimated - used,
      percentage: (used / estimated) * 100,
    };
  }
  
  /**
   * Check if storage is near capacity (above 80%)
   * @returns boolean indicating if storage is near capacity
   */
  isStorageNearCapacity(): boolean {
    const usage = this.getStorageUsage();
    return usage.percentage > 80;
  }
  
  /**
   * Get the current data version
   * @returns string version or null if not found
   */
  getDataVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }
  
  /**
   * Validate and repair corrupted data
   * @returns Object indicating if data was repaired and statistics
   */
  validateAndRepairData(): { repaired: boolean; missionsRepaired: boolean; progressRepaired: boolean; stats: { missionsFixed: number; progressFixed: number } } {
    const stats = { missionsFixed: 0, progressFixed: 0 };
    let missionsRepaired = false;
    let progressRepaired = false;
    
    try {
      // Validate and repair missions
      const missions = this.loadMissions();
      const originalMissionCount = missions.length;
      
      // Re-save missions to trigger validation
      if (missions.length > 0) {
        this.saveMissions(missions);
        const repairedMissions = this.loadMissions();
        stats.missionsFixed = originalMissionCount - repairedMissions.length;
        missionsRepaired = stats.missionsFixed > 0;
      }
      
      // Validate and repair progress updates
      const progressUpdates = this.loadProgressUpdates();
      let originalProgressCount = 0;
      
      Object.values(progressUpdates).forEach(updates => {
        originalProgressCount += updates.length;
      });
      
      // Re-save progress updates to trigger validation
      if (originalProgressCount > 0) {
        this.saveProgressUpdates(progressUpdates);
        const repairedProgress = this.loadProgressUpdates();
        
        let repairedProgressCount = 0;
        Object.values(repairedProgress).forEach(updates => {
          repairedProgressCount += updates.length;
        });
        
        stats.progressFixed = originalProgressCount - repairedProgressCount;
        progressRepaired = stats.progressFixed > 0;
      }
      
      return {
        repaired: missionsRepaired || progressRepaired,
        missionsRepaired,
        progressRepaired,
        stats
      };
    } catch (error) {
      console.error('Failed to validate and repair data:', error);
      return {
        repaired: false,
        missionsRepaired: false,
        progressRepaired: false,
        stats: { missionsFixed: 0, progressFixed: 0 }
      };
    }
  }
}
