import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAgent, ExtendedThinkSchema } from '../../src/agents/BasicAgent';

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

describe('Self-Reflection Feature', () => {
  let agent: BasicAgent;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh agent for each test
    agent = new BasicAgent('test-agent', mockMemoryStore);
  });
  
  it('should perform self-reflection when selfReflect is true', async () => {
    // Initialize agent with self-reflection enabled
    await agent.init({
      thinkParams: {
        structuredReasoning: 'Test reasoning',
        selfReflect: true,
        storeInMemory: false
      }
    });
    
    // Process a step
    const result = await agent.step('My hypothesis is that increasing X will lead to Y.');
    
    // Verify that result contains self-reflection content
    expect(result).toContain('Self-Reflection');
  });
  
  it('should not perform self-reflection when selfReflect is false', async () => {
    // Initialize agent without self-reflection
    await agent.init({
      thinkParams: {
        structuredReasoning: 'Test reasoning',
        selfReflect: false,
        storeInMemory: false
      }
    });
    
    // Process a step
    const result = await agent.step('My hypothesis is that increasing X will lead to Y.');
    
    // Verify that result does not contain self-reflection content
    expect(result).not.toContain('Self-Reflection');
  });
  
  it('should use custom reflection prompt when provided', async () => {
    // Create a spy on the private method
    const reflectionSpy = vi.spyOn(agent as any, 'performSelfReflection');
    
    // Initialize agent with custom reflection prompt
    await agent.init({
      thinkParams: {
        structuredReasoning: 'Test reasoning',
        selfReflect: true,
        reflectPrompt: 'Custom reflection prompt',
        storeInMemory: false
      }
    });
    
    // Process a step
    await agent.step('Test reasoning');
    
    // Since we can't directly test the private method's implementation,
    // we at least verify it was called when selfReflect is true
    expect(reflectionSpy).toHaveBeenCalled();
  });
  
  it('should store self-reflection in memory when both options are enabled', async () => {
    const { graph, graphStorage } = await import('../../src/memory/storage.js');
    
    // Initialize agent with both features enabled
    await agent.init({
      thinkParams: {
        structuredReasoning: 'Test reasoning',
        selfReflect: true,
        storeInMemory: true
      }
    });
    
    // Process a step
    await agent.step('Test reasoning with reflection');
    
    // Finalize to trigger memory storage
    await agent.finalize();
    
    // Verify that the entity was created with the reflection content
    expect(graph.addEntity).toHaveBeenCalled();
    
    // Extract the observations from the addEntity call
    const callArgs = (graph.addEntity as any).mock.calls[0];
    const observations = callArgs[2];
    
    // Verify that at least one observation contains self-reflection content
    const hasReflection = observations.some((obs: string) => obs.includes('Self-Reflection'));
    expect(hasReflection).toBe(true);
    
    // Verify that the graph was saved
    expect(graphStorage.save).toHaveBeenCalled();
  });
}); 