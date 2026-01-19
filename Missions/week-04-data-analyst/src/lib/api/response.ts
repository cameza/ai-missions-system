import { NextResponse } from 'next/server';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...meta,
  });
}

export function errorResponse(
  status: number,
  message: string,
  details?: any
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta
): NextResponse<APIResponse<T[]>> {
  return successResponse(data, { pagination });
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function setCacheHeaders<T>(
  response: NextResponse<APIResponse<T>>,
  maxAge: number,
  staleWhileRevalidate: number
): NextResponse<APIResponse<T>> {
  response.headers.set(
    'Cache-Control',
    `s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  return response;
}

export function setRateLimitHeaders<T>(
  response: NextResponse<APIResponse<T>>,
  limit: number,
  remaining: number,
  reset: Date
): NextResponse<APIResponse<T>> {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toISOString());
  return response;
}
