import { FastMCP } from 'fastmcp';
import { LRUCache } from 'lru-cache';

// Environment variables
const MAX_TOOL_CALLS = parseInt(process.env.TOOL_LIMIT || '25', 10);
const CACHE_TOOL_CALLS = process.env.CACHE_TOOL_CALLS !== 'false'; // Default to true

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
  
  // Store allowed tools if whitelist is enabled
  private allowedTools: string[] | null = null;
  
  constructor() {
    // Initialize LRU cache with size 100
    this.callCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 5, // 5 minute TTL
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
    
    try {
      // Make the actual tool call (this will be implemented in the adapter)
      const result = await this.executeToolCall(toolName, params);
      
      // Cache the result if caching is enabled
      if (CACHE_TOOL_CALLS) {
        const cacheKey = `${toolName}:${JSON.stringify(params)}`;
        this.callCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
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
   * Reset all counters
   */
  reset(): void {
    this.globalCount = 0;
    this.perAgentCount.clear();
    this.callCache.clear();
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