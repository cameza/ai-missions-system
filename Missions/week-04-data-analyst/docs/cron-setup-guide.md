# Cron Jobs Setup Guide (MCS-96)

This guide covers the setup and configuration of the automated data sync pipeline using Vercel Cron Jobs.

## Overview

The Data Sync Pipeline implements scheduled transfer data synchronization with:
- **4x daily syncs** at 6am, 12pm, 6pm, 12am UTC
- **Deadline day mode** with 30-minute intervals
- **Manual trigger capability** for urgent updates
- **Transaction-based sync** with rollback protection
- **Comprehensive logging** and monitoring

## Configuration

### 1. Vercel Cron Jobs

The `vercel.json` file configures the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/sync/transfers",
      "schedule": "0 6,12,18,0 * * *"
    }
  ],
  "env": {
    "DEADLINE_DAY_MODE": "false",
    "MANUAL_SYNC_TOKEN": "your_manual_sync_token_here"
  }
}
```

**Schedule Breakdown:**
- `0 6,12,18,0 * * *` = At minute 0 of hours 6, 12, 18, and 0 (UTC)
- Runs 4 times daily: 06:00, 12:00, 18:00, 00:00 UTC

### 2. Environment Variables

Add these to your Vercel environment variables:

```bash
# Cron Job Configuration
DEADLINE_DAY_MODE=false
MANUAL_SYNC_TOKEN=your_secure_token_here

# API Configuration (from MCS-95)
API_FOOTBALL_KEY=your_api_football_key
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Error Monitoring
SLACK_WEBHOOK_URL=your_slack_webhook_url
ERROR_WEBHOOK_URL=your_error_webhook_url
```

## Usage

### Cron Job Triggers

The cron job automatically calls `/api/sync/transfers` with:
```json
{
  "isCronTrigger": true,
  "season": 2025
}
```

The API automatically determines the appropriate strategy based on:
- Current date (deadline day detection)
- Environment variables (manual override)
- Rate limiting status

### Manual Triggers

For manual syncs, send a POST request:

```bash
curl -X POST "https://your-app.vercel.app/api/sync/transfers" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_manual_sync_token" \
  -d '{
    "isCronTrigger": false,
    "manualToken": "your_manual_sync_token",
    "season": 2025,
    "strategy": "normal"
  }'
```

### Local Development

Use the mock cron script for local testing:

```bash
# Run normal sync
npm run mock-cron normal

# Run deadline day sync
npm run mock-cron deadline

# Run emergency sync
npm run mock-cron emergency

# Run manual sync
npm run mock-cron manual

# Check status
npm run mock-cron status

# Show help
npm run mock-cron help
```

## Sync Strategies

### Normal Mode
- **Frequency**: Every 6 hours
- **Leagues**: Tier 1 & 2 (10 leagues)
- **Rate Limit**: Standard usage

### Deadline Day Mode
- **Frequency**: Every 30 minutes
- **Leagues**: All major leagues (12 leagues)
- **Rate Limit**: Emergency mode activated
- **Duration**: 24 hours around deadline

### Emergency Mode
- **Frequency**: Every 2 hours
- **Leagues**: Tier 1 only (5 leagues)
- **Rate Limit**: Conservative usage
- **Trigger**: Manual or automatic

## Deadline Day Configuration

### Automatic Detection
The system automatically detects deadline days based on:
- Winter window: February 3rd
- Summer window: September 1st
- 24-hour window before deadline

### Manual Activation
To manually activate deadline day mode:

```bash
# Via environment variable
DEADLINE_DAY_MODE=true

# Via manual trigger
curl -X POST "https://your-app.vercel.app/api/sync/transfers" \
  -H "Content-Type: application/json" \
  -d '{"strategy": "deadline_day", "isManualOverride": true}'
```

### High-Frequency Cron Setup
For deadline day, update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync/transfers",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

## Monitoring and Logging

### Sync Logs
All sync operations are logged with:
- Strategy used
- Transfer counts
- API usage
- Performance metrics
- Error details

### Status Endpoint
Check current status:
```bash
curl "https://your-app.vercel.app/api/sync/transfers"
```

### Performance Metrics
The system tracks:
- Transfers per second
- API calls per transfer
- Average processing time
- Success/failure rates

## Error Handling

### Automatic Retry
- **Max attempts**: 2 per sync
- **Backoff**: Exponential (5s, 10s)
- **Max delay**: 30 seconds

### Alert System
Critical errors trigger alerts via:
- Slack webhook (if configured)
- Error webhook (if configured)
- Console logging

### Rate Limiting
- **Daily limit**: 3000 API calls
- **Emergency threshold**: 10% remaining
- **Manual sync limit**: 1 hour between requests

## Troubleshooting

### Common Issues

**Cron job not running:**
- Check Vercel cron status: `vercel cron ls`
- Verify `vercel.json` syntax
- Ensure API endpoint is accessible

**Sync failures:**
- Check API-Football key validity
- Verify rate limit status
- Review error logs

**Performance issues:**
- Monitor sync duration
- Check API response times
- Verify database performance

### Debug Commands

```bash
# Check cron jobs
vercel cron ls

# View function logs
vercel logs

# Test endpoint manually
curl -X POST "http://localhost:3000/api/sync/transfers" \
  -H "Content-Type: application/json" \
  -d '{"isCronTrigger": true}'

# Check environment variables
vercel env ls
```

## Security

### API Authentication
- Manual syncs require valid token
- Cron jobs use internal authentication
- Rate limiting prevents abuse

### Data Protection
- Transaction-based syncs prevent corruption
- Rollback on failures
- Input validation on all requests

## Deployment

### Production Deployment
1. Configure environment variables in Vercel
2. Deploy with `vercel.json`
3. Verify cron jobs: `vercel cron ls`
4. Test manual sync endpoint
5. Monitor first few scheduled runs

### Environment-Specific Configs

**Development:**
```json
{
  "crons": [],
  "env": {
    "DEADLINE_DAY_MODE": "false",
    "MANUAL_SYNC_TOKEN": "dev-token"
  }
}
```

**Production:**
```json
{
  "crons": [
    {
      "path": "/api/sync/transfers",
      "schedule": "0 6,12,18,0 * * *"
    }
  ],
  "env": {
    "DEADLINE_DAY_MODE": "false",
    "MANUAL_SYNC_TOKEN": "secure-production-token"
  }
}
```

## Maintenance

### Regular Tasks
- Monitor sync success rates
- Check API quota usage
- Update deadline dates annually
- Review error logs weekly

### Performance Optimization
- Adjust sync frequency based on usage
- Optimize database queries
- Cache frequently accessed data
- Monitor API response times

## Support

For issues with the cron job setup:
1. Check this documentation
2. Review Vercel cron logs
3. Test with mock cron script
4. Contact the development team

---

**Related Documentation:**
- [API-Football Integration (MCS-95)](./api-service-guide.md)
- [Database Setup (MCS-94)](./database-setup-guide.md)
- [Error Handling Guide](./error-handling-guide.md)
