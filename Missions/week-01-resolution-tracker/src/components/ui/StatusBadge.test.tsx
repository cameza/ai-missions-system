import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { MissionStatus } from '../../types/mission';

// Simple test without complex setup
test('StatusBadge renders Not Started status', () => {
  render(<StatusBadge status={MissionStatus.NotStarted} />);
  const badge = screen.getByText('Not Started');
  expect(badge).toBeInTheDocument();
  expect(badge.className).toContain('bg-slate-100');
});

test('StatusBadge renders In Progress status', () => {
  render(<StatusBadge status={MissionStatus.InProgress} />);
  const badge = screen.getByText('In Progress');
  expect(badge).toBeInTheDocument();
  expect(badge.className).toContain('bg-amber-100');
});

test('StatusBadge renders Completed status', () => {
  render(<StatusBadge status={MissionStatus.Completed} />);
  const badge = screen.getByText('Completed');
  expect(badge).toBeInTheDocument();
  expect(badge.className).toContain('bg-emerald-100');
});

test('StatusBadge renders Blocked status', () => {
  render(<StatusBadge status={MissionStatus.Blocked} />);
  const badge = screen.getByText('Blocked');
  expect(badge).toBeInTheDocument();
  expect(badge.className).toContain('bg-red-100');
});

test('StatusBadge applies custom className', () => {
  render(<StatusBadge status={MissionStatus.Completed} className="custom-class" />);
  const badge = screen.getByText('Completed');
  expect(badge.className).toContain('custom-class');
});

test('StatusBadge has accessibility attributes', () => {
  render(<StatusBadge status={MissionStatus.InProgress} />);
  const badge = screen.getByText('In Progress');
  expect(badge).toHaveAttribute('aria-label', 'Status: In Progress');
});
