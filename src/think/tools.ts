import { FastMCP } from 'fastmcp';
import { ThinkSchema } from './schemas.js';
import { BasicAgent, ExtendedThinkSchema } from '../agents/BasicAgent.js';
import { graph, graphStorage } from '../memory/storage.js';

// Create a dummy memory store adapter (to be replaced in Phase 2)
const tempMemoryAdapter = {
  async add() { /* Will be implemented in Phase 2 */ },
  async query() { return []; /* Will be implemented in Phase 2 */ },
  async prune() { return 0; /* Will be implemented in Phase 2 */ }
};

/**
 * Registers the think tool with the MCP server
 * @param server - The FastMCP server instance
 */
export function registerThinkTool(server: FastMCP): void {
  server.addTool({
    name: 'think',
    description: 'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. Consider including: problem definition, relevant context, analysis steps, self-reflection on your reasoning, and conclusions. Adapt this structure as needed for your specific thought process.',
    parameters: ExtendedThinkSchema,
    execute: async (params) => {
      // Initialize step counters if not already set
      if (params.plannedSteps && typeof params.currentStep === 'undefined') {
        params.currentStep = 1; // Start at step 1 if plannedSteps is specified
      } else if (typeof params.currentStep === 'number') {
        // If currentStep is already set but no plannedSteps, estimate based on content
        if (!params.plannedSteps) {
          // Rough estimate based on content length
          const contentLength = params.structuredReasoning.length;
          params.plannedSteps = Math.max(
            Math.ceil(contentLength / 500), // Approximately 1 step per 500 chars
            params.currentStep + 1 // At least one more step than current
          );
        }
      }
      
      // Create a basic agent to handle the thinking process
      const agent = new BasicAgent('think-tool', tempMemoryAdapter, params);
      
      // Initialize with the provided parameters
      await agent.init({ thinkParams: params });
      
      // Process the reasoning step
      const result = await agent.step(params.structuredReasoning);
      
      // Finalize to ensure persistence
      await agent.finalize();
      
      // Generate response message based on parameters
      const stepInfo = params.currentStep && params.plannedSteps 
        ? `Step ${params.currentStep} of ${params.plannedSteps} completed. `
        : '';
      
      const reflectionInfo = params.selfReflect
        ? 'Self-reflection analysis applied. '
        : '';
      
      const researchInfo = params.allowResearch
        ? 'Research integration enabled. '
        : '';
      
      const formatInfo = params.formatOutput !== false
        ? `Output formatted as ${params.formatType === 'auto' ? 'auto-detected' : params.formatType} markdown. `
        : '';
      
      const storedInfo = params.storeInMemory
        ? 'Your reasoning has been saved to memory. '
        : '';
        
      return `${stepInfo}${reflectionInfo}${researchInfo}${formatInfo}${storedInfo}Your structured reasoning has been processed.`;
    }
  });
} 