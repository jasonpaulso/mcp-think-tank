#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '../dist/server.js');

// Check if dist/server.js exists, if not, try to compile TypeScript files
if (!existsSync(distPath)) {
  try {
    logger.info(`[INFO] Compiled files not found at ${distPath}, attempting to build...`);
    execSync('npm run build', { 
      cwd: join(__dirname, '..'), 
      stdio: 'inherit' 
    });
  } catch (err) {
    logger.error(`Failed to build the project: ${err.message}`);
    logger.info('Attempting to run from source using ts-node...');
  }
}

// Import the server module (will use ts-node as fallback if compilation fails)
if (existsSync(distPath)) {
  import('../dist/server.js').catch(err => {
    logger.error(`Failed to start the Think Tank server: ${err.stack || err.message}`);
    process.exit(1);
  });
} else {
  // Fallback to ts-node
  import('ts-node/register/index.js').then(() => {
    import('../src/server.ts').catch(err => {
      logger.error(`Failed to start the Think Tank server: ${err.stack || err.message}`);
      process.exit(1);
    });
  }).catch(err => {
    logger.error(`Failed to load ts-node: ${err.stack || err.message}`);
    process.exit(1);
  });
} 