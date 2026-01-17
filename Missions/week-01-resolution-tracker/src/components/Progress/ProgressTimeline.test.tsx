import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ProgressTimeline } from './ProgressTimeline';
import type { ProgressUpdate } from '../../types';

describe('ProgressTimeline', () => {
  const mockProgressUpdates: ProgressUpdate[] = [
    {
      id: 'update-1',
      missionId: 'mission-1',
      content: 'Latest progress update',
      timestamp: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'update-2',
      missionId: 'mission-1',
      content: 'Second progress update',
      timestamp: new Date('2024-01-14T10:00:00Z'),
    },
    {
      id: 'update-3',
      missionId: 'mission-1',
      content: 'First progress update',
      timestamp: new Date('2024-01-13T10:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now() for consistent relative time testing
    vi.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15T12:00:00Z').getTime());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders list of progress updates', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    expect(screen.getByText('Latest progress update')).toBeInTheDocument();
    expect(screen.getByText('Second progress update')).toBeInTheDocument();
    expect(screen.getByText('First progress update')).toBeInTheDocument();
    expect(screen.getByText('Progress Updates')).toBeInTheDocument();
  });

  it('displays updates in reverse chronological order', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    const updates = screen.getAllByText(/progress update/);
    expect(updates[0]).toHaveTextContent('Latest progress update');
    expect(updates[1]).toHaveTextContent('Second progress update');
    expect(updates[2]).toHaveTextContent('First progress update');
  });

  it('formats timestamps correctly', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    const updates: ProgressUpdate[] = [
      {
        id: 'update-1',
        missionId: 'mission-1',
        content: 'Just now update',
        timestamp: new Date(now.getTime() - 30 * 1000), // 30 seconds ago
      },
      {
        id: 'update-2',
        missionId: 'mission-1',
        content: 'Minutes ago update',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: 'update-3',
        missionId: 'mission-1',
        content: 'Hours ago update',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'update-4',
        missionId: 'mission-1',
        content: 'Days ago update',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 'update-5',
        missionId: 'mission-1',
        content: 'Old update',
        timestamp: new Date('2023-12-15T10:00:00Z'), // Last year
      },
    ];

    render(<ProgressTimeline progressUpdates={updates} />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
    expect(screen.getByText(/Dec 15, 2023/)).toBeInTheDocument();
  });

  it('shows empty state when no updates', () => {
    render(<ProgressTimeline progressUpdates={[]} />);

    expect(screen.getByText('No progress updates yet')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your progress by adding your first update.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProgressTimeline progressUpdates={[]} isLoading={true} />);

    expect(screen.getByText('Progress Updates')).toBeInTheDocument();
    // Check for loading skeleton elements using data-testid
    expect(screen.getByTestId('loading-skeletons')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
  });

  it('displays correct update count', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    expect(screen.getByText('3 updates')).toBeInTheDocument();
  });

  it('displays singular update count', () => {
    render(<ProgressTimeline progressUpdates={[mockProgressUpdates[0]]} />);

    expect(screen.getByText('1 update')).toBeInTheDocument();
  });

  it('shows "Latest" badge for most recent update', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    expect(screen.getByText('Latest')).toBeInTheDocument();
  });

  it('shows timeline visual elements', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    // Check for timeline dots
    const timelineDots = screen.getAllByRole('generic').filter(
      el => el.className.includes('bg-indigo-600') && el.className.includes('rounded-full')
    );
    expect(timelineDots.length).toBeGreaterThan(0);
  });

  it('shows summary footer for multiple updates', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    expect(screen.getByText(/First update/)).toBeInTheDocument();
    expect(screen.getByText(/Latest update/)).toBeInTheDocument();
  });

  it('does not show summary footer for single update', () => {
    render(<ProgressTimeline progressUpdates={[mockProgressUpdates[0]]} />);

    expect(screen.queryByText(/First update/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Latest update/)).not.toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    // Check for proper time elements
    const timeElements = screen.getAllByRole('time');
    expect(timeElements.length).toBe(mockProgressUpdates.length);

    // Check for proper datetime attributes
    timeElements.forEach((timeEl, index) => {
      expect(timeEl).toHaveAttribute('dateTime', mockProgressUpdates[index].timestamp.toISOString());
    });
  });

  it('handles edge case formatting', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    const edgeCaseUpdates: ProgressUpdate[] = [
      {
        id: 'update-1',
        missionId: 'mission-1',
        content: '1 minute ago',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000),
      },
      {
        id: 'update-2',
        missionId: 'mission-1',
        content: '1 hour ago',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'update-3',
        missionId: 'mission-1',
        content: '1 day ago',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'update-4',
        missionId: 'mission-1',
        content: 'Yesterday',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    render(<ProgressTimeline progressUpdates={edgeCaseUpdates} />);

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('preserves whitespace in content', () => {
    const updatesWithWhitespace: ProgressUpdate[] = [
      {
        id: 'progress-1',
        missionId: 'mission-1',
        content: 'Line 1\n\nLine 2\n  Indented line',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    render(<ProgressTimeline progressUpdates={updatesWithWhitespace} />);

    // Check that content is displayed with whitespace preserved
    const contentElements = screen.getAllByRole('generic');
    const contentElement = contentElements.find(
      el => el.textContent?.includes('Line 1') && el.textContent?.includes('Line 2')
    );
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveClass('whitespace-pre-wrap');
  });

  it('handles long content correctly', () => {
    const longContent = 'x'.repeat(1000); // Very long content
    const updatesWithLongContent: ProgressUpdate[] = [
      {
        id: 'update-1',
        missionId: 'mission-1',
        content: longContent,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    render(<ProgressTimeline progressUpdates={updatesWithLongContent} />);

    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    // Check for proper icon aria-hidden attributes (SVG icons should be aria-hidden)
    const svgElements = screen.getAllByRole('generic').filter(el => 
      el.tagName === 'svg' && el.getAttribute('aria-hidden') === 'true'
    );
    expect(svgElements.length).toBeGreaterThan(0);
    
    // Check for proper time elements with titles
    const timeElements = screen.getAllByRole('time');
    expect(timeElements.length).toBeGreaterThan(0);
    timeElements.forEach(timeEl => {
      expect(timeEl).toHaveAttribute('title');
    });
  });

  it('renders timeline lines between updates', () => {
    render(<ProgressTimeline progressUpdates={mockProgressUpdates} />);

    // Check for timeline connecting lines (should be one less than number of updates)
    const timelineLines = screen.getAllByRole('generic').filter(
      el => el.className.includes('bg-slate-200') && el.className.includes('w-0.5')
    );
    expect(timelineLines.length).toBe(mockProgressUpdates.length - 1);
  });

  it('formats dates correctly for same year', () => {
    const sameYearUpdates = [
      {
        id: 'progress-1',
        missionId: 'mission-1',
        content: 'Earlier update',
        timestamp: new Date('2024-01-05T10:00:00Z'),
      },
      {
        id: 'progress-2',
        missionId: 'mission-1',
        content: 'Later update',
        timestamp: new Date('2024-01-10T10:00:00Z'),
      },
    ];

    render(<ProgressTimeline progressUpdates={sameYearUpdates} />);

    // Check that both dates are displayed
    const timeElements = screen.getAllByRole('time');
    expect(timeElements).toHaveLength(2);
    
    // Check that dates contain the expected month/day patterns
    const dates = timeElements.map(el => el.textContent || '');
    expect(dates.some(date => date?.includes('Jan'))).toBe(true);
    expect(dates.some(date => date?.includes('10'))).toBe(true);
    expect(dates.some(date => date?.includes('5'))).toBe(true);
  });

  it('formats dates correctly for different years', () => {
    const differentYearUpdates = [
      {
        id: 'progress-1',
        missionId: 'mission-1',
        content: 'Current year update',
        timestamp: new Date('2024-01-10T10:00:00Z'),
      },
      {
        id: 'progress-2',
        missionId: 'mission-1',
        content: 'Previous year update',
        timestamp: new Date('2023-12-15T10:00:00Z'),
      },
    ];

    render(<ProgressTimeline progressUpdates={differentYearUpdates} />);

    // Check that both dates are displayed (format may vary by locale)
    const timeElements = screen.getAllByRole('time');
    expect(timeElements).toHaveLength(2);
    
    // Check that one date contains "2023" (the previous year)
    const dates = timeElements.map(el => el.textContent || '');
    expect(dates.some(date => date?.includes('2023'))).toBe(true);
    
    // Check that one date contains "Jan" (current year date)
    expect(dates.some(date => date?.includes('Jan'))).toBe(true);
  });
});
