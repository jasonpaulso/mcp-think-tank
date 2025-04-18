import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { KnowledgeGraph } from './knowledgeGraph.js';
import { logger } from '../utils/logger.js';

/**
 * Class responsible for persisting the knowledge graph to disk
 */
export class GraphStorage {
  private filePath: string;
  private graph: KnowledgeGraph;

  /**
   * Create a new GraphStorage instance
   * @param filePath - Path to the storage file
   * @param graph - Knowledge graph to persist
   */
  constructor(filePath: string, graph: KnowledgeGraph) {
    this.filePath = filePath;
    this.graph = graph;
    this.load();
  }

  /**
   * Load the graph from the file (JSONL only)
   */
  load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        const lines = data.split('\n').filter(Boolean);
        this.graph.entities.clear();
        this.graph.relations.clear();
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj._type === 'entity') {
              this.graph.addEntity(obj);
            } else if (obj._type === 'relation') {
              this.graph.addRelation(obj);
            }
          } catch (err) {
            logger.warn(`Skipping invalid JSONL line: ${err}`);
          }
        }
        logger.info(`Loaded graph from ${this.filePath}`);
      } else {
        logger.info(`No existing graph found at ${this.filePath}, starting with empty graph`);
      }
    } catch (error) {
      logger.error(`Error loading graph: ${error}`);
    }
  }

  /**
   * Save the graph to the file in JSONL format
   */
  save(): void {
    try {
      const lines: string[] = [];
      for (const entity of this.graph.entities.values()) {
        lines.push(JSON.stringify({ ...entity, _type: 'entity' }));
      }
      for (const relSet of this.graph.relations.values()) {
        for (const relation of relSet) {
          lines.push(JSON.stringify({ ...relation, _type: 'relation' }));
        }
      }
      fs.writeFileSync(this.filePath, lines.join('\n') + '\n', 'utf8');
      logger.info(`Saved graph to ${this.filePath}`);
    } catch (error) {
      logger.error(`Error saving graph: ${error}`);
    }
  }

  /**
   * Log an operation for debugging
   * @param operation - The operation being performed
   * @param details - Details about the operation
   */
  logOperation(operation: string, details: unknown): void {
    logger.info(`[${operation}] ${JSON.stringify(details)}`);
  }
}

// Create a default graph instance
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');

// Export the graph and storage for use in tools
export const graph = new KnowledgeGraph();
export const graphStorage = new GraphStorage(memoryPath, graph);

// We'll look at the file first to understand its implementation 