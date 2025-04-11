import { FastMCP } from 'fastmcp';
import { graph, graphStorage } from './storage.js';
import * as Schemas from '../utils/validation.js';
import { embeddingService } from './embeddingService.js';
import { z } from 'zod'; 

// Batch size for processing large entity sets
const BATCH_SIZE = 20;

/**
 * Process entities in batches to prevent timeouts on large operations
 * @param entities Array of entities to process
 * @param processFn Function to process each entity
 * @returns Object with created and existing entity names
 */
async function batchProcessEntities(entities: any[], processFn: (entity: any) => boolean) {
  const results = {
    created: [] as string[],
    existing: [] as string[]
  };

  // Process in batches
  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE);
    
    // Process each entity in the batch
    for (const entity of batch) {
      const success = processFn(entity);
      if (success) {
        results.created.push(entity.name);
      } else {
        results.existing.push(entity.name);
      }
    }
    
    // Save after each batch to ensure persistence
    if (i + BATCH_SIZE < entities.length) {
      graphStorage.save();
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
  // Create entities
  server.addTool({
    name: 'create_entities',
    description: 'Create multiple new entities in the knowledge graph',
    parameters: Schemas.CreateEntitiesSchema,
    execute: async (args) => {
      // Process entities in batches
      const total = args.entities.length;
      if (total > BATCH_SIZE) {
        console.log(`Processing ${total} entities in batches of ${BATCH_SIZE}...`);
      }
      
      const results = await batchProcessEntities(args.entities, (entity) => {
        return graph.addEntity(entity);
      });
      
      // Save final changes
      graphStorage.save();
      
      // Return detailed results
      return JSON.stringify({
        created: results.created.length > 0 ? results.created : null,
        existing: results.existing.length > 0 ? results.existing : null,
        message: `Created ${results.created.length} new entities. ${results.existing.length} entities already existed.`,
        imageEntities: results.created.filter(name => {
          const entity = graph.entities.get(name);
          return entity && entity.imageUrl;
        }).length
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
    parameters: Schemas.UpdateRelationsSchema,
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

  // Semantic search
  server.addTool({
    name: 'semantic_search',
    description: 'Find entities using semantic similarity',
    parameters: Schemas.SemanticSearchSchema,
    execute: async (args) => {
      const threshold = args.threshold ?? 0.7;
      const limit = args.limit ?? 10;
      const generateMissingEmbeddings = args.generateMissingEmbeddings ?? true;
      
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbedding(args.query, 'query');
      
      if (!queryEmbedding) {
        return JSON.stringify({
          entities: [],
          message: "Failed to generate embedding for query"
        });
      }
      
      // Get all entities
      const entities = Array.from(graph.entities.values());
      
      // Generate embeddings for entities that don't have them
      if (generateMissingEmbeddings) {
        const entitiesWithoutEmbeddings = entities.filter(e => !e.embedding);
        
        if (entitiesWithoutEmbeddings.length > 0) {
          // Convert entities to text
          const textsToEmbed = entitiesWithoutEmbeddings.map(entity => {
            return `${entity.name} (${entity.entityType}): ${entity.observations.join(' ')}`;
          });
          
          // Generate embeddings in batches to avoid timeouts
          const batchSize = 10;
          for (let i = 0; i < entitiesWithoutEmbeddings.length; i += batchSize) {
            const batch = textsToEmbed.slice(i, i + batchSize);
            const batchEntities = entitiesWithoutEmbeddings.slice(i, i + batchSize);
            
            const embeddings = await embeddingService.generateEmbeddings(batch);
            
            // Assign embeddings to entities
            for (let j = 0; j < batchEntities.length; j++) {
              if (embeddings && embeddings[j]) {
                batchEntities[j].embedding = embeddings[j];
              }
            }
          }
          
          // Save the graph with new embeddings
          graphStorage.save();
        }
      }
      
      // Calculate similarity scores
      const results = entities
        .filter(entity => entity.embedding) // Only include entities with embeddings
        .map(entity => {
          const similarity = embeddingService.cosineSimilarity(
            queryEmbedding,
            entity.embedding!
          );
          return { entity, similarity };
        })
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      // Return results
      return JSON.stringify({
        entities: results.map(r => ({
          ...r.entity,
          score: r.similarity
        })),
        count: results.length,
        message: `Found ${results.length} semantically similar entities with threshold ${threshold}`
      });
    }
  });

  // Generate embeddings for all entities
  server.addTool({
    name: 'generate_embeddings',
    description: 'Generate embeddings for all entities in the knowledge graph',
    parameters: z.object({}),
    execute: async (args) => {
      // Get all entities
      const entities = Array.from(graph.entities.values());
      
      // Convert entities to text
      const textsToEmbed = entities.map(entity => {
        return `${entity.name} (${entity.entityType}): ${entity.observations.join(' ')}`;
      });
      
      // Process in smaller batches
      const batchSize = 10;
      const results = {
        success: 0,
        failed: 0
      };
      
      for (let i = 0; i < entities.length; i += batchSize) {
        const batch = textsToEmbed.slice(i, i + batchSize);
        const batchEntities = entities.slice(i, i + batchSize);
        
        const embeddings = await embeddingService.generateEmbeddings(batch);
        
        // Assign embeddings to entities
        for (let j = 0; j < batchEntities.length; j++) {
          if (embeddings && embeddings[j]) {
            batchEntities[j].embedding = embeddings[j];
            results.success++;
          } else {
            results.failed++;
          }
        }
      }
      
      // Save the graph with new embeddings
      graphStorage.save();
      
      // Return results
      return JSON.stringify({
        success: results.success,
        failed: results.failed,
        message: `Generated embeddings for ${results.success} entities. ${results.failed} entities failed.`
      });
    }
  });

  // Create image entity
  server.addTool({
    name: 'create_image_entity',
    description: 'Create a new entity with an associated image URL and metadata',
    parameters: z.object({
      name: z.string().min(1, "Entity name cannot be empty"),
      entityType: z.string().min(1, "Entity type cannot be empty"),
      observations: z.array(z.string()),
      imageUrl: z.string().url("Image URL must be a valid URL"),
      imageMetadata: z.object({
        altText: z.string().optional(),
        source: z.string().optional(),
        timestamp: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional()
      }).optional()
    }),
    execute: async (args) => {
      try {
        // Check if entity already exists
        if (graph.entities.has(args.name)) {
          return JSON.stringify({
            success: false,
            message: `Entity '${args.name}' already exists.`
          });
        }
        
        // Create the entity
        const entity = {
          name: args.name,
          entityType: args.entityType,
          observations: args.observations,
          imageUrl: args.imageUrl,
          imageMetadata: args.imageMetadata || {
            altText: '',
            description: ''
          }
        };
        
        graph.addEntity(entity);
        
        // Save changes
        graphStorage.save();
        
        return JSON.stringify({
          success: true,
          message: `Successfully created image entity: ${args.name}`,
          entity: entity
        });
      } catch (error) {
        console.error('Error creating image entity:', error);
        return JSON.stringify({
          success: false,
          message: `Error creating image entity: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  });

  // Generate image embedding
  server.addTool({
    name: 'generate_image_embedding',
    description: 'Generate embedding for an image entity',
    parameters: z.object({
      entityName: z.string().min(1, "Entity name cannot be empty")
    }),
    execute: async (args) => {
      // Get the entity
      const entity = graph.entities.get(args.entityName);
      
      if (!entity) {
        return JSON.stringify({
          message: `Entity ${args.entityName} not found`,
          success: false
        });
      }
      
      // Check if the entity has an image URL
      if (!entity.imageUrl) {
        return JSON.stringify({
          message: `Entity ${args.entityName} does not have an image URL`,
          success: false
        });
      }
      
      // Generate the embedding
      const embedding = await embeddingService.generateImageEmbedding(entity.imageUrl);
      
      if (!embedding) {
        return JSON.stringify({
          message: `Failed to generate image embedding for ${args.entityName}`,
          success: false
        });
      }
      
      // Store the embedding
      entity.imageEmbedding = embedding;
      
      // Save the graph
      graphStorage.save();
      
      return JSON.stringify({
        message: `Successfully generated image embedding for ${args.entityName}`,
        success: true
      });
    }
  });

  // Visual semantic search
  server.addTool({
    name: 'visual_semantic_search',
    description: 'Search using image or text queries with semantic similarity',
    parameters: z.object({
      query: z.string().min(1, "Search query cannot be empty"),
      useImage: z.boolean().optional().describe("Whether to use image embeddings for search"),
      threshold: z.number().min(0).max(1).optional().describe("Minimum similarity threshold (0-1)"),
      limit: z.number().min(1).max(100).optional().describe("Maximum number of results")
    }),
    execute: async (args) => {
      const threshold = args.threshold ?? 0.7;
      const limit = args.limit ?? 10;
      const useImage = args.useImage ?? false;
      
      // Generate embedding for the query
      let queryEmbedding;
      
      if (useImage) {
        // Try to interpret the query as an image URL
        queryEmbedding = await embeddingService.generateImageEmbedding(args.query);
      } else {
        // Use text embedding
        queryEmbedding = await embeddingService.generateEmbedding(args.query, 'query');
      }
      
      if (!queryEmbedding) {
        return JSON.stringify({
          entities: [],
          message: "Failed to generate embedding for query"
        });
      }
      
      // Get all entities
      const entities = Array.from(graph.entities.values());
      
      // Filter entities that have the appropriate embedding type
      const validEntities = entities.filter(entity => {
        return useImage ? entity.imageEmbedding : entity.embedding;
      });
      
      // Calculate similarity scores
      const results = validEntities.map(entity => {
        const entityEmbedding = useImage ? entity.imageEmbedding : entity.embedding;
        
        if (!entityEmbedding) {
          return { entity, similarity: 0 };
        }
        
        const similarity = embeddingService.cosineSimilarity(
          queryEmbedding!,
          entityEmbedding
        );
        
        return { entity, similarity };
      })
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
      // Return results
      return JSON.stringify({
        entities: results.map(r => ({
          ...r.entity,
          score: r.similarity
        })),
        count: results.length,
        message: `Found ${results.length} similar entities using ${useImage ? 'image' : 'text'} embeddings with threshold ${threshold}`
      });
    }
  });
} 