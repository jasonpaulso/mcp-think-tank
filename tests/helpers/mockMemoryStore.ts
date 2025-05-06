import { vi } from 'vitest';
import { MemoryStore } from '../../src/memory/store/MemoryStore.js';

/**
 * Create a mock MemoryStore for testing
 * @returns A mock implementation of MemoryStore
 */
export function createMockMemoryStore(): MemoryStore {
  return {
    add: vi.fn().mockResolvedValue({
      text: 'test observation',
      timestamp: new Date().toISOString()
    }),
    query: vi.fn().mockResolvedValue([]),
    prune: vi.fn().mockResolvedValue(0),
    findSimilar: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    load: vi.fn().mockResolvedValue(undefined),
    getLoadingPromise: vi.fn().mockResolvedValue(undefined),
    // Add compatibility methods for graph operations
    addEntity: vi.fn().mockResolvedValue({
      id: 'mock-id',
      entityType: 'thought',
      observations: ['Test observation']
    }),
    addRelation: vi.fn().mockResolvedValue(undefined)
  };
} 