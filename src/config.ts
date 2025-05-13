import { existsSync, readFileSync } from 'fs';
import minimist from 'minimist';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createDirectory } from './utils/fs.js';
import { createLogger } from './utils/logger.js';

// Create logger
const logger = createLogger('config');

/**
 * Server configuration
 */
export interface ServerConfig {
  // Version info
  version: string;
  
  // Memory path
  memoryPath: string;
  
  // Request handling
  requestTimeout: number;  // in ms
  toolScanTimeout: number; // in ms
  
  // Auto shutdown
  autoShutdownMs: number;  // in ms
  
  // Debugging
  debug: boolean;
}

/**
 * Initialize configuration
 * 
 * @returns Server configuration object
 */
function initializeConfig(): ServerConfig {
  // Parse command line arguments
  const argv = minimist(process.argv.slice(2));

  // Determine base directory for finding package.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const basedir = resolve(__dirname, '..', '..');

  // Dynamically read version from package.json
  let version = '2.1.0'; // Fallback version
  try {
    const packagePath = resolve(basedir, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      version = packageJson.version;
      logger.debug(`Read version ${version} from package.json`);
    }
  } catch (error) {
    logger.warn(`Could not read version from package.json, using fallback version ${version}`, error);
  }

  // Memory path handling
  const defaultMemoryPath = join(homedir(), '.mcp-think-tank', 'memory.jsonl');
  const memoryPath = argv['memory-path'] || process.env.MEMORY_PATH || defaultMemoryPath;
  
  // Ensure memory directory exists
  try {
    createDirectory(dirname(memoryPath));
    logger.debug(`Ensured memory directory exists: ${dirname(memoryPath)}`);
  } catch (error) {
    logger.error(`Failed to create memory directory: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Handle special command line flags
  if (argv.version) {
    logger.info(`mcp-think-tank v${version}`);
    process.exit(0);
  }

  if (argv['show-memory-path']) {
    logger.info(memoryPath);
    process.exit(0);
  }

  // Build configuration object
  return {
    // Version
    version,
    
    // Memory path
    memoryPath,
    
    // Request handling
    requestTimeout: argv['request-timeout'] ? 
                    parseInt(argv['request-timeout'] as string, 10) * 1000 : 
                    process.env.REQUEST_TIMEOUT ? 
                    parseInt(process.env.REQUEST_TIMEOUT, 10) * 1000 : 
                    300000, // 5 minutes
                    
    toolScanTimeout: argv['tool-scan-timeout'] ?
                    parseInt(argv['tool-scan-timeout'] as string, 10) : 
                    process.env.TOOL_SCAN_TIMEOUT ? 
                    parseInt(process.env.TOOL_SCAN_TIMEOUT, 10) : 
                    30000, // 30 seconds
    
    // Debug mode
    debug: !!argv.debug || process.env.MCP_DEBUG === 'true',
    
    // Auto-shutdown
    autoShutdownMs: argv['auto-shutdown-ms'] ? 
                    parseInt(argv['auto-shutdown-ms'] as string, 10) * 1000 :
                    process.env.AUTO_SHUTDOWN_MS ? 
                    parseInt(process.env.AUTO_SHUTDOWN_MS, 10) * 1000 : 
                    process.env.AUTO_SHUTDOWN === 'true' ? 30 * 60 * 1000 : 30 * 60 * 1000, // 30 minutes
  };
}

/**
 * Exported configuration object
 */
export const config = initializeConfig();