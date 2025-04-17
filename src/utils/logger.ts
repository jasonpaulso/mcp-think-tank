import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

const logDir = path.join(homedir(), '.mcp-think-tank', 'logs');
fs.mkdirSync(logDir, { recursive: true });

export const logger = pino(
  {
    level: process.env.MCP_LOG_LEVEL ?? (process.env.MCP_DEBUG ? 'debug' : 'info'),
    timestamp: pino.stdTimeFunctions.isoTime
  },
  pino.destination({
    dest: path.join(logDir, 'mcp-think-tank.log'),
    minLength: 4096,
    sync: false
  })
);