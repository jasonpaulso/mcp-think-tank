import { MemoryStore } from '../memory/store/MemoryStore.js';

/**
 * Interface defining the core contract for all agent implementations.
 * Agents are responsible for processing inputs, reasoning about them,
 * and producing outputs within the context of a given task.
 */
export interface IAgent {
  /**
   * Unique identifier for this agent instance
   */
  agentId: string;

  /**
   * Memory store for persistent storage and retrieval
   */
  memory: MemoryStore;

  /**
   * Initialize the agent with a given context.
   * 
   * @param ctx - Initialization context that may contain task-specific information
   * @returns A promise that resolves when initialization is complete
   */
  init(ctx: Record<string, unknown>): Promise<void>;

  /**
   * Process a single input and produce a step in the reasoning chain.
   * 
   * Side effects: May update internal state or memory store.
   * 
   * @param input - The input to process, typically from a user or another agent
   * @returns Promise resolving to the processed output
   */
  step(input: string): Promise<string>;

  /**
   * Complete the agent's work and perform any cleanup or final memory writes.
   * 
   * Side effects: Should persist any important final state to memory.
   * 
   * @returns Promise resolving when finalization is complete
   */
  finalize(): Promise<void>;
} 