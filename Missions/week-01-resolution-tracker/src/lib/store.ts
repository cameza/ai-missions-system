import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Mission, ProgressUpdate, ViewType, AppState } from '../types';

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
}

export const useMissionStore = create<MissionStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        missions: [],
        progressUpdates: {},
        currentView: 'dashboard',
        selectedMissionId: null,
        isLoading: false,
        error: null,
        isCreatingMission: false,
        editingMissionId: null,
        
        // Storage Actions (handled by persist middleware)
        loadFromStorage: () => {
          // Handled by persist middleware
        },
        
        saveToStorage: () => {
          // Handled by persist middleware
        },
        
        // Mission Actions
        createMission: (missionData) => {
          const mission: Mission = {
            ...missionData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            missions: [...state.missions, mission],
          }));
        },
        
        updateMission: (id, updates) => {
          set((state) => ({
            missions: state.missions.map((mission) =>
              mission.id === id
                ? { ...mission, ...updates, updatedAt: new Date() }
                : mission
            ),
          }));
        },
        
        deleteMission: (id) => {
          set((state) => ({
            missions: state.missions.filter((mission) => mission.id !== id),
            progressUpdates: Object.fromEntries(
              Object.entries(state.progressUpdates).filter(([missionId]) => missionId !== id)
            ),
          }));
        },
        
        // Progress Actions
        addProgressUpdate: (missionId, content) => {
          const update: ProgressUpdate = {
            id: crypto.randomUUID(),
            missionId,
            content,
            timestamp: new Date(),
          };
          
          set((state) => ({
            progressUpdates: {
              ...state.progressUpdates,
              [missionId]: [...(state.progressUpdates[missionId] || []), update],
            },
          }));
        },
        
        // UI Actions
        setCurrentView: (view) => set({ currentView: view }),
        setSelectedMissionId: (id) => set({ selectedMissionId: id }),
        setError: (error) => set({ error }),
        setIsCreatingMission: (isCreating) => set({ isCreatingMission: isCreating }),
        setEditingMissionId: (id) => set({ editingMissionId: id }),
      }),
      {
        name: 'ai-missions-tracker',
        partialize: (state) => ({
          missions: state.missions,
          progressUpdates: state.progressUpdates,
        }),
      }
    )
  )
);
