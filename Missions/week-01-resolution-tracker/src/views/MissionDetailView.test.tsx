import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MissionDetailView } from './MissionDetailView';
import { useMissionStore, useMissionProgress } from '../store/missionStore';

// Mock the store
vi.mock('../store/missionStore', () => ({
  useMissionStore: vi.fn(),
  useMissionProgress: vi.fn(),
}));

// Mock the toast hook
vi.mock('../hooks/useToast', () => ({
  useToast: vi.fn(() => ({
    missionDeleted: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock the ProgressTimeline component
vi.mock('../components/Progress/ProgressTimeline', () => ({
  ProgressTimeline: () => <div data-testid="progress-timeline">Progress Timeline</div>,
}));

// Mock the ProgressForm component
vi.mock('../components/Progress/ProgressForm', () => ({
  ProgressForm: ({ onSubmit }: { onSubmit: (data: { content: string }) => void }) => (
    <form data-testid="progress-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ content: 'Test progress' });
    }}>
      <button type="submit">Submit</button>
    </form>
  ),
}));

// Mock the StatusBadge component
vi.mock('../components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <div data-testid="status-badge">{status}</div>
  ),
}));

describe('MissionDetailView', () => {
  const mockMission = {
    id: 'test-mission-id',
    title: 'Test Mission',
    description: 'Test description',
    status: 'in_progress' as const,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProgressUpdates = [
    {
      id: 'progress-1',
      missionId: 'test-mission-id',
      content: 'First progress update',
      timestamp: new Date('2024-01-02'),
    },
  ];

  const mockStore = {
    missions: [mockMission],
    updateMission: vi.fn(),
    deleteMission: vi.fn(),
    addProgressUpdate: vi.fn(),
  };

  const mockProgress = vi.fn(() => mockProgressUpdates);

  beforeEach(() => {
    vi.clearAllMocks();
    (useMissionStore as any).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
    (useMissionProgress as any).mockReturnValue(mockProgressUpdates);
  });

  it('renders mission details correctly', () => {
    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Test Mission')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('in_progress');
    expect(screen.getByTestId('progress-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('progress-form')).toBeInTheDocument();
  });

  it('shows not found state when mission does not exist', () => {
    (useMissionStore as any).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ ...mockStore, missions: [] });
      }
      return { ...mockStore, missions: [] };
    });

    render(
      <MissionDetailView
        missionId="non-existent-id"
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Mission not found')).toBeInTheDocument();
    expect(screen.getByText('The mission you\'re looking for was removed or never existed.')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    (useMissionStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ ...mockStore, deleteMission: mockDelete });
      }
      return { ...mockStore, deleteMission: mockDelete };
    });

    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    // Click the delete button in the header
    const deleteButtons = screen.getAllByRole('button');
    const headerDeleteButton = deleteButtons.find(btn => 
      btn.textContent?.includes('Delete') && !btn.textContent?.includes('Mission')
    );
    
    expect(headerDeleteButton).toBeDefined();
    fireEvent.click(headerDeleteButton!);

    // Wait for the ConfirmDialog to appear - check for the confirmation message
    await waitFor(() => {
      const confirmationText = screen.queryByText(/Are you sure you want to delete/);
      expect(confirmationText).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls deleteMission when delete is confirmed', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockOnBack = vi.fn();
    (useMissionStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ ...mockStore, deleteMission: mockDelete });
      }
      return { ...mockStore, deleteMission: mockDelete };
    });

    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={mockOnBack}
        onEdit={vi.fn()}
      />
    );

    // Click the delete button in the header
    const deleteButtons = screen.getAllByRole('button');
    const headerDeleteButton = deleteButtons.find(btn => 
      btn.textContent?.includes('Delete') && !btn.textContent?.includes('Mission')
    );
    
    expect(headerDeleteButton).toBeDefined();
    fireEvent.click(headerDeleteButton!);

    // Wait for the ConfirmDialog to appear
    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete/)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find the confirm button - look for button with "Delete Mission" text
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      const confirmButton = allButtons.find(btn => 
        btn.textContent === 'Delete Mission'
      );
      expect(confirmButton).toBeDefined();
      fireEvent.click(confirmButton!);
    });

    // Wait for delete to be called
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('test-mission-id', 'Test Mission');
    });

    // Verify onBack was called
    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('updates mission status when status is changed', () => {
    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const statusSelect = screen.getByDisplayValue('In Progress');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    expect(mockStore.updateMission).toHaveBeenCalledWith('test-mission-id', { status: 'completed' });
  });

  it('adds progress update when form is submitted', () => {
    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const form = screen.getByTestId('progress-form');
    fireEvent.submit(form);

    expect(mockStore.addProgressUpdate).toHaveBeenCalledWith('test-mission-id', 'Test progress');
  });

  it('navigates back when back button is clicked', () => {
    const mockOnBack = vi.fn();
    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={mockOnBack}
        onEdit={vi.fn()}
      />
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('opens edit mode when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(
      <MissionDetailView
        missionId="test-mission-id"
        onBack={vi.fn()}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('test-mission-id');
  });
});
