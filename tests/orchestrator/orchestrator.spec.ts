import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Orchestrator } from '../../src/orchestrator/Orchestrator';
import { SequentialStrategy } from '../../src/orchestrator/strategies/SequentialStrategy';
import { ParallelStrategy } from '../../src/orchestrator/strategies/ParallelStrategy';
import { IAgent } from '../../src/agents/IAgent';

// Create mock agents for testing
class MockAgent implements IAgent {
  agentId: string;
  memory: any;
  initCalled: boolean = false;
  stepCalls: string[] = [];
  finalizeCalled: boolean = false;
  
  constructor(id: string) {
    this.agentId = id;
    this.memory = {}; // Just a placeholder
  }
  
  async init(): Promise<void> {
    this.initCalled = true;
  }
  
  async step(input: string): Promise<string> {
    this.stepCalls.push(input);
    return `Output from ${this.agentId}: ${input}`;
  }
  
  async finalize(): Promise<void> {
    this.finalizeCalled = true;
  }
}

describe('Orchestrator', () => {
  let agent1: MockAgent;
  let agent2: MockAgent;
  let agents: MockAgent[];
  
  beforeEach(() => {
    // Reset agents for each test
    agent1 = new MockAgent('agent1');
    agent2 = new MockAgent('agent2');
    agents = [agent1, agent2];
  });
  
  describe('with SequentialStrategy', () => {
    it('should coordinate agents in sequence', async () => {
      // Arrange
      const strategy = new SequentialStrategy();
      const orchestrator = new Orchestrator(agents, strategy);
      
      // Act
      const result = await orchestrator.run('Initial input');
      
      // Assert
      expect(agent1.initCalled).toBe(true);
      expect(agent2.initCalled).toBe(true);
      
      expect(agent1.stepCalls).toHaveLength(1);
      expect(agent1.stepCalls[0]).toBe('Initial input');
      
      expect(agent2.stepCalls).toHaveLength(1);
      expect(agent2.stepCalls[0]).toContain('Output from agent1');
      
      expect(agent1.finalizeCalled).toBe(true);
      expect(agent2.finalizeCalled).toBe(true);
      
      expect(result.status).toBe('COMPLETED');
      expect(result.steps).toBe(2);
    });
    
    it('should stop when isDone returns true', async () => {
      // Arrange
      const strategy = new SequentialStrategy();
      const orchestrator = new Orchestrator(agents, strategy);
      
      // Act - isDone returns true after the first agent
      const result = await orchestrator.run('Initial input', 
        (output) => output.includes('Output from agent1'));
      
      // Assert
      expect(agent1.stepCalls).toHaveLength(1);
      expect(agent2.stepCalls).toHaveLength(0); // Second agent should not be called
      
      expect(result.status).toBe('COMPLETED');
      expect(result.steps).toBe(1);
    });
  });
  
  describe('with ParallelStrategy', () => {
    it('should process all agents once', async () => {
      // Arrange
      const strategy = new ParallelStrategy();
      const orchestrator = new Orchestrator(agents, strategy);
      
      // Act
      const result = await orchestrator.run('Initial input');
      
      // Assert
      expect(agent1.initCalled).toBe(true);
      expect(agent2.initCalled).toBe(true);
      
      expect(agent1.stepCalls).toHaveLength(1);
      expect(agent2.stepCalls).toHaveLength(1);
      
      expect(agent1.stepCalls[0]).toBe('Initial input');
      expect(agent2.stepCalls[0]).toBe('Initial input');
      
      expect(agent1.finalizeCalled).toBe(true);
      expect(agent2.finalizeCalled).toBe(true);
      
      expect(result.status).toBe('COMPLETED');
      expect(result.steps).toBe(2);
    });
  });
  
  it('should handle errors gracefully', async () => {
    // Arrange
    const strategy = new SequentialStrategy();
    const errorAgent = {
      agentId: 'error-agent',
      memory: {},
      init: async () => { /* no-op */ },
      step: async () => { throw new Error('Agent error'); },
      finalize: async () => { /* no-op */ }
    };
    
    const orchestrator = new Orchestrator([errorAgent], strategy);
    
    // Act
    const result = await orchestrator.run('Initial input');
    
    // Assert
    expect(result.status).toBe('ERROR');
    expect(result.output).toContain('Agent error');
  });
}); 