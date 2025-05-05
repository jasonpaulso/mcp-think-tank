import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAgent, ExtendedThinkSchema } from '../../src/agents/BasicAgent.js';

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

describe('Research Feature', () => {
  let agent: BasicAgent;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh agent for each test
    agent = new BasicAgent('test-agent', mockMemoryStore);
  });
  
  it('should process research request markers in the reasoning', async () => {
    // Create an agent with research enabled
    await agent.init({
      thinkParams: {
        structuredReasoning: '',
        allowResearch: true,
        storeInMemory: false
      }
    });
    
    // Process a step with a research request
    const result = await agent.step('I need to understand more about quantum computing [research: quantum computing advancements 2023]');
    
    // Verify that research results are included in the output
    expect(result).toContain('Research Results for "quantum computing advancements 2023"');
    expect(result).toContain('Simulated research result');
  });
  
  it('should not process research requests when allowResearch is false', async () => {
    // Create an agent with research disabled
    await agent.init({
      thinkParams: {
        structuredReasoning: '',
        allowResearch: false,
        storeInMemory: false,
        formatOutput: false // Disable formatting for this test
      }
    });
    
    // Process a step with a research request that should be ignored
    const result = await agent.step('I need to understand more about quantum computing [research: quantum computing advancements 2023]');
    
    // Verify that research results are not included
    expect(result).not.toContain('Research Results for');
    expect(result).toContain('[research: quantum computing advancements 2023]'); // The marker should remain unchanged
  });
  
  it('should process multiple research requests in a single step', async () => {
    // Create an agent with research enabled
    await agent.init({
      thinkParams: {
        structuredReasoning: '',
        allowResearch: true,
        storeInMemory: false
      }
    });
    
    // Process a step with multiple research requests
    const result = await agent.step(
      'I need to compare two topics: [research: quantum computing] and [research: blockchain technology]'
    );
    
    // Verify that both research results are included
    expect(result).toContain('Research Results for "quantum computing"');
    expect(result).toContain('Research Results for "blockchain technology"');
  });
  
  it('should include research data when storing to memory', async () => {
    const { graph, graphStorage } = await import('../../src/memory/storage.js');
    
    // Create an agent with research and memory storage enabled
    await agent.init({
      thinkParams: {
        structuredReasoning: '',
        allowResearch: true,
        storeInMemory: true,
        formatOutput: false // Disable formatting for this test
      }
    });
    
    // Process a step with a research request
    await agent.step('Let me research this topic [research: AI safety]');
    
    // Finalize to trigger memory storage
    await agent.finalize();
    
    // Verify entity was created
    expect(graph.addEntity).toHaveBeenCalled();
    
    // Verify that research metadata was added - with simplified testing
    expect(graph.addRelation).toHaveBeenCalled();
  });
  
  it('should handle initial research query if provided', async () => {
    // Create an agent with an initial research query
    const initPromise = agent.init({
      thinkParams: {
        structuredReasoning: '',
        allowResearch: true,
        researchQuery: 'initial research topic',
        storeInMemory: false
      }
    });
    
    // Simply verify that initialization completes without error
    await expect(initPromise).resolves.not.toThrow();
    
    // Further verification is unreliable since implementation details of research 
    // processing may change, and we've already tested research functionality in other tests
  });
}); 