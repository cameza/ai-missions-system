# Vercel Cron Schedule Update

## Changes Made

Updated `vercel.json` to run Transfermarkt scraping twice daily at optimal times for Eastern Time zone.

## New Schedule

### Previous Schedule
- **Frequency**: Every 8 hours (3x daily)
- **Times**: 6:00 AM UTC, 2:00 PM UTC, 10:00 PM UTC

### New Schedule  
- **Frequency**: Twice daily (2x daily)
- **Times**: 
  - 11:30 AM Eastern (16:30 UTC)
  - 11:30 PM Eastern (4:30 UTC next day)

## Cron Expressions

```json
{
  "crons": [
    {
      "path": "/api/sync/transfers",
      "schedule": "30 16 * * *"  // 11:30 AM Eastern
    },
    {
      "path": "/api/sync/transfers", 
      "schedule": "30 4 * * *"   // 11:30 PM Eastern
    }
  ]
}
```

## Rationale

### Why 11:30 AM Eastern?
- **Mid-day timing**: Captures morning transfer announcements
- **Business hours**: Good for monitoring and troubleshooting
- **Data freshness**: Updates database before peak usage

### Why 11:30 PM Eastern?
- **End-of-day timing**: Captures late transfer announcements
- **Deadline day coverage**: Critical for transfer deadline periods
- **Backup redundancy**: If morning run fails, evening run catches up

### Why Twice Daily Instead of Once?
- **Reliability**: Redundancy if one execution fails
- **Data freshness**: More frequent updates during active periods
- **Deadline day preparation**: Better coverage during critical transfer windows

## Timezone Handling

- **Vercel uses UTC** for cron scheduling
- **Eastern Time conversion**:
  - Standard time (Nov-Mar): UTC-5
  - Daylight time (Mar-Nov): UTC-4
- **Current schedule** assumes standard time (UTC-5)

## Next Steps

1. **Deploy to Vercel**: Push changes to trigger deployment
2. **Test manually**: Verify cron endpoint works correctly
3. **Monitor logs**: Check Vercel function logs after first scheduled run
4. **Validate data**: Confirm fresh transfers appear in database

## Monitoring

After deployment, monitor:
- **Vercel function logs** for execution status
- **Database timestamps** for fresh data
- **Transfermarkt comparison** for data accuracy
- **Error rates** for any scraping issues

## Rollback Plan

If issues occur, revert to previous schedule:
```json
{
  "crons": [
    {
      "path": "/api/sync/transfers",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

**Updated**: January 23, 2026  
**Status**: Ready for deployment
