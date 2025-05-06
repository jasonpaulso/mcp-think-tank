import * as path from 'path';
import * as os from 'os';
import { MemoryStore, Observation, MemoryQuery, Entity, Relation } from './MemoryStore.js';
import { JsonlMemoryStore } from './JsonlMemoryStore.js';

// Get memory path from environment or use default
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');

// Create a singleton instance of JsonlMemoryStore
const store = new JsonlMemoryStore(memoryPath);
export const memoryStore: MemoryStore = store;

// Export interfaces and implementations
export { MemoryStore, Observation, MemoryQuery, Entity, Relation } from './MemoryStore.js';
export { JsonlMemoryStore } from './JsonlMemoryStore.js';

// Re-export the graph for backward compatibility
export const graph = store.getGraph(); 