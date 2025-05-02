import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAgent } from '../../src/agents/BasicAgent';

// Create a mock memory store for testing
const mockMemoryStore = {
  add: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue([]),
  prune: vi.fn().mockResolvedValue(0)
};

// Mock the graph and graphStorage
vi.mock('../../src/memory/storage.js', () => {
  return {
    graph: {
      addEntity: vi.fn(),
      addRelation: vi.fn(),
      addObservations: vi.fn()
    },
    graphStorage: {
      save: vi.fn()
    }
  };
});

describe('BasicAgent', () => {
  let agent: BasicAgent;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh agent for each test
    agent = new BasicAgent('test-agent', mockMemoryStore);
  });
  
  it('should initialize with default parameters', async () => {
    // Act
    await agent.init({});
    
    // Assert
    expect(agent.agentId).toBe('test-agent');
  });
  
  it('should merge context parameters during initialization', async () => {
    // Arrange
    const ctx = {
      thinkParams: {
        structuredReasoning: 'Initial reasoning',
        tags: ['test']
      }
    };
    
    // Act
    await agent.init(ctx);
    
    // Assert - we'll test this indirectly through step
    const result = await agent.step('Next step');
    expect(result).toContain('Initial reasoning');
    expect(result).toContain('Next step');
  });
  
  it('should process a step and update reasoning', async () => {
    // Arrange
    await agent.init({});
    
    // Act
    const result = await agent.step('First step reasoning');
    
    // Assert
    expect(result).toBe('First step reasoning');
  });
  
  it('should increment currentStep if defined', async () => {
    // Arrange
    await agent.init({
      thinkParams: {
        currentStep: 1,
        plannedSteps: 3
      }
    });
    
    // Act
    await agent.step('Step reasoning');
    
    // Use toJSON to check internal state
    const state = agent.toJSON();
    
    // Assert
    expect(state.currentStep).toBe(2);
  });
  
  it('should store thought in memory when finalize is called', async () => {
    // Arrange - import the mocked modules
    const { graph, graphStorage } = await import('../../src/memory/storage.js');
    
    // Setup agent with memory storage enabled
    agent = new BasicAgent('test-agent', mockMemoryStore, {
      storeInMemory: true,
      structuredReasoning: 'Complete reasoning process',
      tags: ['test', 'memory'],
      category: 'testing'
    });
    
    // Act
    await agent.init({});
    await agent.finalize();
    
    // Assert
    expect(graph.addEntity).toHaveBeenCalled();
    expect(graphStorage.save).toHaveBeenCalled();
    
    // Verify entity structure
    const entityCall = (graph.addEntity as any).mock.calls[0][0];
    expect(entityCall.entityType).toBe('thought');
    expect(entityCall.observations).toContainEqual('Reasoning: Complete reasoning process');
    expect(entityCall.observations).toContainEqual('Category: testing');
    expect(entityCall.observations).toContainEqual('Tags: test, memory');
  });
  
  it('should support self-reflection during step', async () => {
    // Arrange - import the mocked modules
    const { graph } = await import('../../src/memory/storage.js');
    
    // Setup agent with self-reflection enabled
    agent = new BasicAgent('test-agent', mockMemoryStore, {
      storeInMemory: true,
      selfReflect: true,
      currentStep: 1
    });
    
    // Act
    await agent.init({});
    const result = await agent.step('Testing reflection');
    
    // Assert
    expect(result).toContain('Self-reflection on step 2');
    expect(graph.addObservations).toHaveBeenCalled();
  });
}); 