import { FastMCP } from 'fastmcp';
import { ThinkSchema } from './schemas.js';
import { graph, graphStorage } from '../memory/storage.js';

/**
 * Registers the think tool with the MCP server
 * @param server - The FastMCP server instance
 */
export function registerThinkTool(server: FastMCP): void {
  server.addTool({
    name: 'think',
    description: 'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. Consider including: problem definition, relevant context, analysis steps, self-reflection on your reasoning, and conclusions. Adapt this structure as needed for your specific thought process.',
    parameters: ThinkSchema,
    execute: async (params) => {
      // If storeInMemory is true, persist the thought as an entity in the knowledge graph
      if (params.storeInMemory) {
        // Build the entity name and type
        const entityName = `Thought-${Date.now()}`;
        const entityType = 'thought';
        const observations = [
          `Reasoning: ${params.structuredReasoning}`,
        ];
        if (params.context) {
          observations.push(`Context: ${params.context}`);
        }
        if (params.category) {
          observations.push(`Category: ${params.category}`);
        }
        if (params.tags && params.tags.length > 0) {
          observations.push(`Tags: ${params.tags.join(', ')}`);
        }
        // Create the entity
        graph.addEntity({
          name: entityName,
          entityType,
          observations
        });
        // Optionally create a relation to an associated entity
        if (params.associateWithEntity) {
          graph.addRelation({
            from: entityName,
            to: params.associateWithEntity,
            relationType: 'context-for'
          });
        }
        graphStorage.save();
      }
      return "Your structured reasoning has been processed.";
    }
  });
} 