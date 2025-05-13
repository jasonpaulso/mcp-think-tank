import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from '../memory/tools.js';
import { registerThinkTool } from '../think/tools.js';
import { registerTaskTools } from '../tasks/tools.js';
import { registerUtilityTools } from '../utils/tools.js';
import { registerResearchTools } from '../research/index.js';
import { createLogger } from '../utils/logger.js';

// Create logger
const logger = createLogger('tools');

/**
 * Register all tools with the FastMCP server
 * 
 * @param server FastMCP server instance
 */
export function registerAllTools(server: FastMCP): void {
  try {
    // Register all tools in a specific order
    logger.info('Registering memory tools...');
    registerMemoryTools(server);
    
    logger.info('Registering think tools...');
    registerThinkTool(server);
    
    logger.info('Registering task tools...');
    registerTaskTools(server);
    
    logger.info('Registering utility tools...');
    registerUtilityTools(server);
    
    logger.info('Registering research tools...');
    registerResearchTools(server);
    
    logger.info('All tools registered successfully');
  } catch (error) {
    logger.error(`Error registering tools: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined);
    throw error;
  }
} 