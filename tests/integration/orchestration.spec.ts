import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BasicAgent } from '../../src/agents/BasicAgent.js';
import { Orchestrator } from '../../src/orchestrator/Orchestrator.js';
import { SequentialStrategy } from '../../src/orchestrator/strategies/SequentialStrategy.js';
import { ParallelStrategy } from '../../src/orchestrator/strategies/ParallelStrategy.js';

// Mock memory store for testing
const createMockMemoryStore = () => ({
  add: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue([]),
  prune: vi.fn().mockResolvedValue(0)
});

// Mock graph storage
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

describe('Multi-Agent Orchestration Integration', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // Remove memory file after tests
  afterEach(() => {
    // Any cleanup if needed
  });
  
  it('should orchestrate multiple agents using sequential strategy', async () => {
    // Create multiple agents
    const agent1 = new BasicAgent('agent1', createMockMemoryStore());
    const agent2 = new BasicAgent('agent2', createMockMemoryStore());
    const agent3 = new BasicAgent('agent3', createMockMemoryStore());
    
    // Create a sequential strategy
    const strategy = new SequentialStrategy();
    
    // Create an orchestrator with the agents and strategy
    const orchestrator = new Orchestrator([agent1, agent2, agent3], strategy);
    
    // Run the orchestration with input
    const result = await orchestrator.run('Test input for sequential processing');
    
    // Verify that the orchestration completed successfully
    expect(result.status).toBe('COMPLETED');
    
    // Verify that all agents were used in the orchestration
    expect(result.agentOutputs.size).toBe(3);
    expect(result.agentOutputs.has('agent1')).toBe(true);
    expect(result.agentOutputs.has('agent2')).toBe(true);
    expect(result.agentOutputs.has('agent3')).toBe(true);
    
    // Verify the final output contains combined results
    expect(result.output).toBeTruthy();
  });
  
  it('should orchestrate multiple agents using parallel strategy', async () => {
    // Create multiple agents
    const agent1 = new BasicAgent('agent1', createMockMemoryStore());
    const agent2 = new BasicAgent('agent2', createMockMemoryStore());
    
    // Create a parallel strategy
    const strategy = new ParallelStrategy();
    
    // Create an orchestrator with the agents and strategy
    const orchestrator = new Orchestrator([agent1, agent2], strategy);
    
    // Run the orchestration with input
    const result = await orchestrator.run('Test input for parallel processing');
    
    // Verify that the orchestration completed successfully
    expect(result.status).toBe('COMPLETED');
    
    // Verify that all agents were used in the orchestration
    expect(result.agentOutputs.size).toBe(2);
    expect(result.agentOutputs.has('agent1')).toBe(true);
    expect(result.agentOutputs.has('agent2')).toBe(true);
    
    // Verify the final output contains combined results
    expect(result.output).toBeTruthy();
  });
  
  it('should support specialized agents with different capabilities', async () => {
    // Create an agent with self-reflection enabled
    const reflectiveAgent = new BasicAgent('reflective', createMockMemoryStore());
    await reflectiveAgent.init({
      thinkParams: {
        selfReflect: true,
        formatType: 'problem'
      }
    });
    
    // Create an agent with research enabled
    const researchAgent = new BasicAgent('researcher', createMockMemoryStore());
    await researchAgent.init({
      thinkParams: {
        allowResearch: true,
        formatType: 'general'
      }
    });
    
    // Create a sequential strategy
    const strategy = new SequentialStrategy();
    
    // Create an orchestrator with the specialized agents
    const orchestrator = new Orchestrator(
      [reflectiveAgent, researchAgent],
      strategy
    );
    
    // Run the orchestration with complex input
    const result = await orchestrator.run(
      'This problem requires both critical thinking and research capabilities.'
    );
    
    // Verify that the orchestration completed successfully
    expect(result.status).toBe('COMPLETED');
    
    // Verify that all agents were used
    expect(result.agentOutputs.size).toBe(2);
    
    // Verify the final output exists
    expect(result.output).toBeTruthy();
  });
  
  it('should handle complex multi-step reasoning with chained agents', async () => {
    // Create agents for different reasoning steps
    const definitionAgent = new BasicAgent('definition', createMockMemoryStore());
    await definitionAgent.init({
      thinkParams: {
        formatType: 'problem',
        currentStep: 1,
        plannedSteps: 3
      }
    });
    
    const analysisAgent = new BasicAgent('analysis', createMockMemoryStore());
    await analysisAgent.init({
      thinkParams: {
        allowResearch: true,
        currentStep: 2,
        plannedSteps: 3
      }
    });
    
    const conclusionAgent = new BasicAgent('conclusion', createMockMemoryStore());
    await conclusionAgent.init({
      thinkParams: {
        selfReflect: true,
        currentStep: 3,
        plannedSteps: 3
      }
    });
    
    // Create a sequential strategy
    const strategy = new SequentialStrategy();
    
    // Create an orchestrator with the chained agents
    const orchestrator = new Orchestrator(
      [definitionAgent, analysisAgent, conclusionAgent],
      strategy
    );
    
    // Run the orchestration with a complex problem
    const result = await orchestrator.run(
      'We need to design a scalable microservices architecture for our e-commerce platform.'
    );
    
    // Verify that the orchestration completed successfully
    expect(result.status).toBe('COMPLETED');
    
    // Verify that all agents contributed
    expect(result.agentOutputs.size).toBe(3);
    
    // Verify the final output contains a complete solution
    expect(result.output).toBeTruthy();
  });
}); 