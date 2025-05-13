import { FastMCP } from 'fastmcp';
import { createLogger } from '../utils/logger.js';

// Create logger
const logger = createLogger('resources');

/**
 * Set up resources and resource templates for FastMCP
 * 
 * @param server FastMCP server instance
 */
export function setupResources(server: FastMCP): void {
  try {
    // Add health check resource
    server.addResource({
      uri: 'status://health',
      name: 'Health',
      mimeType: 'text/plain',
      load: async () => ({ text: 'ok' })
    });
    
    // Add task template for task management
    server.addResourceTemplate({
      uriTemplate: 'task://{id}',
      name: 'Task JSON',
      mimeType: 'application/json',
      arguments: [{ name: 'id', description: 'Task ID' }],
      load: async ({ id }) => ({ text: JSON.stringify({ id }) })
    });
    
    logger.info('Resources and templates set up successfully');
  } catch (error) {
    logger.error(`Error setting up resources: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined);
    throw error;
  }
} 