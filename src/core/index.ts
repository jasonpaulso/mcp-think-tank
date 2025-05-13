import { FastMCP } from 'fastmcp';
import { config } from '../config.js';
import { wrapFastMCP, ensureDependencies } from '../tools/FastMCPAdapter.js';
import { registerAllTools } from './tools.js';
import { setupResources } from './resources.js';
import { createLogger } from '../utils/logger.js';
import { initializeProcess, cleanupProcess, ProcessInfo, createCleanupScript } from '../utils/process.js';
import { taskStorage } from '../tasks/storage.js';

// Create logger
const logger = createLogger('core');

// Server state globals
export const serverState = {
  connectionCount: 0,
  inactivityTimer: null as NodeJS.Timeout | null,
  connectionCheckTimer: null as NodeJS.Timeout | null,
  processInfo: null as ProcessInfo | null,
  httpServer: null as any,
};

/**
 * Initialize the MCP Think Tank server instance
 */
export async function initializeServer() {
  // Ensure all dependencies are installed
  await ensureDependencies();

  // Initialize process tracking
  serverState.processInfo = initializeProcess();

  // Detect if tool scanning is in progress
  const isToolScanMode = process.env.SMITHERY_TOOL_SCAN === 'true' || 
                        process.argv.includes('--tool-scan') ||
                        process.argv.includes('--scan-tools');

  // Create FastMCP server
  const server = new FastMCP({
    name: "MCP Think Tank",
    version: config.version as `${number}.${number}.${number}`,
    // Add instructions field for better tool scanning behavior
    instructions: isToolScanMode 
      ? "MCP Think Tank provides tools for structured reasoning, knowledge graph memory, and web research. All tools support lazy loading." 
      : undefined
  });

  // Initialize server
  wrapFastMCP(server);
  
  // Register tools and resources
  registerAllTools(server);
  setupResources(server);

  // Set up signal handlers for clean shutdown
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('disconnect', () => {
    logger.warn('Parent process disconnected, shutting down...');
    gracefulShutdown();
  });
  
  // Set up error handlers
  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught exception: ${error.message}`, error);
    
    // For severe errors, consider shutting down to prevent zombie processes
    if (error.message.includes('EADDRINUSE') || error.message.includes('port already in use')) {
      logger.error('Critical error detected, shutting down server...');
      gracefulShutdown();
    }
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    const errorObj = reason instanceof Error ? reason : undefined;
    logger.error(`Unhandled rejection: ${errorMessage}`, errorObj);
  });

  return server;
}

/**
 * Reset inactivity timer
 */
export function resetInactivityTimer() {
  // Auto shutdown after 30 minutes of inactivity by default, can be overridden with AUTO_SHUTDOWN_MS
  const autoShutdownMs = config.autoShutdownMs;

  if (serverState.inactivityTimer) {
    clearTimeout(serverState.inactivityTimer);
    serverState.inactivityTimer = null;
  }
  
  if (autoShutdownMs > 0) {
    serverState.inactivityTimer = setTimeout(() => {
      logger.info(`Server inactive for ${autoShutdownMs}ms, shutting down...`);
      gracefulShutdown();
    }, autoShutdownMs);
  }
}

/**
 * Graceful shutdown function
 */
export function gracefulShutdown() {
  logger.info('Shutting down MCP Think Tank server...');
  
  // Clear any pending timeouts in task storage
  if (taskStorage && typeof taskStorage.clearAllTimeouts === 'function') {
    taskStorage.clearAllTimeouts();
  }
  
  // Clear inactivity timer if exists
  if (serverState.inactivityTimer) {
    clearTimeout(serverState.inactivityTimer);
    serverState.inactivityTimer = null;
  }
  
  // Clear connection check timer if exists
  if (serverState.connectionCheckTimer) {
    clearInterval(serverState.connectionCheckTimer);
    serverState.connectionCheckTimer = null;
  }
  
  // Clean up process resources
  if (serverState.processInfo) {
    cleanupProcess(serverState.processInfo);
  }
  
  // Gracefully stop the server (if needed)
  try {
    // Save any pending tasks
    taskStorage.saveImmediately();
    
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error instanceof Error ? error.message : String(error)}`, 
      error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

// For backward compatibility
export const safeErrorLog = (message: string) => {
  logger.error(message);
}; 