// src/server.ts
// Import console redirections first to ensure all logging is properly handled
import './utils/console.js';

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
import { taskStorage } from './tasks/storage.js';
import { wrapFastMCP, ensureDependencies } from './tools/FastMCPAdapter.js';

// Safely log errors to stderr without interfering with stdout JSON
const safeErrorLog = (message: string) => {
  process.stderr.write(`${message}\n`);
};

// Ensure all dependencies are installed
await ensureDependencies();

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

// Wrap FastMCP server with ToolManager before registering any tools
wrapFastMCP(server);

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

// Track active connections
let connectionCount = 0;
let inactivityTimer: NodeJS.Timeout | null = null;
let connectionCheckTimer: NodeJS.Timeout | null = null;

// Reset inactivity timer
function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (config.autoShutdownMs > 0) {
    inactivityTimer = setTimeout(() => {
      safeErrorLog(`Server inactive for ${config.autoShutdownMs}ms, shutting down...`);
      gracefulShutdown();
    }, config.autoShutdownMs);
  }
}

// Periodically check for active connections
function startConnectionCheck() {
  // Clear existing timer if any
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
  
  // Check every 60 seconds for active connections
  connectionCheckTimer = setInterval(() => {
    // For now, we don't have a reliable way to check active connections
    // FastMCP doesn't expose a method for this
    // This is a placeholder for future implementation
    
    // If AUTO_SHUTDOWN is forced via environment and no connections for a while
    if (process.env.FORCE_CHECK_CONNECTIONS === 'true' && 
        process.env.AUTO_SHUTDOWN === 'true' && 
        connectionCount <= 0) {
      safeErrorLog('No active connections detected, auto-shutdown initiated');
      gracefulShutdown();
    }
    
    // Reset inactivity timer regardless to prevent timeout
    resetInactivityTimer();
  }, 60000); // 60 second interval
}

// Graceful shutdown function
function gracefulShutdown() {
  safeErrorLog('Shutting down MCP Think Tank server...');
  
  // Clear any pending timeouts in task storage
  if (taskStorage && typeof taskStorage.clearAllTimeouts === 'function') {
    taskStorage.clearAllTimeouts();
  }
  
  // Clear inactivity timer if exists
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  // Clear connection check timer if exists
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
  
  // Gracefully stop the server (if needed)
  try {
    // Ensure all pending operations are completed
    // FastMCP doesn't currently have a stop method, but we can add safe cleanup here
    
    // Save any pending tasks
    taskStorage.saveImmediately();
    
    safeErrorLog('Server shut down successfully');
    process.exit(0);
  } catch (err) {
    safeErrorLog(`Error during shutdown: ${err}`);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);

// Start the server with error handling
try {
  server.start();
  safeErrorLog(`MCP Think Tank server v${config.version} started successfully`);
  resetInactivityTimer(); // Start inactivity timer
  startConnectionCheck(); // Start connection monitoring
} catch (e) {
  safeErrorLog(`Startup failed: ${e}`);
  process.exit(1);
}

// Error handling
process.on('uncaughtException', (error: Error) => {
  safeErrorLog(`Uncaught exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  safeErrorLog(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});