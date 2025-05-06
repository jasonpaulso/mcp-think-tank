import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

// Safe logging function that writes directly to stderr
const safeLog = (message: string) => {
  process.stderr.write(`${message}\n`);
};

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Determine base directory for finding package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basedir = resolve(__dirname, '..', '..');

// Dynamically read version from package.json
let version = '2.0.2'; // Fallback version
try {
  const packagePath = resolve(basedir, 'package.json');
  if (existsSync(packagePath)) {
    version = JSON.parse(readFileSync(packagePath, 'utf8')).version;
  }
} catch (error) {
  safeLog(`Error reading package.json: ${error}`);
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
  safeLog(`Failed to create directory for memory path: ${error}`);
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
  
  // Auto-shutdown after inactivity (in ms, default: 30 minutes, 0 = disabled)
  autoShutdownMs: argv['auto-shutdown-ms'] ? 
                 parseInt(argv['auto-shutdown-ms'] as string, 10) * 1000 :
                 process.env.AUTO_SHUTDOWN_MS ? 
                 parseInt(process.env.AUTO_SHUTDOWN_MS, 10) * 1000 : 
                 process.env.AUTO_SHUTDOWN === 'true' ? 30 * 60 * 1000 : 0,
};

// Handle command line arguments for quick info display
if (argv.version) {
  safeLog(`mcp-think-tank v${version}`);
  process.exit(0);
}

if (argv['show-memory-path']) {
  safeLog(memoryPath);
  process.exit(0);
}

export default config;