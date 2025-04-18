import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

const logDir = path.join(homedir(), '.mcp-think-tank', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, 'mcp-think-tank.log');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

function writeLog(level: string, message: string) {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        fs.unlinkSync(logFile); // Delete the log if too big
      }
    }
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] [${level.toUpperCase()}] ${message}\n`, { encoding: 'utf8' });
  } catch {
    // If logging fails, do nothing (avoid crashing the app)
  }
}

export const logger = {
  info: (msg: string) => writeLog('info', msg),
  warn: (msg: string) => writeLog('warn', msg),
  error: (msg: string) => writeLog('error', msg)
};