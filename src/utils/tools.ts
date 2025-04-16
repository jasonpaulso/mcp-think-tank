import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import path from 'path';
import os from 'os';
import { logger } from './logger.js';

/**
 * Register utility tools for the MCP server
 */
export function registerUtilityTools(server: FastMCP): void {
  // Tool to display the memory path
  server.addTool({
    name: 'show_memory_path',
    description: 'Return absolute path of the active knowledge-graph file.',
    parameters: z.object({}),
    execute: async () => {
      const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
      logger.info(`Showing memory path: ${memoryPath}`);
      return memoryPath;
    }
  });

  logger.info('Utility tools registered');
} 