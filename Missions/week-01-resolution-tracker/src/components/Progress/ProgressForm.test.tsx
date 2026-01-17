import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ProgressForm } from './ProgressForm';

describe('ProgressForm', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    missionId: 'test-mission-id',
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea and submit button', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    expect(textarea).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
    expect(screen.getByText('Add Progress Update')).toBeInTheDocument();
  });

  it('validates minimum content length', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });

    // Submit empty form
    fireEvent.click(submitButton);

    expect(screen.getByText('Progress update is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates maximum content length (1000)', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const longContent = 'x'.repeat(1001);

    fireEvent.change(textarea, { target: { value: longContent } });

    expect(screen.getByText('Progress update must be less than 1000 characters')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    
    // Initial state
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    // Add some content
    fireEvent.change(textarea, { target: { value: 'test content' } });
    expect(screen.getByText('12/1000')).toBeInTheDocument();

    // Add more content
    fireEvent.change(textarea, { target: { value: 'x'.repeat(100) } });
    expect(screen.getByText('100/1000')).toBeInTheDocument();
  });

  it('shows warning color when approaching limit', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    
    // Near limit (950+ characters)
    fireEvent.change(textarea, { target: { value: 'x'.repeat(950) } });
    const characterCount = screen.getByText('950/1000');
    expect(characterCount).toHaveClass('text-amber-600');

    // At limit (1000+ characters)
    fireEvent.change(textarea, { target: { value: 'x'.repeat(1001) } });
    const overLimitCount = screen.getByText('1001/1000');
    expect(overLimitCount).toHaveClass('text-red-600');
  });

  it('calls onSubmit with content', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });
    const content = 'Test progress update';

    fireEvent.change(textarea, { target: { value: content } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({ content });
  });

  it('clears form after submission', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });
    const content = 'Test progress update';

    fireEvent.change(textarea, { target: { value: content } });
    fireEvent.click(submitButton);

    expect(textarea).toHaveValue('');
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('supports Shift+Enter for new line', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const content = 'Line 1\nLine 2';

    // Simulate Shift+Enter
    fireEvent.change(textarea, { target: { value: content } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    // Should not submit form
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue(content);
  });

  it('submits on Enter (without Shift)', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const content = 'Test progress update';

    fireEvent.change(textarea, { target: { value: content } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith({ content });
  });

  it('does not submit on Enter if form is invalid', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');

    // Try to submit empty form with Enter
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Progress update is required')).toBeInTheDocument();
  });

  it('disables submit button when form is dirty but invalid', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });

    // Add invalid content (too long)
    fireEvent.change(textarea, { target: { value: 'x'.repeat(1001) } });

    expect(submitButton).toBeDisabled();
  });

  it('disables clear button when form is not dirty', () => {
    render(<ProgressForm {...defaultProps} />);

    const clearButton = screen.getByRole('button', { name: 'Clear' });

    expect(clearButton).toBeDisabled();
  });

  it('enables clear button when form is dirty', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(textarea, { target: { value: 'test' } });

    expect(clearButton).not.toBeDisabled();
  });

  it('clears form when Clear button is clicked', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(textarea, { target: { value: 'test content' } });
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProgressForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Adding/ });
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    const textarea = screen.getByRole('textbox');

    expect(submitButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    expect(textarea).toBeDisabled();
    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    const customPlaceholder = 'Custom placeholder text';
    render(<ProgressForm {...defaultProps} placeholder={customPlaceholder} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('has proper accessibility attributes', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const form = screen.getByRole('form');

    expect(textarea).toHaveAttribute('aria-invalid', 'false');
    expect(textarea).toHaveAttribute('aria-describedby', 'content-help');
    expect(screen.getByText('Add Progress Update *')).toBeInTheDocument();
    expect(screen.getByRole('alert')).not.toBeInTheDocument(); // No error initially
  });

  it('shows error accessibility attributes when invalid', () => {
    render(<ProgressForm {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Add Update' });

    // Trigger validation error
    fireEvent.click(submitButton);

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'content-error');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays keyboard shortcut hints', () => {
    render(<ProgressForm {...defaultProps} />);

    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('Shift+Enter')).toBeInTheDocument();
    expect(screen.getByText('to submit,')).toBeInTheDocument();
    expect(screen.getByText('for new line')).toBeInTheDocument();
  });

  it('has proper form structure', () => {
    render(<ProgressForm {...defaultProps} />);

    const form = screen.getByRole('form');
    const label = screen.getByLabelText(/Add Progress Update/);
    const textarea = screen.getByRole('textbox');

    expect(form).toContainElement(label);
    expect(form).toContainElement(textarea);
    expect(label).toHaveAttribute('for', `progress-${defaultProps.missionId}`);
    expect(textarea).toHaveAttribute('id', `progress-${defaultProps.missionId}`);
  });
});
