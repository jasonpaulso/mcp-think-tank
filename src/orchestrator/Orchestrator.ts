import { IAgent } from '../agents/IAgent.js';
import { CoordinationStrategy, OrchestrationResult } from './CoordinationStrategy.js';
import { toolManager, ToolLimitError } from '../tools/ToolManager.js';
import { memoryStore } from '../memory/store/index.js';

/**
 * Orchestrator that coordinates multiple agents according to a strategy.
 */
export class Orchestrator {
  private agents: IAgent[];
  private strategy: CoordinationStrategy;
  private allowedTools: string[] | null;
  private debug: boolean;
  
  /**
   * Create a new Orchestrator
   * 
   * @param agents - Array of agents to coordinate
   * @param strategy - Coordination strategy to use
   * @param options - Additional orchestration options
   */
  constructor(
    agents: IAgent[],
    strategy: CoordinationStrategy,
    options: {
      allowedTools?: string[],
      debug?: boolean
    } = {}
  ) {
    this.agents = agents;
    this.strategy = strategy;
    this.allowedTools = options.allowedTools || null;
    this.debug = options.debug || false;
    
    // Set allowed tools in the toolManager if specified
    if (this.allowedTools) {
      toolManager.setAllowedTools(this.allowedTools);
    }
  }
  
  /**
   * Run the orchestration with the provided input
   * 
   * @param input - Initial input to process
   * @param isDone - Optional function to check if orchestration is complete
   * @returns Promise resolving to the orchestration result
   */
  async run(
    input: string,
    isDone?: (output: string) => boolean
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const outputs = new Map<string, string[]>();
    let steps = 0;
    let currentAgentId: string | null = null;
    
    // Reset tool manager call counts at the start of each orchestration
    toolManager.reset();
    
    try {
      // Initialize all agents
      await Promise.all(this.agents.map(agent => agent.init({})));
      
      while (steps < 100) { // Safety limit
        // Get the next agent according to the strategy
        const nextAgent = this.strategy.nextAgent(
          this.agents,
          currentAgentId,
          outputs,
          isDone
        );
        
        // If no next agent, we're done
        if (!nextAgent) {
          break;
        }
        
        // Track the current agent
        currentAgentId = nextAgent.agentId;
        
        try {
          // Process the input with the agent
          let agentInput = steps === 0 ? input : this.strategy.combine(outputs);
          const output = await nextAgent.step(agentInput);
          
          // Store the output
          if (!outputs.has(currentAgentId)) {
            outputs.set(currentAgentId, []);
          }
          const agentOutputs = outputs.get(currentAgentId);
          if (agentOutputs) {
            agentOutputs.push(output);
          }
        } catch (error) {
          if (error instanceof ToolLimitError) {
            // Log that limits were reached
            await memoryStore.add('OrchestrationLimits', `Tool call limit reached during orchestration. Agent: ${nextAgent.agentId}`, {
              tags: ['limit_reached'],
              agent: nextAgent.agentId,
              version: '1.0'
            });
            await memoryStore.save();
            
            // Combine current outputs and return with limit status
            const combinedOutput = this.strategy.combine(outputs);
            
            // Extract all individual outputs as an array
            const allOutputs: string[] = [];
            for (const agentOutputArray of outputs.values()) {
              for (const output of agentOutputArray) {
                allOutputs.push(output);
              }
            }
            
            return {
              output: combinedOutput + '\n\n[Note: Execution halted due to tool call limit]',
              finalOutput: combinedOutput + '\n\n[Note: Execution halted due to tool call limit]',
              outputs: allOutputs,
              agentOutputs: outputs,
              status: 'HALTED_LIMIT',
              steps,
              duration: Date.now() - startTime
            };
          }
          
          // Re-throw other errors to be caught by the main try/catch
          throw error;
        }
        
        // Increment steps
        steps++;
      }
      
      // Finalize all agents
      await Promise.all(this.agents.map(agent => agent.finalize()));
      
      // Combine the outputs
      const combinedOutput = this.strategy.combine(outputs);
      
      // Extract all individual outputs
      const allOutputs: string[] = [];
      for (const agentOutputArray of outputs.values()) {
        for (const output of agentOutputArray) {
          allOutputs.push(output);
        }
      }
      
      // Create the result
      const result: OrchestrationResult = {
        output: combinedOutput,
        finalOutput: combinedOutput, // Alias for output
        outputs: allOutputs,         // Array of all individual outputs
        agentOutputs: outputs,
        status: 'COMPLETED',
        steps,
        duration: Date.now() - startTime
      };
      
      return result;
    } catch (error) {
      // Handle errors in a test-friendly way
      if (this.debug) {
        console.error('Orchestration error:', error);
      }
      
      // Extract all individual outputs as an array for error case
      const allOutputs: string[] = [];
      for (const agentOutputArray of outputs.values()) {
        for (const output of agentOutputArray) {
          allOutputs.push(output);
        }
      }
      
      const errorOutput = `Error: ${error instanceof Error ? error.message : String(error)}`;
      
      return {
        output: errorOutput,
        finalOutput: errorOutput, // Alias for output
        outputs: allOutputs,      // All individual outputs as array
        agentOutputs: outputs,
        status: 'ERROR',
        steps,
        duration: Date.now() - startTime
      };
    }
  }
} 