import minimist from 'minimist';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Default memory path is in user's home directory
const DEFAULT_MEMORY_PATH = join(homedir(), '.mcp-think-server', 'memory.jsonl');

// Export configuration object
export const config = {
  // Memory path from command line or default
  memoryPath: argv['memory-path'] || DEFAULT_MEMORY_PATH,
  
  // Other config options can be added here
  debug: !!argv.debug,
  version: '1.0.0', // Should match package.json
};

// Ensure memory directory exists
const memoryDir = config.memoryPath.substring(0, config.memoryPath.lastIndexOf('/'));
if (!existsSync(memoryDir)) {
  mkdirSync(memoryDir, { recursive: true });
}

export default config; 