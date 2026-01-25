# Plan 1: Vercel Cron Job Fix

## Problem Statement

The Transfermarkt scraping cron job is configured in `vercel.json` to run twice daily (11:30 AM/PM Eastern) but doesn't execute automatically in Vercel. The script runs successfully when triggered locally using `npm run mock-cron normal`.

## Root Cause Analysis

After reviewing the codebase, the issue is in how the API route handles Vercel cron job authentication:

### Current Implementation Issue

The [route.ts](file:///Users/camilomeza/Documents/Personal%20Documents/Personal%20Projects/AIDB%20Challenge/Missions/week-04-data-analyst/src/app/api/sync/transfers/route.ts) POST handler:

```typescript
// Lines 93-130 - Current logic
const isCronTrigger = options.forceCron ?? validatedBody.isCronTrigger ?? false;
const isManualRequest = !isCronTrigger;

// Manual request authentication
if (isManualRequest) {
  const expectedToken = process.env.MANUAL_SYNC_TOKEN;
  const providedToken = validatedBody.manualToken;

  if (!providedToken) {
    return NextResponse.json({
      success: false,
      error: 'Manual sync token is required for authenticated triggers.',
      // ...
    }, { status: 400 });
  }
  // ... token validation continues
}
```

**The Problem**: Vercel cron jobs hit the endpoint via HTTP GET (not POST), sending an `Authorization: Bearer <CRON_SECRET>` header. The current code:

1. Expects `isCronTrigger: true` in the POST body - Vercel doesn't send this
2. Doesn't check for Vercel's cron authentication header
3. Falls through to manual token validation and fails

### Evidence from vercel.json

```json
{
  "crons": [
    { "path": "/api/sync/transfers", "schedule": "30 16 * * *" },
    { "path": "/api/sync/transfers", "schedule": "30 4 * * *" }
  ]
}
```

Vercel crons make GET requests to the specified path with the `Authorization: Bearer <CRON_SECRET>` header.

---

## Proposed Changes

### [MODIFY] [route.ts](file:///Users/camilomeza/Documents/Personal%20Documents/Personal%20Projects/AIDB%20Challenge/Missions/week-04-data-analyst/src/app/api/sync/transfers/route.ts)

**Summary**: Update the GET handler to properly detect and authenticate Vercel cron requests, then execute the sync.

#### Changes Required:

1. **Add Vercel cron detection helper function**:
```typescript
function isVercelCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}
```

2. **Modify GET handler to handle cron execution**:
```typescript
export async function GET(request: NextRequest) {
  try {
    // Check if this is a Vercel cron request
    if (isVercelCronRequest(request)) {
      console.log('🤖 Vercel cron job triggered');
      
      // Execute sync with cron context
      const result = await processSyncRequest(
        {
          useTop10: true,
          pageCount: 3,
          season: 2025,
          isCronTrigger: true,
        },
        { forceCron: true, skipManualRateLimit: true }
      );
      
      return result;
    }
    
    // Regular status endpoint (existing logic)
    return NextResponse.json({
      status: { /* existing status response */ },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ GET endpoint failed:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
```

---

### Environment Variable Configuration

Add `CRON_SECRET` to Vercel environment variables:

| Variable | Description | Location |
|----------|-------------|----------|
| `CRON_SECRET` | Secret for authenticating Vercel cron requests | Vercel Project Settings → Environment Variables |

> [!IMPORTANT]
> Generate a secure random string (e.g., `openssl rand -hex 32`) and add it to **both**:
> 1. Vercel Dashboard → Project Settings → Environment Variables
> 2. Vercel automatically provides this when crons are configured, but verify it exists

---

## Verification Plan

### Existing Tests

The [sync-transfers.integration.test.ts](file:///Users/camilomeza/Documents/Personal%20Documents/Personal%20Projects/AIDB%20Challenge/Missions/week-04-data-analyst/src/app/api/__tests__/sync-transfers.integration.test.ts) file has existing tests that verify:

- Cron-triggered sync requests (line 182-196)
- Request body validation
- Error handling

### Automated Tests

1. **Run existing integration tests**:
```bash
cd "/Users/camilomeza/Documents/Personal Documents/Personal Projects/AIDB Challenge/Missions/week-04-data-analyst"
npm test -- src/app/api/__tests__/sync-transfers.integration.test.ts
```

2. **Add new test case for Vercel cron header detection**:

Add to `sync-transfers.integration.test.ts`:
```typescript
describe('Vercel Cron Authentication', () => {
  it('should authenticate and execute sync when Vercel cron header is present', async () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    
    const request = new NextRequest('http://localhost/api/sync/transfers', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-cron-secret',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.context?.isCronTrigger).toBe(true);
  });

  it('should return status (not execute sync) when cron header is missing', async () => {
    const request = new NextRequest('http://localhost/api/sync/transfers', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).not.toHaveProperty('success'); // Status response, not sync response
  });
});
```

### Manual Verification

1. **Local cron simulation**:
```bash
# Test with cron header
curl -X GET "http://localhost:3000/api/sync/transfers" \
  -H "Authorization: Bearer your-cron-secret"
```

2. **Vercel deployment verification**:
   - Deploy the changes to Vercel
   - Navigate to Vercel Dashboard → Project → Settings → Cron Jobs
   - Verify cron jobs are listed and showing schedule
   - Check Vercel Functions logs after scheduled time for execution evidence
   - Command: `vercel logs --prod` or check the Vercel dashboard