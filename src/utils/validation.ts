import { z } from 'zod';

// Entity validation schema
const EntitySchema = z.object({
  name: z.string().min(1),
  entityType: z.string().min(1),
  observations: z.array(z.string())
});

// Relation validation schema
const RelationSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  relationType: z.string().min(1)
});

// Create entities schema
export const CreateEntitiesSchema = z.object({
  entities: z.array(EntitySchema)
});

// Create relations schema
export const CreateRelationsSchema = z.object({
  relations: z.array(RelationSchema)
});

// Add observations schema
export const AddObservationsSchema = z.object({
  observations: z.array(z.object({
    entityName: z.string().min(1),
    contents: z.array(z.string())
  }))
});

// Delete entities schema
export const DeleteEntitiesSchema = z.object({
  entityNames: z.array(z.string().min(1))
});

// Delete observations schema
export const DeleteObservationsSchema = z.object({
  deletions: z.array(z.object({
    entityName: z.string().min(1),
    observations: z.array(z.string())
  }))
});

// Delete relations schema
export const DeleteRelationsSchema = z.object({
  relations: z.array(RelationSchema)
});

// Search nodes schema
export const SearchNodesSchema = z.object({
  query: z.string().min(1)
});

// Open nodes schema
export const OpenNodesSchema = z.object({
  names: z.array(z.string().min(1))
});

// Update entities schema
export const UpdateEntitiesSchema = z.object({
  entities: z.array(z.object({
    name: z.string().min(1),
    entityType: z.string().optional(),
    observations: z.array(z.string()).optional()
  }))
});

// Update relations schema
export const UpdateRelationsSchema = z.object({
  relations: z.array(RelationSchema)
}); 