import minimist from 'minimist';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Default memory path is in user's home directory
const DEFAULT_MEMORY_PATH = join(homedir(), '.mcp-think-server', 'memory.jsonl');

// Validate embedding provider - now only Voyage is supported
const validateProvider = (provider: string | undefined): string => {
  return 'voyage'; // Always use Voyage AI
};

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
  
  // Embedding service configuration
  embedding: {
    // Provider is always 'voyage'
    provider: validateProvider(
      argv['embedding-provider'] as string || 
      process.env.EMBEDDING_PROVIDER
    ),
    
    // API key can be passed via command line or environment variable
    voyageApiKey: argv['voyage-api-key'] || process.env.VOYAGE_API_KEY,
    
    // Model configuration
    model: argv['embedding-model'] || process.env.EMBEDDING_MODEL || 'voyage-3-large',
    dimensions: argv['embedding-dimensions'] ? 
                parseInt(argv['embedding-dimensions'] as string, 10) : 
                1024,
    
    // Voyage-specific options
    inputType: argv['embedding-input-type'] as 'query' | 'document' || 
               process.env.EMBEDDING_INPUT_TYPE as 'query' | 'document' || 
               'query',
    quantization: argv['embedding-quantization'] as 'float' | 'int8' | 'binary' || 
                  process.env.EMBEDDING_QUANTIZATION as 'float' | 'int8' | 'binary' ||
                  'float',
    
    // Caching options
    cache: argv['embedding-cache'] !== 'false' && 
           process.env.EMBEDDING_CACHE !== 'false', // Enabled by default
    cacheDir: argv['embedding-cache-dir'] || 
              process.env.EMBEDDING_CACHE_DIR || 
              join(homedir(), '.mcp-think-server', 'cache'),
  },
  
  // Other config options can be added here
  debug: !!argv.debug,
  version: '1.0.0', // Should match package.json
};

// Ensure memory directory exists
const memoryDir = config.memoryPath.substring(0, config.memoryPath.lastIndexOf('/'));
if (!existsSync(memoryDir)) {
  mkdirSync(memoryDir, { recursive: true });
}

// Ensure cache directory exists
if (!existsSync(config.embedding.cacheDir)) {
  mkdirSync(config.embedding.cacheDir, { recursive: true });
}

export default config; 