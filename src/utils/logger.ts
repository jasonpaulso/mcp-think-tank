import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

class Logger {
  private logFile: string;
  private debugMode: boolean;

  constructor() {
    // Use environment variable or default to false
    this.debugMode = process.env.MCP_DEBUG === 'true';
    
    // Set up log file path in user's home directory
    const logDir = path.join(homedir(), '.mcp-think-tank', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFile = path.join(logDir, 'mcp-think-tank.log');
  }

  private writeToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    
    // Append to log file
    fs.appendFileSync(this.logFile, logMessage);
  }

  private formatMessage(level: string, message: string): string {
    return `[${level}] ${message}`;
  }

  info(message: string) {
    const formattedMessage = this.formatMessage('INFO', message);
    if (this.debugMode) {
      // Use stderr to avoid interfering with stdio communication
      process.stderr.write(formattedMessage + '\n');
    }
    this.writeToFile(formattedMessage);
  }

  error(message: string) {
    const formattedMessage = this.formatMessage('ERROR', message);
    // Always write errors to stderr
    process.stderr.write(formattedMessage + '\n');
    this.writeToFile(formattedMessage);
  }

  debug(message: string) {
    if (this.debugMode) {
      const formattedMessage = this.formatMessage('DEBUG', message);
      process.stderr.write(formattedMessage + '\n');
      this.writeToFile(formattedMessage);
    }
  }
}

// Export a singleton instance
export const logger = new Logger(); 