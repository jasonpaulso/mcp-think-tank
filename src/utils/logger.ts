/**
 * Logger levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

/**
 * Structured logger for MCP Think Tank
 */
export class Logger {
  private context: string;
  private level: LogLevel;
  private fileLogging: boolean;
  
  /**
   * Create a new logger instance
   * 
   * @param context Context label for the logger
   * @param level Minimum log level
   * @param fileLogging Whether to also log to file
   */
  constructor(context: string, level: LogLevel = 'info', fileLogging: boolean = false) {
    this.context = context;
    this.level = level;
    this.fileLogging = fileLogging;
  }
  
  /**
   * Log debug message
   * 
   * @param message Message to log
   * @param data Optional data to include
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, data);
    }
  }
  
  /**
   * Log informational message
   * 
   * @param message Message to log
   * @param data Optional data to include
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, data);
    }
  }
  
  /**
   * Log warning message
   * 
   * @param message Message to log
   * @param data Optional data to include
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, data);
    }
  }
  
  /**
   * Log error message
   * 
   * @param message Message to log
   * @param error Optional error object
   * @param data Optional data to include
   */
  error(message: string, error?: Error, data?: any): void {
    if (this.shouldLog('error')) {
      this.log('ERROR', message, data);
      
      if (error?.stack) {
        process.stderr.write(`${error.stack}\n`);
      }
    }
  }
  
  /**
   * Check if a message at this level should be logged
   * 
   * @param level Log level to check
   * @returns Whether to log this message
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }
  
  /**
   * Internal logging function
   * 
   * @param level Log level
   * @param message Message to log
   * @param data Optional data to include
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    // Always write to stderr for MCP compatibility
    process.stderr.write(`${logLine}\n`);
    
    // Log data if provided
    if (data !== undefined) {
      try {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        process.stderr.write(`${dataStr}\n`);
      } catch (err) {
        process.stderr.write(`[Error serializing log data: ${err}]\n`);
      }
    }
    
    // File logging would be implemented here if enabled
    // We're skipping actual file implementation since that would require additional files
  }
}

/**
 * Get config from environment
 */
function getLoggerConfig(): { level: LogLevel, fileLogging: boolean } {
  return {
    level: (process.env.LOG_LEVEL || 'info') as LogLevel,
    fileLogging: process.env.MCP_LOG_FILE === 'true'
  };
}

/**
 * Create a logger for a specific context
 * 
 * @param context Context label for the logger
 * @returns Logger instance
 */
export function createLogger(context: string): Logger {
  const { level, fileLogging } = getLoggerConfig();
  return new Logger(context, level, fileLogging);
}

/**
 * Global root logger
 */
export const rootLogger = createLogger('root'); 