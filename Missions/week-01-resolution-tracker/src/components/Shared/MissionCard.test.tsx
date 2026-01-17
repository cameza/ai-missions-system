import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MissionCard } from './MissionCard';
import type { Mission } from '../../types';
import { MissionStatus } from '../../types/mission';

// Mock StatusBadge component
vi.mock('../ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: Mission['status'] }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

describe('MissionCard', () => {
  const mockMission: Mission = {
    id: 'test-mission-id',
    title: 'Test Mission',
    description: 'Test mission description',
    status: MissionStatus.NotStarted,
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  const defaultProps = {
    mission: mockMission,
    progressCount: 3,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewDetails: vi.fn(),
    onStatusChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mission title and description', () => {
    render(<MissionCard {...defaultProps} />);

    expect(screen.getByText('Test Mission')).toBeInTheDocument();
    expect(screen.getByText('Test mission description')).toBeInTheDocument();
    expect(screen.getByText('Mission')).toBeInTheDocument(); // Mission label
  });

  it('displays correct status badge', () => {
    render(<MissionCard {...defaultProps} />);

    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent('not_started');
  });

  it('shows progress count', () => {
    render(<MissionCard {...defaultProps} progressCount={5} />);

    expect(screen.getByText('5 updates')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
  });

  it('shows "No updates yet" when progress count is 0', () => {
    render(<MissionCard {...defaultProps} progressCount={0} />);

    expect(screen.getByText('No updates yet')).toBeInTheDocument();
  });

  it('formats dates correctly (Today, Yesterday, X days ago)', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const longAgo = new Date('2023-01-15T10:00:00Z');

    const { rerender } = render(
      <MissionCard {...defaultProps} mission={{ ...mockMission, updatedAt: today }} />
    );
    expect(screen.getByText('Today')).toBeInTheDocument();

    rerender(<MissionCard {...defaultProps} mission={{ ...mockMission, updatedAt: yesterday }} />);
    expect(screen.getByText('Yesterday')).toBeInTheDocument();

    rerender(<MissionCard {...defaultProps} mission={{ ...mockMission, updatedAt: threeDaysAgo }} />);
    expect(screen.getByText('3 days ago')).toBeInTheDocument();

    rerender(<MissionCard {...defaultProps} mission={{ ...mockMission, updatedAt: longAgo }} />);
    expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
  });

  it('calls onViewDetails on click', () => {
    const { onViewDetails } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onViewDetails).toHaveBeenCalledWith(mockMission.id);
  });

  it('calls onViewDetails on Enter key', () => {
    const { onViewDetails } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onViewDetails).toHaveBeenCalledWith(mockMission.id);
  });

  it('calls onViewDetails on Space key', () => {
    const { onViewDetails } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onViewDetails).toHaveBeenCalledWith(mockMission.id);
  });

  it('calls onEdit when Edit button clicked', () => {
    const { onEdit } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const editButton = screen.getByLabelText(`Edit mission: ${mockMission.title}`);
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockMission.id);
  });

  it('calls onDelete when Delete button clicked', () => {
    const { onDelete } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const deleteButton = screen.getByLabelText(`Delete mission: ${mockMission.title}`);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockMission.id);
  });

  it('calls onStatusChange when status dropdown changes', () => {
    const { onStatusChange } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const statusSelect = screen.getByLabelText(`Change status for mission: ${mockMission.title}`);
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

    expect(onStatusChange).toHaveBeenCalledWith(mockMission.id, 'in_progress');
  });

  it('shows loading state', () => {
    render(<MissionCard {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-hidden', 'true');
  });

  it('disables buttons when loading', () => {
    render(<MissionCard {...defaultProps} isLoading={true} />);

    const editButton = screen.getByLabelText(`Edit mission: ${mockMission.title}`);
    const deleteButton = screen.getByLabelText(`Delete mission: ${mockMission.title}`);

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('has correct ARIA labels', () => {
    render(<MissionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 
      expect.stringContaining('Mission: Test Mission')
    );
    expect(card).toHaveAttribute('aria-label', 
      expect.stringContaining('Status: not started')
    );
    expect(card).toHaveAttribute('aria-label', 
      expect.stringContaining('3 updates')
    );
    expect(card).toHaveAttribute('aria-label', 
      expect.stringContaining('Press Enter or Space to view details')
    );
  });

  it('stops event propagation on action buttons', () => {
    const { onViewDetails, onEdit, onDelete } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const editButton = screen.getByLabelText(`Edit mission: ${mockMission.title}`);
    fireEvent.click(editButton);

    // Should call onEdit but not onViewDetails
    expect(onEdit).toHaveBeenCalled();
    expect(onViewDetails).not.toHaveBeenCalled();

    vi.clearAllMocks();

    const deleteButton = screen.getByLabelText(`Delete mission: ${mockMission.title}`);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
    expect(onViewDetails).not.toHaveBeenCalled();
  });

  it('stops event propagation on status dropdown', () => {
    const { onViewDetails, onStatusChange } = defaultProps;
    render(<MissionCard {...defaultProps} />);

    const statusSelect = screen.getByLabelText(`Change status for mission: ${mockMission.title}`);
    fireEvent.click(statusSelect); // This should stop propagation

    expect(onViewDetails).not.toHaveBeenCalled();
  });

  it('renders without description when not provided', () => {
    const missionWithoutDescription = { ...mockMission };
    delete missionWithoutDescription.description;

    render(<MissionCard {...defaultProps} mission={missionWithoutDescription} />);

    expect(screen.queryByText('Test mission description')).not.toBeInTheDocument();
  });

  it('handles different mission statuses', () => {
    const statuses: Mission['status'][] = [
      MissionStatus.NotStarted,
      MissionStatus.InProgress,
      MissionStatus.Completed,
      MissionStatus.Blocked,
    ];

    statuses.forEach(status => {
      const { unmount } = render(
        <MissionCard {...defaultProps} mission={{ ...mockMission, status }} />
      );
      
      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toHaveTextContent(status);
      
      unmount();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<MissionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('role', 'button');

    // Check for proper focus management elements
    const editButton = screen.getByLabelText(/Edit mission/);
    const deleteButton = screen.getByLabelText(/Delete mission/);
    const statusSelect = screen.getByLabelText(/Change status for mission/);

    expect(editButton).toHaveAttribute('aria-label');
    expect(deleteButton).toHaveAttribute('aria-label');
    expect(statusSelect).toHaveAttribute('aria-label');
  });

  it('displays correct progress count pluralization', () => {
    const { rerender } = render(<MissionCard {...defaultProps} progressCount={1} />);
    expect(screen.getByText('1 update')).toBeInTheDocument();

    rerender(<MissionCard {...defaultProps} progressCount={2} />);
    expect(screen.getByText('2 updates')).toBeInTheDocument();
  });
});
