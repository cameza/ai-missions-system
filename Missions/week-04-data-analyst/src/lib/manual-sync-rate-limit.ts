import { getSupabaseAdminClient } from './supabase-admin';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const TABLE_NAME = 'manual_sync_limits';

let lastManualSyncMemory: number | null = null;

export interface ManualSyncRateLimitResult {
  allowed: boolean;
  nextAllowedAt?: Date;
  source: 'supabase' | 'memory';
  reason?: string;
}

/**
 * Test helper to reset in-memory fallback state between tests.
 * No effect when Supabase is configured.
 */
export function resetManualSyncRateLimitStateForTests() {
  lastManualSyncMemory = null;
}

function getNextAllowedDate(lastTriggered: Date): Date {
  return new Date(lastTriggered.getTime() + RATE_LIMIT_WINDOW_MS);
}

/**
 * Attempt to reserve a manual sync slot. Returns whether the request is allowed
 * and records the attempt (persistently when Supabase is configured, otherwise
 * falls back to an in-memory guard for the current runtime).
 */
export async function acquireManualSyncSlot(manualToken: string): Promise<ManualSyncRateLimitResult> {
  if (!manualToken) {
    return {
      allowed: false,
      source: 'memory',
      reason: 'Manual token is required for rate limiting.',
    };
  }

  const supabase = getSupabaseAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  if (!supabase) {
    if (lastManualSyncMemory && lastManualSyncMemory > windowStart.getTime()) {
      return {
        allowed: false,
        nextAllowedAt: getNextAllowedDate(new Date(lastManualSyncMemory)),
        source: 'memory',
        reason: 'Manual sync limit reached (non-persistent fallback).',
      };
    }

    lastManualSyncMemory = now.getTime();
    return {
      allowed: true,
      source: 'memory',
    };
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('token, last_triggered')
    .eq('token', manualToken)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[manual-sync-rate-limit] Failed to read Supabase table:', error.message);
    return {
      allowed: false,
      source: 'supabase',
      reason: 'Unable to verify manual sync rate limit. Please try again later.',
    };
  }

  if (data && data.last_triggered) {
    const lastTriggered = new Date(data.last_triggered);
    if (lastTriggered > windowStart) {
      return {
        allowed: false,
        nextAllowedAt: getNextAllowedDate(lastTriggered),
        source: 'supabase',
        reason: 'Manual sync limit reached. Please wait before triggering again.',
      };
    }
  }

  const { error: upsertError } = await supabase
    .from(TABLE_NAME)
    .upsert(
      {
        token: manualToken,
        last_triggered: now.toISOString(),
      },
      { onConflict: 'token' }
    );

  if (upsertError) {
    console.error('[manual-sync-rate-limit] Failed to update Supabase table:', upsertError.message);
    return {
      allowed: false,
      source: 'supabase',
      reason: 'Unable to update manual sync rate limit. Please try again later.',
    };
  }

  return {
    allowed: true,
    source: 'supabase',
  };
}
