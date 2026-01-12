import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Mission, ProgressUpdate, ViewType, AppState } from '../types';
import { StorageService } from '../services/storage';

/**
 * Interface for the Mission Store extending AppState with actions
 */
interface MissionStore extends AppState {
  // Actions
  loadFromStorage: () => void;
  saveToStorage: () => void;
  
  // Mission Actions
  createMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  
  // Progress Actions
  addProgressUpdate: (missionId: string, content: string) => void;
  
  // UI Actions
  setCurrentView: (view: ViewType) => void;
  setSelectedMissionId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setIsCreatingMission: (isCreating: boolean) => void;
  setEditingMissionId: (id: string | null) => void;
  
  // Error handling actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Zustand store for mission management with StorageService integration
 */
export const useMissionStore = create<MissionStore>()(
  devtools(
    (set, get) => {
      // Initialize StorageService
      const storageService = new StorageService();
      
      // Load initial data from storage
      const loadFromStorage = () => {
        try {
          const missions = storageService.loadMissions();
          const progressUpdates = storageService.loadProgressUpdates();
          
          set({
            missions,
            progressUpdates,
            error: null,
          });
        } catch (error) {
          console.error('Failed to load from storage:', error);
          // Use initial state on load failure
          set({
            missions: [],
            progressUpdates: {},
            error: 'Failed to load data from storage',
          });
        }
      };

      // Load initial data on store creation
      loadFromStorage();
      
      return {
        // Initial State
        missions: [],
        progressUpdates: {},
        currentView: 'dashboard',
        selectedMissionId: null,
        isLoading: false,
        error: null,
        isCreatingMission: false,
        editingMissionId: null,
        
        // Storage Actions
        loadFromStorage,
        saveToStorage: () => {
          try {
            const state = get();
            storageService.saveMissions(state.missions);
            storageService.saveProgressUpdates(state.progressUpdates);
          } catch (error) {
            console.error('Failed to save to storage:', error);
            set({ error: 'Failed to save data to storage' });
          }
        },
        
        // Mission Actions
        createMission: (missionData) => {
          try {
            const mission: Mission = {
              ...missionData,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            set((state) => ({
              missions: [...state.missions, mission],
              error: null,
            }));
            
            // Save after creating
            get().saveToStorage();
          } catch (error) {
            set({ error: 'Failed to create mission' });
            console.error('Create mission error:', error);
          }
        },
        
        updateMission: (id, updates) => {
          try {
            set((state) => ({
              missions: state.missions.map((mission) =>
                mission.id === id
                  ? { ...mission, ...updates, updatedAt: new Date() }
                  : mission
              ),
              error: null,
            }));
            
            // Save after updating
            get().saveToStorage();
          } catch (error) {
            set({ error: 'Failed to update mission' });
            console.error('Update mission error:', error);
          }
        },
        
        deleteMission: (id) => {
          try {
            set((state) => ({
              missions: state.missions.filter((mission) => mission.id !== id),
              progressUpdates: Object.fromEntries(
                Object.entries(state.progressUpdates).filter(([missionId]) => missionId !== id)
              ),
              error: null,
            }));
            
            // Save after deleting
            get().saveToStorage();
          } catch (error) {
            set({ error: 'Failed to delete mission' });
            console.error('Delete mission error:', error);
          }
        },
        
        // Progress Actions
        addProgressUpdate: (missionId, content) => {
          try {
            const update: ProgressUpdate = {
              id: crypto.randomUUID(),
              missionId,
              content,
              timestamp: new Date(),
            };
            
            set((state) => ({
              progressUpdates: {
                ...state.progressUpdates,
                [missionId]: [update, ...(state.progressUpdates[missionId] || [])],
              },
              error: null,
            }));
            
            // Save after adding progress
            get().saveToStorage();
          } catch (error) {
            set({ error: 'Failed to add progress update' });
            console.error('Add progress update error:', error);
          }
        },
        
        // UI Actions
        setCurrentView: (view) => set({ currentView: view }),
        setSelectedMissionId: (id) => set({ selectedMissionId: id }),
        setError: (error) => set({ error }),
        setIsCreatingMission: (isCreating) => set({ isCreatingMission: isCreating }),
        setEditingMissionId: (id) => set({ editingMissionId: id }),
        
        // Error handling actions
        clearError: () => set({ error: null }),
        setLoading: (loading) => set({ isLoading: loading }),
      };
    }
  )
);

/**
 * Derived selectors for statistics and filters
 */
export const useMissionStats = () => {
  const missions = useMissionStore((state) => state.missions);
  
  return {
    total: missions.length,
    notStarted: missions.filter(m => m.status === 'not_started').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
    blocked: missions.filter(m => m.status === 'blocked').length,
    completionPercentage: missions.length > 0 
      ? (missions.filter(m => m.status === 'completed').length / missions.length) * 100 
      : 0,
  };
};

/**
 * Selector for missions filtered by status
 */
export const useMissionsByStatus = (status: Mission['status']) => {
  return useMissionStore((state) => 
    state.missions.filter(mission => mission.status === status)
  );
};

/**
 * Selector for progress updates of a specific mission
 */
export const useMissionProgress = (missionId: string) => {
  return useMissionStore((state) => 
    state.progressUpdates[missionId] || []
  );
};

/**
 * Selector for mission by ID
 */
export const useMissionById = (missionId: string) => {
  return useMissionStore((state) => 
    state.missions.find(mission => mission.id === missionId)
  );
};

/**
 * Selector for active missions
 */
export const useActiveMissions = () => {
  return useMissionStore((state) => 
    state.missions.filter(mission => mission.isActive)
  );
};
