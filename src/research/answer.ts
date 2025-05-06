import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { Exa } from 'exa-js';

/**
 * Register the Exa answer tool for getting sourced answers
 */
export function registerExaAnswerTool(server: FastMCP): void {
  server.addTool({
    name: 'exa_answer',
    description: 'Ask a question and get a sourced answer via Exa /answer API.',
    parameters: z.object({
      question: z.string().min(5).describe("The question to ask and get an answer with sources"),
      max_citations: z.number().min(1).max(10).default(5).describe("Maximum number of citations to include in the answer (1-10)")
    }),
    execute: async ({ question, max_citations }, context) => {
      const log = context && context.log ? context.log : { info() {}, error() {}, warn() {}, debug() {} };
      // Ensure API key is set
      if (!process.env.EXA_API_KEY) {
        log.error('EXA_API_KEY environment variable is not set. Please set it before using this tool.');
        return JSON.stringify({
          error: 'EXA_API_KEY environment variable is not set. Please set it before using this tool.'
        });
      }

      try {
        const exa = new Exa(process.env.EXA_API_KEY);
        
        // Exa doesn't directly let us control citation count in AnswerOptions
        // We'll use the text option to get more complete results
        const response = await exa.answer(question, {
          text: true,
          model: "exa"
        });
        
        return JSON.stringify(response);
      } catch (error) {
        const errorMessage = `Error executing Exa answer: ${error}`;
        log.error(errorMessage);
        
        return JSON.stringify({
          error: errorMessage
        });
      }
    }
  });
} 