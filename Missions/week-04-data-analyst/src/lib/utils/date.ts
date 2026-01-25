const EASTERN_TIME_ZONE = 'America/New_York' as const;

/**
 * Format a Date into YYYY-MM-DD string in the Eastern Time zone.
 * Defaults to current date when no argument provided.
 */
export function formatDateToEastern(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EASTERN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
