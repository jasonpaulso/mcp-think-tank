/**
 * Interface for a memory storage system that can persist and retrieve data.
 * This abstraction allows different storage backends (JSONL, database, etc.)
 * to be used interchangeably.
 */
export interface MemoryStore {
  /**
   * Add an item to the memory store
   * 
   * @param key - Unique identifier for the item
   * @param value - The data to store
   * @param metadata - Optional metadata associated with the item
   * @returns Promise that resolves when the add operation is complete
   */
  add(key: string, value: unknown, metadata?: Record<string, unknown>): Promise<void>;
  
  /**
   * Query the memory store for items matching the criteria
   * 
   * @param criteria - Object containing query parameters
   * @returns Promise resolving to the array of matching items
   */
  query(criteria: {
    keyword?: string,
    time?: { before?: Date, after?: Date },
    tag?: string | string[],
    agent?: string,
    limit?: number
  }): Promise<Array<unknown>>;
  
  /**
   * Remove items from the memory store based on criteria
   * 
   * @param criteria - Object containing pruning parameters
   * @returns Promise resolving to the number of items removed
   */
  prune(criteria: {
    before?: Date,
    tag?: string | string[],
    dryRun?: boolean
  }): Promise<number>;
} 