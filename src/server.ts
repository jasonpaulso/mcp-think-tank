// Redirect console.log to stderr immediately at the top of the file
// This is crucial for FastMCP which uses stdio for communication
// eslint-disable-next-line no-global-assign
console.log = (...args: unknown[]) => console.error(...args);

import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { registerTaskTools } from './tasks/tools.js';
import { registerUtilityTools } from './utils/tools.js';
import { registerResearchTools } from './research/index.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';
import { config } from './config.js';
import { logger } from './utils/logger.js';

// NOTE: Moving console.log redirection to bootstrap.mjs
// This line will be removed after testing bootstrap.mjs is working

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
  version: config.version as `${number}.${number}.${number}` // Cast to the expected format
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

// --- Add FastMCP handshake resources/templates for Cursor compatibility ---
server.addResource({
  uri: 'status://health',
  name: 'Health',
  mimeType: 'text/plain',
  load: async () => ({ text: 'ok' })
});

server.addResourceTemplate({
  uriTemplate: 'task://{id}',
  name: 'Task JSON',
  mimeType: 'application/json',
  arguments: [{ name: 'id', description: 'Task ID' }],
  load: async ({ id }) => ({ text: JSON.stringify({ id }) })
});

// Start the server with error handling
try {
  server.start();
} catch (e) {
  logger.error(`Startup failed: ${e}`);
  process.exit(1);
}

// Error handling
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});