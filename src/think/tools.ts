import { FastMCP } from 'fastmcp';
import { ThinkSchema } from './schemas.js';

/**
 * Registers the think tool with the MCP server
 * @param server - The FastMCP server instance
 */
export function registerThinkTool(server: FastMCP): void {
  server.addTool({
    name: 'think',
    description: 'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. Consider including: problem definition, relevant context, analysis steps, self-reflection on your reasoning, and conclusions. Adapt this structure as needed for your specific thought process.',
    parameters: ThinkSchema,
    execute: async (_options) => {
      // Return confirmation without trying to log to stdout
      return "Your structured reasoning has been processed.";
    }
  });
} 