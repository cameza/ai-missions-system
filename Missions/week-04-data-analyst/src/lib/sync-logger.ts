/**
 * Sync Logging and Monitoring (MCS-96)
 * 
 * Provides structured logging for sync operations with
 * performance metrics, error tracking, and status monitoring.
 */

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  strategy: 'normal' | 'deadline_day' | 'emergency';
  season: number;
  trigger: 'cron' | 'manual';
  context: {
    isDeadlineDay: boolean;
    isManualOverride: boolean;
    isCronTrigger: boolean;
  };
  result: {
    totalProcessed: number;
    successful: number;
    failed: number;
    duration: number;
    leaguesProcessed: number;
    apiCallsUsed: number;
    errors: string[];
  };
  rateLimitStatus: {
    used: number;
    limit: number;
    remaining: number;
    emergencyMode: boolean;
    cacheHits: number;
    usagePercentage: number;
  };
  performance: {
    transfersPerSecond: number;
    apiCallsPerTransfer: number;
    averageTransferTime: number;
  };
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDuration: number;
  totalTransfersProcessed: number;
  totalApiCallsUsed: number;
  lastSyncTime: string | null;
  deadlineDaySyncs: number;
  emergencyModeSyncs: number;
  manualSyncs: number;
  cronSyncs: number;
}

class SyncLogger {
  private logs: SyncLogEntry[] = [];
  private maxLogs: number = 100;

  /**
   * Log a sync operation
   */
  logSync(entry: Omit<SyncLogEntry, 'id'>): void {
    const logEntry: SyncLogEntry = {
      ...entry,
      id: this.generateLogId(),
    };

    // Calculate performance metrics
    logEntry.performance = this.calculatePerformanceMetrics(logEntry.result);

    // Add to logs (maintain max size)
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console for monitoring
    this.logToConsole(logEntry);
  }

  /**
   * Get recent sync logs
   */
  getRecentLogs(limit: number = 10): SyncLogEntry[] {
    return this.logs.slice(0, limit);
  }

  /**
   * Get sync metrics
   */
  getMetrics(): SyncMetrics {
    const totalSyncs = this.logs.length;
    const successfulSyncs = this.logs.filter(log => log.result.failed === 0).length;
    const failedSyncs = totalSyncs - successfulSyncs;
    
    const totalDuration = this.logs.reduce((sum, log) => sum + log.result.duration, 0);
    const averageDuration = totalSyncs > 0 ? totalDuration / totalSyncs : 0;
    
    const totalTransfersProcessed = this.logs.reduce((sum, log) => sum + log.result.totalProcessed, 0);
    const totalApiCallsUsed = this.logs.reduce((sum, log) => sum + log.result.apiCallsUsed, 0);
    
    const lastSyncTime = this.logs.length > 0 ? this.logs[0].timestamp : null;
    
    const deadlineDaySyncs = this.logs.filter(log => log.context.isDeadlineDay).length;
    const emergencyModeSyncs = this.logs.filter(log => log.rateLimitStatus.emergencyMode).length;
    const manualSyncs = this.logs.filter(log => log.trigger === 'manual').length;
    const cronSyncs = this.logs.filter(log => log.trigger === 'cron').length;

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageDuration,
      totalTransfersProcessed,
      totalApiCallsUsed,
      lastSyncTime,
      deadlineDaySyncs,
      emergencyModeSyncs,
      manualSyncs,
      cronSyncs,
    };
  }

  /**
   * Get logs by strategy
   */
  getLogsByStrategy(strategy: 'normal' | 'deadline_day' | 'emergency'): SyncLogEntry[] {
    return this.logs.filter(log => log.strategy === strategy);
  }

  /**
   * Get logs by trigger type
   */
  getLogsByTrigger(trigger: 'cron' | 'manual'): SyncLogEntry[] {
    return this.logs.filter(log => log.trigger === trigger);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(result: SyncLogEntry['result']) {
    const transfersPerSecond = result.duration > 0 ? (result.totalProcessed / (result.duration / 1000)) : 0;
    const apiCallsPerTransfer = result.totalProcessed > 0 ? (result.apiCallsUsed / result.totalProcessed) : 0;
    const averageTransferTime = result.totalProcessed > 0 ? (result.duration / result.totalProcessed) : 0;

    return {
      transfersPerSecond: Math.round(transfersPerSecond * 100) / 100,
      apiCallsPerTransfer: Math.round(apiCallsPerTransfer * 100) / 100,
      averageTransferTime: Math.round(averageTransferTime * 100) / 100,
    };
  }

  /**
   * Log to console with structured format
   */
  private logToConsole(entry: SyncLogEntry): void {
    console.log(`📊 Sync Log [${entry.id}]`);
    console.log(`  Strategy: ${entry.strategy}`);
    console.log(`  Trigger: ${entry.trigger}`);
    console.log(`  Duration: ${entry.result.duration}ms`);
    console.log(`  Transfers: ${entry.result.successful}/${entry.result.totalProcessed}`);
    console.log(`  API Calls: ${entry.result.apiCallsUsed}`);
    console.log(`  Performance: ${entry.performance.transfersPerSecond} transfers/sec`);
    
    if (entry.result.failed > 0) {
      console.log(`  Errors: ${entry.result.errors.join(', ')}`);
    }
    
    if (entry.rateLimitStatus.emergencyMode) {
      console.log(`  ⚠️ Emergency Mode Active`);
    }
    
    if (entry.context.isDeadlineDay) {
      console.log(`  📅 Deadline Day Mode`);
    }
  }
}

// Global sync logger instance
export const syncLogger = new SyncLogger();

/**
 * Helper function to log sync from API route
 */
export function logSyncOperation(
  strategy: 'normal' | 'deadline_day' | 'emergency',
  season: number,
  trigger: 'cron' | 'manual',
  context: any,
  result: any,
  rateLimitStatus: any
): void {
  syncLogger.logSync({
    timestamp: new Date().toISOString(),
    strategy,
    season,
    trigger,
    context,
    result,
    rateLimitStatus,
    performance: {} as any, // Will be calculated by the logger
  });
}
