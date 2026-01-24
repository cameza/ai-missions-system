import { NextRequest, NextResponse } from 'next/server';
import { shouldRunDeadlineCron } from '../../../../../lib/scheduling';
import { processSyncRequest, type SyncRequestPayload } from '../route';

const SKIP_RESPONSE = {
  success: true,
  skipped: true,
  reason: 'Deadline cron disabled. Set ENABLE_DEADLINE_CRON=true or rely on automatic deadline detection.',
};

async function triggerDeadlineSync(overrides?: Partial<SyncRequestPayload>): Promise<NextResponse> {
  if (!shouldRunDeadlineCron()) {
    return NextResponse.json(SKIP_RESPONSE, { status: 200 });
  }

  const payload: SyncRequestPayload = {
    season: overrides?.season ?? 2025,
    isCronTrigger: true,
    isDeadlineDay: overrides?.isDeadlineDay ?? true,
    isManualOverride: false, // This is an automated cron trigger
    useTop10: overrides?.useTop10 ?? true,
    pageCount: overrides?.pageCount ?? 5, // More pages for deadline day
  };

  return processSyncRequest(payload, {
    forceCron: true,
    contextOverrides: { isDeadlineDay: true },
    skipManualRateLimit: true,
  });
}

export async function GET(): Promise<NextResponse> {
  return triggerDeadlineSync();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    return triggerDeadlineSync(body);
  } catch {
    return triggerDeadlineSync();
  }
}
