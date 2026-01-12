import type { Mission, ProgressUpdate } from '../types';

export class StorageService {
  private readonly MISSIONS_KEY = 'ai-missions:tracker:missions';
  private readonly PROGRESS_KEY = 'ai-missions:tracker:progress';
  private readonly VERSION_KEY = 'ai-missions:tracker:version';
  private readonly CURRENT_VERSION = '1.0';
  
  saveMissions(missions: Mission[]): void {
    try {
      const data = JSON.stringify(missions);
      localStorage.setItem(this.MISSIONS_KEY, data);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some missions.');
      }
      throw new Error('Failed to save missions');
    }
  }
  
  loadMissions(): Mission[] {
    try {
      const data = localStorage.getItem(this.MISSIONS_KEY);
      if (!data) return [];
      
      const missions = JSON.parse(data);
      return this.validateMissions(missions);
    } catch (error) {
      console.error('Failed to load missions:', error);
      return [];
    }
  }
  
  saveProgressUpdates(updates: Record<string, ProgressUpdate[]>): void {
    try {
      const data = JSON.stringify(updates);
      localStorage.setItem(this.PROGRESS_KEY, data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some progress updates.');
      }
      throw new Error('Failed to save progress updates');
    }
  }
  
  loadProgressUpdates(): Record<string, ProgressUpdate[]> {
    try {
      const data = localStorage.getItem(this.PROGRESS_KEY);
      if (!data) return {};
      
      const updates = JSON.parse(data);
      return this.validateProgressUpdates(updates);
    } catch (error) {
      console.error('Failed to load progress updates:', error);
      return {};
    }
  }
  
  clear(): void {
    localStorage.removeItem(this.MISSIONS_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.VERSION_KEY);
  }
  
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
  
  private validateMissions(missions: any[]): Mission[] {
    return missions.filter(mission => {
      return mission &&
             typeof mission.id === 'string' &&
             typeof mission.title === 'string' &&
             typeof mission.status === 'string' &&
             ['not_started', 'in_progress', 'completed', 'blocked'].includes(mission.status);
    });
  }
  
  private validateProgressUpdates(updates: any): Record<string, ProgressUpdate[]> {
    const validated: Record<string, ProgressUpdate[]> = {};
    
    Object.entries(updates).forEach(([missionId, missionUpdates]) => {
      if (Array.isArray(missionUpdates)) {
        validated[missionId] = missionUpdates.filter(update => {
          return update &&
                 typeof update.id === 'string' &&
                 typeof update.content === 'string' &&
                 typeof update.missionId === 'string';
        });
      }
    });
    
    return validated;
  }
}

export const storageService = new StorageService();
