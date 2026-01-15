import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../../App';
import { StorageService } from '../../services/storage';
import { toastService } from '../../lib/toast';
import type { Mission } from '../../types';
import { MissionStatus } from '../../types/mission';

// Mock dependencies
vi.mock('../../services/storage');
vi.mock('../../lib/toast');

const mockStorageService = vi.mocked(StorageService);
const mockToastService = vi.mocked(toastService);

describe('Mission User Flows', () => {
  let mockStorage: StorageService;

  beforeEach(() => {
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
  });

  it('user can create a new mission', async () => {
    render(<App />);

    // Find and click the "Add Mission" button
    const addMissionButton = screen.getByRole('button', { name: /add mission/i });
    expect(addMissionButton).toBeInTheDocument();
    
    fireEvent.click(addMissionButton);

    // Fill out the mission form
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create mission/i });

    fireEvent.change(titleInput, { target: { value: 'Test Mission' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test mission description' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify mission was created
    await waitFor(() => {
      expect(mockStorage.saveMissions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Mission',
            description: 'Test mission description',
            status: MissionStatus.NotStarted,
            isActive: true
          })
        ])
      );
    });

    // Verify success toast was shown
    expect(mockToastService.missionCreated).toHaveBeenCalledWith('Test Mission');
  });

  it('user can edit an existing mission', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Original Title',
      description: 'Original Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Wait for mission to load
    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });

    // Find and click the Edit button
    const editButton = screen.getByLabelText(/edit mission: original title/i);
    fireEvent.click(editButton);

    // Update the mission
    const titleInput = screen.getByDisplayValue('Original Title');
    const descriptionInput = screen.getByDisplayValue('Original Description');
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    fireEvent.click(saveButton);

    // Verify mission was updated
    await waitFor(() => {
      expect(mockStorage.saveMissions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-mission-id',
            title: 'Updated Title',
            description: 'Updated Description'
          })
        ])
      );
    });

    // Verify success toast was shown
    expect(mockToastService.missionUpdated).toHaveBeenCalledWith('Updated Title');
  });

  it('user can delete a mission with confirmation', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Mission to Delete',
      description: 'Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Wait for mission to load
    await waitFor(() => {
      expect(screen.getByText('Mission to Delete')).toBeInTheDocument();
    });

    // Find and click the Delete button
    const deleteButton = screen.getByLabelText(/delete mission: mission to delete/i);
    fireEvent.click(deleteButton);

    // Confirm deletion in the dialog
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Verify mission was deleted
    await waitFor(() => {
      expect(mockStorage.saveMissions).toHaveBeenCalledWith([]);
    });

    // Verify success toast was shown
    expect(mockToastService.missionDeleted).toHaveBeenCalledWith('Mission to Delete');
  });

  it('user can change mission status', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Test Mission',
      description: 'Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Wait for mission to load
    await waitFor(() => {
      expect(screen.getByText('Test Mission')).toBeInTheDocument();
    });

    // Find and change the status dropdown
    const statusSelect = screen.getByLabelText(/change status for mission: test mission/i);
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

    // Verify status was changed
    await waitFor(() => {
      expect(mockStorage.saveMissions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-mission-id',
            status: MissionStatus.InProgress
          })
        ])
      );
    });
  });

  it('user can add progress update', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Test Mission',
      description: 'Description',
      status: MissionStatus.InProgress,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Wait for mission to load
    await waitFor(() => {
      expect(screen.getByText('Test Mission')).toBeInTheDocument();
    });

    // Click on mission to view details
    const missionCard = screen.getByRole('button', { name: /mission: test mission/i });
    fireEvent.click(missionCard);

    // Wait for detail view to load
    await waitFor(() => {
      expect(screen.getByText(/add progress update/i)).toBeInTheDocument();
    });

    // Add progress update
    const progressTextarea = screen.getByRole('textbox', { name: /add progress update/i });
    const submitButton = screen.getByRole('button', { name: /add update/i });

    fireEvent.change(progressTextarea, { target: { value: 'Made great progress today!' } });
    fireEvent.click(submitButton);

    // Verify progress update was added
    await waitFor(() => {
      expect(mockStorage.saveProgressUpdates).toHaveBeenCalledWith({
        'test-mission-id': expect.arrayContaining([
          expect.objectContaining({
            missionId: 'test-mission-id',
            content: 'Made great progress today!'
          })
        ])
      });
    });

    // Verify success toast was shown
    expect(mockToastService.progressAdded).toHaveBeenCalled();
  });

  it('data persists after page reload (mock)', async () => {
    // Create a mission
    const testMission: Mission = {
      id: 'test-mission-id',
      title: 'Persistent Mission',
      description: 'Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    // Mock storage to return the mission on load
    (mockStorage.loadMissions as any).mockReturnValue([testMission]);

    render(<App />);

    // Verify mission is loaded from storage
    await waitFor(() => {
      expect(screen.getByText('Persistent Mission')).toBeInTheDocument();
    });

    // Verify the mission data is correct
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('not_started');
  });

  it('handles storage errors gracefully', async () => {
    // Mock storage error on load
    (mockStorage.loadMissions as any).mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    render(<App />);

    // Verify error toast is shown
    await waitFor(() => {
      expect(mockToastService.storageError).toHaveBeenCalledWith('Storage access denied');
    });

    // Verify app still renders with empty state
    expect(screen.getByText(/no missions yet/i)).toBeInTheDocument();
  });

  it('validates mission creation form', async () => {
    render(<App />);

    // Click Add Mission button
    const addMissionButton = screen.getByRole('button', { name: /add mission/i });
    fireEvent.click(addMissionButton);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /create mission/i });
    fireEvent.click(submitButton);

    // Verify validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(mockStorage.saveMissions).not.toHaveBeenCalled();
  });

  it('validates progress update form', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Test Mission',
      description: 'Description',
      status: MissionStatus.InProgress,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Navigate to mission detail
    await waitFor(() => {
      const missionCard = screen.getByRole('button', { name: /mission: test mission/i });
      fireEvent.click(missionCard);
    });

    // Wait for detail view
    await waitFor(() => {
      expect(screen.getByText(/add progress update/i)).toBeInTheDocument();
    });

    // Try to submit empty progress update
    const submitButton = screen.getByRole('button', { name: /add update/i });
    fireEvent.click(submitButton);

    // Verify validation error
    expect(screen.getByText(/progress update is required/i)).toBeInTheDocument();
    expect(mockStorage.saveProgressUpdates).not.toHaveBeenCalled();
  });

  it('handles mission limit enforcement', async () => {
    // Mock 10 existing missions (the limit)
    const existingMissions: Mission[] = Array.from({ length: 10 }, (_, i) => ({
      id: `mission-${i}`,
      title: `Mission ${i + 1}`,
      description: `Description ${i + 1}`,
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    }));

    (mockStorage.loadMissions as any).mockReturnValue(existingMissions);

    render(<App />);

    // Wait for missions to load
    await waitFor(() => {
      expect(screen.getByText(/10 of 10 missions used/i)).toBeInTheDocument();
    });

    // Add Mission button should be disabled or show limit message
    const addMissionButton = screen.getByRole('button', { name: /add mission/i });
    expect(addMissionButton).toBeDisabled();
  });

  it('supports keyboard navigation', async () => {
    // Mock existing mission
    const existingMission: Mission = {
      id: 'test-mission-id',
      title: 'Test Mission',
      description: 'Description',
      status: MissionStatus.NotStarted,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    (mockStorage.loadMissions as any).mockReturnValue([existingMission]);

    render(<App />);

    // Wait for mission to load
    await waitFor(() => {
      expect(screen.getByText('Test Mission')).toBeInTheDocument();
    });

    // Test keyboard navigation to mission card
    const missionCard = screen.getByRole('button', { name: /mission: test mission/i });
    
    // Tab to mission card
    missionCard.focus();
    expect(missionCard).toHaveFocus();

    // Press Enter to view details
    fireEvent.keyDown(missionCard, { key: 'Enter' });

    // Verify navigation to detail view
    await waitFor(() => {
      expect(screen.getByText(/add progress update/i)).toBeInTheDocument();
    });
  });

  it('maintains mission statistics', async () => {
    // Mock missions with different statuses
    const missions: Mission[] = [
      {
        id: 'mission-1',
        title: 'Mission 1',
        description: 'Description',
        status: MissionStatus.NotStarted,
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'mission-2',
        title: 'Mission 2',
        description: 'Description',
        status: MissionStatus.InProgress,
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'mission-3',
        title: 'Mission 3',
        description: 'Description',
        status: MissionStatus.Completed,
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    (mockStorage.loadMissions as any).mockReturnValue(missions);

    render(<App />);

    // Verify statistics are displayed correctly
    await waitFor(() => {
      expect(screen.getByText('3 missions')).toBeInTheDocument();
      expect(screen.getByText('1 completed')).toBeInTheDocument();
      expect(screen.getByText('33.3%')).toBeInTheDocument(); // 1/3 * 100
    });
  });
});
