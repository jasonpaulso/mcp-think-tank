import { FastMCP } from 'fastmcp';
import { graph, graphStorage } from './storage.js';
import * as Schemas from '../utils/validation.js';

/**
 * Register all memory-related tools with the MCP server
 * @param server The FastMCP server instance
 */
export function registerMemoryTools(server: FastMCP): void {
  // Create entities
  server.addTool({
    name: 'create_entities',
    description: 'Create multiple new entities in the knowledge graph',
    parameters: Schemas.CreateEntitiesSchema,
    execute: async (args) => {
      const results = {
        created: [] as string[],
        existing: [] as string[]
      };

      for (const entity of args.entities) {
        const success = graph.addEntity(entity);
        if (success) {
          results.created.push(entity.name);
        } else {
          results.existing.push(entity.name);
        }
      }

      // Save changes
      graphStorage.save();

      // Return as string
      return JSON.stringify({
        created: results.created.length > 0 ? results.created : null,
        existing: results.existing.length > 0 ? results.existing : null,
        message: `Created ${results.created.length} new entities. ${results.existing.length} entities already existed.`
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
      graphStorage.save();

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
        const added = graph.addObservations(item.entityName, item.contents);
        if (added.length > 0 || graph.entities.has(item.entityName)) {
          results.updated.push({
            entityName: item.entityName,
            added
          });
        } else {
          results.failed.push({
            entityName: item.entityName,
            reason: `Entity '${item.entityName}' doesn't exist`
          });
        }
      }

      // Save changes
      graphStorage.save();

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

      for (const entityName of args.entityNames) {
        const success = graph.deleteEntity(entityName);
        if (success) {
          results.deleted.push(entityName);
        } else {
          results.notFound.push(entityName);
        }
      }

      // Save changes
      graphStorage.save();

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
        const success = graph.deleteObservations(item.entityName, item.observations);
        if (success) {
          results.updated.push(item.entityName);
        } else {
          results.notFound.push(item.entityName);
        }
      }

      // Save changes
      graphStorage.save();

      // Return as string
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        notFound: results.notFound.length > 0 ? results.notFound : null,
        message: `Removed observations from ${results.updated.length} entities. ${results.notFound.length} entities not found.`
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

      for (const relation of args.relations) {
        const success = graph.deleteRelation(relation);
        if (success) {
          results.deleted.push(relation);
        } else {
          results.notFound.push(relation);
        }
      }

      // Save changes
      graphStorage.save();

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
      random_string: z.string().describe("Dummy parameter for no-parameter tools").optional()
    }),
    execute: async () => {
      // Return as string
      return JSON.stringify(graph.toJSON());
    }
  });

  // Search nodes
  server.addTool({
    name: 'search_nodes',
    description: 'Search for nodes in the knowledge graph based on a query',
    parameters: Schemas.SearchNodesSchema,
    execute: async (args) => {
      const results = graph.searchNodes(args.query);
      
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

  // Update entities
  server.addTool({
    name: 'update_entities',
    description: 'Update multiple existing entities in the knowledge graph',
    parameters: Schemas.UpdateEntitiesSchema,
    execute: async (args) => {
      const results = {
        updated: [] as string[],
        notFound: [] as string[]
      };

      for (const updateEntity of args.entities) {
        const entity = graph.entities.get(updateEntity.name);
        if (!entity) {
          results.notFound.push(updateEntity.name);
          continue;
        }

        // Update entity type if provided
        if (updateEntity.entityType !== undefined) {
          entity.entityType = updateEntity.entityType;
        }

        // Update observations if provided
        if (updateEntity.observations !== undefined) {
          entity.observations = [...updateEntity.observations];
        }

        results.updated.push(updateEntity.name);
      }

      // Save changes
      graphStorage.save();

      // Return as string
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        notFound: results.notFound.length > 0 ? results.notFound : null,
        message: `Updated ${results.updated.length} entities. ${results.notFound.length} entities not found.`
      });
    }
  });

  // Update relations
  server.addTool({
    name: 'update_relations',
    description: 'Update multiple existing relations in the knowledge graph',
    parameters: Schemas.CreateRelationsSchema, // Reuse the same schema as create_relations
    execute: async (args) => {
      const results = {
        updated: [] as Array<{from: string, to: string, relationType: string}>,
        created: [] as Array<{from: string, to: string, relationType: string}>,
        failed: [] as Array<{from: string, to: string, relationType: string, reason: string}>
      };

      for (const relation of args.relations) {
        // Try to delete the relation first (if it exists)
        const deleted = graph.deleteRelation(relation);
        
        // Then add it
        const added = graph.addRelation(relation);
        
        if (!added) {
          // If we couldn't add it, determine the reason
          let reason = "Unknown error";
          if (!graph.entities.has(relation.from)) {
            reason = `Source entity '${relation.from}' doesn't exist`;
          } else if (!graph.entities.has(relation.to)) {
            reason = `Target entity '${relation.to}' doesn't exist`;
          }
          
          results.failed.push({...relation, reason});
        } else if (deleted) {
          // If we deleted and added, it was an update
          results.updated.push(relation);
        } else {
          // If we just added (didn't delete first), it was a creation
          results.created.push(relation);
        }
      }

      // Save changes
      graphStorage.save();

      // Return as string
      return JSON.stringify({
        updated: results.updated.length > 0 ? results.updated : null,
        created: results.created.length > 0 ? results.created : null,
        failed: results.failed.length > 0 ? results.failed : null,
        message: `Updated ${results.updated.length} relations. Created ${results.created.length} relations. Failed for ${results.failed.length} relations.`
      });
    }
  });
}

// Import Zod for the read_graph tool
import { z } from 'zod'; 