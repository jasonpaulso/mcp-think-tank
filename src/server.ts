import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';
import { config } from './config.js';
import { logger } from './utils/logger.js';

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
  version: "1.0.5"
});

// Register memory tools
registerMemoryTools(server);

// Add the 'think' tool for structured reasoning
registerThinkTool(server);

// Start the server
server.start();

// Error handling
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled rejection:', reason);
});