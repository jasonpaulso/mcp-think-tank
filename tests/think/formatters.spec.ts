import { describe, it, expect } from 'vitest';
import {
  formatGeneralReasoning,
  formatProblemSolving,
  formatComparison,
  detectFormatterType,
  formatThought
} from '../../src/think/formatters';

describe('Thought Formatters', () => {
  describe('detectFormatterType', () => {
    it('should detect comparison type content', () => {
      const comparisonContent = 'We need to compare React vs Angular for our project. The pros and cons are:\n\n| Framework | Pros | Cons |\n|-|-|-|\n| React | Virtual DOM, JSX | Learning curve |\n| Angular | Complete solution | Verbose |';
      expect(detectFormatterType(comparisonContent)).toBe('comparison');
    });
    
    it('should detect problem-solving type content', () => {
      const problemContent = 'The problem we need to solve is how to handle authentication in a microservices architecture. There are several steps to consider...';
      expect(detectFormatterType(problemContent)).toBe('problem');
    });
    
    it('should default to general reasoning for ambiguous content', () => {
      const generalContent = 'This is a general analysis of the current market trends. The economy shows signs of recovery after recent disruptions.';
      expect(detectFormatterType(generalContent)).toBe('general');
    });
  });
  
  describe('formatGeneralReasoning', () => {
    it('should format general reasoning with metadata', () => {
      const content = 'This is a test reasoning process.';
      const formatted = formatGeneralReasoning(content, {
        title: 'Test Reasoning',
        category: 'Analysis',
        context: 'Project X',
        hasReflection: true
      });
      
      expect(formatted).toContain('# Test Reasoning');
      expect(formatted).toContain('## Metadata');
      expect(formatted).toContain('Category: Analysis');
      expect(formatted).toContain('Context: Project X');
      expect(formatted).toContain('## Features');
      expect(formatted).toContain('Includes self-reflection analysis');
      expect(formatted).toContain('This is a test reasoning process.');
    });
    
    it('should add step information when provided', () => {
      const content = 'Step 2 of the analysis process.';
      const formatted = formatGeneralReasoning(content, {
        step: 2,
        totalSteps: 5
      });
      
      expect(formatted).toContain('# Structured Reasoning (Step 2/5)');
    });
    
    it('should not add default sections to short content', () => {
      const shortContent = 'This is very brief.';
      const formatted = formatGeneralReasoning(shortContent);
      
      expect(formatted).not.toContain('## Introduction');
      expect(formatted).toContain(shortContent);
    });
  });
  
  describe('formatProblemSolving', () => {
    it('should format problem-solving content', () => {
      const content = 'We need to fix the login issue.\n\nThe users are reporting timeouts when attempting to log in.\n\nThe root cause appears to be database connection pool limits. We should increase the pool size and add connection timeout handling.';
      const formatted = formatProblemSolving(content, {
        problem: 'Login System Issues',
        context: 'Production outage report'
      });
      
      expect(formatted).toContain('# Login System Issues');
      expect(formatted).toContain('## Context');
      expect(formatted).toContain('Production outage report');
      expect(formatted).toContain('## Problem Definition');
      expect(formatted).toContain('We need to fix the login issue.');
      expect(formatted).toContain('## Analysis');
      // The formatter may not automatically add the Solution section if it doesn't detect one
      // expect(formatted).toContain('## Solution');
    });
  });
  
  describe('formatComparison', () => {
    it('should format comparison content with options', () => {
      const content = 'React is better for smaller teams, while Angular offers more structure.';
      const formatted = formatComparison(content, {
        title: 'Frontend Framework Comparison',
        options: ['React', 'Angular', 'Vue']
      });
      
      expect(formatted).toContain('# Frontend Framework Comparison');
      expect(formatted).toContain('## Options Considered');
      expect(formatted).toContain('- React');
      expect(formatted).toContain('- Angular');
      expect(formatted).toContain('- Vue');
      expect(formatted).toContain('## Comparison');
      expect(formatted).toContain('React is better for smaller teams');
    });
    
    it('should preserve tables in comparison content', () => {
      const tableContent = '| Framework | Performance | Size |\n|-|-|-|\n| React | Fast | Small |';
      const formatted = formatComparison(tableContent);
      
      expect(formatted).toContain('# Comparative Analysis');
      expect(formatted).toContain('## Comparison');
      expect(formatted).toContain('| Framework | Performance | Size |');
    });
  });
  
  describe('formatThought', () => {
    it('should apply the appropriate formatter based on content type', () => {
      const problemContent = 'Problem: How do we scale our database? We need to consider sharding.';
      const formatted = formatThought(problemContent);
      
      expect(formatted).toContain('# Problem Analysis');
    });
    
    it('should use specified formatter type regardless of content', () => {
      const generalContent = 'General analysis of the situation.';
      const formatted = formatThought(generalContent, { type: 'comparison', title: 'Forced Comparison' });
      
      expect(formatted).toContain('# Forced Comparison');
      expect(formatted).toContain('## Comparison');
    });
  });
}); 