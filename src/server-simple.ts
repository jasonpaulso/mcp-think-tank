import { FastMCP } from 'fastmcp';
import { z } from 'zod';

// Initialize the FastMCP server
const server = new FastMCP({
  name: "MCP Think Server (Simple)",
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
  }),
  execute: async (args) => {
    // Log the thinking
    console.log(`Think tool used: ${args.structuredReasoning.substring(0, 50)}...`);
    
    // Return confirmation
    return `Your structured reasoning has been processed.`;
  }
});

// Start the server
console.error("Starting MCP Think Server (Simple)...");
server.start({
  transportType: "stdio"
});
console.error("MCP Think Server (Simple) is running"); 