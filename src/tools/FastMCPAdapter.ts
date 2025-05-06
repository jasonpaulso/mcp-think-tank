import { FastMCP, Tool } from 'fastmcp';
import { toolManager, ToolLimitError, ToolNotPermittedError } from './ToolManager.js';
import { graph, memoryStore } from '../memory/store/index.js';

/**
 * Creates a wrapped tool that uses the ToolManager for tracking and limits
 * @param tool The FastMCP tool to wrap
 * @param agentId The ID of the agent calling the tool
 * @returns A wrapped tool with the same interface
 */
export function createManagedTool(tool: Tool<any, any>, agentId: string = 'default'): Tool<any, any> {
  // Create a wrapper for the execute function
  const originalExecute = tool.execute;
  
  // Create the wrapped execute function that uses ToolManager
  const wrappedExecute = async (...args: any[]) => {
    try {
      return await toolManager.callTool(agentId, tool.name, args[0]);
    } catch (error) {
      if (error instanceof ToolLimitError) {
        // Log to memory with tags for limit_reached
        try {
          await memoryStore.add('ToolCallLimits', `Tool call limit reached by agent ${agentId}. Tool: ${tool.name}`, {
            tags: ['limit_reached'],
            agent: agentId
          });
          await memoryStore.save();
        } catch (memoryError) {
          console.error('Failed to log to memory:', memoryError);
        }
      }
      throw error;
    }
  };
  
  // Clone the tool and replace the execute function
  return {
    ...tool,
    execute: wrappedExecute
  };
}

/**
 * Wrap FastMCP's addTool method to use the ToolManager
 * @param server The FastMCP server instance
 * @param defaultAgentId The default agent ID to use if not provided
 */
export function wrapFastMCP(server: FastMCP, defaultAgentId: string = 'default'): void {
  // Store the original addTool method
  const originalAddTool = server.addTool.bind(server);
  
  // Set up the executeToolCall method on toolManager to call the real tools
  // @ts-ignore - we're accessing a private method
  toolManager.executeToolCall = async (toolName: string, params: any) => {
    // Find the tool in FastMCP by name
    // Since server.getTool is not accessible, we use a workaround
    // We maintain a local cache of tools as they're added
    if (!wrapFastMCP.toolCache.has(toolName)) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    // Get the original tool from our cache
    const originalTool = wrapFastMCP.toolCache.get(toolName);
    
    // Call the original execute method directly
    return await originalTool!.execute(params, { log: console, direct: true } as any);
  };
  
  // Initialize tool cache
  if (!wrapFastMCP.toolCache) {
    wrapFastMCP.toolCache = new Map<string, Tool<any, any>>();
  }
  
  // Replace with our wrapped version
  server.addTool = (tool: Tool<any, any>) => {
    // Store the original execute method
    const originalExecute = tool.execute;
    
    // Store the original tool in our cache
    wrapFastMCP.toolCache.set(tool.name, { ...tool, execute: originalExecute });
    
    // Create a wrapped tool that uses our monitoring
    const wrappedTool = {
      ...tool,
      execute: async (params: any, context: any) => {
        try {
          // If direct execution, bypass ToolManager to avoid double counting
          if (context?.direct === true) {
            return await originalExecute(params, context);
          }
          
          // Get the agent ID from context or use default
          const agentId = context?.agentId || defaultAgentId;
          
          // Use ToolManager to call the tool
          return await toolManager.callTool(agentId, tool.name, params);
        } catch (error) {
          if (error instanceof ToolLimitError) {
            // Store that limits were reached in memory
            try {
              await memoryStore.add('ToolCallLimits', `Tool call limit reached. Tool: ${tool.name}`, {
                tags: ['limit_reached'],
                version: '1.0'
              });
              await memoryStore.save();
            } catch (memoryError) {
              console.error('Failed to log to memory:', memoryError);
            }
            
            // Return a partial result with status
            return JSON.stringify({
              status: 'HALTED_LIMIT',
              message: `${error.message}. Tool execution halted.`,
              partial: true
            });
          }
          
          if (error instanceof ToolNotPermittedError) {
            return JSON.stringify({
              status: 'HALTED_NOT_PERMITTED',
              message: error.message,
              partial: true
            });
          }
          
          // Re-throw other errors
          throw error;
        }
      }
    };
    
    // Add the wrapped tool to FastMCP
    return originalAddTool(wrappedTool);
  };
}

// Add a static property to store the tool cache
wrapFastMCP.toolCache = new Map<string, Tool<any, any>>();

/**
 * Install the LRU cache package if it's not already installed
 */
export async function ensureDependencies(): Promise<void> {
  try {
    // Try to import lru-cache to check if it's available
    await import('lru-cache');
    console.log('LRU-cache dependency is already installed');
  } catch (error) {
    console.log('Installing lru-cache dependency...');
    
    try {
      // Use dynamic import for child_process
      const childProcess = await import('child_process');
      const { exec } = childProcess;
      
      // Run npm install
      await new Promise<void>((resolve, reject) => {
        exec('npm install lru-cache', (error: Error | null) => {
          if (error) {
            console.error('Failed to install lru-cache:', error);
            reject(error);
            return;
          }
          console.log('LRU-cache installed successfully');
          resolve();
        });
      });
    } catch (importError) {
      console.error('Failed to import child_process:', importError);
      console.error('Please install lru-cache manually with: npm install lru-cache');
    }
  }
} 