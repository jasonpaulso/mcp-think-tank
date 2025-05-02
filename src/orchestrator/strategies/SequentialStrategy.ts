import { IAgent } from '../../agents/IAgent';
import { CoordinationStrategy } from '../CoordinationStrategy';

/**
 * Implements a sequential, round-robin strategy for agent coordination.
 * Agents take turns processing the input until one indicates completion.
 */
export class SequentialStrategy implements CoordinationStrategy {
  private currentIndex: number = -1;
  
  /**
   * Create a new SequentialStrategy
   */
  constructor() {}
  
  /**
   * Get the next agent in the round-robin sequence.
   * 
   * @param agents - Array of available agents
   * @param currentAgentId - ID of the currently active agent (if any)
   * @param outputs - Map of agent IDs to their outputs so far
   * @param isDone - Optional function to check if an agent's output indicates completion
   * @returns The next agent to run, or null if orchestration should terminate
   */
  nextAgent(
    agents: IAgent[],
    currentAgentId: string | null,
    outputs: Map<string, string[]>,
    isDone?: (output: string) => boolean
  ): IAgent | null {
    // If no agents, return null
    if (agents.length === 0) {
      return null;
    }
    
    // If this is the first call or current agent not found
    if (currentAgentId === null) {
      this.currentIndex = 0;
      return agents[0];
    }
    
    // Check if the current agent's output indicates completion
    if (isDone && currentAgentId) {
      const agentOutputs = outputs.get(currentAgentId) || [];
      const lastOutput = agentOutputs[agentOutputs.length - 1];
      
      if (lastOutput && isDone(lastOutput)) {
        return null; // Terminate orchestration
      }
    }
    
    // Find the index of the current agent
    const currentIdx = agents.findIndex(a => a.agentId === currentAgentId);
    
    // Increment to the next agent in a round-robin fashion
    this.currentIndex = (currentIdx + 1) % agents.length;
    return agents[this.currentIndex];
  }
  
  /**
   * Combine the outputs from multiple agents into a final result.
   * For sequential strategy, we typically take the last output from the last agent.
   * 
   * @param outputs - Map of agent IDs to their outputs
   * @returns The combined output
   */
  combine(outputs: Map<string, string[]>): string {
    // For sequential, we concatenate all outputs with clear separation
    const result: string[] = [];
    
    outputs.forEach((agentOutputs, agentId) => {
      if (agentOutputs.length > 0) {
        // Add all outputs from this agent
        result.push(`== Agent: ${agentId} ==`);
        agentOutputs.forEach((output, i) => {
          result.push(`--- Step ${i + 1} ---`);
          result.push(output);
        });
      }
    });
    
    return result.join('\n\n');
  }
} 