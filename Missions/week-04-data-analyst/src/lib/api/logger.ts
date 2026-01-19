import { NextRequest } from 'next/server';

export function logRequest(req: NextRequest, duration: number, status: number, error?: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status,
    duration: `${duration}ms`,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    ...(error && { error }),
  };

  if (status >= 400) {
    console.error('[API Error]', logData);
  } else {
    console.log('[API Request]', logData);
  }
}

export function createRequestHandler(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    let status = 200;
    let error: string | undefined;

    try {
      const response = await handler(req);
      status = response.status;
      return response;
    } catch (err) {
      status = err instanceof Error && 'status' in err ? (err as any).status : 500;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      logRequest(req, duration, status, error);
    }
  };
}
