#!/usr/bin/env node

/**
 * Script to display content cache and tool call statistics
 * Part of Story 3-G: File/URL reads caching implementation
 * 
 * Usage: npm run cache:stats
 */

import { toolManager } from '../dist/src/tools/ToolManager.js';

// Print content cache stats
const contentCacheStats = toolManager.getContentCacheStats();
console.log('\nContent Cache Stats:');
console.log('-------------------');
console.log(`Status: ${contentCacheStats.enabled ? 'Enabled' : 'Disabled'}`);
console.log(`Items: ${contentCacheStats.size} of ${contentCacheStats.maxSize} (${Math.round(contentCacheStats.size / contentCacheStats.maxSize * 100)}% full)`);
console.log(`TTL: ${contentCacheStats.ttl}ms (${contentCacheStats.ttl / 1000}s)`);

// Print tool call stats
const toolCallStats = toolManager.getStats();
console.log('\nTool Call Stats:');
console.log('----------------');
console.log(`Global count: ${toolCallStats.global}`);

// Show per-agent stats
console.log('\nPer-Agent Stats:');
if (toolCallStats.perAgent.size === 0) {
  console.log('No agent tool calls recorded yet');
} else {
  for (const [agentId, count] of toolCallStats.perAgent.entries()) {
    console.log(`- ${agentId}: ${count} calls`);
  }
}

console.log('\n'); 