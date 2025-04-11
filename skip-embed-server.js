#!/usr/bin/env node

/**
 * This script runs the server with embedding service disabled
 * to prevent timeout issues
 */

process.env.SKIP_EMBEDDINGS = 'true';
process.env.VOYAGE_API_KEY = 'dummy-key'; // Set a dummy key so it won't try to initialize

// Import the server module
import('./dist/server.js').catch(err => {
  console.error('Failed to start the Think Tool server:', err);
  process.exit(1);
}); 