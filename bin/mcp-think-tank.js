#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

// Redirect console.log to stderr immediately 
// This is crucial for FastMCP which uses stdio for communication
console.log = (...args) => console.error(...args);

// Import the server module with error handling
import('../dist/src/server.js').catch(e => { 
  console.error(`Failed to start MCP Think Tank server:`, e); 
  process.exit(1); 
}); 