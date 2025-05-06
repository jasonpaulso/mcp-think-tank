#!/usr/bin/env node

/**
 * Memory pruning utility for MCP Think Tank
 * 
 * This script helps clean up the knowledge graph by pruning old observations.
 * It can either delete observations or mark them as deprecated.
 * 
 * Usage:
 *   node bin/prune-memory.js --before=2023-01-01T00:00:00Z --tag=obsolete --deprecate
 *   node bin/prune-memory.js --dry-run --before=2023-01-01T00:00:00Z
 */

import { memoryStore } from '../dist/src/memory/store/index.js';
import minimist from 'minimist';
import path from 'path';
import os from 'os';

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
  string: ['before', 'tag', 'memory-path'],
  boolean: ['dry-run', 'deprecate', 'help'],
  alias: {
    h: 'help',
    b: 'before',
    t: 'tag',
    d: 'deprecate',
    n: 'dry-run',
    m: 'memory-path'
  }
});

// Show help and exit if requested
if (argv.help) {
  console.log(`
Memory Pruning Utility for MCP Think Tank

Usage:
  node bin/prune-memory.js [options]

Options:
  --before, -b     ISO date string to prune observations before (e.g., 2023-01-01T00:00:00Z)
  --tag, -t        Only prune observations containing this tag/text
  --deprecate, -d  Mark observations as deprecated instead of deleting them
  --dry-run, -n    Preview what would be pruned without making changes
  --memory-path, -m Path to memory file (defaults to MEMORY_PATH env var or ~/.mcp-think-tank/memory.jsonl)
  --help, -h       Show this help message

Examples:
  node bin/prune-memory.js --before=2023-01-01T00:00:00Z --deprecate
  node bin/prune-memory.js --tag="old feature" --dry-run
  `);
  process.exit(0);
}

// Main function
async function main() {
  try {
    // Determine memory path
    const memoryPath = argv['memory-path'] || process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
    console.log(`Using memory file: ${memoryPath}`);

    // Validate arguments
    if (!argv.before && !argv.tag) {
      console.error('Error: You must specify at least one of --before or --tag.');
      process.exit(1);
    }

    // If --before is specified, validate the date format
    if (argv.before) {
      try {
        new Date(argv.before);
      } catch (err) {
        console.error(`Error: Invalid date format for --before: ${argv.before}`);
        console.error('Please use ISO format, e.g., 2023-01-01T00:00:00Z');
        process.exit(1);
      }
    }

    // If dry run, inform the user
    if (argv['dry-run']) {
      console.log('DRY RUN: No changes will be made.');
    }

    // Build the query parameters for pruning
    const queryParams = {
      time: {}
    };

    if (argv.before) {
      queryParams.time.before = argv.before;
    }

    if (argv.tag) {
      queryParams.tag = argv.tag;
    }

    // First, query to see what would be pruned
    console.log('Searching for observations to prune...');
    const matchingObservations = await memoryStore.query({
      ...queryParams,
      limit: 1000 // Limit to prevent overwhelming output
    });

    console.log(`Found ${matchingObservations.length} matching observations.`);

    // If no matching observations, exit
    if (matchingObservations.length === 0) {
      console.log('No matching observations found. Nothing to prune.');
      process.exit(0);
    }

    // Preview the observations that would be pruned
    console.log('\nPreview of observations that would be pruned:');
    const previewCount = Math.min(10, matchingObservations.length);
    for (let i = 0; i < previewCount; i++) {
      const { entityName, observation } = matchingObservations[i];
      console.log(`- Entity: "${entityName}", Observation: "${observation.text.substring(0, 70)}${observation.text.length > 70 ? '...' : ''}"`);
    }

    if (matchingObservations.length > previewCount) {
      console.log(`... and ${matchingObservations.length - previewCount} more.`);
    }

    // If dry run, exit here
    if (argv['dry-run']) {
      console.log('\nDRY RUN completed. No changes were made.');
      process.exit(0);
    }

    // Confirm before proceeding
    console.log('\nWarning: This operation cannot be undone!');
    console.log(`About to ${argv.deprecate ? 'mark as deprecated' : 'delete'} ${matchingObservations.length} observations.`);
    
    // In a real interactive script, you would ask for confirmation here
    // Since this is a non-interactive script, we'll just proceed

    // Perform the pruning
    console.log('\nPruning observations...');
    const prunedCount = await memoryStore.prune({
      before: argv.before,
      tag: argv.tag,
      deprecate: !!argv.deprecate
    });

    console.log(`Successfully ${argv.deprecate ? 'marked as deprecated' : 'deleted'} ${prunedCount} observations.`);
    
    // Save changes
    await memoryStore.save();
    console.log('Changes saved to memory file.');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error during pruning: ${error}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error(`Unhandled error: ${err}`);
  process.exit(1);
}); 