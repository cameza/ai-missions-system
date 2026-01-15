import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../../services/storage';
import type { Mission } from '../../types';
import { MissionStatus } from '../../types/mission';

// Helper function to generate UUID-like strings for testing
const generateMockId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to create mock missions with string dates (as they appear in localStorage)
const createMockMissions = (count: number): Mission[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: generateMockId(),
    title: `Mission ${i}`,
    description: `Description for mission ${i}`,
    status: MissionStatus.NotStarted,
    isActive: true,
    createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
    updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
  }));
};

// Helper function to create mock missions with string dates (as they appear in localStorage)
const createMockMissionsWithStringDates = (count: number): Mission[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: generateMockId(),
    title: `Mission ${i}`,
    description: `Description for mission ${i}`,
    status: MissionStatus.NotStarted,
    isActive: true,
    createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
    updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
  }));
};

describe('Storage Performance Tests', () => {
  let storage: StorageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new StorageService();
  });

  it('saveMissions completes within acceptable time for 100 missions', () => {
    const missions = createMockMissions(100);
    const startTime = performance.now();
    
    storage.saveMissions(missions);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 50ms for 100 missions
    expect(duration).toBeLessThan(50);
    console.log(`saveMissions for 100 missions took ${duration.toFixed(2)}ms`);
  });

  it('loadMissions completes within acceptable time for 100 missions', () => {
    const missions = createMockMissions(100);
    // First save the missions
    storage.saveMissions(missions);
    
    const startTime = performance.now();
    
    const loadedMissions = storage.loadMissions();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 10ms for loading
    expect(duration).toBeLessThan(10);
    expect(loadedMissions).toHaveLength(100);
    console.log(`loadMissions for 100 missions took ${duration.toFixed(2)}ms`);
  });

  it('saveProgressUpdates completes within acceptable time for 100 updates', () => {
    const missions = createMockMissions(10);
    const progressUpdatesArray = Array.from({ length: 100 }, (_, i) => ({
      id: generateMockId(),
      missionId: missions[i % 10].id, // Use actual mission IDs from missions
      content: `Progress update ${i}`,
      timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
    }));

    // Convert to Record format
    const progressUpdates: Record<string, any[]> = {};
    progressUpdatesArray.forEach(update => {
      if (!progressUpdates[update.missionId]) {
        progressUpdates[update.missionId] = [];
      }
      progressUpdates[update.missionId].push(update);
    });

    const startTime = performance.now();
    
    storage.saveProgressUpdates(progressUpdates);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 30ms for 100 progress updates
    expect(duration).toBeLessThan(30);
    console.log(`saveProgressUpdates for 100 updates took ${duration.toFixed(2)}ms`);
  });

  it('loadProgressUpdates completes within acceptable time', () => {
    const missions = createMockMissions(50);
    // First save some progress updates
    const progressUpdatesArray = Array.from({ length: 50 }, (_, i) => ({
      id: generateMockId(),
      missionId: missions[i].id, // Use actual mission IDs from missions
      content: `Progress update ${i}`,
      timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
    }));

    // Convert to Record format
    const progressUpdates: Record<string, any[]> = {};
    progressUpdatesArray.forEach(update => {
      if (!progressUpdates[update.missionId]) {
        progressUpdates[update.missionId] = [];
      }
      progressUpdates[update.missionId].push(update);
    });
    
    storage.saveProgressUpdates(progressUpdates);
    
    const startTime = performance.now();
    
    const loadedUpdates = storage.loadProgressUpdates();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 10ms for loading
    expect(duration).toBeLessThan(10);
    console.log(`loadProgressUpdates took ${duration.toFixed(2)}ms`);
  });

  it('getStorageUsage completes within acceptable time', () => {
    // Save some data first
    const missions = createMockMissions(50);
    storage.saveMissions(missions);
    
    const startTime = performance.now();
    
    const usage = storage.getStorageUsage();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 5ms
    expect(duration).toBeLessThan(5);
    expect(usage.used).toBeGreaterThan(0);
    console.log(`getStorageUsage took ${duration.toFixed(2)}ms`);
  });

  it('validateAndRepairData completes within acceptable time', () => {
    // Save some data with potential issues
    const missions = createMockMissions(10);
    const missionsWithIssues = [
      ...missions,
      // Add some potentially invalid data
      { id: 'invalid', title: '', description: '', status: 'invalid' as any, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ] as Mission[];
    
    storage.saveMissions(missionsWithIssues);
    
    const startTime = performance.now();
    
    const result = storage.validateAndRepairData();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 20ms for validation and repair
    expect(duration).toBeLessThan(20);
    expect(result.repaired).toBe(true);
    console.log(`validateAndRepairData took ${duration.toFixed(2)}ms`);
  });

  it('batch operations scale linearly', async () => {
    const sizes = [10, 25, 50, 100];
    const timings: number[] = [];
    
    for (const size of sizes) {
      const missions = createMockMissions(size);
      
      const startTime = performance.now();
      storage.saveMissions(missions);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      timings.push(duration);
      
      console.log(`saveMissions for ${size} missions took ${duration.toFixed(2)}ms`);
    }
    
    // Check that timing scales reasonably (not exponentially)
    // 100 missions should take less than 10x the time of 10 missions
    expect(timings[3]).toBeLessThan(timings[0] * 10);
  });

  it('concurrent operations handle gracefully', async () => {
    const promises: Promise<void>[] = [];
    const missions = createMockMissions(100);
    
    // Create multiple concurrent operations
    for (let i = 0; i < 10; i++) {
      promises.push(Promise.resolve(storage.saveMissions(missions.slice(i * 10, (i + 1) * 10))));
    }
    
    const startTime = performance.now();
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time even with concurrent operations
    expect(duration).toBeLessThan(100);
    console.log(`Concurrent save operations took ${duration.toFixed(2)}ms`);
  });

  it('storage quota check is fast', async () => {
    const startTime = performance.now();
    
    const isNearCapacity = storage.isStorageNearCapacity();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 1ms
    expect(duration).toBeLessThan(1);
    console.log(`isStorageNearCapacity took ${duration.toFixed(2)}ms`);
  });

  it('clear operation is fast', () => {
    // Save some data first
    const missions = createMockMissions(50);
    storage.saveMissions(missions);
    
    const startTime = performance.now();
    
    storage.clear();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within 5ms
    expect(duration).toBeLessThan(5);
    console.log(`clear operation took ${duration.toFixed(2)}ms`);
  });
});
