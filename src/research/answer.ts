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

  // Optional streaming answer tool - uncomment if you want to enable it
  /*
  server.addTool({
    name: 'exa_stream_answer',
    description: 'Ask a question and get a streamed answer with sources via Exa API.',
    parameters: z.object({
      question: z.string().min(5),
      max_citations: z.number().min(1).max(5).default(3) // Default to 3 for speed
    }),
    stream: true,
    execute: async function* ({ question, max_citations }) {
      // Ensure API key is set
      if (!process.env.EXA_API_KEY) {
        const errorMessage = 'EXA_API_KEY environment variable is not set. Please set it before using this tool.';
        logger.error(errorMessage);
        yield JSON.stringify({
          error: errorMessage
        });
        return;
      }

      try {
        const exa = new Exa(process.env.EXA_API_KEY);
        
        const stream = await exa.streamAnswer(question, {
          text: true
        });
        
        for await (const chunk of stream) {
          yield JSON.stringify(chunk);
        }
      } catch (error) {
        const errorMessage = `Error executing Exa streaming answer: ${error}`;
        logger.error(errorMessage);
        
        yield JSON.stringify({
          error: errorMessage
        });
      }
    }
  });
  */
} 