import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useMissionStore,
  useMissionStats,
  useMissionsByStatus,
  useMissionProgress,
  useMissionById,
  useActiveMissions
} from './missionStore';
import { StorageService } from '../services/storage';
import { toastService } from '../lib/toast';
import type { Mission, ProgressUpdate } from '../types';
import { MissionStatus } from '../types/mission';

// Mock dependencies
vi.mock('../services/storage');
vi.mock('../lib/toast');
vi.mock('../utils/date', () => ({
  formatRelativeTime: vi.fn((date: Date) => 'Today'),
}));

const mockStorageService = vi.mocked(StorageService);
const mockToastService = vi.mocked(toastService);

describe('useMissionStore', () => {
  let mockStorage: StorageService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock storage instance
    mockStorage = {
      loadMissions: vi.fn().mockReturnValue([]),
      loadProgressUpdates: vi.fn().mockReturnValue({}),
      saveMissions: vi.fn(),
      saveProgressUpdates: vi.fn(),
      isStorageNearCapacity: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
      getStorageUsage: vi.fn().mockReturnValue({ used: 0, available: 5242880, percentage: 0 }),
      getDataVersion: vi.fn().mockReturnValue('1.0'),
      validateAndRepairData: vi.fn().mockReturnValue({
        repaired: false,
        missionsRepaired: false,
        progressRepaired: false,
        stats: { missionsFixed: 0, progressFixed: 0 }
      })
    } as any;

    mockStorageService.mockImplementation(() => mockStorage);
    
    // Reset store state
    useMissionStore.setState({
      missions: [],
      progressUpdates: {},
      currentView: 'dashboard',
      selectedMissionId: null,
      isLoading: false,
      error: null,
      isCreatingMission: false,
      editingMissionId: null,
    });
  });

  describe('createMission', () => {
    const missionData = {
      title: 'Test Mission',
      description: 'Test Description',
      status: MissionStatus.NotStarted,
      isActive: true,
    };

    it('adds mission with generated id and timestamps', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.createMission(missionData);
      });

      const state = result.current;
      expect(state.missions).toHaveLength(1);
      expect(state.missions[0].id).toMatch(/^[0-9a-f-]+$/); // UUID format
      expect(state.missions[0].title).toBe(missionData.title);
      expect(state.missions[0].createdAt).toBeInstanceOf(Date);
      expect(state.missions[0].updatedAt).toBeInstanceOf(Date);
    });

    it('persists to storage', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.createMission(missionData);
      });

      expect(mockStorage.saveMissions).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ title: missionData.title })])
      );
      expect(mockStorage.saveProgressUpdates).toHaveBeenCalled();
    });

    it('shows success toast', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.createMission(missionData);
      });

      expect(mockToastService.missionCreated).toHaveBeenCalledWith(missionData.title);
    });

    it('handles errors gracefully', () => {
      (mockStorage.saveMissions as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.createMission(missionData);
      });

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to create mission');
      expect(result.current.error).toBe('Failed to create mission');
    });
  });

  describe('updateMission', () => {
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Original Title',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    beforeEach(() => {
      useMissionStore.setState({ missions: [existingMission] });
    });

    it('updates mission fields and updatedAt timestamp', () => {
      const { result } = renderHook(() => useMissionStore());
      const updates = { title: 'Updated Title', status: MissionStatus.InProgress };

      act(() => {
        result.current.updateMission(existingMission.id, updates);
      });

      const updatedMission = result.current.missions.find(m => m.id === existingMission.id);
      expect(updatedMission).toBeDefined();
      expect(updatedMission!.title).toBe(updates.title);
      expect(updatedMission!.status).toBe(updates.status);
      expect(updatedMission!.updatedAt.getTime()).toBeGreaterThan(existingMission.updatedAt.getTime());
    });

    it('persists to storage', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.updateMission(existingMission.id, { title: 'Updated Title' });
      });

      expect(mockStorage.saveMissions).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ title: 'Updated Title' })])
      );
    });

    it('shows success toast', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.updateMission(existingMission.id, { title: 'Updated Title' });
      });

      expect(mockToastService.missionUpdated).toHaveBeenCalledWith('Updated Title');
    });

    it('handles errors gracefully', () => {
      (mockStorage.saveMissions as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.updateMission(existingMission.id, { title: 'Updated Title' });
      });

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to update mission');
      expect(result.current.error).toBe('Failed to update mission');
    });
  });

  describe('deleteMission', () => {
    const missionToDelete: Mission = {
      id: 'delete-me-id',
      title: 'Mission to Delete',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    const missionToKeep: Mission = {
      id: 'keep-me-id',
      title: 'Mission to Keep',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    const progressUpdate: ProgressUpdate = {
      id: 'progress-id',
      missionId: 'delete-me-id',
      content: 'Test progress',
      timestamp: new Date('2024-01-10T10:00:00Z'),
    };

    beforeEach(() => {
      useMissionStore.setState({
        missions: [missionToDelete, missionToKeep],
        progressUpdates: {
          'delete-me-id': [progressUpdate],
          'keep-me-id': []
        }
      });
    });

    it('removes mission from state', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.deleteMission(missionToDelete.id, missionToDelete.title);
      });

      expect(result.current.missions).toHaveLength(1);
      expect(result.current.missions[0].id).toBe(missionToKeep.id);
      expect(result.current.missions.find(m => m.id === missionToDelete.id)).toBeUndefined();
    });

    it('removes associated progress updates', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.deleteMission(missionToDelete.id);
      });

      expect(result.current.progressUpdates['delete-me-id']).toBeUndefined();
      expect(result.current.progressUpdates['keep-me-id']).toEqual([]);
    });

    it('persists to storage', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.deleteMission(missionToDelete.id);
      });

      expect(mockStorage.saveMissions).toHaveBeenCalledWith([missionToKeep]);
      expect(mockStorage.saveProgressUpdates).toHaveBeenCalledWith({ 'keep-me-id': [] });
    });

    it('shows success toast when title provided', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.deleteMission(missionToDelete.id, missionToDelete.title);
      });

      expect(mockToastService.missionDeleted).toHaveBeenCalledWith(missionToDelete.title);
    });

    it('handles errors gracefully', () => {
      (mockStorage.saveMissions as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.deleteMission(missionToDelete.id);
      });

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete mission');
      expect(result.current.error).toBe('Failed to delete mission');
    });
  });

  describe('addProgressUpdate', () => {
    const missionId = 'test-mission-id';
    const content = 'New progress update';

    beforeEach(() => {
      useMissionStore.setState({
        missions: [{ id: missionId, title: 'Test Mission', status: MissionStatus.NotStarted, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
        progressUpdates: {}
      });
    });

    it('adds update with generated id and timestamp', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.addProgressUpdate(missionId, content);
      });

      const updates = result.current.progressUpdates[missionId];
      expect(updates).toHaveLength(1);
      expect(updates[0].id).toMatch(/^[0-9a-f-]+$/); // UUID format
      expect(updates[0].missionId).toBe(missionId);
      expect(updates[0].content).toBe(content);
      expect(updates[0].timestamp).toBeInstanceOf(Date);
    });

    it('prepends to existing updates (reverse chronological)', () => {
      const existingUpdate: ProgressUpdate = {
        id: 'existing-id',
        missionId,
        content: 'Existing update',
        timestamp: new Date('2024-01-10T10:00:00Z'),
      };

      useMissionStore.setState({
        progressUpdates: { [missionId]: [existingUpdate] }
      });

      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.addProgressUpdate(missionId, content);
      });

      const updates = result.current.progressUpdates[missionId];
      expect(updates).toHaveLength(2);
      expect(updates[0].content).toBe(content); // New update first
      expect(updates[1].content).toBe('Existing update'); // Existing update second
    });

    it('persists to storage', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.addProgressUpdate(missionId, content);
      });

      expect(mockStorage.saveMissions).toHaveBeenCalled();
      expect(mockStorage.saveProgressUpdates).toHaveBeenCalledWith({
        [missionId]: expect.arrayContaining([expect.objectContaining({ content })])
      });
    });

    it('shows success toast', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.addProgressUpdate(missionId, content);
      });

      expect(mockToastService.progressAdded).toHaveBeenCalled();
    });

    it('handles errors gracefully', () => {
      (mockStorage.saveMissions as any).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.addProgressUpdate(missionId, content);
      });

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to add progress update');
      expect(result.current.error).toBe('Failed to add progress update');
    });
  });

  describe('UI Actions', () => {
    it('setCurrentView updates view', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.setCurrentView('mission-detail');
      });

      expect(result.current.currentView).toBe('mission-detail');
    });

    it('setSelectedMissionId updates selected mission', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.setSelectedMissionId('test-id');
      });

      expect(result.current.selectedMissionId).toBe('test-id');
    });

    it('setError updates error state', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });

    it('clearError removes error', () => {
      const { result } = renderHook(() => useMissionStore());

      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

describe('Selectors', () => {
  beforeEach(() => {
    // Reset store state before each selector test
    useMissionStore.setState({
      missions: [],
      progressUpdates: {},
      currentView: 'dashboard',
      selectedMissionId: null,
      isLoading: false,
      error: null,
      isCreatingMission: false,
      editingMissionId: null,
    });
  });

  describe('useMissionStats', () => {
    it('calculates total, by status, completion percentage', () => {
      const missions: Mission[] = [
        { id: '1', title: 'Mission 1', status: MissionStatus.NotStarted, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Mission 2', status: MissionStatus.InProgress, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'Mission 3', status: MissionStatus.Completed, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', title: 'Mission 4', status: MissionStatus.Completed, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '5', title: 'Mission 5', status: MissionStatus.Blocked, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      useMissionStore.setState({ missions });

      const { result } = renderHook(() => useMissionStats());

      expect(result.current.total).toBe(5);
      expect(result.current.notStarted).toBe(1);
      expect(result.current.inProgress).toBe(1);
      expect(result.current.completed).toBe(2);
      expect(result.current.blocked).toBe(1);
      expect(result.current.completionPercentage).toBe(40); // 2/5 * 100
    });

    it('handles empty missions array', () => {
      const { result } = renderHook(() => useMissionStats());

      expect(result.current.total).toBe(0);
      expect(result.current.notStarted).toBe(0);
      expect(result.current.inProgress).toBe(0);
      expect(result.current.completed).toBe(0);
      expect(result.current.blocked).toBe(0);
      expect(result.current.completionPercentage).toBe(0);
    });
  });

  describe('useMissionsByStatus', () => {
    beforeEach(() => {
      const missions: Mission[] = [
        { id: '1', title: 'Mission 1', status: MissionStatus.NotStarted, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Mission 2', status: MissionStatus.InProgress, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'Mission 3', status: MissionStatus.InProgress, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      useMissionStore.setState({ missions });
    });

    it('filters missions by status correctly', () => {
      const { result: inProgressResult } = renderHook(() => useMissionsByStatus(MissionStatus.InProgress));
      const { result: notStartedResult } = renderHook(() => useMissionsByStatus(MissionStatus.NotStarted));
      const { result: completedResult } = renderHook(() => useMissionsByStatus(MissionStatus.Completed));

      expect(inProgressResult.current).toHaveLength(2);
      expect(notStartedResult.current).toHaveLength(1);
      expect(completedResult.current).toHaveLength(0);
    });
  });

  describe('useMissionProgress', () => {
    it('returns updates for mission', () => {
      const missionId = 'test-mission';
      const progressUpdates: Record<string, ProgressUpdate[]> = {
        [missionId]: [
          { id: '1', missionId, content: 'Update 1', timestamp: new Date() },
          { id: '2', missionId, content: 'Update 2', timestamp: new Date() },
        ],
        'other-mission': [
          { id: '3', missionId: 'other-mission', content: 'Other update', timestamp: new Date() },
        ],
      };

      useMissionStore.setState({ progressUpdates });

      const { result } = renderHook(() => useMissionProgress(missionId));

      expect(result.current).toHaveLength(2);
      expect(result.current[0].missionId).toBe(missionId);
    });

    it('returns empty array for unknown mission', () => {
      const { result } = renderHook(() => useMissionProgress('unknown-mission'));

      expect(result.current).toEqual([]);
    });
  });

  describe('useMissionById', () => {
    const missions: Mission[] = [
      { id: '1', title: 'Mission 1', status: MissionStatus.NotStarted, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', title: 'Mission 2', status: MissionStatus.InProgress, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    beforeEach(() => {
      useMissionStore.setState({ missions });
    });

    it('returns mission by ID', () => {
      const { result } = renderHook(() => useMissionById('1'));

      expect(result.current).toBeDefined();
      expect(result.current!.id).toBe('1');
      expect(result.current!.title).toBe('Mission 1');
    });

    it('returns undefined for unknown mission', () => {
      const { result } = renderHook(() => useMissionById('unknown'));

      expect(result.current).toBeUndefined();
    });
  });

  describe('useActiveMissions', () => {
    beforeEach(() => {
      const missions: Mission[] = [
        { id: '1', title: 'Active Mission 1', status: MissionStatus.NotStarted, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Inactive Mission', status: MissionStatus.InProgress, isActive: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'Active Mission 2', status: MissionStatus.Completed, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      useMissionStore.setState({ missions });
    });

    it('filters active missions only', () => {
      const { result } = renderHook(() => useActiveMissions());

      expect(result.current).toHaveLength(2);
      expect(result.current.every(m => m.isActive)).toBe(true);
      expect(result.current.map(m => m.title)).toEqual(['Active Mission 1', 'Active Mission 2']);
    });
  });
});
