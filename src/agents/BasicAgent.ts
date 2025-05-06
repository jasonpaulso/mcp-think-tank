import { IAgent } from './IAgent.js';
import { MemoryStore } from '../memory/store/MemoryStore.js';
import { z } from 'zod';
import { formatThought, detectFormatterType } from '../think/formatters.js';

// Import ThinkSchema and extend it with the new fields
import { ThinkSchema as BaseThinkSchema } from '../think/schemas.js';

// Extend the base schema with additional fields for step counting
export const ExtendedThinkSchema = BaseThinkSchema.extend({
  plannedSteps: z.number().optional().describe('The total number of steps planned for this thinking process'),
  currentStep: z.number().optional().describe('The current step number in the thinking process'),
  selfReflect: z.boolean().optional().default(false).describe('Whether to perform a self-reflection pass after generating the answer'),
  allowResearch: z.boolean().optional().default(false).describe('Whether to allow research via external tools during the reasoning process'),
  reflectPrompt: z.string().optional().describe('Custom prompt for the self-reflection stage'),
  researchQuery: z.string().optional().describe('Optional research query to execute during the reasoning process'),
  formatOutput: z.boolean().optional().default(true).describe('Whether to apply markdown formatting to the output'),
  formatType: z.enum(['auto', 'general', 'problem', 'comparison']).optional().default('auto').describe('The type of formatting to apply')
});

// Type for the think tool parameters
export type ThinkParams = z.infer<typeof ExtendedThinkSchema>;

// Import types for research tools
type ResearchResult = {
  query: string;
  results: string[];
  sources: string[];
};

/**
 * Basic agent implementation that uses the think tool for reasoning.
 * This implementation refactors the original think tool logic to follow the IAgent interface.
 */
export class BasicAgent implements IAgent {
  agentId: string;
  memory: MemoryStore;
  private params: ThinkParams;
  private output: string = '';
  private reflection: string = '';
  private researchResults: ResearchResult[] = [];
  private formattedOutput: string = '';
  
  /**
   * Create a new BasicAgent instance
   * 
   * @param agentId - Unique identifier for this agent
   * @param memory - Memory store for persistence
   * @param params - Optional think tool parameters
   */
  constructor(agentId: string, memory: MemoryStore, params?: Partial<ThinkParams>) {
    this.agentId = agentId;
    this.memory = memory;
    this.params = {
      structuredReasoning: '',
      storeInMemory: false,
      selfReflect: false,
      allowResearch: false,
      formatOutput: true,
      formatType: 'auto',
      category: '',
      tags: [],
      ...params
    };
  }
  
  /**
   * Initialize the agent
   * 
   * @param ctx - Initialization context
   */
  async init(ctx: Record<string, unknown>): Promise<void> {
    // If thinkParams is provided in the context, use it to override the default params
    if (ctx.thinkParams) {
      this.params = {
        ...this.params,
        ...(ctx.thinkParams as Partial<ThinkParams>)
      };
    }
    
    // Initialize research state if allowed
    if (this.params.allowResearch && this.params.researchQuery) {
      await this.conductResearch(this.params.researchQuery);
    }
  }
  
  /**
   * Process a step of reasoning
   * 
   * @param input - Input for this reasoning step
   * @returns The processed output
   */
  async step(input: string): Promise<string> {
    // Store the input as our main reasoning
    this.output = input;
    
    // If the output contains research request markers, process them
    if (this.params.allowResearch) {
      await this.handleResearchRequests();
    }
    
    // If self-reflection is enabled, perform a reflection pass
    if (this.params.selfReflect) {
      await this.performSelfReflection();
    }
    
    // Apply markdown formatting if enabled
    if (this.params.formatOutput !== false) {
      this.applyFormatting();
    } else {
      this.formattedOutput = this.output;
    }
    
    // If the step counter is being used, increment the current step
    if (typeof this.params.currentStep === 'number') {
      this.params.currentStep += 1;
    }
    
    return this.finalOutput();
  }
  
  /**
   * Scan the output for research requests and process them
   * Format: [research: query to search]
   */
  private async handleResearchRequests(): Promise<void> {
    const researchPattern = /\[research:\s*([^\]]+)\]/g;
    let match;
    let modified = this.output;
    
    while ((match = researchPattern.exec(this.output)) !== null) {
      const query = match[1].trim();
      const placeholder = match[0];
      
      // Conduct the research
      await this.conductResearch(query);
      
      // Get the most recent research result
      const latestResearch = this.researchResults[this.researchResults.length - 1];
      
      // Format the research results
      const formattedResults = `
**Research Results for "${latestResearch.query}":**
${latestResearch.results.map((r, i) => `- ${r} ${latestResearch.sources[i] ? `(Source: ${latestResearch.sources[i]})` : ''}`).join('\n')}
`;
      
      // Replace the placeholder with the results
      modified = modified.replace(placeholder, formattedResults);
    }
    
    // Update the output with the research results
    this.output = modified;
  }
  
  /**
   * Conduct research using external tools
   * In a real implementation, this would call a search API
   */
  private async conductResearch(query: string): Promise<void> {
    // In a full implementation, this would call the research tool
    // For now, we'll simulate research results for testing
    
    // Simulate a delay for the "network call"
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create mock research result that matches the format in the tests
    const mockResult: ResearchResult = {
      query,
      results: [
        `Result 1`,
        `Result 2`,
        `Result 3`
      ],
      sources: [
        'Source 1',
        'Source 2',
        'Source 3'
      ]
    };
    
    // Store the research result
    this.researchResults.push(mockResult);
  }
  
  /**
   * Perform a self-reflection pass on the current reasoning
   */
  private async performSelfReflection(): Promise<void> {
    // Generate a reflection prompt based on the current reasoning
    const reflectPrompt = this.params.reflectPrompt || 
      `Review the following reasoning for inconsistencies, logical errors, or incomplete analysis:\n\n${this.output}\n\nProvide a critical self-reflection identifying any issues and suggesting improvements:`;
    
    // In a real implementation, this would call the LLM again
    // For now, we'll simulate a reflection
    this.reflection = `Self-reflection on the reasoning:\n- The reasoning is sound but could be more comprehensive\n- Additional considerations for edge cases would strengthen the analysis\n- The conclusion follows logically from the premises`;
    
    // In a full implementation, we might update the original output based on reflection
    if (this.reflection) {
      this.output = `${this.output}\n\n---\n\n**Self-Reflection:**\n${this.reflection}`;
    }
  }
  
  /**
   * Apply markdown formatting to the output
   */
  private applyFormatting(): void {
    // Determine the format type
    let formatType: 'general' | 'problem' | 'comparison' = 'general';
    
    if (this.params.formatType === 'auto') {
      formatType = detectFormatterType(this.output);
    } else {
      formatType = this.params.formatType as 'general' | 'problem' | 'comparison';
    }
    
    // Build the metadata
    const metadata: Record<string, any> = {
      type: formatType,
      title: this.params.context || undefined,
      step: this.params.currentStep,
      totalSteps: this.params.plannedSteps,
      category: this.params.category,
      context: this.params.context,
      hasReflection: this.params.selfReflect,
      hasResearch: this.params.allowResearch && this.researchResults.length > 0
    };
    
    // Format the output
    this.formattedOutput = formatThought(this.output, metadata);
  }
  
  /**
   * Return the final formatted output
   */
  private finalOutput(): string {
    // If step counting is enabled, add step information to the output
    if (typeof this.params.currentStep === 'number' && typeof this.params.plannedSteps === 'number') {
      const stepInfo = `Step ${this.params.currentStep} of ${this.params.plannedSteps}`;
      return `${this.formattedOutput}\n\n(${stepInfo})`;
    }
    
    return this.formattedOutput;
  }

  /**
   * Finalize the agent's work and persist to memory if needed
   */
  async finalize(): Promise<void> {
    // If storeInMemory is true, save to the knowledge graph
    if (this.params.storeInMemory) {
      const entityName = `Thought_${new Date().toISOString().replace(/[-:.]/g, '_')}`;
      const entityType = this.params.category || 'Thought';
      
      const observations = [];
      
      // Add step information if available
      if (typeof this.params.currentStep === 'number' && typeof this.params.plannedSteps === 'number') {
        observations.push(`Step: ${this.params.currentStep}/${this.params.plannedSteps}`);
      }
      
      // Add context if available
      if (this.params.context) {
        observations.push(`Context: ${this.params.context}`);
      }
      
      // Add the reasoning itself
      observations.push(`Reasoning: ${this.output}`);
      
      // If there's a reflection, add it too
      if (this.reflection) {
        observations.push(`Reflection: ${this.reflection}`);
      }
      
      // Add research results if any
      if (this.researchResults.length > 0) {
        this.researchResults.forEach((result, index) => {
          observations.push(`Research ${index + 1}: Query: ${result.query}, Results: ${result.results.join(', ')}`);
        });
      }
      
      // Add to knowledge graph
      const entity = await this.memory.addEntity({
        name: entityName,
        entityType: entityType,
        observations: observations
      });
      
      // Add context relation if available
      if (this.params.context) {
        await this.memory.addRelation({
          from: entityName,
          to: this.params.context,
          relationType: 'has context'
        });
      }
      
      // Add tag relations if available
      if (this.params.tags && this.params.tags.length > 0) {
        for (const tag of this.params.tags) {
          await this.memory.addRelation({
            from: entityName,
            to: tag,
            relationType: 'tagged with'
          });
        }
      }
      
      // Add research source relations if any
      if (this.researchResults.length > 0) {
        for (const research of this.researchResults) {
          for (const source of research.sources) {
            if (source) {
              await this.memory.addRelation({
                from: entityName,
                to: source,
                relationType: 'references'
              });
            }
          }
        }
      }
      
      // Save to storage
      await this.memory.save();
    }
  }
} 