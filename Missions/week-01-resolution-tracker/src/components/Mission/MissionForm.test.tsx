import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MissionForm } from './MissionForm';
import type { Mission } from '../../types';
import { MissionStatus } from '../../types';

const mockMission: Mission = {
  id: 'test-id',
  title: 'Test Mission',
  description: 'Test description',
  status: MissionStatus.InProgress,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MissionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders create form with empty fields', () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active mission/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create mission/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders edit form with mission data', () => {
    render(
      <MissionForm
        mission={mockMission}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test Mission')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update mission/i })).toBeInTheDocument();
  });

  it('validates required title field', async () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create mission/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates title length', async () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const longTitle = 'A'.repeat(101);
    
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    const submitButton = screen.getByRole('button', { name: /create mission/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title must be less than 100 characters/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates description length', async () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    const longDescription = 'A'.repeat(501);
    
    fireEvent.change(descriptionInput, { target: { value: longDescription } });
    
    const submitButton = screen.getByRole('button', { name: /create mission/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description must be less than 500 characters/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data for create', async () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const submitButton = screen.getByRole('button', { name: /create mission/i });

    fireEvent.change(titleInput, { target: { value: 'New Mission' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Mission',
        description: 'New description',
        status: 'in_progress',
        isActive: true,
      });
    });
  });

  it('submits form with valid data for edit', async () => {
    render(
      <MissionForm
        mission={mockMission}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const submitButton = screen.getByRole('button', { name: /update mission/i });

    fireEvent.change(titleInput, { target: { value: 'Updated Mission' } });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Updated Mission',
        description: 'Test description',
        status: 'in_progress',
        isActive: true,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByLabelText(/title/i)).toBeDisabled();
  });

  it('shows unsaved changes warning when form is dirty', async () => {
    render(
      <MissionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when form is not dirty', () => {
    render(
      <MissionForm
        mission={mockMission}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /update mission/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is dirty', async () => {
    render(
      <MissionForm
        mission={mockMission}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /update mission/i });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
