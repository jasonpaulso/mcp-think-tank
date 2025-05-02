import { IAgent } from './IAgent';
import { MemoryStore } from '../memory/store/MemoryStore';
import { z } from 'zod';
import { graph, graphStorage } from '../memory/storage.js';

// Import ThinkSchema and extend it with the new fields
import { ThinkSchema as BaseThinkSchema } from '../think/schemas.js';

// Extend the base schema with additional fields for step counting
export const ExtendedThinkSchema = BaseThinkSchema.extend({
  plannedSteps: z.number().optional().describe('The total number of steps planned for this thinking process'),
  currentStep: z.number().optional().describe('The current step number in the thinking process'),
  selfReflect: z.boolean().optional().default(false).describe('Whether to perform a self-reflection pass after generating the answer'),
  allowResearch: z.boolean().optional().default(false).describe('Whether to allow research tool calls during the reasoning process'),
});

// Export the type for the extended schema
export type ThinkParams = z.infer<typeof ExtendedThinkSchema>;

/**
 * Basic implementation of an agent that handles structured thinking.
 * Refactored from the original think tool implementation.
 */
export class BasicAgent implements IAgent {
  agentId: string;
  memory: MemoryStore;
  private params: Partial<ThinkParams>;
  private currentThoughtId: string | null = null;

  /**
   * Create a new BasicAgent
   * 
   * @param agentId - Unique identifier for this agent
   * @param memory - The memory store to use
   * @param params - Optional default parameters for the think tool
   */
  constructor(agentId: string, memory: MemoryStore, params: Partial<ThinkParams> = {}) {
    this.agentId = agentId;
    this.memory = memory;
    this.params = params;
  }

  /**
   * Initialize the agent with a given context
   * 
   * @param ctx - Initialization context
   */
  async init(ctx: Record<string, unknown>): Promise<void> {
    // Merge any context parameters with default params
    if (ctx.thinkParams && typeof ctx.thinkParams === 'object') {
      this.params = {
        ...this.params,
        ...ctx.thinkParams
      };
    }
    
    // Generate a unique thought ID if this is stored in memory
    if (this.params.storeInMemory) {
      this.currentThoughtId = `Thought-${this.agentId}-${Date.now()}`;
    }
  }

  /**
   * Process a single step of reasoning
   * 
   * @param input - The input to process
   * @returns The processed output
   */
  async step(input: string): Promise<string> {
    // If this is the first step, use the input as the structuredReasoning
    if (!this.params.structuredReasoning) {
      this.params.structuredReasoning = input;
    } else {
      // Otherwise, append to the existing reasoning
      this.params.structuredReasoning += `\n\n${input}`;
    }
    
    // Increment the current step if defined
    if (typeof this.params.currentStep === 'number') {
      this.params.currentStep += 1;
    }

    // If self-reflection is enabled, perform a critique
    let output = this.params.structuredReasoning;
    if (this.params.selfReflect) {
      // This would be implemented with a critique prompt - simplified for now
      const critique = `Self-reflection on step ${this.params.currentStep}: The reasoning is sound.`;
      
      // Store the critique in memory if enabled
      if (this.params.storeInMemory && this.currentThoughtId) {
        // Add the critique as an observation
        graph.addObservations(this.currentThoughtId, [`Self-reflection: ${critique}`]);
        graphStorage.save();
      }
      
      // Append the critique to the output
      output += `\n\n${critique}`;
    }

    return output;
  }

  /**
   * Complete the agent's work and store final state in memory
   */
  async finalize(): Promise<void> {
    // If we should store in memory and have a current thought
    if (this.params.storeInMemory && this.params.structuredReasoning) {
      // If we don't have a thought ID yet, create one
      if (!this.currentThoughtId) {
        this.currentThoughtId = `Thought-${this.agentId}-${Date.now()}`;
      }

      // Create the entity
      const entityName = this.currentThoughtId;
      const entityType = 'thought';
      const observations = [
        `Reasoning: ${this.params.structuredReasoning}`,
      ];
      
      // Add optional metadata
      if (this.params.context) {
        observations.push(`Context: ${this.params.context}`);
      }
      if (this.params.category) {
        observations.push(`Category: ${this.params.category}`);
      }
      if (this.params.tags && this.params.tags.length > 0) {
        observations.push(`Tags: ${this.params.tags.join(', ')}`);
      }
      if (this.params.plannedSteps) {
        observations.push(`Planned Steps: ${this.params.plannedSteps}`);
      }
      if (this.params.currentStep) {
        observations.push(`Completed Steps: ${this.params.currentStep}`);
      }
      
      // Create the entity in the graph
      graph.addEntity({
        name: entityName,
        entityType,
        observations
      });
      
      // Optionally create a relation to an associated entity
      if (this.params.associateWithEntity) {
        graph.addRelation({
          from: entityName,
          to: this.params.associateWithEntity,
          relationType: 'context-for'
        });
      }
      
      // Save the graph
      graphStorage.save();
    }
  }
  
  /**
   * Helper to create a JSON representation of the agent state
   */
  toJSON() {
    return {
      agentId: this.agentId,
      type: 'BasicAgent',
      currentStep: this.params.currentStep,
      plannedSteps: this.params.plannedSteps,
      hasMemory: !!this.params.storeInMemory
    };
  }
} 