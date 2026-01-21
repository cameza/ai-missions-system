# Initial Live Data Sync Runbook

**Version:** 1.0  
**Last Updated:** January 19, 2025  
**Owner:** Engineering Team  
**Status:** Active

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Sync Checklist](#pre-sync-checklist)
4. [Execution Steps](#execution-steps)
5. [Verification Procedures](#verification-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Troubleshooting](#troubleshooting)
9. [Post-Sync Actions](#post-sync-actions)

---

## Overview

This runbook guides the initial production synchronization of transfer data from API-Football to Supabase. This is a critical operation that establishes the baseline dataset for the Transfer Hub application.

**Scope:** First-time production data sync for 2025 winter transfer window  
**Duration:** Estimated 15-30 minutes  
**Risk Level:** Medium (data integrity, API quota consumption)

---

## Prerequisites

### Required Access

- [ ] Vercel project admin access
- [ ] Supabase project admin access
- [ ] API-Football account credentials
- [ ] Manual sync token (from environment variables)

### Required Tools

- [ ] Terminal access
- [ ] `curl` or Postman for API testing
- [ ] Browser for Supabase dashboard
- [ ] Access to monitoring dashboards (if configured)

### Environment Validation

Ensure all required environment variables are configured in Vercel:

```bash
# Required Variables
API_FOOTBALL_KEY=<your-key>
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
MANUAL_SYNC_TOKEN=<your-manual-token>

# Optional but Recommended
SYNC_API_KEY=<your-sync-key>
SLACK_WEBHOOK_URL=<your-webhook>
ERROR_WEBHOOK_URL=<your-error-webhook>

# Feature Flags
DEADLINE_DAY_MODE=false
ENABLE_DEADLINE_CRON=false
```

---

## Pre-Sync Checklist

### 1. Health Check Validation

Run the health check endpoint to verify system readiness:

```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T...",
  "checks": {
    "database": { "status": "pass", "message": "Database connection successful" },
    "apiFootball": { "status": "pass", "message": "API-Football connection successful" },
    "environment": { "status": "pass", "message": "All required environment variables configured" }
  }
}
```

**Go/No-Go Decision:**
- ✅ **GO** if all checks return `"status": "pass"`
- ❌ **NO-GO** if any check returns `"status": "fail"`

### 2. Database Schema Validation

Verify database tables exist and are empty (or ready for data):

```sql
-- Run in Supabase SQL Editor
SELECT 
  table_name,
  (SELECT COUNT(*) FROM transfers) as transfer_count,
  (SELECT COUNT(*) FROM clubs) as club_count,
  (SELECT COUNT(*) FROM leagues) as league_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('transfers', 'clubs', 'leagues');
```

**Expected:** Tables exist, counts may be 0 or contain seed data.

### 3. API Rate Limit Check

Verify API-Football quota before sync:

```bash
curl -X GET "https://v3.football.api-sports.io/status" \
  -H "x-rapidapi-key: YOUR_API_KEY" \
  -H "x-rapidapi-host: v3.football.api-sports.io"
```

**Verify:**
- Daily limit remaining > 100 requests
- Account status is active

### 4. CI/CD Validation

Ensure all tests pass before sync:

```bash
# Run locally or check CI status
pnpm lint
pnpm test
```

**Expected:** All tests pass, no lint errors.

### 5. Backup Verification

**Option A: Supabase Native Backups (Recommended)**
- Verify automatic daily backups are enabled in Supabase dashboard
- Navigate to: Project Settings > Database > Backups
- Confirm latest backup timestamp is recent (< 24 hours)

**Option B: Manual Backup (if needed)**
```bash
# Export current database state
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup_pre_sync_$(date +%Y%m%d_%H%M%S).sql
```

---

## Execution Steps

### Step 1: Dry Run (Staging/Dev Environment)

**If using staging environment:**

```bash
# Point to staging Supabase instance
export SUPABASE_URL=<staging-url>
export SUPABASE_SERVICE_ROLE_KEY=<staging-key>

# Trigger sync
curl -X POST https://your-app-staging.vercel.app/api/sync/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "normal",
    "season": 2025,
    "manualToken": "YOUR_MANUAL_TOKEN"
  }'
```

**If using local/dev environment:**

```bash
# Run locally
pnpm dev

# In another terminal
curl -X POST http://localhost:3000/api/sync/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "normal",
    "season": 2025,
    "manualToken": "YOUR_MANUAL_TOKEN"
  }'
```

**Validation:**
- Check response for `"success": true`
- Verify `totalProcessed > 0`
- Verify `failed === 0` or minimal failures
- Record row counts before/after

### Step 2: Production Sync Trigger

**Manual Trigger Command:**

```bash
curl -X POST https://your-app.vercel.app/api/sync/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "normal",
    "season": 2025,
    "manualToken": "YOUR_MANUAL_TOKEN",
    "isManualOverride": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "strategy": "normal",
  "season": 2025,
  "result": {
    "totalProcessed": 500,
    "successful": 495,
    "failed": 5,
    "duration": 12345,
    "leaguesProcessed": 5,
    "apiCallsUsed": 15
  },
  "rateLimitStatus": {
    "used": 15,
    "remaining": 2985,
    "emergencyMode": false
  }
}
```

### Step 3: Monitor Sync Progress

**Real-time Monitoring:**

1. **Vercel Logs:**
   - Navigate to Vercel Dashboard > Your Project > Logs
   - Filter by `/api/sync/transfers`
   - Watch for errors or warnings

2. **Supabase Logs:**
   - Navigate to Supabase Dashboard > Logs > Postgres Logs
   - Monitor for connection issues or query errors

3. **Rate Limit Monitoring:**
   ```bash
   # Check sync status endpoint
   curl https://your-app.vercel.app/api/sync/transfers
   ```

---

## Verification Procedures

### 1. Data Integrity Checks

```sql
-- Verify transfer count
SELECT COUNT(*) as total_transfers FROM transfers;

-- Verify data distribution by league
SELECT league_name, COUNT(*) as transfer_count
FROM transfers
GROUP BY league_name
ORDER BY transfer_count DESC;

-- Check for null critical fields
SELECT COUNT(*) as null_player_names
FROM transfers
WHERE player_full_name IS NULL OR player_full_name = '';

-- Verify transfer window assignment
SELECT window, COUNT(*) as count
FROM transfers
GROUP BY window;
```

**Expected Results:**
- Total transfers > 0
- All top 5 leagues represented
- No null player names
- Transfers assigned to correct window (2025-winter)

### 2. API Response Validation

Check sync status endpoint:

```bash
curl https://your-app.vercel.app/api/sync/transfers | jq
```

**Verify:**
- `syncMetrics.totalSyncs > 0`
- `syncMetrics.successfulSyncs > 0`
- `errorStats.total` is low or zero

### 3. Frontend Validation

1. Navigate to production URL
2. Verify dashboard displays data:
   - KPI cards show non-zero values
   - Transfer table populates
   - Charts render with data
3. Test filters and search functionality
4. Check mobile responsiveness

---

## Rollback Procedures

### Scenario 1: Partial Sync Failure (< 50% success rate)

**Action:** Truncate and retry

```sql
-- Truncate transfers table
TRUNCATE TABLE transfers CASCADE;

-- Verify empty
SELECT COUNT(*) FROM transfers;
```

Then re-run sync with adjusted parameters.

### Scenario 2: Data Corruption

**Action:** Restore from backup

**Option A: Supabase Point-in-Time Recovery**
1. Navigate to Supabase Dashboard > Database > Backups
2. Select backup timestamp before sync
3. Click "Restore" and confirm
4. Wait for restoration (5-15 minutes)

**Option B: Manual SQL Restore**
```bash
# Restore from backup file
psql -h db.your-project.supabase.co -U postgres -d postgres < backup_pre_sync_YYYYMMDD_HHMMSS.sql
```

### Scenario 3: API Rate Limit Exhaustion

**Action:** Wait and monitor

1. Check rate limit status:
   ```bash
   curl https://your-app.vercel.app/api/sync/transfers | jq '.status.rateLimit'
   ```
2. If `emergencyMode: true`, wait 24 hours for reset
3. Use cached data in the meantime
4. Consider upgrading API-Football plan

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Sync Success Rate:** Target > 95%
2. **API Rate Limit Usage:** Keep < 90% daily limit
3. **Database Connection Pool:** Monitor active connections
4. **Response Times:** Health check < 2s, Sync < 30s

### Alert Thresholds

Configure alerts for:
- Sync failure rate > 10%
- API rate limit > 90%
- Database connection errors
- Health check failures

### Observability Options

**Option A: Sentry Integration (Recommended for Production)**
```bash
# Add to environment
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ENVIRONMENT=production
```

**Option B: Slack Webhooks (Current Setup)**
- Errors automatically posted to configured Slack channel
- Monitor `ERROR_WEBHOOK_URL` channel

**Option C: Console Logging (Development)**
- Review Vercel function logs
- Use `console.log` statements for debugging

---

## Troubleshooting

### Issue: Health Check Fails - Database

**Symptoms:** `database.status: "fail"`

**Diagnosis:**
1. Check Supabase project status
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Test connection manually

**Resolution:**
```bash
# Test connection
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/transfers \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"count": "exact"}'
```

### Issue: Health Check Fails - API-Football

**Symptoms:** `apiFootball.status: "fail"`

**Diagnosis:**
1. Verify API key is valid
2. Check API-Football service status
3. Verify network connectivity

**Resolution:**
```bash
# Test API directly
curl -X GET "https://v3.football.api-sports.io/status" \
  -H "x-rapidapi-key: YOUR_KEY"
```

### Issue: Sync Returns High Failure Rate

**Symptoms:** `result.failed > 10%`

**Diagnosis:**
1. Check error logs in response
2. Review Vercel function logs
3. Verify data transformation logic

**Resolution:**
- Review `result.errors` array
- Check for schema mismatches
- Validate API response format

### Issue: Rate Limit Exceeded

**Symptoms:** `rateLimitStatus.emergencyMode: true`

**Diagnosis:**
- Check `rateLimitStatus.used` vs `limit`
- Review sync frequency

**Resolution:**
1. Reduce sync frequency temporarily
2. Use cached data
3. Wait for daily reset (24 hours)
4. Consider API plan upgrade

---

## Post-Sync Actions

### 1. Documentation

- [ ] Record sync timestamp and results
- [ ] Document any issues encountered
- [ ] Update this runbook with lessons learned

### 2. Performance Review

- [ ] Review sync duration
- [ ] Analyze API call efficiency
- [ ] Check database query performance

### 3. Data Quality Audit

- [ ] Run data quality checks (see Verification section)
- [ ] Validate transfer window assignments
- [ ] Check for duplicate records

### 4. Monitoring Setup

- [ ] Verify cron jobs are scheduled correctly
- [ ] Confirm alert channels are working
- [ ] Set up dashboard for ongoing monitoring

### 5. Team Communication

- [ ] Notify team of successful sync
- [ ] Share metrics and insights
- [ ] Schedule post-mortem if issues occurred

---

## Quick Reference

### Essential Commands

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Manual sync
curl -X POST https://your-app.vercel.app/api/sync/transfers \
  -H "Content-Type: application/json" \
  -d '{"strategy": "normal", "season": 2025, "manualToken": "TOKEN"}'

# Check sync status
curl https://your-app.vercel.app/api/sync/transfers

# Verify data count
psql -h db.PROJECT.supabase.co -U postgres -c "SELECT COUNT(*) FROM transfers;"
```

### Emergency Contacts

- **Engineering Lead:** [Contact Info]
- **DevOps/Platform:** [Contact Info]
- **On-Call Engineer:** [Contact Info]

### External Resources

- [API-Football Documentation](https://www.api-football.com/documentation-v3)
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Project Tech Spec](../M4-Tech-Spec.md)
- [Project PRD](../M4-PRD.md)

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-19 | 1.0 | Initial runbook creation | Engineering Team |

---

## Sign-Off

**Pre-Sync Approval:**
- [ ] Engineering Lead
- [ ] Product Owner
- [ ] QA Lead

**Post-Sync Confirmation:**
- [ ] Sync completed successfully
- [ ] Data verified
- [ ] Monitoring active
- [ ] Team notified

**Approved By:** _______________  
**Date:** _______________
