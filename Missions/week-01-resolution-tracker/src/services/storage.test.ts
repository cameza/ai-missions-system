import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './storage';
import type { Mission, ProgressUpdate } from '../types';
import { MissionStatus } from '../types/mission';

describe('StorageService', () => {
  let storageService: StorageService;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    // Clear localStorage mock
    mockLocalStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
    });

    storageService = new StorageService();
  });

  describe('saveMissions / loadMissions', () => {
    const validMission: Mission = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Mission',
      description: 'Test Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    it('saves valid missions to localStorage', () => {
      storageService.saveMissions([validMission]);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-missions:tracker:missions',
        expect.stringContaining('"id":"550e8400-e29b-41d4-a716-446655440000"')
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-missions:tracker:version',
        '1.0'
      );
    });

    it('loads missions with date transformation', () => {
      // Save mission with Date objects
      storageService.saveMissions([validMission]);
      
      // Load and verify dates are transformed correctly
      const loadedMissions = storageService.loadMissions();
      
      expect(loadedMissions).toHaveLength(1);
      expect(loadedMissions[0].id).toBe(validMission.id);
      expect(loadedMissions[0].createdAt).toBeInstanceOf(Date);
      expect(loadedMissions[0].updatedAt).toBeInstanceOf(Date);
      expect(loadedMissions[0].createdAt.getTime()).toBe(validMission.createdAt.getTime());
    });

    it('returns empty array when no data', () => {
      const missions = storageService.loadMissions();
      expect(missions).toEqual([]);
    });

    it('filters out invalid missions on load', () => {
      // Mix of valid and invalid missions
      const invalidMission1 = { id: 'invalid-id', title: '' }; // Missing required fields
      const invalidMission2 = { id: 'not-a-uuid', title: 'Test', status: 'invalid', isActive: true, createdAt: 'date', updatedAt: 'date' };
      
      mockLocalStorage['ai-missions:tracker:missions'] = JSON.stringify([
        validMission,
        invalidMission1,
        invalidMission2,
      ]);

      const missions = storageService.loadMissions();
      
      expect(missions).toHaveLength(1);
      expect(missions[0].id).toBe(validMission.id);
    });

    it('throws on quota exceeded', () => {
      // Mock DOMException for quota exceeded
      const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });

      expect(() => storageService.saveMissions([validMission])).toThrow(
        'Storage quota exceeded. Please delete some missions.'
      );
    });

    it('throws on invalid mission data', () => {
      const invalidMission = { ...validMission, title: '' }; // Empty title

      expect(() => storageService.saveMissions([invalidMission])).toThrow(
        'Invalid mission data'
      );
    });
  });

  describe('saveProgressUpdates / loadProgressUpdates', () => {
    const validProgressUpdate: ProgressUpdate = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      missionId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Test progress update',
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const progressUpdates: Record<string, ProgressUpdate[]> = {
      '550e8400-e29b-41d4-a716-446655440000': [validProgressUpdate],
    };

    it('saves valid progress updates', () => {
      storageService.saveProgressUpdates(progressUpdates);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-missions:tracker:progress',
        expect.stringContaining('"id":"550e8400-e29b-41d4-a716-446655440001"')
      );
    });

    it('loads with date transformation', () => {
      storageService.saveProgressUpdates(progressUpdates);
      
      const loadedUpdates = storageService.loadProgressUpdates();
      
      expect(loadedUpdates).toHaveProperty('550e8400-e29b-41d4-a716-446655440000');
      expect(loadedUpdates['550e8400-e29b-41d4-a716-446655440000']).toHaveLength(1);
      expect(loadedUpdates['550e8400-e29b-41d4-a716-446655440000'][0].timestamp).toBeInstanceOf(Date);
    });

    it('returns empty object when no data', () => {
      const updates = storageService.loadProgressUpdates();
      expect(updates).toEqual({});
    });

    it('filters invalid updates', () => {
      const invalidUpdate = { id: 'invalid', content: '' }; // Missing required fields
      
      mockLocalStorage['ai-missions:tracker:progress'] = JSON.stringify({
        '550e8400-e29b-41d4-a716-446655440000': [validProgressUpdate, invalidUpdate],
      });

      const updates = storageService.loadProgressUpdates();
      
      expect(updates['550e8400-e29b-41d4-a716-446655440000']).toHaveLength(1);
      expect(updates['550e8400-e29b-41d4-a716-446655440000'][0].id).toBe(validProgressUpdate.id);
    });

    it('throws on quota exceeded for progress updates', () => {
      const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });

      expect(() => storageService.saveProgressUpdates(progressUpdates)).toThrow(
        'Storage quota exceeded. Please delete some progress updates.'
      );
    });
  });

  describe('getStorageUsage', () => {
    it('calculates used/available/percentage', () => {
      // Add some data to localStorage
      mockLocalStorage['ai-missions:tracker:missions'] = JSON.stringify([{ id: 'test', title: 'Test' }]);
      mockLocalStorage['ai-missions:tracker:progress'] = JSON.stringify({});

      const usage = storageService.getStorageUsage();

      expect(usage.used).toBeGreaterThan(0);
      expect(usage.available).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThan(0);
      expect(usage.percentage).toBeLessThan(100);
    });

    it('returns zero usage when no data', () => {
      const usage = storageService.getStorageUsage();

      expect(usage.used).toBe(0);
      expect(usage.available).toBe(5 * 1024 * 1024); // 5MB estimated
      expect(usage.percentage).toBe(0);
    });
  });

  describe('isStorageNearCapacity', () => {
    it('returns true when > 80%', () => {
      // Mock storage usage calculation
      const largeData = 'x'.repeat(4 * 1024 * 1024); // 4MB of data
      mockLocalStorage['ai-missions:tracker:missions'] = largeData;

      const isNearCapacity = storageService.isStorageNearCapacity();
      expect(isNearCapacity).toBe(true);
    });

    it('returns false when < 80%', () => {
      const smallData = JSON.stringify([{ id: 'test', title: 'Test' }]);
      mockLocalStorage['ai-missions:tracker:missions'] = smallData;

      const isNearCapacity = storageService.isStorageNearCapacity();
      expect(isNearCapacity).toBe(false);
    });
  });

  describe('validateAndRepairData', () => {
    const validMission: Mission = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Mission',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    const validProgressUpdate: ProgressUpdate = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      missionId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Test progress update',
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    it('repairs corrupted missions', () => {
      // Mix of valid and invalid missions
      const invalidMission = { id: 'invalid', title: '', status: 'invalid' };
      mockLocalStorage['ai-missions:tracker:missions'] = JSON.stringify([
        validMission,
        invalidMission,
      ]);

      const result = storageService.validateAndRepairData();

      expect(result.repaired).toBe(true);
      expect(result.missionsRepaired).toBe(true);
      expect(result.stats.missionsFixed).toBe(1);
    });

    it('repairs corrupted progress updates', () => {
      const invalidUpdate = { id: 'invalid', content: '' };
      mockLocalStorage['ai-missions:tracker:progress'] = JSON.stringify({
        '550e8400-e29b-41d4-a716-446655440000': [validProgressUpdate, invalidUpdate],
      });

      const result = storageService.validateAndRepairData();

      expect(result.repaired).toBe(true);
      expect(result.progressRepaired).toBe(true);
      expect(result.stats.progressFixed).toBe(1);
    });

    it('returns no repair when data is valid', () => {
      storageService.saveMissions([validMission]);
      storageService.saveProgressUpdates({
        '550e8400-e29b-41d4-a716-446655440000': [validProgressUpdate],
      });

      const result = storageService.validateAndRepairData();

      expect(result.repaired).toBe(false);
      expect(result.missionsRepaired).toBe(false);
      expect(result.progressRepaired).toBe(false);
      expect(result.stats.missionsFixed).toBe(0);
      expect(result.stats.progressFixed).toBe(0);
    });

    it('handles errors gracefully', () => {
      // Mock JSON.parse to throw an error
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('JSON parse error');
      });

      const result = storageService.validateAndRepairData();

      expect(result.repaired).toBe(false);
      expect(result.missionsRepaired).toBe(false);
      expect(result.progressRepaired).toBe(false);
      expect(result.stats.missionsFixed).toBe(0);
      expect(result.stats.progressFixed).toBe(0);
    });
  });

  describe('clear', () => {
    it('removes all storage keys', () => {
      // Add some data
      mockLocalStorage['ai-missions:tracker:missions'] = 'test-data';
      mockLocalStorage['ai-missions:tracker:progress'] = 'test-data';
      mockLocalStorage['ai-missions:tracker:version'] = '1.0';

      storageService.clear();

      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-missions:tracker:missions');
      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-missions:tracker:progress');
      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-missions:tracker:version');
    });
  });

  describe('getDataVersion', () => {
    it('returns version when set', () => {
      mockLocalStorage['ai-missions:tracker:version'] = '1.0';
      
      const version = storageService.getDataVersion();
      expect(version).toBe('1.0');
    });

    it('returns null when not set', () => {
      const version = storageService.getDataVersion();
      expect(version).toBe(null);
    });
  });
});
