/**
 * Scheduling utilities for Data Sync Pipeline (MCS-96)
 * 
 * Provides deadline day detection and emergency cadence logic
 * for dynamic sync frequency adjustment based on transfer window deadlines.
 */

/**
 * Transfer window deadlines for major European leagues (2024/25 season)
 * These are the critical deadline days when sync frequency should increase
 */
const TRANSFER_DEADLINES = [
  // Winter window 2025
  new Date('2025-02-03T23:00:00Z'), // Most leagues
  new Date('2025-02-03T23:00:00Z'), // Premier League
  // Summer window 2025
  new Date('2025-09-01T23:00:00Z'), // Most leagues  
  new Date('2025-09-01T23:00:00Z'), // Premier League
];

/**
 * Check if today is a transfer deadline day
 * Returns true if current date is within 24 hours of a deadline
 */
export function isDeadlineDay(): boolean {
  const now = new Date();
  
  return TRANSFER_DEADLINES.some(deadline => {
    const deadlineStart = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    const deadlineEnd = new Date(deadline.getTime() + 2 * 60 * 60 * 1000); // 2 hours after deadline
    return now >= deadlineStart && now <= deadlineEnd;
  });
}


/**
 * Check if emergency cadence should be used
 * Returns true if deadline day mode is enabled OR if we're in deadline window
 */
export function shouldUseEmergencyCadence(): boolean {
  const deadlineDayMode = process.env.DEADLINE_DAY_MODE === 'true';
  return deadlineDayMode || isDeadlineDay();
}

/**
 * Get appropriate sync strategy based on current conditions
 */
export function getSyncStrategy(): 'normal' | 'deadline_day' | 'emergency' {
  if (isDeadlineDay()) {
    return 'deadline_day';
  }
  
  if (shouldUseEmergencyCadence()) {
    return 'emergency';
  }
  
  return 'normal';
}

/**
 * Get next sync interval in minutes based on strategy
 */
export function getNextSyncInterval(): number {
  const strategy = getSyncStrategy();
  switch (strategy) {
    case 'deadline_day':
      return 30; // Every 30 minutes on deadline day
    case 'emergency':
      return 120; // Every 2 hours in emergency mode
    case 'normal':
    default:
      return 360; // Every 6 hours normally
  }
}

/**
 * Check whether deadline cron path should execute
 */
export function shouldRunDeadlineCron(): boolean {
  const cronOverride = process.env.ENABLE_DEADLINE_CRON === 'true';
  return cronOverride || isDeadlineDay();
}
