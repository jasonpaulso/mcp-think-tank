#!/usr/bin/env node

/**
 * This is the executable entry point for the think-mcp-server 
 * when installed globally via npm
 */

// Import the server module
import('../dist/server.js').catch(err => {
  console.error('Failed to start the Think Tool server:', err);
  process.exit(1);
}); 