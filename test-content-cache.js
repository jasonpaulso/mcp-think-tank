#!/usr/bin/env node

/**
 * Test script for content caching functionality
 * Part of Story 3-G implementation
 * 
 * This script demonstrates the file/URL caching by repeatedly 
 * reading the same file and fetching the same URL
 */

import { readFile, fetchUrl } from './dist/src/tools/ContentCacheAdapter.js';
import { toolManager } from './dist/src/tools/ToolManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Number of test iterations
const ITERATIONS = 3;

async function main() {
  console.log('Content Caching Test');
  console.log('====================');

  // Test file read caching
  console.log('\nTesting file read caching:');
  console.log('--------------------------');
  
  const filePath = path.join(__dirname, 'package.json');
  
  // Read the file multiple times
  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`\nIteration ${i + 1}:`);
    console.time('File read time');
    const content = await readFile(filePath, 'utf8');
    console.timeEnd('File read time');
    console.log(`File size: ${content.length} bytes`);
  }
  
  // Show cache stats 
  const stats = toolManager.getContentCacheStats();
  console.log('\nContent Cache Stats:');
  console.log(`Status: ${stats.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`Items: ${stats.size} of ${stats.maxSize} (${Math.round(stats.size / stats.maxSize * 100)}% full)`);
  console.log(`TTL: ${stats.ttl}ms (${stats.ttl / 1000}s)`);
  
  // Test URL fetch caching (optional)
  try {
    console.log('\nTesting URL read caching:');
    console.log('--------------------------');
    
    // Simple public URL for testing
    const url = 'https://jsonplaceholder.typicode.com/todos/1';
    
    // Fetch the URL multiple times
    for (let i = 0; i < ITERATIONS; i++) {
      console.log(`\nIteration ${i + 1}:`);
      console.time('URL fetch time');
      const content = await fetchUrl(url);
      console.timeEnd('URL fetch time');
      console.log(`Response size: ${content.length} bytes`);
    }
  } catch (error) {
    console.error('URL fetch test error:', error.message);
  }
}

// Run the test
main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 