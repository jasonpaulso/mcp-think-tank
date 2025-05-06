import { FastMCP } from 'fastmcp';
import { graph, memoryStore } from './store/index.js';
import * as Schemas from '../utils/validation.js';
import { z } from 'zod'; 
import { Relation } from './store/MemoryStore.js';

// Batch size for processing large entity sets
const BATCH_SIZE = 20;
// MAX_OPERATION_TIME controls how long Think Tank tools will run before aborting a batch operation.
// NOTE: FastMCP 1.21.0 does NOT support configurable timeouts via env vars; this only affects local tool logic, not the server.
const MAX_OPERATION_TIME = process.env.REQUEST_TIMEOUT
  ? parseInt(process.env.REQUEST_TIMEOUT, 10) * 1000
  : 55000; // 55 seconds default for all users

/**
 * Process entities in batches to prevent timeouts on large operations
 * @param entities Array of entities to process
 * @param processFn Function to process each entity
 * @param log FastMCP log object
 * @returns Object with created and existing entity names
 */
async function batchProcessEntities<T extends { name: string }>(entities: T[], processFn: (entity: T) => Promise<boolean>, log: any) {
  const results = {
    created: [] as string[],
    existing: [] as string[],
    incomplete: false
  };

  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    // Check if we're approaching timeout
    if (Date.now() - startTime > MAX_OPERATION_TIME) {
      results.incomplete = true;
      if (log) log.warn(`Operation approaching timeout limit. Processed ${i} of ${entities.length} entities.`);
      break;
    }

    const batch = entities.slice(i, i + BATCH_SIZE);
    
    // Process each entity in the batch
    for (const entity of batch) {
      const success = await processFn(entity);
      if (success) {
        results.created.push(entity.name);
      } else {
        results.existing.push(entity.name);
      }
    }
    
    // Save after each batch to ensure persistence
    if (i + BATCH_SIZE < entities.length) {
      await memoryStore.save();
    }
    
    // If not the last batch, add a small delay to prevent CPU blocking
    if (i + BATCH_SIZE < entities.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return results;
}

/**
 * Register all memory-related tools with the MCP server
 * @param server The FastMCP server instance
 */
export function registerMemoryTools(server: FastMCP): void {
  // Upsert entities (combined create/update)
  server.addTool({
    name: 'upsert_entities',
    description: 'Create new entities or update existing ones in the knowledge graph using an upsert pattern',
    parameters: Schemas.UpsertEntitiesSchema,
    execute: async (args, context) => {
      const total = args.entities.length;
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      
      const results = {
        created: [] as string[],
        updated: [] as string[],
        failed: [] as {name: string, reason: string}[],
        incomplete: false
      };

      // Process with timeout protection
      const startTime = Date.now();
      const timeoutMs = 25000; // 25 second timeout
      
      for (const entity of args.entities) {
        try {
          // Check if we've exceeded our time budget
          if (Date.now() - startTime > timeoutMs) {
            results.incomplete = true;
            break;
          }
          
          // Check if entity exists
          const existingEntity = graph.entities.get(entity.name);
          const doesExist = !!existingEntity;
          
          // If entity doesn't exist, create it
          if (!doesExist) {
            // Add observations for the new entity
            for (const observation of entity.observations) {
              await memoryStore.add(entity.name, observation, {
                version: '1.0'
              });
            }
            results.created.push(entity.name);
          } 
          // If entity exists and update flag is true, update it
          else if (entity.update) {
            // Update entity type
            existingEntity.entityType = entity.entityType;
            
            // Remove all existing observations and add new ones
            graph.deleteObservations(entity.name, existingEntity.observations);
            
            // Add new observations
            for (const observation of entity.observations) {
              await memoryStore.add(entity.name, observation, {
                version: '1.0'
              });
            }
            results.updated.push(entity.name);
          }
          // Entity exists but update flag is false, skip
          else {
            results.failed.push({
              name: entity.name,
              reason: "Entity already exists and update flag is false"
            });
          }
        } catch (error) {
          results.failed.push({
            name: entity.name,
            reason: `Error processing entity: ${error}`
          });
        }
      }
      
      // Save final changes
      await memoryStore.save();
      
      // Return detailed results
      return JSON.stringify({
        created: results.created.length > 0 ? results.created : null,
        updated: results.updated.length > 0 ? results.updated : null,
        failed: results.failed.length > 0 ? results.failed : null,
        incomplete: results.incomplete,
        message: `Created ${results.created.length} new entities. Updated ${results.updated.length} existing entities. Failed for ${results.failed.length} entities.${
          results.incomplete ? ` Operation incomplete due to timeout - ${results.created.length + results.updated.length + results.failed.length} of ${total} entities processed.` : ''
        }`
      });
    }
  });

  // Create relations
  server.addTool({
    name: 'create_relations',
    description: 'Create multiple new relations between entities in the knowledge graph. Relations should be in active voice',
    parameters: Schemas.CreateRelationsSchema,
    execute: async (args) => {
      const results = {
        created: [] as Array<{from: string, to: string, relationType: string}>,
        failed: [] as Array<{from: string, to: string, relationType: string, reason: string}>
      };

      // Using the lower-level graph for relations for now
      // In a future update, we can add relation handling to the MemoryStore itself
      for (const relation of args.relations) {
        const success = graph.addRelation(relation);
        if (success) {
          results.created.push(relation);
        } else {
          // Determine failure reason
          let reason = "Unknown error";
          if (!graph.entities.has(relation.from)) {
            reason = `Source entity '${relation.from}' doesn't exist`;
          } else if (!graph.entities.has(relation.to)) {
            reason = `Target entity '${relation.to}' doesn't exist`;
          } else {
            reason = "Relation already exists";
          }
          
          results.failed.push({...relation, reason});
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string
      return JSON.stringify({
        created: results.created.length > 0 ? results.created : null,
        failed: results.failed.length > 0 ? results.failed : null,
        message: `Created ${results.created.length} new relations. ${results.failed.length} relations failed.`
      });
    }
  });

  // Add observations
  server.addTool({
    name: 'add_observations',
    description: 'Add new observations to existing entities in the knowledge graph',
    parameters: Schemas.AddObservationsSchema,
    execute: async (args) => {
      const results = {
        updated: [] as Array<{entityName: string, added: string[]}>,
        failed: [] as Array<{entityName: string, reason: string}>
      };

      for (const item of args.observations) {
        try {
          const added: string[] = [];
          for (const content of item.contents) {
            await memoryStore.add(item.entityName, content, {
              version: '1.0'
            });
            added.push(content);
          }
          
          if (added.length > 0) {
            results.updated.push({
              entityName: item.entityName,
              added
            });
          }
        } catch (error) {
          results.failed.push({
            entityName: item.entityName,
            reason: `Failed to add observations: ${error}`
          });
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        failed: results.failed.length > 0 ? results.failed : null,
        message: `Added observations to ${results.updated.length} entities. Failed for ${results.failed.length} entities.`
      });
    }
  });

  // Delete entities
  server.addTool({
    name: 'delete_entities',
    description: 'Delete multiple entities and their associated relations from the knowledge graph',
    parameters: Schemas.DeleteEntitiesSchema,
    execute: async (args) => {
      const results = {
        deleted: [] as string[],
        notFound: [] as string[]
      };

      // Using the lower-level graph for entity deletion for now
      // In a future update, we can add entity deletion to the MemoryStore itself
      for (const entityName of args.entityNames) {
        const success = graph.deleteEntity(entityName);
        if (success) {
          results.deleted.push(entityName);
        } else {
          results.notFound.push(entityName);
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string
      return JSON.stringify({
        deleted: results.deleted.length > 0 ? results.deleted : null,
        notFound: results.notFound.length > 0 ? results.notFound : null,
        message: `Deleted ${results.deleted.length} entities. ${results.notFound.length} entities not found.`
      });
    }
  });

  // Delete observations
  server.addTool({
    name: 'delete_observations',
    description: 'Delete specific observations from entities in the knowledge graph',
    parameters: Schemas.DeleteObservationsSchema,
    execute: async (args) => {
      const results = {
        updated: [] as string[],
        notFound: [] as string[]
      };

      for (const item of args.deletions) {
        try {
          // First, find the entity directly
          const entity = graph.entities.get(item.entityName);
          
          if (!entity) {
            // If not found directly, try to find similar entities
            const similarEntities = await memoryStore.findSimilar(item.entityName);
            
            if (similarEntities.length === 0) {
              // No matching entity found
              results.notFound.push(item.entityName);
              continue;
            }
            
            // Use the first similar entity
            item.entityName = similarEntities[0];
          }
          
          // Get enhanced entity from memory store (access private property carefully)
          const enhancedEntityMap = (memoryStore as any).enhancedEntities;
          const enhancedEntity = enhancedEntityMap?.get(item.entityName);
          
          if (!enhancedEntity) {
            results.notFound.push(item.entityName);
            continue;
          }
          
          // Track if any observations were removed
          let observationsRemoved = false;
          
          // Loop through the observations to delete
          for (const observationToDelete of item.observations) {
            // Filter out observations that match the text
            const originalLength = enhancedEntity.observations.length;
            enhancedEntity.observations = enhancedEntity.observations.filter((obs: { text: string }) => 
              !obs.text.includes(observationToDelete)
            );
            
            if (enhancedEntity.observations.length < originalLength) {
              observationsRemoved = true;
            }
          }
          
          if (observationsRemoved) {
            results.updated.push(item.entityName);
          } else {
            results.notFound.push(item.entityName);
          }
        } catch (error) {
          console.error(`Error deleting observations for ${item.entityName}:`, error);
          results.notFound.push(item.entityName);
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        notFound: results.notFound.length > 0 ? results.notFound : null,
        message: `Removed observations from ${results.updated.length} entities. ${results.notFound.length} entities not found or observations not found.`
      });
    }
  });

  // Delete relations
  server.addTool({
    name: 'delete_relations',
    description: 'Delete multiple relations from the knowledge graph',
    parameters: Schemas.DeleteRelationsSchema,
    execute: async (args) => {
      const results = {
        deleted: [] as Array<{from: string, to: string, relationType: string}>,
        notFound: [] as Array<{from: string, to: string, relationType: string}>
      };

      // Using the lower-level graph for relations for now
      for (const relation of args.relations) {
        const success = graph.deleteRelation(relation);
        if (success) {
          results.deleted.push(relation);
        } else {
          results.notFound.push(relation);
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string
      return JSON.stringify({
        deleted: results.deleted.length > 0 ? results.deleted : null,
        notFound: results.notFound.length > 0 ? results.notFound : null,
        message: `Deleted ${results.deleted.length} relations. ${results.notFound.length} relations not found.`
      });
    }
  });

  // Read graph
  server.addTool({
    name: 'read_graph',
    description: 'Read the entire knowledge graph',
    parameters: z.object({
      dummy: z.string().describe("Placeholder parameter - this tool doesn't require parameters but returns the complete knowledge graph with entities and relationships").optional()
    }),
    execute: async () => {
      // Return as string - still using the underlying graph for compatibility
      return JSON.stringify(graph.toJSON());
    }
  });

  // Search nodes
  server.addTool({
    name: 'search_nodes',
    description: 'Search for nodes in the knowledge graph based on a query',
    parameters: Schemas.SearchNodesSchema,
    execute: async (args) => {
      // First, check if any entity names directly match or contain the query
      const directMatches = Array.from(graph.entities.keys()).filter(name => 
        name.toLowerCase().includes(args.query.toLowerCase())
      );
      
      // Then use the query interface to search observations
      const queryResults = await memoryStore.query({
        keyword: args.query,
        limit: 100
      });
      
      // Combine direct entity name matches with observation content matches
      const entityNames = new Set<string>([
        ...directMatches,
        ...queryResults.map(result => result.entityName)
      ]);
      
      // Get the full entities
      const results = graph.getEntities(Array.from(entityNames));
      
      // Return as string
      return JSON.stringify({
        entities: results,
        count: results.length,
        message: `Found ${results.length} matching entities.`
      });
    }
  });

  // Open nodes
  server.addTool({
    name: 'open_nodes',
    description: 'Open specific nodes in the knowledge graph by their names',
    parameters: Schemas.OpenNodesSchema,
    execute: async (args) => {
      const results = graph.getEntities(args.names);
      const found = results.map(entity => entity.name);
      const notFound = args.names.filter(name => !found.includes(name));
      
      // Return as string
      return JSON.stringify({
        entities: results,
        found,
        notFound: notFound.length > 0 ? notFound : null,
        message: `Found ${found.length} entities. ${notFound.length} entities not found.`
      });
    }
  });

  // Update relations
  server.addTool({
    name: 'update_relations',
    description: 'Update multiple existing relations in the knowledge graph',
    parameters: Schemas.UpdateRelationsSchema,
    execute: async (args) => {
      const results = {
        updated: [] as Array<{from: string, to: string, relationType: string}>,
        created: [] as Array<{from: string, to: string, relationType: string}>,
        failed: [] as Array<{from: string, to: string, relationType: string, reason: string}>
      };

      // Check entities exist before attempting operations
      for (const relation of args.relations) {
        // First check if entities exist
        const fromExists = graph.entities.has(relation.from);
        const toExists = graph.entities.has(relation.to);
        
        if (!fromExists || !toExists) {
          let reason = "Unknown error";
          if (!fromExists) {
            reason = `Source entity '${relation.from}' doesn't exist`;
          } else if (!toExists) {
            reason = `Target entity '${relation.to}' doesn't exist`;
          }
          
          results.failed.push({...relation, reason});
          continue;
        }
        
        // Check if relationship already exists
        // Flatten the relations into a single array of Relation objects
        const allRelations: Relation[] = [];
        graph.relations.forEach(relations => {
          relations.forEach(relation => allRelations.push(relation));
        });
        
        const existingRelation = allRelations.find(rel => 
          rel.from === relation.from && 
          rel.to === relation.to && 
          rel.relationType === relation.relationType
        );
        
        // Proceed with update (which is delete + recreate)
        const deleted = existingRelation ? graph.deleteRelation(relation) : false;
        const added = graph.addRelation(relation);
        
        if (!added) {
          // If addition failed for some reason
          results.failed.push({...relation, reason: "Failed to create relation"});
        } else if (deleted) {
          // If we deleted an existing relation and added a new one, consider it updated
          results.updated.push(relation);
        } else {
          // If we just added (didn't delete first), it was a creation
          results.created.push(relation);
        }
      }

      // Save changes
      await memoryStore.save();

      // Return as string with clarified message about behavior
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        created: results.created.length > 0 ? results.created : null,
        failed: results.failed.length > 0 ? results.failed : null,
        message: `Updated ${results.updated.length} relations (by recreating them). Created ${results.created.length} new relations. Failed for ${results.failed.length} relations.`,
        note: "Relations are updated by removing and recreating them, rather than modifying in place."
      });
    }
  });

  // Memory query tool (new in Phase 2)
  server.addTool({
    name: 'memory_query',
    description: 'Query the memory store with advanced filters',
    parameters: z.object({
      keyword: z.string().optional().describe("Text to search for in observations"),
      before: z.string().optional().describe("ISO date to filter observations before"),
      after: z.string().optional().describe("ISO date to filter observations after"),
      tag: z.string().optional().describe("Tag to filter observations by"),
      agent: z.string().optional().describe("Agent that created the observations"),
      limit: z.number().optional().describe("Maximum number of results to return")
    }),
    execute: async (args) => {
      const results = await memoryStore.query({
        keyword: args.keyword,
        time: {
          before: args.before,
          after: args.after
        },
        tag: args.tag,
        agent: args.agent,
        limit: args.limit
      });
      
      return JSON.stringify({
        observations: results,
        count: results.length,
        message: `Found ${results.length} matching observations.`
      });
    }
  });
} 