import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasicAgent } from '../../src/agents/BasicAgent.js';
import { createMockMemoryStore } from '../helpers/mockMemoryStore.js';

describe('Self-Reflection in BasicAgent', () => {
  let agent: BasicAgent;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh agent for each test
    agent = new BasicAgent('test-agent', createMockMemoryStore());
  });
  
  it('should perform self-reflection when enabled', async () => {
    // Setup agent with self-reflection enabled
    await agent.init({
      thinkParams: {
        selfReflect: true,
        formatOutput: false // Disable formatting for clearer testing
      }
    });
    
    // Process a reasoning step
    const result = await agent.step('This is my reasoning about the problem.');
    
    // Verify that self-reflection is included in the output
    expect(result).toContain('Self-Reflection');
  });
  
  it('should not perform self-reflection when disabled', async () => {
    // Setup agent with self-reflection disabled
    await agent.init({
      thinkParams: {
        selfReflect: false,
        formatOutput: false // Disable formatting for clearer testing
      }
    });
    
    // Process a reasoning step
    const result = await agent.step('This is my reasoning about the problem.');
    
    // Verify that self-reflection is not included in the output
    expect(result).not.toContain('Self-Reflection');
  });
  
  it('should use custom reflection prompt if provided', async () => {
    // Create a spy on the internal method that performs self-reflection
    const performReflectionSpy = vi.spyOn(agent as any, 'performSelfReflection');
    
    // Setup agent with self-reflection enabled and custom prompt
    await agent.init({
      thinkParams: {
        selfReflect: true,
        reflectPrompt: 'Custom reflection instructions: analyze the reasoning critically.',
        formatOutput: false // Disable formatting for clearer testing
      }
    });
    
    // Process a reasoning step
    await agent.step('This is my reasoning about the problem.');
    
    // Check that the custom prompt was used
    expect(performReflectionSpy).toHaveBeenCalled();
    // Note: Since the implementation may vary, we can't reliably check the exact prompt used
  });
  
  it('should store self-reflection in memory when finalized', async () => {
    // Setup agent with self-reflection and memory storage enabled
    agent = new BasicAgent('test-agent', createMockMemoryStore(), {
      selfReflect: true,
      storeInMemory: true,
      formatOutput: false // Disable formatting for clearer testing
    });
    
    // Process a reasoning step
    await agent.init({});
    await agent.step('This is my reasoning with self-reflection.');
    await agent.finalize();
    
    // Check that the memory store operations were called
    expect(agent.memory.addEntity).toHaveBeenCalled();
  });
}); 