import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { MissionStatus } from '../../types/mission';

describe('StatusBadge', () => {
  it('renders Not Started status', () => {
    render(<StatusBadge status={MissionStatus.NotStarted} />);
    const badge = screen.getByText('NOT STARTED');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-slate-100');
  });

  it('renders In Progress status', () => {
    render(<StatusBadge status={MissionStatus.InProgress} />);
    const badge = screen.getByText('IN PROGRESS');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-orange-100');
  });

  it('renders Completed status', () => {
    render(<StatusBadge status={MissionStatus.Completed} />);
    const badge = screen.getByText('COMPLETED');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-emerald-100');
  });

  it('renders Blocked status', () => {
    render(<StatusBadge status={MissionStatus.Blocked} />);
    const badge = screen.getByText('BLOCKED');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies custom className', () => {
    render(<StatusBadge status={MissionStatus.Completed} className="custom-class" />);
    const badge = screen.getByText('COMPLETED');
    expect(badge.className).toContain('custom-class');
  });

  it('has accessibility attributes', () => {
    render(<StatusBadge status={MissionStatus.InProgress} />);
    const badge = screen.getByText('IN PROGRESS');
    expect(badge).toHaveAttribute('aria-label', 'Status: IN PROGRESS');
  });
});
