// Redirect console.log to stderr immediately at the top of the file
// This is crucial for FastMCP which uses stdio for communication
// eslint-disable-next-line no-global-assign
console.log = (...args: unknown[]) => console.error(...args);

// EPIPE error handling
process.on('SIGPIPE', () => {});
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') return;
  throw err;
});

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

// Get configuration from environment
const _REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300', 10);

// Create necessary directories
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
createDirectory(path.dirname(memoryPath));

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
  console.error(`Startup failed: ${e}`);
  process.exit(1);
}

// Error handling
process.on('uncaughtException', (error: Error) => {
  console.error(`Uncaught exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});