import { FastMCP } from 'fastmcp';
import { ThinkSchema } from './schemas.js';
import { BasicAgent, ExtendedThinkSchema } from '../agents/BasicAgent.js';
import { memoryStore } from '../memory/store/index.js';

/**
 * Register the think tool for structured reasoning
 * @param server The FastMCP server instance
 */
export function registerThinkTool(server: FastMCP): void {
  server.addTool({
    name: 'think',
    description: 'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. Consider including: problem definition, relevant context, analysis steps, self-reflection on your reasoning, and conclusions. Adapt this structure as needed for your specific thought process.',
    parameters: ExtendedThinkSchema,
    execute: async (params) => {
      // If params don't include storeInMemory, default to false to avoid persisting everything
      params.storeInMemory = params.storeInMemory === true;
      
      // Initialize step counters if not provided
      if (typeof params.currentStep !== 'number') {
        params.currentStep = 1;
      }
      
      // Estimate plannedSteps based on content length if not provided
      if (typeof params.plannedSteps !== 'number') {
        // Simple heuristic: 1 step per 300 characters, minimum 1, maximum 10
        const contentLength = params.structuredReasoning.length;
        params.plannedSteps = Math.max(1, Math.min(10, Math.ceil(contentLength / 300)));
      }
      
      // Create a temporary memory adapter for research capabilities
      const tempMemoryAdapter = {
        add: async () => Promise.resolve({
          text: '',
          timestamp: new Date().toISOString()
        }),
        query: async () => Promise.resolve([]),
        prune: async () => Promise.resolve(0),
        findSimilar: async () => Promise.resolve([]),
        save: async () => Promise.resolve(),
        load: async () => Promise.resolve(),
        getLoadingPromise: async () => Promise.resolve(),
        // For compatibility with BasicAgent expectations
        addEntity: async () => Promise.resolve(true),
        addRelation: async () => Promise.resolve(true)
      };
      
      // Create agent
      const agent = new BasicAgent('think-tool', tempMemoryAdapter, params);
      
      // Initialize with provided params
      await agent.init({ thinkParams: params });
      
      // Process the reasoning
      const output = await agent.step(params.structuredReasoning);
      
      // If storing in memory, use the real memory store
      if (params.storeInMemory) {
        // Create a new agent with the real memory store
        const persistentAgent = new BasicAgent('think-tool', memoryStore, params);
        
        // Initialize and reprocess the reasoning
        await persistentAgent.init({ thinkParams: params });
        await persistentAgent.step(params.structuredReasoning);
        
        // Finalize to store in memory
        await persistentAgent.finalize();
      }
      
      // Return the output as a string
      return output;
    }
  });
} 