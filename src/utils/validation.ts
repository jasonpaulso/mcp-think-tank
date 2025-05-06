import { z } from 'zod';

// Entity validation schema
const EntitySchema = z.object({
  name: z.string().min(1).describe('Unique identifier for the entity'),
  entityType: z.string().min(1).describe('Type classification of the entity'),
  observations: z.array(z.string()).describe('Facts or observations about the entity'),
  context: z.string().optional().describe('Optional context or situation relevant to this entity (e.g., project, meeting, or scenario)')
});

// Relation validation schema
const RelationSchema = z.object({
  from: z.string().min(1).describe('Source entity name'),
  to: z.string().min(1).describe('Target entity name'),
  relationType: z.string().min(1).describe('Type of relationship (in active voice)')
});

// Unified entity schema for both creation and updates
export const UpsertEntitiesSchema = z.object({
  entities: z.array(z.object({
    name: z.string().min(1).describe('Unique identifier for the entity'),
    entityType: z.string().min(1).describe('Type classification of the entity'),
    observations: z.array(z.string()).describe('Facts or observations about the entity'),
    context: z.string().optional().describe('Optional context or situation relevant to this entity (e.g., project, meeting, or scenario)'),
    update: z.boolean().optional().default(false).describe('If true, will fully replace an existing entity; if false, will only create if entity doesn\'t exist')
  })).describe('Array of entities to create or update')
});

// Create relations schema
export const CreateRelationsSchema = z.object({
  relations: z.array(RelationSchema).describe('Array of relations to create')
});

// Add observations schema
export const AddObservationsSchema = z.object({
  observations: z.array(z.object({
    entityName: z.string().min(1).describe('Name of the entity to add observations to'),
    contents: z.array(z.string()).describe('Observations to add to the entity')
  })).describe('Array of entity observations to add')
});

// Delete entities schema
export const DeleteEntitiesSchema = z.object({
  entityNames: z.array(z.string().min(1)).describe('Array of entity names to delete')
});

// Delete observations schema
export const DeleteObservationsSchema = z.object({
  deletions: z.array(z.object({
    entityName: z.string().min(1).describe('Name of the entity to remove observations from'),
    observations: z.array(z.string()).describe('Observations to remove from the entity')
  })).describe('Array of entity observations to delete')
});

// Delete relations schema
export const DeleteRelationsSchema = z.object({
  relations: z.array(RelationSchema).describe('Array of relations to delete')
});

// Search nodes schema
export const SearchNodesSchema = z.object({
  query: z.string().min(1).describe('Search query to find matching entities')
});

// Open nodes schema
export const OpenNodesSchema = z.object({
  names: z.array(z.string().min(1)).describe('Array of entity names to retrieve')
});

// Update relations schema
export const UpdateRelationsSchema = z.object({
  relations: z.array(RelationSchema).describe('Array of relations to update')
}); 