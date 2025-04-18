import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerExaSearchTool } from '../src/research/search.js';
import { registerExaAnswerTool } from '../src/research/answer.js';

// Mock environment 
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}));

// Mock Exa class
vi.mock('exa-js', () => {
  return {
    Exa: class MockExa {
      constructor() {}
      
      search = vi.fn().mockResolvedValue({
        results: [
          {
            title: 'Test Result',
            url: 'https://example.com',
            text: 'Sample search result text'
          }
        ]
      });
      
      answer = vi.fn().mockResolvedValue({
        answer: 'This is a test answer.',
        citations: [
          {
            url: 'https://example.com/citation',
            quote: 'Sample citation text'
          }
        ]
      });
    }
  };
});

describe('Exa Research Tools', () => {
  let mockServer;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock server
    mockServer = {
      addTool: vi.fn()
    };
    
    // Mock environment variables
    process.env.EXA_API_KEY = 'test-api-key';
  });
  
  describe('Exa Search Tool', () => {
    it('should register the exa_search tool', () => {
      registerExaSearchTool(mockServer);
      expect(mockServer.addTool).toHaveBeenCalledTimes(1);
      expect(mockServer.addTool.mock.calls[0][0].name).toBe('exa_search');
    });
    
    it('should handle search execution', async () => {
      registerExaSearchTool(mockServer);
      
      // Get the execute function
      const { execute } = mockServer.addTool.mock.calls[0][0];
      
      // Call the execute function
      const result = await execute({
        query: 'test query',
        num_results: 5
      });
      
      // Parse the result
      const parsedResult = JSON.parse(result);
      
      // Check the result
      expect(parsedResult.results).toBeDefined();
      expect(parsedResult.results.length).toBe(1);
      expect(parsedResult.results[0].title).toBe('Test Result');
    });
    
    it('should handle missing API key', async () => {
      // Remove API key
      delete process.env.EXA_API_KEY;
      
      registerExaSearchTool(mockServer);
      
      // Get the execute function
      const { execute } = mockServer.addTool.mock.calls[0][0];
      
      // Call the execute function
      const result = await execute({
        query: 'test query',
        num_results: 5
      });
      
      // Parse the result
      const parsedResult = JSON.parse(result);
      
      // Check the result
      expect(parsedResult.error).toBeDefined();
      expect(parsedResult.error).toContain('EXA_API_KEY environment variable is not set');
    });
  });
  
  describe('Exa Answer Tool', () => {
    it('should register the exa_answer tool', () => {
      registerExaAnswerTool(mockServer);
      expect(mockServer.addTool).toHaveBeenCalledTimes(1);
      expect(mockServer.addTool.mock.calls[0][0].name).toBe('exa_answer');
    });
    
    it('should handle answer execution', async () => {
      // Restore API key
      process.env.EXA_API_KEY = 'test-api-key';
      
      registerExaAnswerTool(mockServer);
      
      // Get the execute function
      const { execute } = mockServer.addTool.mock.calls[0][0];
      
      // Call the execute function
      const result = await execute({
        question: 'What is the capital of France?',
        max_citations: 3
      });
      
      // Parse the result
      const parsedResult = JSON.parse(result);
      
      // Check the result
      expect(parsedResult.answer).toBeDefined();
      expect(parsedResult.answer).toBe('This is a test answer.');
      expect(parsedResult.citations).toBeDefined();
      expect(parsedResult.citations.length).toBe(1);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
}); 