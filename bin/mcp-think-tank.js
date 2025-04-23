#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

import('../dist/server.js').catch(e => { 
  console.error(e); 
  process.exit(1); 
}); 