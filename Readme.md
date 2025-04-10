# MCP Think Server with Knowledge Graph Memory

<div align="center">
  <img src="https://github.com/user-attachments/assets/d86470ba-45d4-48d0-8ebe-783c402dd4f4" alt="ContextCraft Logo" width="240">
  <p>The "think" tool excels where other approaches fall short - now with persistent memory across conversations</p>
</div>

[![npm version](https://img.shields.io/npm/v/mcp-think-server.svg)](https://www.npmjs.com/package/mcp-think-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Official implementation of Anthropic's "think" tool as an MCP server** - dramatically improve Claude's reasoning capabilities with structured thinking and persistent knowledge graph memory.

## What is the Think Tool with Memory?

The MCP Think Server now combines two powerful capabilities:

1. **Structured Reasoning**: The original "think" tool provides Claude with a dedicated space for structured reasoning during complex problem-solving tasks.

2. **Persistent Memory**: The new Knowledge Graph Memory feature allows Claude to retain information across conversations, build semantic relationships between entities, and access previous reasoning.

## Knowledge Graph Memory

The knowledge graph memory feature extends Claude's capabilities by providing:

- **Information Persistence**: Store and retrieve facts across multiple sessions
- **Semantic Connections**: Create and navigate relationships between entities
- **Reasoning History**: Access previous conclusions and thought processes

### Memory Model

The knowledge graph is built around three key concepts:

1. **Entities**: Nodes in the graph representing people, objects, concepts, etc.
   ```json
   {
     "name": "Claude",
     "entityType": "ai_assistant",
     "observations": ["Built by Anthropic", "Uses a think tool"]
   }
   ```

2. **Relations**: Connections between entities
   ```json
   {
     "from": "Claude",
     "to": "Anthropic",
     "relationType": "was_created_by"
   }
   ```

3. **Observations**: Facts or attributes associated with entities

### Memory Tools

The following MCP tools are available for memory operations:

#### Entity Management
- `create_entities` - Create multiple entities
- `update_entities` - Update entity properties
- `delete_entities` - Remove entities

#### Relation Management
- `create_relations` - Create connections between entities
- `update_relations` - Update relation properties
- `delete_relations` - Remove relations

#### Observation Management
- `add_observations` - Add new observations to entities
- `delete_observations` - Remove observations from entities

#### Query and Retrieval
- `read_graph` - Get the entire knowledge graph
- `open_nodes` - Retrieve specific entities
- `search_nodes` - Find entities by keyword search
- `semantic_search` - Find entities using semantic similarity
- `generate_embeddings` - Generate vector embeddings for all entities

### Semantic Search

The knowledge graph now supports semantic search using vector embeddings. This allows Claude to find conceptually similar information even when there's no exact text match.

#### How it works

1. Entities are converted to vector embeddings using OpenAI's embedding models
2. Queries are also converted to embeddings
3. The system finds entities with the highest semantic similarity to the query
4. Results are ranked by similarity score

#### Using Semantic Search

To use semantic search:

```js
semantic_search({
  query: "What projects is the team working on?",
  threshold: 0.7,  // Minimum similarity score (0-1)
  limit: 5,        // Maximum number of results
  generateMissingEmbeddings: true  // Auto-generate embeddings if needed
})
```

#### Setting up OpenAI API for Embeddings

To enable semantic search, set your OpenAI API key:

```bash
# Set as environment variable
export OPENAI_API_KEY=your_api_key

# Or when running the server
OPENAI_API_KEY=your_api_key mcp-think-server

# Or in Cursor configuration
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-server",
      "args": [],
      "env": {
        "OPENAI_API_KEY": "your_api_key"
      },
      "type": "stdio"
    }
  }
}
```

## Setup and Configuration

### Memory Path Configuration

By default, the knowledge graph is stored in `~/.mcp-think-server/memory.jsonl`. You can specify a custom path using the `--memory-path` option:

```bash
mcp-think-server --memory-path=/path/to/your/memory.json
```

Or in your Cursor configuration:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-server",
      "args": ["--memory-path=/path/to/your/memory.json"],
      "type": "stdio"
    }
  }
}
```

## What is the Think Tool?

The "think" tool provides Claude with a dedicated space for structured reasoning during complex problem-solving tasks. Unlike Anthropic's "extended thinking" capability (which helps Claude plan before generating a response), the "think" tool allows Claude to pause mid-task to process new information obtained from tool calls or user interactions.

According to Anthropic's March 2025 research, this approach enables more thoughtful, accurate, and reliable responses, especially for tasks requiring complex reasoning, policy adherence, and sequential decision-making.

## Performance Benefits (Latest Research)

Recent studies by Anthropic demonstrate remarkable improvements when using the "think" tool:

- **54% relative improvement** in the airline domain (0.570 vs. 0.370 on pass^1 metric)
- **Significantly better performance** in the retail domain (0.812 vs. 0.783 baseline)
- **Enhanced consistency** across multiple trials of the same task
- **Improved performance** on software engineering benchmarks
- **1.6% average improvement** on SWE-Bench, contributing to Claude 3.7 Sonnet's state-of-the-art score of 0.623

The best performance comes from pairing the "think" tool with domain-specific prompting that provides examples of reasoning approaches relevant to the task.

## Key Benefits

The "think" tool excels where other approaches fall short:
- **Better than extended thinking** for cases where Claude doesn't have all necessary information from the initial query
- **More effective than baseline prompting** for policy-heavy scenarios
- **Especially powerful** for analyzing tool outputs from other MCP servers

## Technical Implementation

This MCP server is a lightweight, efficient implementation that combines:

- **Structured Thinking**: The original "think" tool based on Anthropic's research
- **Knowledge Graph Memory**: Persistent storage of information across conversations
- **MCP Standards Compliance**: Follows Anthropic's official MCP specifications

## Installation

### Recommended: Direct NPX Installation

The simplest and most reliable way to use mcp-think-server:

```bash
# No installation needed, just configure Cursor or Claude to use:
npx -y mcp-think-server
```

This method:
- Always uses the latest version
- Avoids permission issues
- Works consistently across different environments

### Alternative: Global Installation

If you prefer a global installation:

```bash
npm install -g mcp-think-server
```

And then run it from anywhere:

```bash
mcp-think-server
```

### Alternative: Local Installation

You can also install it locally to your project:

```bash
npm install mcp-think-server
```

And run it via npx:

```bash
npx mcp-think-server
```

### Troubleshooting

If you encounter issues during installation:

1. Make sure you have Node.js version 18 or higher installed
2. If TypeScript compilation fails, you can try:
   ```bash
   git clone https://github.com/flight505/mcp-think-server.git
   cd mcp-think-server
   npm install
   npm run build
   npm link
   ```

## Cursor Integration

### Recommended Setup (NPX Method)

For the most reliable integration with Cursor, use this configuration in your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-server"],
      "type": "stdio"
    }
  }
}
```

This method:
- Uses npx to always fetch the latest version
- Avoids permission issues
- Doesn't require global installation
- Works consistently across different environments

### Alternative Setup Methods

If you prefer other installation approaches:

**Global Installation** (requires manual updates):
```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-server",
      "type": "stdio"
    }
  }
}
```

**Full Path Method** (for troubleshooting):
```json
{
  "mcpServers": {
    "think-tool": {
      "command": "/path/to/mcp-think-server",
      "type": "stdio"
    }
  }
}
```

### Important Notes

1. After changing your configuration, **restart Cursor** for changes to take effect
2. If using the NPX method for the first time, there might be a delay as the package downloads
3. Verify Node.js v18+ is installed in your system

### Troubleshooting

- Check Cursor's MCP logs for detailed error messages
- Ensure Node.js is in your PATH
- Verify that no other MCP server is using the same name

## How It Works

According to Anthropic's latest research, the "think" tool works through a standard tool specification format:

```json
{
  "name": "think",
  "description": "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  "input_schema": {
    "type": "object",
    "properties": {
      "thought": {
        "type": "string",
        "description": "A thought to think about."
      }
    },
    "required": ["thought"]
  }
}
```

**Key mechanism:** The tool doesn't perform any external actions or retrieve new information - it simply provides Claude with a dedicated space for structured reasoning. This dramatically improves performance on complex tasks by allowing Claude to:

1. **Pause mid-response** to organize thoughts when new information is received
2. **Create a structured approach** to multi-step problems
3. **Verify policy compliance** more thoroughly and consistently
4. **Carefully analyze outputs** from other MCP tools
5. **Maintain better context awareness** across long interactions

## When to Use the Think Tool

The "think" tool is especially valuable when:

1. **Working with other MCP tools** - Great for analyzing outputs from databases, filesystems, or APIs
2. **Following complex policies** - Perfect for customer service, legal, or compliance scenarios
3. **Making sequential decisions** - Ideal for workflows where later steps depend on earlier ones
4. **Processing web search results** - Helps Claude synthesize information from multiple sources
5. **Solving coding challenges** - Improves success rates on software engineering tasks

## System Prompt for Optimal Results

Anthropic's research shows that **combining the "think" tool with optimized prompting delivers the strongest performance improvements**. For best results, add the following optimized system prompt to your Claude interaction:

### For Claude Desktop (Custom Instructions)

Add this to Settings > Custom Instructions:

```
You have access to a "think" tool that provides a dedicated space for structured reasoning. Using this tool significantly improves your performance on complex tasks.

## When to use the think tool

Before taking any action or responding to the user after receiving tool results, use the think tool as a scratchpad to:
- List the specific rules that apply to the current request
- Check if all required information is collected
- Verify that the planned action complies with all policies
- Iterate over tool results for correctness
- Analyze complex information from web searches or other tools
- Plan multi-step approaches before executing them

## How to use the think tool effectively

When using the think tool:
1. Break down complex problems into clearly defined steps
2. Identify key facts, constraints, and requirements
3. Check for gaps in information and plan how to fill them
4. Evaluate multiple approaches before choosing one
5. Verify your reasoning for logical errors or biases

Remember that using the think tool has been shown to improve your performance by up to 54% on complex tasks, especially when working with multiple tools or following detailed policies.
```

### For Cursor (Global Rules)

Add this to Cursor Settings > General > Rules for AI:

```
After any context change (viewing new files, running commands, or receiving tool outputs), use the "mcp_think" tool to organize your reasoning before responding.

Specifically, always use the think tool when:
- After examining file contents or project structure
- After running terminal commands or analyzing their outputs
- After receiving search results or API responses
- Before making code suggestions or explaining complex concepts
- When transitioning between different parts of a task

When using the think tool:
- List the specific rules or constraints that apply to the current task
- Check if all required information is collected
- Verify that your planned approach is correct
- Break down complex problems into clearly defined steps
- Analyze outputs from other tools thoroughly
- Plan multi-step approaches before executing them

The think tool has been proven to improve performance by up to 54% on complex tasks, especially when working with multiple tools or following detailed policies.
```

## License

[MIT License](LICENSE)
