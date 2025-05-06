import { FastMCP } from 'fastmcp';
import { LRUCache } from 'lru-cache';
import crypto from 'crypto';
import fs from 'fs/promises';
import http from 'http';
import https from 'https';

// Environment variables
const MAX_TOOL_CALLS = parseInt(process.env.TOOL_LIMIT || '25', 10);
const CACHE_TOOL_CALLS = process.env.CACHE_TOOL_CALLS !== 'false'; // Default to true
const CACHE_CONTENT = process.env.CACHE_CONTENT !== 'false'; // Default to true
const CONTENT_CACHE_SIZE = parseInt(process.env.CONTENT_CACHE_SIZE || '50', 10);
const CONTENT_CACHE_TTL = parseInt(process.env.CONTENT_CACHE_TTL || '300000', 10); // 5 minutes default

/**
 * ToolManager tracks and limits tool calls across agents
 */
export class ToolManager {
  // Track total calls across all agents
  private globalCount: number = 0;
  
  // Track calls per agent
  private perAgentCount: Map<string, number> = new Map();
  
  // Cache for duplicate tool calls
  private callCache: LRUCache<string, any>;
  
  // Public getter for contentCache
  get contentCache(): LRUCache<string, any> {
    return this._contentCache;
  }
  
  // Actual private storage for content cache
  private _contentCache: LRUCache<string, any>;
  
  // Store allowed tools if whitelist is enabled
  private allowedTools: string[] | null = null;
  
  constructor() {
    // Initialize LRU cache with size 100
    this.callCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 5, // 5 minute TTL
    });
    
    // Initialize content cache
    this._contentCache = new LRUCache({
      max: CONTENT_CACHE_SIZE,
      ttl: CONTENT_CACHE_TTL,
    });
  }
  
  /**
   * Set the whitelist of allowed tools
   * @param tools Array of tool names that are allowed
   */
  setAllowedTools(tools: string[]): void {
    this.allowedTools = tools;
  }
  
  /**
   * Call a tool with tracking and limits
   * @param agentId ID of the agent making the call
   * @param toolName Name of the tool to call
   * @param params Parameters for the tool
   * @returns Result from the tool
   * @throws ToolLimitError if call limit is exceeded
   * @throws ToolNotPermittedError if tool is not in the whitelist
   */
  async callTool(agentId: string, toolName: string, params: any): Promise<any> {
    // Check if tool is allowed
    if (this.allowedTools && !this.allowedTools.includes(toolName)) {
      throw new ToolNotPermittedError(`Tool '${toolName}' is not permitted for agent '${agentId}'`);
    }
    
    // Check cache for duplicate calls if enabled
    if (CACHE_TOOL_CALLS) {
      const cacheKey = `${toolName}:${JSON.stringify(params)}`;
      const cachedResult = this.callCache.get(cacheKey);
      if (cachedResult) {
        console.log(`[ToolManager] Cache hit for ${toolName} by agent ${agentId}`);
        return cachedResult;
      }
    }
    
    // Check if we've hit the global limit
    if (this.globalCount >= MAX_TOOL_CALLS) {
      throw new ToolLimitError(`Tool call limit (${MAX_TOOL_CALLS}) exceeded`);
    }
    
    // Increment counters
    this.globalCount++;
    const agentCount = (this.perAgentCount.get(agentId) || 0) + 1;
    this.perAgentCount.set(agentId, agentCount);
    
    // Log the call
    this.logToolCall(agentId, toolName, params);
    
    // Make the actual tool call (this will be implemented in the adapter)
    const result = await this.executeToolCall(toolName, params);
    
    // Cache the result if caching is enabled
    if (CACHE_TOOL_CALLS) {
      const cacheKey = `${toolName}:${JSON.stringify(params)}`;
      this.callCache.set(cacheKey, result);
    }
    
    return result;
  }
  
  /**
   * Execute the actual tool call - this is a placeholder that will be implemented
   * by adapters for each specific tool
   */
  private async executeToolCall(toolName: string, params: any): Promise<any> {
    // This is just a placeholder - actual implementation will be in adapters
    throw new Error('executeToolCall must be implemented by an adapter');
  }
  
  /**
   * Log a tool call
   */
  private logToolCall(agentId: string, toolName: string, params: any): void {
    const timestamp = new Date().toISOString();
    const paramSummary = this.getParamsSummary(params);
    
    // Log format: [timestamp] agentId: toolName(paramSummary) - globalCount
    console.log(`[${timestamp}] ${agentId}: ${toolName}(${paramSummary}) - call ${this.globalCount}/${MAX_TOOL_CALLS}`);
    
    // Detailed logging if debug mode is enabled
    if (process.env.MCP_DEBUG === 'true') {
      console.log(`[DEBUG] Full params: ${JSON.stringify(params)}`);
    }
  }
  
  /**
   * Get a summarized version of params for logging
   */
  private getParamsSummary(params: any): string {
    if (!params) return '';
    
    try {
      // For large objects, just show a sample or count of items
      if (typeof params === 'object') {
        if (Array.isArray(params)) {
          return `array[${params.length}]`;
        }
        
        // Extract key values for common parameters
        const keys = Object.keys(params);
        if (keys.length === 0) return '{}';
        
        if (keys.length <= 3) {
          return keys.map(k => {
            const val = params[k];
            if (typeof val === 'string' && val.length > 20) {
              return `${k}:"${val.substring(0, 17)}..."`;
            } else if (Array.isArray(val)) {
              return `${k}:array[${val.length}]`;
            } else if (typeof val === 'object' && val !== null) {
              return `${k}:{...}`;
            }
            return `${k}:${val}`;
          }).join(', ');
        }
        
        return `{${keys.slice(0, 2).join(', ')}, ...}`;
      }
      
      // Convert primitive values to string
      return String(params);
    } catch (e) {
      return 'Error creating summary';
    }
  }
  
  /**
   * Get the current call counts
   */
  getStats(): { global: number, perAgent: Map<string, number> } {
    return {
      global: this.globalCount,
      perAgent: new Map(this.perAgentCount)
    };
  }
  
  /**
   * Get statistics about the content cache
   */
  getContentCacheStats(): { enabled: boolean, size: number, maxSize: number, ttl: number } {
    return {
      enabled: CACHE_CONTENT,
      size: this._contentCache.size,
      maxSize: this._contentCache.max,
      ttl: CONTENT_CACHE_TTL
    };
  }
  
  /**
   * Check if content is in the cache
   * @param key Cache key to check
   * @returns Whether the key exists in the cache
   */
  hasContentCacheItem(key: string): boolean {
    return this._contentCache.has(key);
  }
  
  /**
   * Get content from the cache
   * @param key Cache key to retrieve
   * @returns The cached content or undefined if not found
   */
  getContentCacheItem(key: string): any {
    return this._contentCache.get(key);
  }
  
  /**
   * Set content in the cache
   * @param key Cache key
   * @param value Value to cache
   * @returns The cache instance
   */
  setContentCacheItem(key: string, value: any): LRUCache<string, any> {
    return this._contentCache.set(key, value);
  }
  
  /**
   * Reset all counters
   */
  reset(): void {
    this.globalCount = 0;
    this.perAgentCount.clear();
    this.callCache.clear();
    // Also clear content cache
    this._contentCache.clear();
  }

  /**
   * Generate a SHA-1 hash of content
   * @param content The content to hash
   * @returns The SHA-1 hash as a hex string
   */
  private generateContentHash(content: string | Buffer): string {
    const hash = crypto.createHash('sha1');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Read a file with caching based on content hash
   * @param filePath Path to the file to read
   * @param options Options for fs.readFile
   * @returns The file contents
   */
  async readFileWithCache(filePath: string, options?: any): Promise<string | Buffer> {
    if (!CACHE_CONTENT) {
      return fs.readFile(filePath, options);
    }

    try {
      // First, check if we have a recent stat for this file to avoid reading it
      const stats = await fs.stat(filePath);
      const fileKey = `file:${filePath}:${stats.size}:${stats.mtime.getTime()}`;
      
      // Check if we have this exact file version cached
      const cachedContent = this._contentCache.get(fileKey);
      if (cachedContent) {
        console.log(`[ToolManager] Content cache hit for file ${filePath}`);
        return cachedContent;
      }
      
      // Read the file content
      const content = await fs.readFile(filePath, options);
      
      // Cache the content
      this._contentCache.set(fileKey, content);
      
      return content;
    } catch (error) {
      console.error(`[ToolManager] Error reading file with cache: ${error}`);
      // Fall back to regular file read
      return fs.readFile(filePath, options);
    }
  }

  /**
   * Fetch URL content with caching based on content hash
   * @param url The URL to fetch
   * @returns The URL content
   */
  async fetchUrlWithCache(url: string): Promise<string> {
    if (!CACHE_CONTENT) {
      return this.fetchUrl(url);
    }

    // Check if we have a cache hit for this URL
    const urlKey = `url:${url}`;
    const cachedContent = this._contentCache.get(urlKey);
    
    if (cachedContent) {
      console.log(`[ToolManager] Content cache hit for URL ${url}`);
      return cachedContent;
    }
    
    // Fetch fresh content
    const content = await this.fetchUrl(url);
    
    // Generate hash and cache content
    this._contentCache.set(urlKey, content);
    
    return content;
  }

  /**
   * Helper method to fetch URL content
   * @param url The URL to fetch
   * @returns Promise resolving to the URL content
   */
  private fetchUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        const { statusCode } = res;
        
        if (statusCode !== 200) {
          // Consume response data to free up memory
          res.resume();
          reject(new Error(`Request failed with status code: ${statusCode}`));
          return;
        }
        
        res.setEncoding('utf8');
        let rawData = '';
        
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve(rawData);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (e) => {
        reject(e);
      });
    });
  }
}

/**
 * Error thrown when tool call limit is exceeded
 */
export class ToolLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolLimitError';
  }
}

/**
 * Error thrown when a tool is not in the allowed list
 */
export class ToolNotPermittedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolNotPermittedError';
  }
}

// Export a singleton instance
export const toolManager = new ToolManager(); 