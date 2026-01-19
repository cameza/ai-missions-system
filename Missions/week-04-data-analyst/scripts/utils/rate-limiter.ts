/**
 * API Rate Limiter
 * 
 * Implements a token bucket strategy to respect API rate limits.
 * Configurable delay between requests to stay within QPS limits.
 */

export class APIRateLimiter {
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly delayMs: number;
  private readonly maxRequestsPerHour: number;
  private hourlyWindowStart: number;

  constructor(
    private readonly requestsPerSecond: number = 5, // Conservative default
    private readonly maxHourlyRequests: number = 1000 // Conservative daily limit
  ) {
    this.delayMs = 1000 / requestsPerSecond;
    this.maxRequestsPerHour = maxHourlyRequests;
    this.hourlyWindowStart = Date.now();
  }

  /**
   * Wait until it's safe to make the next request
   */
  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    
    // Reset hourly counter if window has passed
    if (now - this.hourlyWindowStart > 60 * 60 * 1000) {
      this.requestCount = 0;
      this.hourlyWindowStart = now;
    }

    // Check hourly limit
    if (this.requestCount >= this.maxRequestsPerHour) {
      const waitTime = 60 * 60 * 1000 - (now - this.hourlyWindowStart);
      if (waitTime > 0) {
        console.log(`[RateLimiter] Hourly limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await this.sleep(waitTime);
        this.requestCount = 0;
        this.hourlyWindowStart = Date.now();
      }
    }

    // Enforce delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastRequest;
      await this.sleep(waitTime);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Get current rate limiter statistics
   */
  getStats() {
    const now = Date.now();
    const currentHourUsage = this.requestCount;
    const hourProgress = (now - this.hourlyWindowStart) / (60 * 60 * 1000);
    
    return {
      requestsThisHour: currentHourUsage,
      maxRequestsPerHour: this.maxRequestsPerHour,
      hourlyUtilization: (currentHourUsage / this.maxRequestsPerHour) * 100,
      hourProgress: hourProgress * 100,
      delayBetweenRequests: this.delayMs
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
