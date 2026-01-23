# Transfer Hub Scraping System Guide

## Overview

This system automatically scrapes football transfer data from Transfermarkt and updates the Supabase database. It consists of a scraping script, database seeding, and automated scheduling.

## System Architecture

```
Transfermarkt Website → transfermarkt-scrape.ts → CSV File → seed.ts → Supabase Database
```

## Key Components

### 1. Transfermarkt Scraper (`scripts/transfermarkt-scrape.ts`)
- **Purpose**: Scrape latest transfers from Transfermarkt website
- **Technology**: Node.js + Cheerio for web scraping
- **Output**: CSV file with transfer data
- **Frequency**: Every hour (ideal) or manual execution

### 2. Database Seeder (`scripts/seed.ts`)
- **Purpose**: Import CSV data into Supabase database
- **Technology**: Node.js + PapaParse + Supabase client
- **Features**: Club/league resolution, data normalization, upsert logic

### 3. Mock Cron Simulator (`scripts/mock-cron.js`)
- **Purpose**: Simulate production cron triggers locally
- **Technology**: Node.js HTTP client
- **Usage**: Testing and development

### 4. Local Sync Script (`scripts/local-sync.sh`)
- **Purpose**: Orchestrate complete pipeline (scrape → copy → seed)
- **Technology**: Bash script
- **Usage**: Manual full pipeline execution

## Quick Start

### Prerequisites
- Node.js installed
- npm installed
- Supabase credentials configured in `.env.local`

### Environment Variables Required

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Football (for league/club metadata)
API_FOOTBALL_KEY=your-api-football-key
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Transfermarkt Scraper Configuration
TRANSFERMARKT_TOP10=true
TRANSFERMARKT_PAGE_COUNT=3
TRANSFERMARKT_START_PAGE=1
TRANSFER_CSV_PATH=Temp_Ref/latest-transfers-top10-pages-1-to-10.csv
```

## Manual Execution

### Option 1: Full Pipeline (Recommended)
```bash
cd "/path/to/week-04-data-analyst"
./scripts/local-sync.sh
```

### Option 2: Step by Step
```bash
# Step 1: Scrape transfers
npx tsx scripts/transfermarkt-scrape.ts

# Step 2: Seed database
npx tsx scripts/seed.ts
```

### Option 3: Mock Cron (Testing API)
```bash
npm run mock-cron normal
```

## Automated Scheduling

### Production (Vercel)
- **Schedule**: Every 8 hours via Vercel Cron Jobs
- **Endpoint**: `/api/sync/transfers`
- **Configuration**: `vercel.json` cron configuration

### Local Development (Launchd - Currently Issues)
- **File**: `scripts/com.transferhub.sync.plist`
- **Schedule**: Every hour (3600 seconds)
- **Status**: ⚠️ Not working reliably - use manual execution

### Manual Scheduling (Current Recommended)
Set up calendar reminders for:
- 6:00 AM, 10:00 AM, 2:00 PM, 6:00 PM, 10:00 PM, 2:00 AM

## Monitoring & Validation

### Check Execution Status
```bash
# View logs
cat logs/cron.log

# Check sync metrics
npm run mock-cron status

# Verify latest data
head -5 tmp/latest-transfers-pages-1-to-3.csv
```

### Validate Data Quality
1. **Compare with Transfermarkt**: Visit transfermarkt.com and verify recent transfers
2. **Check file timestamps**: Ensure CSV is recent
3. **Verify database**: Check Supabase dashboard for new records
4. **Monitor API limits**: Check rate limit status in sync output

## File Locations

```
Scripts:
├── scripts/transfermarkt-scrape.ts     # Main scraper
├── scripts/seed.ts                     # Database seeder
├── scripts/mock-cron.js                 # API simulator
├── scripts/local-sync.sh                # Full pipeline
└── scripts/com.transferhub.sync.plist   # Launchd config (broken)

Data Files:
├── tmp/latest-transfers-pages-1-to-3.csv     # Raw scraped data
├── Temp_Ref/latest-transfers-top10-pages-1-to-10.csv  # Production data
└── logs/cron.log                              # Execution logs

Configuration:
├── .env.local                              # Environment variables
├── vercel.json                             # Production cron config
└── package.json                           # npm scripts
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Scraper Returns No Data
**Symptoms**: Empty CSV file, "No rows were parsed" message
**Causes**: Transfermarkt website structure changed
**Solutions**:
- Check if website is accessible: `curl -I https://www.transfermarkt.com`
- Inspect HTML structure in browser
- Update CSS selectors in `transfermarkt-scrape.ts`

#### 2. Database Seeder Fails
**Symptoms**: Club resolution errors, duplicate key violations
**Causes**: Club name mismatches, missing league data
**Solutions**:
- Check API Football credentials
- Verify club names in CSV vs API mapping
- Run API Football endpoints manually to test

#### 3. API Rate Limits
**Symptoms**: HTTP 429 errors, "rate limit exceeded"
**Causes**: Too many API requests
**Solutions**:
- Check API-Football usage dashboard
- Reduce scrape frequency
- Use cached data where possible

#### 4. Launchd Agent Not Running
**Symptoms**: No automatic execution, empty logs
**Causes**: macOS permissions, plist configuration
**Solutions**:
- Use manual execution (recommended)
- Try reloading launchd agent
- Check system logs: `log show --predicate 'process == "launchd"'`

#### 5. File Permission Issues
**Symptoms**: "Permission denied" errors
**Causes**: Incorrect file permissions
**Solutions**:
```bash
chmod +x scripts/local-sync.sh
chmod 644 scripts/*.ts
```

## Performance Metrics

### Expected Performance
- **Scraping Duration**: 30-60 seconds for 3 pages
- **Database Seeding**: 10-30 seconds
- **Total Pipeline**: 1-2 minutes
- **Data Freshness**: < 2 hours from Transfermarkt

### API Usage
- **Transfermarkt**: No API (web scraping)
- **API Football**: ~10 requests per sync
- **Supabase**: ~50 operations per sync

## Data Quality Checklist

### Before Each Run
- [ ] Transfermarkt website accessible
- [ ] API Football credentials valid
- [ ] Supabase connection working
- [ ] Disk space available (>100MB)

### After Each Run
- [ ] CSV file created and not empty
- [ ] Database updated with new records
- [ ] No error messages in logs
- [ ] Recent transfers visible in application

## Emergency Procedures

### If Scraper Fails
1. **Fallback**: Use last good CSV file
2. **Manual**: Manually enter critical transfers
3. **Alert**: Create GitHub issue for investigation

### If Database Fails
1. **Backup**: Export current data
2. **Reset**: Clear and re-seed from scratch
3. **Verify**: Check Supabase status page

### Complete System Failure
1. **Isolate**: Test each component separately
2. **Rollback**: Use previous working version
3. **Escalate**: Contact system administrator

## Contact & Support

### Documentation
- **PRD**: `docs/M4-PRD.md` - Product requirements
- **Tech Spec**: `docs/M4-Tech-Spec.md` - Technical details
- **API Docs**: API-Football and Supabase documentation

### Issue Tracking
- **GitHub**: Create issues for bugs and improvements
- **Logs**: Check `logs/cron.log` for error details
- **Status**: Use `npm run mock-cron status` for system health

---

## Quick Reference Commands

```bash
# Full pipeline
./scripts/local-sync.sh

# Scrape only
npx tsx scripts/transfermarkt-scrape.ts

# Seed only
npx tsx scripts/seed.ts

# Test API
npm run mock-cron normal

# Check status
npm run mock-cron status

# View logs
tail -f logs/cron.log

# Launchd management
launchctl list | grep transferhub
launchctl start com.transferhub.sync
launchctl stop com.transferhub.sync
```

**Last Updated**: January 22, 2026  
**Version**: 1.0  
**Status**: ✅ Manual execution working, ⚠️ Launchd automation needs fixes
