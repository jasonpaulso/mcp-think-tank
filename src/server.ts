// src/server.ts
// Import console redirections first to ensure all logging is properly handled
import './utils/console.js';

import { initializeServer, resetInactivityTimer } from './core/index.js';
import { startServer } from './transport/index.js';
import { createLogger } from './utils/logger.js';
import { createCleanupScript } from './utils/process.js';

// Create logger
const logger = createLogger('server');

// Detect if tool scanning is in progress
const isToolScanMode = process.env.SMITHERY_TOOL_SCAN === 'true' || 
                        process.argv.includes('--tool-scan') ||
                        process.argv.includes('--scan-tools');

// Main server startup function
async function main() {
  try {
    logger.info('Starting MCP Think Tank server...');
    
    // Initialize server
    const server = await initializeServer();
    
    // Start the server with the appropriate transport
    await startServer(server, isToolScanMode);
    
    // Reset inactivity timer
    resetInactivityTimer();
    
    // Create cleanup script
    createCleanupScript();
    
  } catch (error) {
    logger.error(`Server startup failed: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  logger.error(`Uncaught error in main: ${error instanceof Error ? error.message : String(error)}`,
    error instanceof Error ? error : undefined);
  process.exit(1);
});