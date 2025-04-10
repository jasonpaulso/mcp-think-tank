import { embeddingService } from './embeddingService.js';

// Entity structure
export interface Entity {
  name: string;            // Unique identifier
  entityType: string;      // Type classification
  observations: string[];  // Facts/observations
  embedding?: number[];    // Vector embedding for semantic search
}

// Relation structure
export interface Relation {
  from: string;            // Source entity name
  to: string;              // Target entity name  
  relationType: string;    // Relationship type (active voice)
}

// Knowledge Graph interface
export interface KnowledgeGraph {
  entities: Map<string, Entity>;
  relations: Map<string, Set<Relation>>;
}

// Knowledge Graph implementation
export class KnowledgeGraphImpl implements KnowledgeGraph {
  entities: Map<string, Entity>;
  relations: Map<string, Set<Relation>>;

  constructor() {
    this.entities = new Map<string, Entity>();
    this.relations = new Map<string, Set<Relation>>();
  }

  // Add an entity to the graph
  addEntity(entity: Entity): boolean {
    // If entity already exists, return false
    if (this.entities.has(entity.name)) {
      return false;
    }

    // Add entity to graph
    this.entities.set(entity.name, {
      name: entity.name,
      entityType: entity.entityType,
      observations: [...entity.observations],
      embedding: entity.embedding
    });

    return true;
  }

  // Add a relation to the graph
  addRelation(relation: Relation): boolean {
    // Check if source and target entities exist
    if (!this.entities.has(relation.from) || !this.entities.has(relation.to)) {
      return false;
    }

    // Get or create relations set for source entity
    let entityRelations = this.relations.get(relation.from);
    if (!entityRelations) {
      entityRelations = new Set<Relation>();
      this.relations.set(relation.from, entityRelations);
    }

    // Check if relation already exists
    for (const existingRelation of entityRelations) {
      if (
        existingRelation.from === relation.from &&
        existingRelation.to === relation.to &&
        existingRelation.relationType === relation.relationType
      ) {
        return false; // Relation already exists
      }
    }

    // Add relation to set
    entityRelations.add({
      from: relation.from,
      to: relation.to,
      relationType: relation.relationType
    });

    return true;
  }

  // Add observations to an entity
  addObservations(entityName: string, observations: string[]): string[] {
    // Check if entity exists
    const entity = this.entities.get(entityName);
    if (!entity) {
      return [];
    }

    // Add observations that don't already exist
    const addedObservations: string[] = [];
    for (const observation of observations) {
      if (!entity.observations.includes(observation)) {
        entity.observations.push(observation);
        addedObservations.push(observation);
      }
    }

    return addedObservations;
  }

  // Delete an entity and its relations
  deleteEntity(entityName: string): boolean {
    // Check if entity exists
    if (!this.entities.has(entityName)) {
      return false;
    }

    // Delete entity
    this.entities.delete(entityName);

    // Delete relations where entity is source
    this.relations.delete(entityName);

    // Delete relations where entity is target
    for (const [source, relations] of this.relations.entries()) {
      const newRelations = new Set<Relation>();
      for (const relation of relations) {
        if (relation.to !== entityName) {
          newRelations.add(relation);
        }
      }
      this.relations.set(source, newRelations);
    }

    return true;
  }

  // Delete specific observations from an entity
  deleteObservations(entityName: string, observations: string[]): boolean {
    // Check if entity exists
    const entity = this.entities.get(entityName);
    if (!entity) {
      return false;
    }

    // Remove specified observations
    entity.observations = entity.observations.filter(
      obs => !observations.includes(obs)
    );

    return true;
  }

  // Delete a specific relation
  deleteRelation(relation: Relation): boolean {
    // Check if source entity has relations
    const relations = this.relations.get(relation.from);
    if (!relations) {
      return false;
    }

    // Find and remove the relation
    let found = false;
    const newRelations = new Set<Relation>();
    for (const existingRelation of relations) {
      if (
        existingRelation.from === relation.from &&
        existingRelation.to === relation.to &&
        existingRelation.relationType === relation.relationType
      ) {
        found = true;
      } else {
        newRelations.add(existingRelation);
      }
    }

    if (found) {
      this.relations.set(relation.from, newRelations);
      return true;
    }

    return false;
  }

  // Search for entities matching a query
  searchNodes(query: string): Entity[] {
    const results: Entity[] = [];
    const lowerQuery = query.toLowerCase();

    for (const entity of this.entities.values()) {
      // Check if query matches entity name or type
      if (
        entity.name.toLowerCase().includes(lowerQuery) ||
        entity.entityType.toLowerCase().includes(lowerQuery)
      ) {
        results.push(entity);
        continue;
      }

      // Check if query matches any observation
      for (const observation of entity.observations) {
        if (observation.toLowerCase().includes(lowerQuery)) {
          results.push(entity);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Search for entities using semantic similarity with embeddings
   * @param query The search query
   * @param options Options for semantic search
   * @returns Array of entities with similarity scores
   */
  async semanticSearch(
    query: string, 
    options: { 
      threshold?: number; 
      limit?: number;
      generateMissingEmbeddings?: boolean;
    } = {}
  ): Promise<Array<{ entity: Entity; similarity: number }>> {
    console.error(`Starting semantic search for: "${query}"`);
    const {
      threshold = 0.7,
      limit = 10,
      generateMissingEmbeddings = true
    } = options;
    
    // Check if embedding service is available
    if (!embeddingService.isAvailable()) {
      await embeddingService.initialize();
      if (!embeddingService.isAvailable()) {
        console.warn('Embedding service unavailable. Falling back to text search.');
        return this.searchNodes(query).map(entity => ({ entity, similarity: 1 }));
      }
    }

    // Generate embedding for query
    console.error('Generating embedding for search query...');
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    if (!queryEmbedding) {
      console.warn('Failed to generate embedding for query. Falling back to text search.');
      return this.searchNodes(query).map(entity => ({ entity, similarity: 1 }));
    }

    // If we need to generate missing embeddings
    if (generateMissingEmbeddings) {
      // Collect entities that need embeddings
      const entitiesToEmbed: Entity[] = [];
      for (const entity of this.entities.values()) {
        if (!entity.embedding && entity.observations.length > 0) {
          entitiesToEmbed.push(entity);
        }
      }

      // Generate embeddings in batches if needed
      if (entitiesToEmbed.length > 0) {
        console.error(`Generating embeddings for ${entitiesToEmbed.length} entities...`);
        
        // Process in smaller batches to avoid timeouts
        const batchSize = 20;
        for (let i = 0; i < entitiesToEmbed.length; i += batchSize) {
          const batch = entitiesToEmbed.slice(i, i + batchSize);
          console.error(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(entitiesToEmbed.length/batchSize)}`);
          await this.generateEntityEmbeddings(batch);
        }
      }
    }

    // Calculate similarity scores for all entities with embeddings
    console.error('Calculating similarity scores...');
    const results: Array<{ entity: Entity; similarity: number }> = [];
    
    let entitiesWithEmbeddings = 0;
    let entitiesWithoutEmbeddings = 0;
    
    for (const entity of this.entities.values()) {
      if (entity.embedding) {
        entitiesWithEmbeddings++;
        const similarity = embeddingService.cosineSimilarity(queryEmbedding, entity.embedding);
        if (similarity >= threshold) {
          results.push({ entity, similarity });
        }
      } else {
        entitiesWithoutEmbeddings++;
      }
    }
    
    console.error(`Processed ${entitiesWithEmbeddings} entities with embeddings (${entitiesWithoutEmbeddings} without embeddings)`);
    console.error(`Found ${results.length} results above threshold ${threshold}`);

    // Sort by similarity (highest first) and limit results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Generate embeddings for a list of entities
   * @param entities Entities to generate embeddings for
   */
  async generateEntityEmbeddings(entities: Entity[]): Promise<void> {
    // Check if embedding service is available
    if (!embeddingService.isAvailable()) {
      await embeddingService.initialize();
      if (!embeddingService.isAvailable()) {
        console.warn('Embedding service unavailable. Cannot generate embeddings.');
        return;
      }
    }

    // Prepare text content for each entity
    const textsToEmbed = entities.map(entity => {
      // Combine entity name, type and observations into a single text
      return [
        entity.name,
        entity.entityType,
        ...entity.observations
      ].join('\n');
    });

    // Generate embeddings
    const embeddings = await embeddingService.generateEmbeddings(textsToEmbed);

    // Assign embeddings to entities
    entities.forEach((entity, index) => {
      const embedding = embeddings[index];
      if (embedding !== null) {
        entity.embedding = embedding;
      }
    });
  }

  /**
   * Generate embeddings for all entities in the graph
   */
  async generateAllEmbeddings(): Promise<void> {
    const entities = Array.from(this.entities.values());
    await this.generateEntityEmbeddings(entities);
  }

  // Get specific entities by name
  getEntities(entityNames: string[]): Entity[] {
    const results: Entity[] = [];
    for (const name of entityNames) {
      const entity = this.entities.get(name);
      if (entity) {
        results.push(entity);
      }
    }
    return results;
  }

  // Convert to JSON-serializable object for storage
  toJSON(): any {
    const entitiesArray: Entity[] = Array.from(this.entities.values());
    
    const relationsArray: Relation[] = [];
    for (const relationSet of this.relations.values()) {
      for (const relation of relationSet) {
        relationsArray.push(relation);
      }
    }

    return {
      entities: entitiesArray,
      relations: relationsArray
    };
  }

  // Create knowledge graph from JSON data
  static fromJSON(data: any): KnowledgeGraphImpl {
    const graph = new KnowledgeGraphImpl();
    
    // Add entities
    if (data.entities && Array.isArray(data.entities)) {
      for (const entity of data.entities) {
        graph.addEntity(entity);
      }
    }
    
    // Add relations
    if (data.relations && Array.isArray(data.relations)) {
      for (const relation of data.relations) {
        graph.addRelation(relation);
      }
    }
    
    return graph;
  }
} 