#!/usr/bin/env node

/**
 * Simple test script to check if the MCP Think Tank server in Docker is working.
 * 
 * Usage:
 *   node test-docker.js [host] [port] [path]
 * 
 * Example:
 *   node test-docker.js localhost 8000 /mcp
 */

import { FastMCP } from 'fastmcp';

// Get command line arguments with defaults
const host = process.argv[2] || 'localhost';
const port = process.argv[3] || '8000';
const path = process.argv[4] || '/mcp';

// Create endpoint URL
const endpoint = `http://${host}:${port}${path}`;

console.log(`Testing connection to MCP Think Tank at ${endpoint}`);

async function testConnection() {
  try {
    // Create FastMCP client
    const client = new FastMCP({
      transportType: 'streamable-http',
      streamableHttp: {
        endpoint,
        timeout: 30000
      }
    });

    console.log('Initializing connection...');
    
    // List available tools
    console.log('Getting available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools:`);
    tools.forEach(tool => {
      console.log(`- ${tool.name}`);
    });

    // Test a simple tool call
    console.log('\nTesting think tool...');
    const result = await client.invoke('think', {
      structuredReasoning: 'This is a test message from Docker container.'
    });

    console.log('\nResponse from server:');
    console.log(result);
    
    console.log('\nConnection test successful!');
  } catch (error) {
    console.error('Error testing connection:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();