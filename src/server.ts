import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { registerTaskTools } from './tasks/tools.js';
import { registerUtilityTools } from './utils/tools.js';
import { registerResearchTools } from './research/index.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';
import './config.js';
import { logger } from './utils/logger.js';
import { graph } from './memory/storage.js';

// NOTE: Moving console.log redirection to bootstrap.mjs
// This line will be removed after testing bootstrap.mjs is working

// Get configuration from environment
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300', 10);

// Log configuration
logger.info(`Request timeout set to ${REQUEST_TIMEOUT} seconds`);

// Create necessary directories
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
createDirectory(path.dirname(memoryPath));

logger.info(`Memory path: ${memoryPath}`);

// Create FastMCP server
const server = new FastMCP({
  name: "MCP Think Tank",
  version: "1.3.6" // Updated version
});

// --- Add resource templates to satisfy FastMCP 1.2.4+ handshake ---
// Health check resource
server.addResource({
  uri: 'status://health',
  name: 'Health',
  mimeType: 'text/plain',
  value: 'ok'
});

// Knowledge graph resource template
server.addResourceTemplate({
  uri: 'knowledge-graph://{type}',
  name: 'Knowledge Graph',
  mimeType: 'application/json'
});

// Task resource template
server.addResourceTemplate({
  uri: 'task://{id}',
  name: 'Task JSON',
  mimeType: 'application/json'
});

// Add resource accessor for the knowledge graph
server.addResourceAccessor({
  uriPattern: 'knowledge-graph://{type}',
  getResource: async (params) => {
    if (params.type === 'all') {
      return {
        uri: 'knowledge-graph://all',
        name: 'Complete Knowledge Graph',
        mimeType: 'application/json',
        value: JSON.stringify(graph.toJSON())
      };
    } else if (params.type === 'entities') {
      return {
        uri: 'knowledge-graph://entities',
        name: 'Knowledge Graph Entities',
        mimeType: 'application/json',
        value: JSON.stringify(Array.from(graph.entities.values()))
      };
    } else if (params.type === 'relations') {
      return {
        uri: 'knowledge-graph://relations',
        name: 'Knowledge Graph Relations',
        mimeType: 'application/json',
        value: JSON.stringify(Array.from(graph.relations.entries())
          .flatMap(([, rels]) => Array.from(rels)))
      };
    }
    return null;
  }
});

// Register memory tools
registerMemoryTools(server);

// Add the 'think' tool for structured reasoning
registerThinkTool(server);

// Register task management tools
registerTaskTools(server);

// Register utility tools
registerUtilityTools(server);

// Register research tools
registerResearchTools(server);

// Start the server
server.start();

// Error handling
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});