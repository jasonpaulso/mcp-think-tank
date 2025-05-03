import { IAgent } from '../agents/IAgent';
import { CoordinationStrategy, OrchestrationResult } from './CoordinationStrategy';

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
        
        // Process the input with the agent
        let agentInput = steps === 0 ? input : this.strategy.combine(outputs);
        const output = await nextAgent.step(agentInput);
        
        // Store the output
        if (!outputs.has(currentAgentId)) {
          outputs.set(currentAgentId, []);
        }
        outputs.get(currentAgentId)?.push(output);
        
        // Increment steps
        steps++;
      }
      
      // Finalize all agents
      await Promise.all(this.agents.map(agent => agent.finalize()));
      
      // Combine all outputs according to the strategy
      const result: OrchestrationResult = {
        output: this.strategy.combine(outputs),
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
      
      return {
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
        agentOutputs: outputs,
        status: 'ERROR',
        steps,
        duration: Date.now() - startTime
      };
    }
  }
} 