import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { registerTaskTools } from './tasks/tools.js';
import { registerUtilityTools } from './utils/tools.js';
import { registerResearchTools } from './research/index.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';
import './config.js';
import { logger } from './utils/logger.js';

// Hijack console.log to stderr to prevent accidental stdout noise
console.log = (...args) => console.error(...args);

// Get configuration from environment
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300', 10);

// Log configuration
logger.info(`Request timeout set to ${REQUEST_TIMEOUT} seconds`);

// Create necessary directories
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
createDirectory(path.dirname(memoryPath));

logger.info(`Memory path: ${memoryPath}`);

// Create FastMCP server
const server = new FastMCP({
  name: "MCP Think Tank",
  version: "1.3.3"
});

// Register memory tools
registerMemoryTools(server);

// Add the 'think' tool for structured reasoning
registerThinkTool(server);

// Register task management tools
registerTaskTools(server);

// Register utility tools
registerUtilityTools(server);

// Register research tools
registerResearchTools(server);

// Start the server
server.start();

// Error handling
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});