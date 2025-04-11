import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';

// Create necessary directories
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-server/memory.jsonl');
createDirectory(path.dirname(memoryPath));

console.log(`Memory path: ${memoryPath}`);

// Initialize the FastMCP server with required options
const server = new FastMCP({
  name: "MCP Think Server",
  version: "1.0.5"
});

// Register memory-related tools
registerMemoryTools(server);

// Add the 'think' tool for structured reasoning
registerThinkTool(server);

// Start the server on the specified port (default: 3000)
const port = parseInt(process.env.PORT || '3000', 10);

// Start the server using stdio transport (default)
server.start({
  transportType: "stdio"
});

// Use console.error instead of console.log - this writes to stderr which won't interfere with the protocol
console.error(`MCP Think Server running on port ${port}`);