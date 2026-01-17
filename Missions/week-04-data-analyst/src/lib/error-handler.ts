/**
 * Error Handler - Retry Logic & Alerting
 * 
 * Implements comprehensive error handling with exponential backoff
 * retry logic and alerting for critical failures.
 * 
 * Tech Spec §7.4: Error Handling & Monitoring
 * 
 * @version 1.0
 * @since 2025-01-17
 */

// ============================================================================
// ERROR TYPES & CLASSIFICATION
// ============================================================================

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories
 */
export type ErrorCategory = 
  | 'api_rate_limit'
  | 'api_authentication'
  | 'api_network'
  | 'api_validation'
  | 'database_connection'
  | 'database_transaction'
  | 'database_validation'
  | 'data_transformation'
  | 'sync_orchestration'
  | 'unknown';

/**
 * Standardized error structure
 */
export interface StandardError {
  /** Error ID for tracking */
  id: string;
  /** Error message */
  message: string;
  /** Error category */
  category: ErrorCategory;
  /** Error severity */
  severity: ErrorSeverity;
  /** Original error */
  originalError?: Error;
  /** Timestamp */
  timestamp: Date;
  /** Context information */
  context?: Record<string, any>;
  /** Stack trace */
  stack?: string;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Whether to jitter delays */
  jitter: boolean;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  /** Whether alerts are enabled */
  enabled: boolean;
  /** Webhook URL for alerts */
  webhookUrl?: string;
  /** Slack webhook URL */
  slackWebhookUrl?: string;
  /** Email recipients for alerts */
  emailRecipients?: string[];
  /** Minimum severity for alerts */
  minSeverity: ErrorSeverity;
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

/**
 * Classify error based on message and type
 */
export function classifyError(error: Error | string): ErrorCategory {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // API Rate Limit errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return 'api_rate_limit';
  }

  // API Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden') || 
      lowerMessage.includes('authentication') || lowerMessage.includes('api key')) {
    return 'api_authentication';
  }

  // API Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || 
      lowerMessage.includes('timeout') || lowerMessage.includes('fetch')) {
    return 'api_network';
  }

  // API Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('schema') || 
      lowerMessage.includes('invalid data') || lowerMessage.includes('parse')) {
    return 'api_validation';
  }

  // Database Connection errors
  if (lowerMessage.includes('database connection') || lowerMessage.includes('connection pool') || 
      lowerMessage.includes('database unavailable')) {
    return 'database_connection';
  }

  // Database Transaction errors
  if (lowerMessage.includes('transaction') || lowerMessage.includes('rollback') || 
      lowerMessage.includes('commit') || lowerMessage.includes('deadlock')) {
    return 'database_transaction';
  }

  // Database Validation errors
  if (lowerMessage.includes('constraint') || lowerMessage.includes('foreign key') || 
      lowerMessage.includes('unique constraint') || lowerMessage.includes('not null')) {
    return 'database_validation';
  }

  // Data Transformation errors
  if (lowerMessage.includes('transform') || lowerMessage.includes('normalize') || 
      lowerMessage.includes('convert') || lowerMessage.includes('format')) {
    return 'data_transformation';
  }

  // Sync Orchestration errors
  if (lowerMessage.includes('sync') || lowerMessage.includes('orchestrator') || 
      lowerMessage.includes('pipeline') || lowerMessage.includes('batch')) {
    return 'sync_orchestration';
  }

  return 'unknown';
}

/**
 * Determine error severity based on category and context
 */
export function determineSeverity(category: ErrorCategory, context?: Record<string, any>): ErrorSeverity {
  switch (category) {
    case 'api_authentication':
    case 'database_connection':
      return 'critical';

    case 'api_rate_limit':
    case 'database_transaction':
      return 'high';

    case 'api_network':
    case 'database_validation':
      return 'medium';

    case 'api_validation':
    case 'data_transformation':
    case 'sync_orchestration':
      return 'low';

    case 'unknown':
    default:
      return 'medium';
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  backoffMultiplier: 2,
  maxDelay: 30000, // 30 seconds
  jitter: true,
};

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: Record<string, any>
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain error types
      if (shouldNotRetry(lastError)) {
        throw createStandardError(lastError, context);
      }

      if (attempt === retryConfig.maxAttempts) {
        // Last attempt failed, throw standardized error
        throw createStandardError(lastError, context);
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(retryConfig, attempt);
      
      console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(config: RetryConfig, attempt: number): number {
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  
  // Apply maximum delay limit
  delay = Math.min(delay, config.maxDelay);
  
  // Apply jitter if enabled
  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5); // 50% to 100% of delay
  }
  
  return Math.round(delay);
}

/**
 * Determine if error should not be retried
 */
function shouldNotRetry(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Don't retry authentication errors
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return true;
  }
  
  // Don't retry validation errors
  if (message.includes('validation') || message.includes('schema') || 
      message.includes('invalid data') || message.includes('parse')) {
    return true;
  }
  
  // Don't retry not found errors
  if (message.includes('not found') || message.includes('404')) {
    return true;
  }
  
  return false;
}

// ============================================================================
// STANDARD ERROR CREATION
// ============================================================================

/**
 * Create standardized error
 */
export function createStandardError(
  originalError: Error,
  context?: Record<string, any>
): StandardError {
  const category = classifyError(originalError);
  const severity = determineSeverity(category, context);

  return {
    id: crypto.randomUUID(),
    message: originalError.message,
    category,
    severity,
    originalError,
    timestamp: new Date(),
    context,
    stack: originalError.stack,
  };
}

/**
 * Create standardized error from string
 */
export function createStandardErrorFromString(
  message: string,
  context?: Record<string, any>
): StandardError {
  const error = new Error(message);
  return createStandardError(error, context);
}

// ============================================================================
// ALERTING SYSTEM
// ============================================================================

/**
 * Alert manager class
 */
export class AlertManager {
  private config: AlertConfig;

  constructor(config: AlertConfig) {
    this.config = config;
  }

  /**
   * Send alert for error
   */
  async sendAlert(error: StandardError): Promise<void> {
    if (!this.config.enabled || error.severity === 'low') {
      return;
    }

    if (error.severity === 'critical' || 
        (this.config.minSeverity === 'high' && error.severity === 'high')) {
      await this.sendCriticalAlert(error);
    } else if (error.severity === 'medium' || 
               (this.config.minSeverity === 'medium' && error.severity === 'high')) {
      await this.sendWarningAlert(error);
    }
  }

  /**
   * Send critical alert
   */
  private async sendCriticalAlert(error: StandardError): Promise<void> {
    const message = `🚨 CRITICAL ERROR: ${error.message}`;
    
    console.error(message);
    console.error('Category:', error.category);
    console.error('Context:', error.context);
    console.error('Timestamp:', error.timestamp.toISOString());

    // Send to Slack if configured
    if (this.config.slackWebhookUrl) {
      await this.sendSlackAlert(message, error, 'danger');
    }

    // Send webhook if configured
    if (this.config.webhookUrl) {
      await this.sendWebhookAlert(error);
    }
  }

  /**
   * Send warning alert
   */
  private async sendWarningAlert(error: StandardError): Promise<void> {
    const message = `⚠️ WARNING: ${error.message}`;
    
    console.warn(message);
    console.warn('Category:', error.category);
    console.warn('Context:', error.context);

    // Send to Slack if configured
    if (this.config.slackWebhookUrl) {
      await this.sendSlackAlert(message, error, 'warning');
    }
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(
    message: string, 
    error: StandardError, 
    color: 'danger' | 'warning' | 'good'
  ): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    try {
      const payload = {
        text: message,
        attachments: [{
          color,
          fields: [
            { title: 'Error ID', value: error.id, short: true },
            { title: 'Category', value: error.category, short: true },
            { title: 'Severity', value: error.severity, short: true },
            { title: 'Timestamp', value: error.timestamp.toISOString(), short: true },
          ],
          ...(error.context && {
            fields: [
              { title: 'Context', value: JSON.stringify(error.context, null, 2), short: false },
            ],
          }),
        }],
      };

      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError);
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(error: StandardError): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (webhookError) {
      console.error('Failed to send webhook alert:', webhookError);
    }
  }
}

// ============================================================================
// ERROR LOGGER
// ============================================================================

/**
 * Error logger class
 */
export class ErrorLogger {
  private alertManager: AlertManager;
  private errors: StandardError[] = [];

  constructor(alertConfig: AlertConfig) {
    this.alertManager = new AlertManager(alertConfig);
  }

  /**
   * Log error and send alert if needed
   */
  async logError(error: Error | string, context?: Record<string, any>): Promise<StandardError> {
    const standardError = typeof error === 'string' 
      ? createStandardErrorFromString(error, context)
      : createStandardError(error, context);

    // Store error
    this.errors.push(standardError);

    // Log to console
    this.logToConsole(standardError);

    // Send alert
    await this.alertManager.sendAlert(standardError);

    return standardError;
  }

  /**
   * Log error to console with appropriate level
   */
  private logToConsole(error: StandardError): void {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.category}: ${error.message}`;
    
    switch (error.severity) {
      case 'critical':
        console.error(logMessage, error.context);
        break;
      case 'high':
        console.error(logMessage, error.context);
        break;
      case 'medium':
        console.warn(logMessage, error.context);
        break;
      case 'low':
        console.log(logMessage, error.context);
        break;
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): StandardError[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent24h: 0,
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const error of this.errors) {
      // Count by category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Count recent errors
      if (error.timestamp > yesterday) {
        stats.recent24h++;
      }
    }

    return stats;
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Create error logger instance
 */
export function createErrorLogger(alertConfig: AlertConfig): ErrorLogger {
  return new ErrorLogger(alertConfig);
}

/**
 * Default alert configuration
 */
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  minSeverity: 'high',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  webhookUrl: process.env.ERROR_WEBHOOK_URL,
};

/**
 * Global error logger instance
 */
export const globalErrorLogger = createErrorLogger(DEFAULT_ALERT_CONFIG);
