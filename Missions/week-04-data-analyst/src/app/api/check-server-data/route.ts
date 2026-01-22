import { NextRequest, NextResponse } from 'next/server';
import { fetchSummary } from '@/lib/api/server-fetchers';

export const runtime = 'nodejs';

async function handleCheckServerData(req: NextRequest) {
  try {
    const serverData = await fetchSummary();
    
    return NextResponse.json({
      serverData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Server data check error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch server data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const GET = handleCheckServerData;
