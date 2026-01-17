#!/usr/bin/env node

/**
 * Mock Cron Script for Local Development (MCS-96)
 * 
 * Simulates Vercel cron job triggers locally for testing
 * the sync pipeline without deploying to Vercel.
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SYNC_ENDPOINT = '/api/sync/transfers';
const MANUAL_TOKEN = process.env.MANUAL_SYNC_TOKEN || 'test-token-123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Make HTTP request to sync endpoint
 */
async function triggerSync(payload = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(SYNC_ENDPOINT, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const postData = JSON.stringify({
      isCronTrigger: true,
      season: 2025,
      ...payload,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(payload.manualToken && { 'x-api-key': payload.manualToken }),
      },
    };

    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Get sync status
 */
async function getSyncStatus() {
  return new Promise((resolve, reject) => {
    const url = new URL(SYNC_ENDPOINT, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'GET',
    };

    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Main execution functions
 */

async function runNormalSync() {
  log('\n🚀 Running Normal Sync', colors.cyan);
  try {
    const response = await triggerSync();
    if (response.status === 200) {
      log('✅ Normal sync completed successfully', colors.green);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`❌ Normal sync failed with status ${response.status}`, colors.red);
      console.log(response.data);
    }
  } catch (error) {
    log(`❌ Error running normal sync: ${error.message}`, colors.red);
  }
}

async function runDeadlineDaySync() {
  log('\n📅 Running Deadline Day Sync', colors.yellow);
  try {
    const response = await triggerSync({ strategy: 'deadline_day' });
    if (response.status === 200) {
      log('✅ Deadline day sync completed successfully', colors.green);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`❌ Deadline day sync failed with status ${response.status}`, colors.red);
      console.log(response.data);
    }
  } catch (error) {
    log(`❌ Error running deadline day sync: ${error.message}`, colors.red);
  }
}

async function runEmergencySync() {
  log('\n🚨 Running Emergency Sync', colors.red);
  try {
    const response = await triggerSync({ strategy: 'emergency' });
    if (response.status === 200) {
      log('✅ Emergency sync completed successfully', colors.green);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`❌ Emergency sync failed with status ${response.status}`, colors.red);
      console.log(response.data);
    }
  } catch (error) {
    log(`❌ Error running emergency sync: ${error.message}`, colors.red);
  }
}

async function runManualSync() {
  log('\n👤 Running Manual Sync', colors.blue);
  try {
    const response = await triggerSync({ 
      manualToken: MANUAL_TOKEN,
      isManualOverride: true 
    });
    if (response.status === 200) {
      log('✅ Manual sync completed successfully', colors.green);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`❌ Manual sync failed with status ${response.status}`, colors.red);
      console.log(response.data);
    }
  } catch (error) {
    log(`❌ Error running manual sync: ${error.message}`, colors.red);
  }
}

async function showStatus() {
  log('\n📊 Current Sync Status', colors.magenta);
  try {
    const response = await getSyncStatus();
    if (response.status === 200) {
      log('✅ Status retrieved successfully', colors.green);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      log(`❌ Failed to get status with status ${response.status}`, colors.red);
      console.log(response.data);
    }
  } catch (error) {
    log(`❌ Error getting status: ${error.message}`, colors.red);
  }
}

function showHelp() {
  log('\n📖 Mock Cron Script Help', colors.cyan);
  log('\nAvailable commands:', colors.bright);
  log('  normal     - Run normal sync strategy', colors.reset);
  log('  deadline   - Run deadline day sync strategy', colors.reset);
  log('  emergency  - Run emergency sync strategy', colors.reset);
  log('  manual     - Run manual sync with token', colors.reset);
  log('  status     - Show current sync status', colors.reset);
  log('  help       - Show this help message', colors.reset);
  
  log('\nEnvironment variables:', colors.bright);
  log('  BASE_URL           - Base URL of the application (default: http://localhost:3000)', colors.reset);
  log('  MANUAL_SYNC_TOKEN  - Token for manual sync (default: test-token-123)', colors.reset);
  
  log('\nExamples:', colors.bright);
  log('  BASE_URL=http://localhost:3000 npm run mock-cron normal', colors.reset);
  log('  MANUAL_SYNC_TOKEN=my-token npm run mock-cron manual', colors.reset);
  log('  npm run mock-cron status', colors.reset);
}

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  
  log('🤖 Mock Cron Script for Transfer Sync', colors.cyan);
  log(`🌐 Target: ${BASE_URL}`, colors.blue);
  
  switch (command.toLowerCase()) {
    case 'normal':
      await runNormalSync();
      break;
    case 'deadline':
      await runDeadlineDaySync();
      break;
    case 'emergency':
      await runEmergencySync();
      break;
    case 'manual':
      await runManualSync();
      break;
    case 'status':
      await showStatus();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught error: ${error.message}`, colors.red);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled rejection: ${reason}`, colors.red);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  triggerSync,
  getSyncStatus,
  runNormalSync,
  runDeadlineDaySync,
  runEmergencySync,
  runManualSync,
  showStatus,
};
