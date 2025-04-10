import { z } from 'zod';
import { Entity, Relation } from '../memory/knowledgeGraph.js';

// Entity validation schema
export const EntitySchema = z.object({
  name: z.string().min(1, "Entity name cannot be empty"),
  entityType: z.string().min(1, "Entity type cannot be empty"),
  observations: z.array(z.string())
});

// Relation validation schema
export const RelationSchema = z.object({
  from: z.string().min(1, "Source entity name cannot be empty"),
  to: z.string().min(1, "Target entity name cannot be empty"),
  relationType: z.string().min(1, "Relation type cannot be empty")
});

// Schema for creating entities
export const CreateEntitiesSchema = z.object({
  entities: z.array(EntitySchema)
});

// Schema for creating relations
export const CreateRelationsSchema = z.object({
  relations: z.array(RelationSchema)
});

// Schema for adding observations
export const AddObservationsSchema = z.object({
  observations: z.array(
    z.object({
      entityName: z.string().min(1, "Entity name cannot be empty"),
      contents: z.array(z.string())
    })
  )
});

// Schema for deleting entities
export const DeleteEntitiesSchema = z.object({
  entityNames: z.array(z.string().min(1, "Entity name cannot be empty"))
});

// Schema for deleting observations
export const DeleteObservationsSchema = z.object({
  deletions: z.array(
    z.object({
      entityName: z.string().min(1, "Entity name cannot be empty"),
      observations: z.array(z.string())
    })
  )
});

// Schema for deleting relations
export const DeleteRelationsSchema = z.object({
  relations: z.array(RelationSchema)
});

// Schema for searching nodes
export const SearchNodesSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty")
});

// Schema for opening nodes
export const OpenNodesSchema = z.object({
  names: z.array(z.string().min(1, "Entity name cannot be empty"))
});

// Schema for updating entities
export const UpdateEntitiesSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string().min(1, "Entity name cannot be empty"),
      entityType: z.string().optional(),
      observations: z.array(z.string()).optional()
    })
  )
});

// Schema for updating relations
export const UpdateRelationsSchema = z.object({
  relations: z.array(RelationSchema)
});

// Schema for semantic search
export const SemanticSearchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
  threshold: z.number().min(0).max(1).optional().describe("Minimum similarity threshold (0-1)"),
  limit: z.number().min(1).max(100).optional().describe("Maximum number of results"),
  generateMissingEmbeddings: z.boolean().optional().describe("Generate embeddings for entities that don't have them")
});

// Helper function to validate an entity
export function validateEntity(entity: any): Entity {
  return EntitySchema.parse(entity);
}

// Helper function to validate a relation
export function validateRelation(relation: any): Relation {
  return RelationSchema.parse(relation);
} 