import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

// Redirect console.log to stderr immediately if not already done
// This is crucial for FastMCP which uses stdio for communication
// eslint-disable-next-line no-global-assign
if (console.log !== console.error) {
  console.log = (...args: unknown[]) => console.error(...args);
}

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Determine base directory for finding package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basedir = resolve(__dirname, '..', '..');

// Dynamically read version from package.json
let version = '1.3.11'; // Fallback version
try {
  const packagePath = resolve(basedir, 'package.json');
  if (existsSync(packagePath)) {
    version = JSON.parse(readFileSync(packagePath, 'utf8')).version;
  }
} catch (error) {
  console.error('Error reading package.json:', error);
}

// Default memory path
const DEFAULT_MEMORY_PATH = join(homedir(), '.mcp-think-tank', 'memory.jsonl');
const memoryPath = argv['memory-path'] || process.env.MEMORY_PATH || DEFAULT_MEMORY_PATH;

// Create default directories if they don't exist
try {
  if (!existsSync(dirname(memoryPath))) {
    mkdirSync(dirname(memoryPath), { recursive: true });
  }
} catch (error) {
  console.error(`Failed to create directory for memory path: ${error}`);
}

// Export configuration object
export const config = {
  // Memory path from command line or default
  memoryPath,
  
  // Request timeout in milliseconds (default: 300 seconds = 5 minutes)
  requestTimeout: argv['request-timeout'] ? 
                 parseInt(argv['request-timeout'] as string, 10) * 1000 : 
                 process.env.REQUEST_TIMEOUT ? 
                 parseInt(process.env.REQUEST_TIMEOUT, 10) * 1000 : 
                 300000,
  
  // Debug mode can be enabled with --debug flag or MCP_DEBUG=true env var
  debug: !!argv.debug || process.env.MCP_DEBUG === 'true',
  
  // Version from package.json
  version,
};

// Handle command line arguments for quick info display
if (argv.version) {
  console.log(`mcp-think-tank v${version}`);
  process.exit(0);
}

if (argv['show-memory-path']) {
  console.log(memoryPath);
  process.exit(0);
}

export default config; 