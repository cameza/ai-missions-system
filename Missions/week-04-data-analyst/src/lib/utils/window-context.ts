import type { SupabaseClient } from '@supabase/supabase-js';
import { detectTransferWindow, getCurrentWindow } from './window-detection';

export type TransferWindow = `${number}-winter` | `${number}-summer` | string;

/**
 * Resolves the current transfer window context from the database.
 * Uses the proper YYYY-winter/YYYY-summer format that matches database storage.
 * 
 * Strategy:
 * 1. First, try to find transfers in the current calculated window (e.g., '2026-winter')
 * 2. If no transfers found, fallback to the most recent window with data
 * 3. If still nothing, return the calculated current window
 */
export async function resolveWindowContext(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<TransferWindow> {
  // Get the current window in proper format (e.g., '2026-winter')
  const currentWindow = getCurrentWindow();

  // Check if we have transfers in the current window
  const { count, error } = await supabase
    .from('transfers')
    .select('*', { count: 'exact', head: true })
    .eq('window', currentWindow);

  if (!error && (count ?? 0) > 0) {
    return currentWindow;
  }

  // Fallback: get the most recent window that has data
  const { data } = await supabase
    .from('transfers')
    .select('window, transfer_date')
    .not('window', 'is', null)
    .order('transfer_date', { ascending: false })
    .limit(1);

  const fallbackWindow = data?.[0]?.window;
  if (typeof fallbackWindow === 'string' && fallbackWindow.trim().length > 0) {
    return fallbackWindow;
  }

  return currentWindow;
}
