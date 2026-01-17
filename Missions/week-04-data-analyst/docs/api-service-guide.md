# API-Football Integration Service Guide

## Overview

The API-Football Integration Service provides a robust, rate-limited interface for fetching transfer data from API-Football with comprehensive error handling, data transformation, and monitoring capabilities.

## Architecture

### Core Components

1. **TransferService** - Main API integration service
2. **APIRateLimiter** - Rate limiting with emergency mode
3. **SyncOrchestrator** - Transactional data pipeline
4. **ErrorHandler** - Retry logic and alerting
5. **MockData** - Development and testing data

### Key Features

- **Rate Limiting**: 3000 calls/day with 10% emergency threshold
- **Priority Strategies**: Normal, Deadline Day, Emergency modes
- **Data Transformation**: API response normalization and validation
- **Error Handling**: Exponential backoff retry with alerting
- **Monitoring**: Comprehensive logging and metrics
- **Security**: API key authentication and environment variable protection

## Configuration

### Environment Variables

```bash
# API-Football Configuration
API_FOOTBALL_KEY=your_api_football_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Sync API Security
SYNC_API_KEY=your_sync_api_key_here

# Error Monitoring & Alerting
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
ERROR_WEBHOOK_URL=your_error_webhook_url_here

# Development/Testing
NODE_ENV=development
```

### Setup Instructions

1. **API-Football Account**
   - Sign up at [API-Football](https://www.api-football.com/)
   - Choose a plan with adequate rate limits (3000+ calls/day)
   - Generate API key

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Alert Configuration** (Optional)
   - Create Slack webhook for error notifications
   - Configure webhook URL in environment variables

## Usage

### Basic API Integration

```typescript
import { TransferService, createTransferService } from '@/lib/transfer-service';

// Create service instance
const service = createTransferService();

// Fetch transfers for specific leagues
const transfers = await service.fetchTransfers({
  season: 2025,
  leagueIds: [39, 140, 135], // Premier League, La Liga, Serie A
});

// Transform to internal format
const normalizedTransfers = service.transformBatch(transfers.response);
```

### Sync Orchestration

```typescript
import { SyncOrchestrator, createSyncOrchestrator } from '@/lib/sync-orchestrator';

// Create orchestrator
const orchestrator = createSyncOrchestrator();

// Execute sync with strategy
const result = await orchestrator.executeSync('normal', 2025);

console.log(`Processed ${result.successful} transfers`);
console.log(`Failed: ${result.failed}`);
console.log(`Duration: ${result.duration}ms`);
```

### API Endpoints

#### POST /api/sync/transfers

Trigger transfer data synchronization.

```bash
curl -X POST http://localhost:3000/api/sync/transfers \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_sync_api_key" \
  -d '{
    "strategy": "normal",
    "season": 2025,
    "isDeadlineDay": false,
    "isManualOverride": false
  }'
```

**Response:**
```json
{
  "success": true,
  "strategy": "normal",
  "season": 2025,
  "result": {
    "strategy": "normal",
    "totalProcessed": 150,
    "successful": 148,
    "failed": 2,
    "duration": 15420,
    "leaguesProcessed": 5,
    "apiCallsUsed": 15,
    "errors": []
  },
  "timestamp": "2025-01-17T20:00:00.000Z",
  "rateLimitStatus": {
    "used": 15,
    "limit": 3000,
    "remaining": 2985,
    "emergencyMode": false,
    "cacheHits": 0,
    "usagePercentage": 0.5
  }
}
```

#### GET /api/sync/transfers

Get current sync status and recent errors.

```bash
curl -X GET http://localhost:3000/api/sync/transfers \
  -H "x-api-key: your_sync_api_key"
```

## Sync Strategies

### Normal Mode
- **When to use**: Regular scheduled syncs
- **Leagues**: Tier 1 & 2 leagues (10 leagues)
- **Rate Limit**: Standard usage
- **Priority**: Balanced performance and completeness

### Deadline Day Mode
- **When to use**: Transfer deadline days
- **Leagues**: All major leagues (12 leagues)
- **Rate Limit**: Aggressive usage
- **Priority**: Maximum coverage, minimal delays

### Emergency Mode
- **When to use**: Rate limit approaching threshold
- **Leagues**: Tier 1 leagues only (5 leagues)
- **Rate Limit**: Conservative usage
- **Priority**: Essential data only, cache fallback

## Rate Limiting

### Configuration
- **Daily Limit**: 3000 calls
- **Emergency Threshold**: 10% remaining (300 calls)
- **Reset**: Every 24 hours
- **Cache Hits**: Not counted against limit

### Behavior
1. **Normal Operation**: Full API access
2. **Emergency Mode**: Reduced league set, 1-second delays
3. **Exhausted**: API calls blocked until reset

### Monitoring
```typescript
const service = createTransferService();
const status = service.getRateLimitStatus();

console.log(`Usage: ${status.used}/${status.limit}`);
console.log(`Remaining: ${status.remaining}`);
console.log(`Emergency Mode: ${status.emergencyMode}`);
```

## Error Handling

### Retry Logic
- **Max Attempts**: 3 retries
- **Backoff**: Exponential (1s, 2s, 4s)
- **Jitter**: 50-100% randomization
- **No Retry**: Authentication, validation, 404 errors

### Error Classification
- **Critical**: Authentication, database connection
- **High**: Rate limit, database transaction
- **Medium**: Network, database validation
- **Low**: Data transformation, sync orchestration

### Alerting
- **Critical Errors**: Slack webhook, immediate notification
- **High Errors**: Slack webhook, warning notification
- **Medium/Low Errors**: Logging only

## Data Transformation

### API Response → Internal Format

```typescript
// API-Football format
{
  "id": 12345,
  "playerName": "John Doe",
  "fromClub": { "name": "Club A" },
  "toClub": { "name": "Club B" },
  "type": "Loan",
  "amount": "5M",
  "date": "2025-01-15"
}

// Internal Transfer format
{
  "id": "uuid",
  "playerId": 67890,
  "playerFirstName": "John",
  "playerLastName": "Doe",
  "playerFullName": "John Doe",
  "fromClubName": "Club A",
  "toClubName": "Club B",
  "transferType": "Loan",
  "transferValueUsd": 500000000,
  "transferValueDisplay": "€5.0M",
  "window": "2025-winter",
  "apiTransferId": 12345
}
```

### Validation
- **Zod Schemas**: Runtime type validation
- **Required Fields**: Player names, club names, transfer type, date
- **Value Parsing**: Transfer amounts converted to USD cents
- **Date Validation**: Proper date format and window detection

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Mock Data
```typescript
import { MOCK_API_TRANSFERS, generateMockTransfer } from '@/lib/mock-data';

// Use predefined mock data
const mockTransfers = MOCK_API_TRANSFERS;

// Generate custom mock data
const customTransfer = generateMockTransfer({
  playerName: "Custom Player",
  transferType: "Permanent",
  amount: "25M"
});
```

### Integration Testing
```typescript
// Test with mock service
import { MockDatabaseService } from '@/lib/sync-orchestrator';

const mockDB = new MockDatabaseService();
const orchestrator = new SyncOrchestrator(mockDB);

const result = await orchestrator.executeSync('normal', 2025);
```

## Monitoring

### Metrics
- API calls used/remaining
- Transfer processing counts
- Error rates by category
- Sync duration and performance
- Rate limiter status

### Logging
- Structured JSON logging
- Error context and stack traces
- Performance metrics
- Rate limit warnings

### Health Checks
```typescript
// Service health check
const service = createTransferService();
const status = service.getRateLimitStatus();

if (status.emergencyMode) {
  console.warn('Service operating in emergency mode');
}

if (status.remaining < 100) {
  console.error('API rate limit critically low');
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check `API_FOOTBALL_KEY` environment variable
   - Verify API key is valid and active

2. **Rate Limit Exceeded**
   - Monitor usage via `getRateLimitStatus()`
   - Implement emergency mode strategies
   - Consider upgrading API plan

3. **Data Validation Errors**
   - Check API response format changes
   - Review Zod schema validation
   - Examine transformation logic

4. **Database Connection Issues**
   - Verify Supabase configuration
   - Check connection pooling settings
   - Review RLS policies

### Debug Mode
```typescript
// Enable debug logging
process.env.NODE_ENV = 'development';

// Use mock data for testing
const service = new TransferService();
const mockData = await import('@/lib/mock-data');
```

## Security

### API Key Protection
- Never expose API keys in client code
- Use environment variables for sensitive data
- Implement API key rotation strategy
- Monitor for unauthorized usage

### Data Validation
- Validate all API responses
- Sanitize input data
- Implement type safety with TypeScript
- Use Zod for runtime validation

### Access Control
- Require API key for sync endpoints
- Implement rate limiting per client
- Monitor for abuse patterns
- Log all API access

## Performance Optimization

### Caching Strategy
- Cache API responses when possible
- Use emergency mode fallbacks
- Implement smart retry logic
- Monitor cache hit rates

### Batch Processing
- Process transfers in batches
- Use database transactions
- Implement parallel processing where safe
- Monitor memory usage

### Network Optimization
- Use connection pooling
- Implement request timeouts
- Compress responses where possible
- Monitor network latency

## Deployment

### Environment Setup
1. Configure all environment variables
2. Set up monitoring and alerting
3. Test API connectivity
4. Verify database connections

### Production Considerations
- Use production API keys
- Enable comprehensive monitoring
- Set up automated alerts
- Implement health checks

### Scaling
- Monitor API usage patterns
- Implement horizontal scaling
- Consider CDN for static assets
- Optimize database queries

## Support

For issues and questions:
1. Check this documentation first
2. Review error logs and metrics
3. Test with mock data
4. Contact the development team

## Version History

- **v1.0** (2025-01-17): Initial implementation
  - TransferService with API integration
  - Rate limiting with emergency mode
  - Sync orchestration with strategies
  - Error handling and retry logic
  - Comprehensive testing and documentation
