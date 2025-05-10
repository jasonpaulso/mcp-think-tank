import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { KnowledgeGraph } from './knowledgeGraph.js';
import { createDirectory } from '../utils/fs.js';

/**
 * Class responsible for persisting the knowledge graph to disk
 */
export class GraphStorage {
  private filePath: string;
  private graph: KnowledgeGraph;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Create a new GraphStorage instance
   * @param filePath - Path to the storage file
   * @param graph - Knowledge graph to persist
   */
  constructor(filePath: string, graph: KnowledgeGraph) {
    this.filePath = filePath;
    this.graph = graph;
    this.loadPromise = this.load();
  }

  /**
   * Get the loading promise - useful for waiting until loading is complete
   */
  getLoadingPromise(): Promise<void> {
    return this.loadPromise || Promise.resolve();
  }

  /**
   * Load the graph from the file (JSONL only) using streaming for better performance
   * @returns Promise that resolves when loading is complete
   */
  async load(): Promise<void> {
    if (this.isLoading) {
      // No logging
      return this.loadPromise as Promise<void>;
    }

    this.isLoading = true;
    this.loadPromise = new Promise<void>((resolve) => {
      try {
        // Ensure directory exists
        createDirectory(path.dirname(this.filePath));
        
        if (fs.existsSync(this.filePath)) {
          // Clear existing data
          this.graph.entities.clear();
          this.graph.relations.clear();
          
          // Create read stream and readline interface
          const fileStream = createReadStream(this.filePath, { encoding: 'utf8' });
          const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
          });

          let _lineCount = 0;
          
          // Process each line as it's read
          rl.on('line', (line) => {
            if (!line.trim()) return; // Skip empty lines
            
            try {
              const obj = JSON.parse(line);
              if (obj._type === 'entity') {
                this.graph.addEntity(obj);
              } else if (obj._type === 'relation') {
                this.graph.addRelation(obj);
              }
              _lineCount++;
              // No progress logging
            } catch (_err) {
              // No warn logging
            }
          });
          
          // When file is completely read
          rl.on('close', () => {
            // No info logging
            this.isLoading = false;
            resolve();
          });
          
          // Handle errors
          fileStream.on('error', (_error) => {
            console.error(`Error reading graph file: ${_error}`);
            this.isLoading = false;
            resolve(); // Resolve anyway to prevent hanging
          });
        } else {
          // Create an empty file if it doesn't exist
          fs.writeFileSync(this.filePath, '', 'utf8');
          // No info logging
          this.isLoading = false;
          resolve();
        }
      } catch (_error) {
        console.error(`Error loading graph: ${_error}`);
        this.isLoading = false;
        resolve(); // Resolve anyway to prevent hanging
      }
    });
    
    return this.loadPromise;
  }

  /**
   * Save the graph to the file in JSONL format
   */
  async save(): Promise<void> {
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
      // No info logging
    } catch (_err) {
      // Just continue
    }
  }

  /**
   * Log an operation for debugging
   * @param operation - The operation being performed
   * @param details - Details about the operation
   */
  logOperation(_operation: string, _details: unknown): void {
    // No logging
  }
}

// Create a default graph instance
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');

// Export the graph and storage for use in tools
export const graph = new KnowledgeGraph();
export const graphStorage = new GraphStorage(memoryPath, graph);

// We'll look at the file first to understand its implementation 