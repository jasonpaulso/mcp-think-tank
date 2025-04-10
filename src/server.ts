import { FastMCP, UserError } from "fastmcp";
import { z } from "zod";

// Create a new MCP server
const server = new FastMCP({
  name: "Think Tool Server",
  version: "1.0.5",
});

// Add the "think" tool
server.addTool({
  name: "think",
  description: "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. For best results, structure your reasoning with: 1) Problem definition, 2) Relevant facts/context, 3) Analysis steps, 4) Conclusion/decision.",
  parameters: z.object({
    structuredReasoning: z.string()
      .min(10, "Reasoning should be substantial enough to be helpful")
      .describe("A structured thought process to work through complex problems. Use this as a dedicated space for reasoning step-by-step.")
  }),
  execute: async (args, { log }) => {
    // Log the thought (this will be visible in the server logs but not to the user)
    log.info("Thinking process", { structuredReasoning: args.structuredReasoning });
    
    // Simply return the thought itself, as per Anthropic's blog post
    return args.structuredReasoning;
  },
});

// For the warning "FastMCP could not infer client capabilities", we need a version update
// of fastmcp to fix properly. For now, use the basic configuration:
server.start({
  transportType: "stdio",
});

// Use console.error instead of console.log - this writes to stderr which won't interfere with the protocol
console.error("Think Tool Server is running...");