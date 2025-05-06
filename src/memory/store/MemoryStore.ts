/**
 * Represents an observation in the memory store
 */
export interface Observation {
  text: string;
  timestamp: string;
  version?: string;
}

/**
 * Query parameters for searching observations
 */
export interface MemoryQuery {
  keyword?: string;
  time?: {
    before?: string;
    after?: string;
  };
  tag?: string;
  agent?: string;
  limit?: number;
}

/**
 * Entity interface for backward compatibility
 */
export interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

/**
 * Relation interface for backward compatibility
 */
export interface Relation {
  from: string;
  to: string;
  relationType: string;
}

/**
 * Interface for memory storage implementations
 */
export interface MemoryStore {
  /**
   * Add a new observation to the store
   * @param entityName - Entity to associate the observation with
   * @param text - The observation text
   * @param metadata - Optional metadata for the observation
   * @returns The stored observation with generated metadata
   */
  add(entityName: string, text: string, metadata?: {
    version?: string;
    tags?: string[];
    agent?: string;
  }): Promise<Observation>;

  /**
   * Query observations based on filter criteria
   * @param query - Query parameters
   * @returns Array of matching observations
   */
  query(query: MemoryQuery): Promise<{
    entityName: string;
    observation: Observation;
  }[]>;

  /**
   * Prune observations from the store
   * @param options - Pruning options
   * @returns Count of pruned observations
   */
  prune(options: {
    before?: string; // ISO date
    tag?: string;
    deprecate?: boolean; // If true, mark as deprecated instead of removing
  }): Promise<number>;

  /**
   * Find similar entity names based on the provided name
   * @param name - The name to find similar entities for
   * @returns Array of similar entity names
   */
  findSimilar(name: string): Promise<string[]>;

  /**
   * Save current state of the memory store
   * @returns Promise resolving when save is complete
   */
  save(): Promise<void>;

  /**
   * Load data into the memory store
   * @returns Promise resolving when load is complete
   */
  load(): Promise<void>;

  /**
   * Get the loading promise
   * @returns Promise that resolves when loading is complete
   */
  getLoadingPromise(): Promise<void>;
  
  /**
   * Backward compatibility method: Add a new entity to the graph
   * @param entity - The entity to add
   * @returns Promise resolving to true if the entity was added, false if it already exists
   */
  addEntity(entity: Entity): Promise<boolean>;
  
  /**
   * Backward compatibility method: Add a new relation between entities
   * @param relation - The relation to add
   * @returns Promise resolving to true if the relation was added, false if invalid or already exists
   */
  addRelation(relation: Relation): Promise<boolean>;
} 