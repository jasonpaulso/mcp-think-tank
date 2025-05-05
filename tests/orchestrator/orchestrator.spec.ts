import { describe, it, expect, vi } from 'vitest';
import { Orchestrator } from '../../src/orchestrator/Orchestrator.js';
import { SequentialStrategy } from '../../src/orchestrator/strategies/SequentialStrategy.js';
import { ParallelStrategy } from '../../src/orchestrator/strategies/ParallelStrategy.js';
import { IAgent } from '../../src/agents/IAgent.js';
import { MemoryStore } from '../../src/memory/store/MemoryStore.js';

// Helper to create a typed mock agent
function createMockAgent(id: string, memory: MemoryStore): IAgent {
  return {
    agentId: id,
    memory,
    init: vi.fn().mockResolvedValue(undefined),
    step: vi.fn().mockResolvedValue(`${id} output`),
    finalize: vi.fn().mockResolvedValue(undefined)
  };
}

describe('Orchestrator', () => {
  // Create mock memory store
  const mockMemory: MemoryStore = {
    add: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([]),
    prune: vi.fn().mockResolvedValue(0)
  };
  
  it('should use the strategy to select the next agent', async () => {
    // Create mock agents
    const agent1 = createMockAgent('agent1', mockMemory);
    const agent2 = createMockAgent('agent2', mockMemory);
    
    // Mock the strategy
    const mockStrategy = {
      nextAgent: vi.fn().mockReturnValueOnce(agent1).mockReturnValueOnce(null),
      combine: vi.fn().mockReturnValue('Combined output')
    };
    
    // Create orchestrator
    const orchestrator = new Orchestrator([agent1, agent2], mockStrategy);
    
    // Run the orchestrator
    await orchestrator.run('Test input');
    
    // Check that the strategy's nextAgent method was called
    expect(mockStrategy.nextAgent).toHaveBeenCalledTimes(2);
    
    // Check that the agent's init method was called
    expect(agent1.init).toHaveBeenCalled();
    
    // Check that the agent's step method was called with the input
    expect(agent1.step).toHaveBeenCalledWith('Test input');
    
    // Check that the agent's finalize method was called
    expect(agent1.finalize).toHaveBeenCalled();
  });
  
  it('should handle agent errors gracefully', async () => {
    // Create mock agent that throws an error
    const errorAgent = createMockAgent('error-agent', mockMemory);
    
    // Override the init method to reject
    (errorAgent.init as any).mockRejectedValue(new Error('Init error'));
    
    // Mock the strategy
    const strategy = new SequentialStrategy();
    
    // Create orchestrator with debug mode
    const orchestrator = new Orchestrator([errorAgent], strategy, { debug: true });
    
    // Run the orchestrator
    const result = await orchestrator.run('Test input');
    
    // Check that the result has ERROR status
    expect(result.status).toBe('ERROR');
    expect(result.output).toContain('Error');
  });
  
  it('should work with SequentialStrategy', async () => {
    // Create mock agents
    const agent1 = createMockAgent('agent1', mockMemory);
    const agent2 = createMockAgent('agent2', mockMemory);
    
    // Create orchestrator with sequential strategy
    const strategy = new SequentialStrategy();
    const orchestrator = new Orchestrator([agent1, agent2], strategy);
    
    // Run the orchestrator
    const result = await orchestrator.run('Test input');
    
    // Check that the result has COMPLETED status
    expect(result.status).toBe('COMPLETED');
  });
  
  it('should work with ParallelStrategy', async () => {
    // Create mock agents
    const agent1 = createMockAgent('agent1', mockMemory);
    const agent2 = createMockAgent('agent2', mockMemory);
    
    // Create orchestrator with parallel strategy
    const strategy = new ParallelStrategy();
    const orchestrator = new Orchestrator([agent1, agent2], strategy);
    
    // Run the orchestrator with isDone function
    const result = await orchestrator.run('Test input', 
      (output: string) => output.includes('agent1 output'));
    
    // Check that the result has COMPLETED status
    expect(result.status).toBe('COMPLETED');
  });
}); 