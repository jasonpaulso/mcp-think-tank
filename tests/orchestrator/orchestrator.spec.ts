import { describe, it, expect, vi } from 'vitest';
import { Orchestrator } from '../../src/orchestrator/Orchestrator.js';
import { BasicAgent } from '../../src/agents/BasicAgent.js';
import { SequentialStrategy } from '../../src/orchestrator/strategies/SequentialStrategy.js';
import { ParallelStrategy } from '../../src/orchestrator/strategies/ParallelStrategy.js';
import { createMockMemoryStore } from '../helpers/mockMemoryStore.js';

// Set test environment
process.env.NODE_ENV = 'test';

describe('Orchestrator', () => {
  it('should run agents in sequential order', async () => {
    // Create memory store
    const mockMemory = createMockMemoryStore();
    
    // Create mock agents
    const agent1 = new BasicAgent('agent1', mockMemory);
    const agent2 = new BasicAgent('agent2', mockMemory);
    
    // Spy on agent step methods
    const stepSpy1 = vi.spyOn(agent1, 'step');
    const stepSpy2 = vi.spyOn(agent2, 'step');
    
    // Add a counter to prevent infinite loops in the test
    let agent1Calls = 0;
    let agent2Calls = 0;
    
    // Mock agent step implementations to track order
    stepSpy1.mockImplementation(async (input) => {
      agent1Calls++;
      // Only process once to avoid infinite loops in test
      if (agent1Calls === 1) {
        return `Agent1: ${input}`;
      }
      return 'Agent1: done';
    });
    
    stepSpy2.mockImplementation(async (input) => {
      agent2Calls++;
      // Only process once to avoid infinite loops in test
      if (agent2Calls === 1) {
        return `Agent2: ${input}`;
      }
      return 'Agent2: done';
    });
    
    // Setup orchestrator with sequential strategy
    const strategy = new SequentialStrategy();
    const orchestrator = new Orchestrator([agent1, agent2], strategy);
    
    // Run orchestration
    const result = await orchestrator.run('Initial input');
    
    // Check agents were called with the correct inputs
    expect(stepSpy1).toHaveBeenCalledWith('Initial input');
    
    // Check agent2 was called with agent1's output
    expect(stepSpy2.mock.calls[0][0]).toContain('Agent1: Initial input');
    
    // Verify output contains information from both agents
    expect(result.output).toContain('Agent2:');
    expect(result.outputs.length).toBeGreaterThan(0);
  });
  
  it('should run agents in parallel', async () => {
    // Create memory store
    const mockMemory = createMockMemoryStore();
    
    // Create mock agents
    const agent1 = new BasicAgent('agent1', mockMemory);
    const agent2 = new BasicAgent('agent2', mockMemory);
    
    // Spy on agent step methods
    const stepSpy1 = vi.spyOn(agent1, 'step');
    const stepSpy2 = vi.spyOn(agent2, 'step');
    
    // Mock agent step implementations
    stepSpy1.mockImplementation(async (input) => `Agent1: ${input}`);
    stepSpy2.mockImplementation(async (input) => `Agent2: ${input}`);
    
    // Setup orchestrator with parallel strategy
    const strategy = new ParallelStrategy();
    const orchestrator = new Orchestrator([agent1, agent2], strategy);
    
    // Run orchestration
    const result = await orchestrator.run('Initial input');
    
    // Check both agents were called (input may vary based on implementation)
    expect(stepSpy1).toHaveBeenCalled();
    expect(stepSpy2).toHaveBeenCalled();
    
    // Check result includes outputs from both agents
    expect(result.outputs).toHaveLength(2);
    expect(result.outputs.some(output => output.includes('Agent1:'))).toBe(true);
    expect(result.outputs.some(output => output.includes('Agent2:'))).toBe(true);
  });
}); 