// Since pino's ESM typing can be challenging, try a dynamic import approach
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pino = require('pino');

const logDir = path.join(homedir(), '.mcp-think-tank', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, 'mcp-think-tank.log');
const enableFile = process.env.MCP_LOG_FILE !== 'false';

const targets = enableFile
  ? [
      {
        target: 'pino-roll',
        options: {
          file: logFile,
          interval: '1d',
          size: '10M',
          mkdir: true
        }
      }
    ]
  : [];

export const logger = pino(
  {
    level: process.env.MCP_LOG_LEVEL ?? (process.env.MCP_DEBUG ? 'debug' : 'info'),
    timestamp: pino.stdTimeFunctions.isoTime
  },
  pino.transport({ targets })
);