# Launchd Management Guide

## What is Launchd?

Launchd is macOS's native service management framework that replaces cron for background tasks. It's more reliable and provides better logging and error handling.

## Our Transfer Hub Sync Agent

**File**: `scripts/com.transferhub.sync.plist`
**Label**: `com.transferhub.sync`
**Schedule**: Every hour (3600 seconds)
**Logs**: `logs/cron.log`

## Management Commands

### Check Status
```bash
launchctl list | grep com.transferhub.sync
```
Output: `- 78 com.transferhub.sync` (running with PID 78)

### Start Agent
```bash
cd "/Users/camilomeza/Documents/Personal Documents/Personal Projects/AIDB Challenge/Missions/week-04-data-analyst"
launchctl start com.transferhub.sync
```

### Stop Agent
```bash
launchctl stop com.transferhub.sync
```

### Restart Agent
```bash
launchctl stop com.transferhub.sync
launchctl start com.transferhub.sync
```

### Unload/Remove Agent
```bash
launchctl unload scripts/com.transferhub.sync.plist
```

### Load/Install Agent
```bash
launchctl load scripts/com.transferhub.sync.plist
```

## Monitoring

### Check Logs
```bash
cd "/Users/camilomeza/Documents/Personal Documents/Personal Projects/AIDB Challenge/Missions/week-04-data-analyst"
cat logs/cron.log
```

### Check Sync Status
```bash
cd "/Users/camilomeza/Documents/Personal Documents/Personal Projects/AIDB Challenge/Missions/week-04-data-analyst"
npm run mock-cron status
```

## Troubleshooting

### If Agent Not Running
1. Check if loaded: `launchctl list | grep com.transferhub.sync`
2. Load if missing: `launchctl load scripts/com.transferhub.sync.plist`
3. Check logs for errors: `cat logs/cron.log`

### If Agent Fails
1. Check logs for error messages
2. Verify working directory path is correct
3. Ensure npm/node are accessible at specified paths
4. Restart agent: `launchctl stop com.transferhub.sync && launchctl start com.transferhub.sync`

## Key Differences from Cron

| Feature | Cron | Launchd |
|---------|------|---------|
| Reliability | Unreliable on macOS | ✅ Reliable |
| Logging | Manual setup | ✅ Built-in |
| Restart on failure | No | ✅ Automatic |
| User context | Issues | ✅ Proper |
| System integration | Legacy | ✅ Native |

## Schedule Configuration

Current: Every hour (3600 seconds)
To change frequency, modify the `StartInterval` value in the plist file:
- 1800 = 30 minutes
- 3600 = 1 hour  
- 14400 = 4 hours
- 86400 = 24 hours
