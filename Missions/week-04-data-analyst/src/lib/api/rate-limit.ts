import { APIError, setRateLimitHeaders } from './response';

interface RateLimitResult {
  limit: number;
  reset: Date;
  remaining: number;
}

// Simple in-memory rate limiter for development
// In production, you'd use Redis or a similar solution
class MemoryRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private requestLimit: number,
    private windowMs: number
  ) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = identifier;
    const existing = this.requests.get(key);

    if (!existing || now > existing.resetTime) {
      // New window or expired window
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        limit: this.requestLimit,
        reset: new Date(now + this.windowMs),
        remaining: this.requestLimit - 1,
      };
    }

    if (existing.count >= this.requestLimit) {
      throw new APIError(429, 'Rate limit exceeded', {
        limit: this.requestLimit,
        reset: new Date(existing.resetTime),
        remaining: 0,
      });
    }

    existing.count++;
    return {
      limit: this.requestLimit,
      reset: new Date(existing.resetTime),
      remaining: this.requestLimit - existing.count,
    };
  }
}

// Create rate limiter instances
const apiRateLimiter = new MemoryRateLimiter(100, 60 * 1000); // 100 requests per minute
const heavyRateLimiter = new MemoryRateLimiter(20, 60 * 1000); // 20 requests per minute for heavy endpoints

export async function checkRateLimit(
  identifier: string,
  type: 'api' | 'heavy' = 'api'
): Promise<RateLimitResult> {
  const limiter = type === 'heavy' ? heavyRateLimiter : apiRateLimiter;
  return limiter.limit(identifier);
}

export function getClientIdentifier(request: Request): string {
  // Try to get user ID from auth header, fallback to IP
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // In a real app, you'd extract user ID from JWT token
    return `user:${authHeader.slice(0, 20)}`;
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

export async function applyRateLimit(
  request: Request,
  type: 'api' | 'heavy' = 'api'
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, type);
  return result;
}
