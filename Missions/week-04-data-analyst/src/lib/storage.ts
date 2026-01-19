/**
 * Storage Service for State Persistence
 * Handles localStorage operations with error handling and fallbacks
 */

export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageService implements StorageService {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable) return null;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      
      // Handle JSON parsing with fallback
      try {
        return JSON.parse(item) as T;
      } catch {
        // Return as string if JSON parsing fails
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable) return;

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
      
      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldItems();
        // Retry once
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.warn(`Retry failed for localStorage key "${key}":`, retryError);
        }
      }
    }
  }

  remove(key: string): void {
    if (!this.isAvailable) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key "${key}":`, error);
    }
  }

  clear(): void {
    if (!this.isAvailable) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }

  private clearOldItems(): void {
    // Clear items older than 7 days to free up space
    const keysToRemove: string[] = [];
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transfer-hub-')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp && parsed.timestamp < sevenDaysAgo) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // If we can't parse, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore errors during cleanup
      }
    });
  }
}

// Memory fallback for when localStorage is not available
class MemoryStorageService implements StorageService {
  private store: Map<string, any> = new Map();

  get<T>(key: string): T | null {
    const value = this.store.get(key);
    return value !== undefined ? (value as T) : null;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Create and export the storage service instance
export const storageService: StorageService = new LocalStorageService();

// Export a method to get the current storage service (for testing)
export const getStorageService = (): StorageService => storageService;

// Export types for use in components

// Utility functions for common storage operations
export const storageUtils = {
  // Save user preferences
  saveUserPreferences: (preferences: Record<string, any>) => {
    storageService.set('transfer-hub-user-preferences', {
      ...preferences,
      timestamp: Date.now(),
    });
  },

  // Get user preferences
  getUserPreferences: (): Record<string, any> => {
    return storageService.get('transfer-hub-user-preferences') || {};
  },

  // Save filter state
  saveFilterState: (filters: any) => {
    storageService.set('transfer-hub-filters', {
      ...filters,
      timestamp: Date.now(),
    });
  },

  // Get filter state
  getFilterState: (): any => {
    return storageService.get('transfer-hub-filters');
  },

  // Save recently viewed transfers
  saveRecentTransfers: (transferIds: string[]) => {
    storageService.set('transfer-hub-recent-transfers', {
      transfers: transferIds.slice(0, 10), // Keep only last 10
      timestamp: Date.now(),
    });
  },

  // Get recently viewed transfers
  getRecentTransfers: (): string[] => {
    const data = storageService.get<{ transfers: string[]; timestamp: number }>('transfer-hub-recent-transfers');
    return data?.transfers || [];
  },

  // Clear all transfer-hub related data
  clearTransferHubData: () => {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transfer-hub-')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      storageService.remove(key);
    });
  },
};
