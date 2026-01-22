import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function handleClearCache(req: NextRequest) {
  // This endpoint will help force refresh React Query cache
  // By changing the API version or adding cache-busting headers
  const response = NextResponse.json({
    success: true,
    message: 'Cache cleared - refresh your browser to see latest data',
    timestamp: new Date().toISOString(),
    action: 'Please refresh your browser to clear React Query cache'
  });
  
  // Set cache-busting headers
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const GET = handleClearCache;
