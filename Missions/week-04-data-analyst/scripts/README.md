# Database Seeding Scripts

This directory contains scripts for populating the Supabase database with initial football data from API-Football.

## Scripts Overview

### `seed.ts` - Main Database Seeding Script

Populates the database with the Top 5 European leagues and associated data:

**Target Leagues:**
- Premier League (England)
- La Liga (Spain) 
- Serie A (Italy)
- Bundesliga (Germany)
- Ligue 1 (France)

**Data Seeded:**
- League information and seasons
- Club/team details and venues
- Transfer data for current season

**Features:**
- ✅ Idempotent (safe to re-run)
- ✅ Rate limited to respect API quotas
- ✅ Progress logging and error handling
- ✅ Uses upserts on API IDs for data integrity
- ✅ Standalone execution via tsx (no serverless timeouts)

### `seed-validation.ts` - Validation Script

Tests the seeding implementation with just Premier League to validate:
- Data structure integrity
- Foreign key relationships
- API connectivity
- Database schema compatibility

**Usage:** Run before full seed to verify setup is correct.

## Prerequisites

1. **Environment Configuration**
   ```bash
   # Copy example environment
   cp .env.example .env.local
   
   # Configure required variables
   API_FOOTBALL_KEY=your_api_football_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Database Setup**
   - Ensure MCS-94 (Supabase Database Setup) is complete
   - Tables should exist: `leagues`, `clubs`, `transfers`
   - Proper constraints on `api_league_id`, `api_club_id`, `api_transfer_id`

3. **Dependencies**
   ```bash
   npm install --save-dev tsx dotenv
   ```

## Usage

### Validation (Recommended First)
```bash
# Test with Premier League only
npm run seed:validate
# or
npx tsx scripts/seed-validation.ts
```

### Full Database Seed
```bash
# Seed all Top 5 leagues
npm run seed
# or
npx tsx scripts/seed.ts
```

### Environment Variables
Required variables in `.env.local`:

```bash
# API-Football
API_FOOTBALL_KEY=0ff4c3d70afd7872a63951cafb27cbc8
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Script Architecture

### Rate Limiting
- Conservative 5 requests/second limit
- 1000 requests/hour maximum
- Automatic retry with exponential backoff
- Progress tracking and utilization stats

### Data Flow
1. **Phase 1**: Seed leagues (5 API calls)
2. **Phase 2**: Seed clubs per league (~20 clubs/league)
3. **Phase 3**: Seed transfers per league (varies by season)

### Error Handling
- Graceful failure per entity
- Detailed error logging
- Rollback not implemented (too large for single transaction)
- Safe re-runs via upserts

## API Endpoints Used

- `/leagues?id={league_id}` - League details
- `/teams?league={id}&season=2024` - Teams in league
- `/transfers?league={id}&season=2024` - Transfer activity

## Expected Runtime

- **Validation**: ~30-60 seconds (Premier League only)
- **Full seed**: ~2-5 minutes (depends on API response times)
- **Rate limited**: Automatically throttled to respect quotas

## Validation Results

Successful validation should show:
```
🧪 Running validation seed with Premier League only...
✅ Seeded Premier League
✅ Seeded 20 clubs
✅ Seeded X transfers
✅ Found 1 Premier League record(s)
✅ Sample clubs data: Manchester United, Liverpool, Arsenal...
✅ Sample transfers: Player Name (In/Out)...
✅ Foreign key relationships working
🎉 Validation seed completed successfully!
```

## Troubleshooting

### Common Issues

**Missing Environment Variables**
```
Error: API_FOOTBALL_KEY environment variable is required
```
Solution: Configure `.env.local` with required variables.

**Rate Limiting**
```
[RateLimiter] Hourly limit reached. Waiting X seconds...
```
Solution: Wait for rate limit reset or upgrade API plan.

**Database Connection**
```
Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
```
Solution: Verify Supabase project setup and credentials.

**API Failures**
```
API request failed: 401 Unauthorized
```
Solution: Check API-Football key validity and subscription.

**Validation Failures**
```
❌ Validation seed failed: relation "clubs" does not exist
```
Solution: Ensure MCS-94 database setup is complete.

### Debug Mode

Add additional logging by setting:
```bash
NODE_ENV=development npm run seed:validate
```

## Data Model Reference

### Leagues Table
- `api_league_id` (PK) - API-Football league ID
- `name` - League name
- `type` - League type
- `country` - Country name
- `logo_url` - League logo

### Clubs Table  
- `api_club_id` (PK) - API-Football team ID
- `name` - Club name
- `venue_*` fields for stadium information

### Transfers Table
- `api_transfer_id` (PK) - API-Football transfer ID
- `player_id` - Player API ID
- `from_club_id`/`to_club_id` - Club API IDs
- `transfer_date` - Transfer date

## Development

### Adding New Leagues
Update `TOP_5_LEAGUES` constant in `scripts/seed.ts`:

```typescript
const TOP_5_LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  // Add new leagues here
];
```

### Modifying Rate Limits
Adjust rate limiter initialization:

```typescript
this.rateLimiter = new APIRateLimiter(
  requestsPerSecond: 10, // Increase for higher tiers
  maxHourlyRequests: 2000
);
```

## Dependencies

- `@supabase/supabase-js` - Database client
- `tsx` - TypeScript execution
- `dotenv` - Environment variable loading
- API-Football subscription - Data source
