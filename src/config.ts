import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import minimist from 'minimist';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Default memory path
const DEFAULT_MEMORY_PATH = join(homedir(), '.mcp-think-tank', 'memory');

// Create default directories if they don't exist
if (!existsSync(DEFAULT_MEMORY_PATH)) {
  mkdirSync(DEFAULT_MEMORY_PATH, { recursive: true });
}

// Dynamically read version from package.json
// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up two levels to reach the project root from dist/src/ or one level from src/
const packagePath = join(__dirname, '..', '..', 'package.json');
const fallbackPackagePath = join(__dirname, '..', 'package.json');

let version = '1.3.10'; // Fallback version
try {
  if (existsSync(packagePath)) {
    version = JSON.parse(readFileSync(packagePath, 'utf8')).version;
  } else if (existsSync(fallbackPackagePath)) {
    version = JSON.parse(readFileSync(fallbackPackagePath, 'utf8')).version;
  }
} catch (error) {
  console.error('Error reading package.json:', error);
}

// Export configuration object
export const config = {
  // Memory path from command line or default
  memoryPath: argv['memory-path'] || DEFAULT_MEMORY_PATH,
  
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

// Handle --version command line argument
if (argv.version) {
  console.log(`mcp-think-tank v${version}`);
  process.exit(0);
}

export default config; 