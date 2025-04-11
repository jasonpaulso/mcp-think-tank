#!/usr/bin/env node

// Minimal MCP server with just the 'think' tool
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

console.log("Starting Think-only MCP Server...");

// Initialize the FastMCP server
const server = new FastMCP({
  name: "MCP Think Server (Basic)",
  version: "1.0.0"
});

// Add the 'think' tool
server.addTool({
  name: 'think',
  description: 'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. For best results, structure your reasoning with: 1) Problem definition, 2) Relevant facts/context, 3) Analysis steps, 4) Conclusion/decision.',
  parameters: z.object({
    structuredReasoning: z.string()
      .min(10, 'Reasoning must be at least 10 characters long')
      .describe('A structured thought process to work through complex problems. Use this as a dedicated space for reasoning step-by-step.'),
    
    // Optional memory parameters
    associateWithEntity: z.string().optional()
      .describe('Optional entity name to associate this thought with'),
    
    category: z.string().optional()
      .describe('Optional category for the thought (e.g., "problem-solving", "analysis", "planning")'),
    
    tags: z.array(z.string()).optional()
      .describe('Optional tags to help categorize and find this thought later'),
    
    storeInMemory: z.boolean().optional()
      .default(false)
      .describe('Whether to store this thought in the knowledge graph memory'),
  }),
  execute: async (args) => {
    // Log the thinking
    console.log(`[THINK TOOL] ${args.structuredReasoning.substring(0, 100)}...`);
    
    // Return confirmation
    return `Your structured reasoning has been processed.`;
  }
});

// Start the server with stdio transport
server.start({
  transportType: "stdio"
});

console.log("MCP Think Server (Basic) is running");
console.error("MCP Think Server (Basic) is running"); 