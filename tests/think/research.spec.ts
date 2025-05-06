import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAgent } from '../../src/agents/BasicAgent.js';
import { createMockMemoryStore } from '../helpers/mockMemoryStore.js';

// Mock the research tool
vi.mock('../../src/research/index.js', () => {
  return {
    conductResearch: vi.fn().mockResolvedValue({
      query: 'test query',
      results: ['Result 1', 'Result 2'],
      sources: ['Source 1', 'Source 2']
    })
  };
});

describe('Research in BasicAgent', () => {
  let agent: BasicAgent;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh agent for each test
    agent = new BasicAgent('test-agent', createMockMemoryStore());
  });
  
  it('should detect and process research requests in the reasoning', async () => {
    // Setup agent with research enabled
    await agent.init({
      thinkParams: {
        allowResearch: true,
        formatOutput: false // Disable formatting for clearer testing
      }
    });
    
    // Create input with research marker
    const input = 'I need to analyze [research: quantum computing] for this problem.';
    
    // Process the input
    const result = await agent.step(input);
    
    // Check that the research marker was replaced with results
    expect(result).toContain('Research Results');
    expect(result).toContain('quantum computing');
    expect(result).toContain('Result 1');
    expect(result).toContain('Result 2');
  });
  
  it('should handle multiple research requests', async () => {
    // Setup agent with research enabled
    await agent.init({
      thinkParams: {
        allowResearch: true,
        formatOutput: false // Disable formatting for clearer testing
      }
    });
    
    // Create input with multiple research markers
    const input = 'I need to analyze [research: topic 1] and also consider [research: topic 2].';
    
    // Process the input
    const result = await agent.step(input);
    
    // Check that both research markers were replaced
    const occurrences = (result.match(/Research Results/g) || []).length;
    expect(occurrences).toBeGreaterThan(1);
  });
  
  it('should store research results as relations when stored in memory', async () => {
    // Setup agent with research and memory storage enabled
    agent = new BasicAgent('test-agent', createMockMemoryStore(), {
      allowResearch: true,
      storeInMemory: true,
      formatOutput: false // Disable formatting for clearer testing
    });
    
    // Process input with research marker
    await agent.init({});
    await agent.step('Research on [research: important topic]');
    await agent.finalize();
    
    // Check that the memory store operations were called
    expect(agent.memory.addEntity).toHaveBeenCalled();
    expect(agent.memory.addRelation).toHaveBeenCalled();
  });
}); 