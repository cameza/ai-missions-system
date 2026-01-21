/**
 * Transfer value formatting utilities
 * Shared across API routes and server-side fetchers
 */

export function formatTransferValue(valueUsd: number | null | undefined): string {
  if (!valueUsd || valueUsd === 0) return 'Undisclosed';
  
  const millions = valueUsd / 1000000;
  if (millions >= 1000) {
    return `€${(millions / 1000).toFixed(1)}B`;
  } else {
    return `€${millions.toFixed(0)}M`;
  }
}
