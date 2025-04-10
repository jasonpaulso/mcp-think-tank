import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { KnowledgeGraphImpl } from './knowledgeGraph.js';
import config from '../config.js';

/**
 * Storage class for persisting the knowledge graph to disk.
 */
export class GraphStorage {
  private filePath: string;
  private graph: KnowledgeGraphImpl;

  constructor(filePath: string = config.memoryPath) {
    this.filePath = filePath;
    this.graph = this.load();
  }

  /**
   * Load the knowledge graph from disk.
   * @returns The loaded knowledge graph
   */
  private load(): KnowledgeGraphImpl {
    try {
      // Check if file exists
      if (!existsSync(this.filePath)) {
        return new KnowledgeGraphImpl();
      }

      // Read file
      const fileContent = readFileSync(this.filePath, 'utf-8');
      if (!fileContent.trim()) {
        return new KnowledgeGraphImpl();
      }

      // Parse JSON
      const data = JSON.parse(fileContent);
      return KnowledgeGraphImpl.fromJSON(data);
    } catch (error) {
      console.error('Error loading knowledge graph:', error);
      return new KnowledgeGraphImpl();
    }
  }

  /**
   * Save the knowledge graph to disk.
   */
  save(): void {
    try {
      const serialized = JSON.stringify(this.graph.toJSON(), null, 2);
      writeFileSync(this.filePath, serialized, 'utf-8');
    } catch (error) {
      console.error('Error saving knowledge graph:', error);
    }
  }

  /**
   * Get the knowledge graph.
   * @returns The knowledge graph
   */
  getGraph(): KnowledgeGraphImpl {
    return this.graph;
  }

  /**
   * Add an operation log entry to track changes (for advanced implementations).
   * @param operation The operation performed
   * @param data The data associated with the operation
   */
  private logOperation(operation: string, data: any): void {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = JSON.stringify({
        timestamp,
        operation,
        data
      });

      appendFileSync(`${this.filePath}.log`, `${logEntry}\n`, 'utf-8');
    } catch (error) {
      console.error('Error logging operation:', error);
    }
  }
}

// Export a singleton instance of the graph storage
export const graphStorage = new GraphStorage();

// Export the graph directly for convenience
export const graph = graphStorage.getGraph();

// Set up autosave on process exit
process.on('exit', () => {
  graphStorage.save();
}); 