# MCP Think Tank

<div align="center">
  
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_dark.png" width="320">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_light.png" width="320">
  <img alt="MCP Think Tank Logo" src="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_light.png" width="320">
</picture>

[![npm version](https://img.shields.io/npm/v/mcp-think-tank.svg?style=flat-square)](https://www.npmjs.com/package/mcp-think-tank)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Cursor Compatible](https://img.shields.io/badge/Cursor-Compatible-4B8DF8?logo=cursor&logoColor=white&style=flat-square)](https://www.cursor.so/)
[![Claude Compatibility](https://img.shields.io/badge/Claude-Compatible-9370DB.svg)](https://www.anthropic.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Tank-orange.svg)](https://github.com/modelcontextprotocol)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## Overview

MCP Think Tank provides **Cursor** and **Claude @Web** with a dedicated space for structured reasoning, persistent memory, advanced task management, and web research via Exa. It enhances these clients' natural capabilities for systematic problem-solving, project planning, and knowledge building, all while maintaining a persistent knowledge graph.

## 🎯 Philosophy

MCP Think Tank is built on three core principles:

1. **Elegant Simplicity**: We believe in the power of minimal, well-designed tools that work with Claude's natural capabilities rather than trying to replicate or override them.

2. **Enhanced Reflection**: By providing gentle guidance rather than rigid structure, we enable better reasoning and self-reflection without constraining Claude's thinking process.

3. **Persistent Context**: The knowledge graph provides memory across conversations while maintaining simplicity in both storage and retrieval.

## 🧠 The Power of Structured Thinking

The think tool provides a dedicated space for systematic reasoning, encouraging:
- Clear problem definition
- Relevant context gathering
- Step-by-step analysis
- Self-reflection on reasoning
- Well-formed conclusions

Recent studies show significant improvements when using structured thinking:
- **54% relative improvement** in complex decision-making tasks
- **Enhanced consistency** across multiple trials
- **Improved performance** on software engineering benchmarks

## 🚀 Key Features

- 💭 **Think Tool**: Dedicated space for structured reasoning and self-reflection
- 🧩 **Knowledge Graph**: Simple but effective persistent memory
- 📝 **Task Management Tools**: Plan, track, and update tasks with full knowledge graph integration
- 🌐 **Web Research Tools (Exa)**: Search the web and get sourced answers using Exa API
- 🔍 **Memory Tools**: Easy-to-use tools for storing and retrieving information
- 🤝 **Client Support**: Seamless integration with Cursor, Claude @Web, and other MCP clients
- 🔒 **Tool Orchestration & Call Limits**: Built-in safeguards to prevent excessive tool usage with configurable limits
- ⚡ **Content Caching**: Performance optimization for file and URL operations with automatic duplicate detection

## 📦 Installation

> ⚠️ **Important:** MCP Think Tank requires a pre-built server.
> The package is automatically built before publishing, so users
> do not need to take any extra steps. Just install and run!

### NPX (Recommended)

The easiest way to use MCP Think Tank is via NPX:

```bash
npx mcp-think-tank@latest
```

### Global Installation

```bash
npm install -g mcp-think-tank
mcp-think-tank
```

## ⚙️ Configuration

### Quick Start: Essential Setup

1. **Install MCP Think Tank** (see Installation above)
2. **Get your Exa API Key** (required for web search):
   - Sign up at [exa.ai](https://exa.ai/) and copy your API key.
3. **Configure your MCP server** (for Cursor, add to `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here"
      }
    }
  }
}
```


> ⚠️ **Important:**
> Always set a unique `MEMORY_PATH` for each project!
> 
> Using the default (centralized) memory path can cause knowledge graph conflicts between projects. For best results and to keep your project memories isolated, specify a custom `MEMORY_PATH` in your configuration for every project.
> If omitted, defaults to `~/.mcp-think-tank/memory.jsonl`.

- `EXA_API_KEY` (**required for Exa web search**): Enables `exa_search` and `exa_answer` tools. Without it, web search will not work.

> For more details, see [exa.ai](https://exa.ai/) and [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

### Tool Limits and Caching Configuration

MCP Think Tank includes built-in safeguards to prevent excessive tool usage and performance optimizations through caching. These can be configured via environment variables:

- `TOOL_LIMIT` (default: 25): Maximum number of tool calls allowed per session
- `CACHE_TOOL_CALLS` (default: true): Enable/disable duplicate tool call caching
- `CACHE_CONTENT` (default: true): Enable/disable content-based caching for file/URL operations
- `CONTENT_CACHE_SIZE` (default: 50): Maximum number of items in the content cache
- `CONTENT_CACHE_TTL` (default: 300000): Time-to-live for cached content in milliseconds (5 minutes)

Example configuration with custom limits and caching settings:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here",
        "TOOL_LIMIT": "50",
        "CACHE_CONTENT": "true",
        "CONTENT_CACHE_SIZE": "100"
      }
    }
  }
}
```

> 💡 **Performance tip:**
> Content caching can significantly improve performance for repeated file and URL operations. In tests, cached URL fetches were over 1000× faster than the initial fetch.

---

### Advanced: Other Configuration Options

- You can also set `MEMORY_PATH` or `EXA_API_KEY` as environment variables when running the server directly:
  ```bash
  EXA_API_KEY=your-exa-api-key-here mcp-think-tank --memory-path=/absolute/path/to/your/memory.jsonl
  ```
- The directory for `MEMORY_PATH` will be created automatically if it doesn't exist.
- If the file doesn't exist, an empty knowledge graph will be initialized.
- The `.jsonl` extension is recommended for the storage file.

## Logging

MCP Think Tank uses a minimal, stable logging approach designed for FastMCP and production best practices:

- Logs are written to a single file at `~/.mcp-think-tank/logs/mcp-think-tank.log`.
- Before each log write, the file size is checked. If it exceeds 10MB, the log file is renamed with a timestamp and a new one is started.
- Only Node.js built-in modules are used for logging.
- Debug logging can be enabled by setting the environment variable `MCP_DEBUG=true`.
- File logging can be disabled by setting `MCP_LOG_FILE=false`.

This approach is intentional to keep the focus on core MCP server tools and avoid unnecessary complexity.

## 📝 MCP Think Tank: Project Rule Setup

To ensure Cursor and all agents use MCP Think Tank's full capabilities, create a **single, always-on project rule** as follows:

### Exa Web Search API Key Required

> **Note:** To use Exa-based web research tools (`exa_search`, `exa_answer`), you must provide an Exa API key. Without it, web search will not work.
>
> 1. **Get your API key:** Sign up and obtain an API key at [exa.ai](https://exa.ai/).
> 2. **Set the key in your MCP server config:** Add `EXA_API_KEY` to the `env` section of your MCP server configuration. Example for `.cursor/mcp.json`:
>
> ```json
> {
>   "mcpServers": {
>     "think-tool": {
>       "command": "npx",
>       "args": ["-y", "mcp-think-tank"],
>       "type": "stdio",
>       "env": {
>         "MEMORY_PATH": "/absolute/path/to/your/memory.jsonl",
>         "EXA_API_KEY": "your-exa-api-key-here"
>       }
>     }
>   }
> }
> ```
>
> For more details, see [exa.ai](https://exa.ai/) and [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

### 1. Add a New Rule in Cursor

1. Open Cursor.
2. Go to the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
3. Select **"New Cursor Rule"**.
4. Name the rule (e.g., `mcp-think-tank.mdc`).
5. In the rule editor, set the metadata as shown below and paste the rule content.

### 2. Example Rule File (`.cursor/rules/mcp-think-tank.mdc`)
```
---
rule type: auto attach
use globs: **/*.js,**/*.ts,**/*.jsx,**/*.tsx,**/*.md,**/*.py,**/*.json
---

# MCP Think Tank Tools Guide

MCP Think Tank extends AI with structured reasoning, knowledge graph memory, task management, and web research capabilities. This rule helps determine when each tool is most appropriate.

## Tool Selection Guide

### 1. Thinking Tools (Structured Reasoning)

Use `think` for:
- Complex technical decisions requiring systematic analysis
- Architecture planning and design considerations
- Step-by-step problem-solving with self-reflection
- When analysis should be saved for future reference

```javascript
// Complex architecture decision with memory storage
mcp_think-tool_think({
  structuredReasoning: "Analyzing database options for our user management system...",
  category: "architecture",
  storeInMemory: true
})
```

### 2. Memory & Knowledge Graph

Use when information should be preserved across conversations:

| Tool | When to Use |
|------|-------------|
| `create_entities` | Document important concepts or components |
| `add_observations` | Add new facts to existing entities |
| `create_relations` | Connect related concepts |
| `search_nodes` | Find relevant knowledge before solving problems |
| `open_nodes` | Retrieve specific entity details |

```javascript
// Documenting architectural components
mcp_think-tool_create_entities([
  {name: "AuthService", entityType: "System", observations: ["Handles authentication"]}
])
```

### 3. Task Management

Use for project planning and tracking:

- `plan_tasks`: At project start or when planning features
- `list_tasks`: To understand current work status
- `next_task`: When ready to work on next priority
- `complete_task`: When a task is finished
- `update_tasks`: When priorities change

### 4. Web Research (Exa)

Use when current context is insufficient:

- `exa_search`: For finding current information from the web
- `exa_answer`: For factual questions requiring cited sources

```javascript
// Research current best practices
mcp_think-tool_exa_search({
  query: "latest React state management libraries 2025",
  num_results: 5
})
```

## Integration Best Practices

1. Start complex reasoning with `think` tool
2. Save important conclusions to knowledge graph
3. Create tasks based on conclusions when appropriate
4. Use research tools to fill knowledge gaps
5. Record research findings in knowledge graph

## Performance Considerations

- Tool calls are limited to 25 per session (configurable)
- Content caching improves repeated file/URL operation performance
- Avoid redundant tool calls for optimal performance
```


## 📝 How To Save Important Thoughts

When using the `think` tool with important reasoning, set `storeInMemory: true` simply tell the agent "Please save this reasoning in memory for future reference."

## 🧠 Think Tank Instructions

This section provides detailed, actionable guidance for using MCP Think Tank within Cursor AI IDE (or any MCP-compliant agent), with a focus on coding and large project development. The tools are grouped into four main categories:

### 1. Think Tools (Structured Reasoning)
- Use the `think` tool for all complex decisions, architecture planning, and problem-solving.
- Always provide clear, step-by-step reasoning and relevant context.
- **To persist your reasoning for future reference, set `storeInMemory: true` in your tool call.**
  - Example: When you want your analysis or decision to be available across sessions or for team traceability.
- If you do not set `storeInMemory: true`, your reasoning will be processed but not saved in the knowledge graph.
- Agents (like Cursor or Claude) can be prompted to "save this reasoning in memory" to ensure persistence.
- You can later retrieve saved thoughts using the `search_nodes` or `open_nodes` tools.

#### How `storeInMemory` Works
- The `think` tool accepts a `storeInMemory` parameter (default: false).
- When `storeInMemory: true`, your structured reasoning, context, and tags are saved as an entity in the knowledge graph.
- This enables robust project memory, traceability, and continuity.
- Example tool call:
  ```json
  {
    "tool": "think",
    "parameters": {
      "structuredReasoning": "Analyzed the pros and cons of REST vs GraphQL for our new API. Decided REST is simpler for our use case.",
      "context": "API design meeting 2024-07-10",
      "category": "architecture",
      "tags": ["api", "meeting"],
      "storeInMemory": true
    }
  }
  ```
- To retrieve saved thoughts, use:
  - `search_nodes` (by keyword, tag, or context)
  - `open_nodes` (by entity name)

#### Multi-step Reasoning with Step Counters
- For complex thinking processes that span multiple steps, use the step counter parameters:
  - `plannedSteps`: Total number of steps you plan to complete (e.g., 5)
  - `currentStep`: The current step number you're on (e.g., 2)
- The system will track your progress through the multi-step reasoning process
- Each step will be saved with appropriate metadata when using `storeInMemory: true`
- Example tool call:
  ```json
  {
    "tool": "think",
    "parameters": {
      "structuredReasoning": "Step 2 analysis of database schema options...",
      "plannedSteps": 5,
      "currentStep": 2,
      "storeInMemory": true
    }
  }
  ```
- This is especially useful for breaking down complex problems into manageable stages and tracking progress.

#### Self-Reflection for Enhanced Reasoning
- Use the self-reflection feature to automatically critique your reasoning and identify potential improvements
- Set `selfReflect: true` in your think tool parameters to enable this feature
- You can optionally provide a custom reflection prompt with `reflectPrompt`
- Self-reflection helps identify:
  - Potential logical fallacies or inconsistencies in reasoning
  - Overlooked factors or considerations
  - Assumptions that may need validation
  - Areas where the reasoning could be strengthened
- Example tool call with self-reflection:
  ```json
  {
    "tool": "think",
    "parameters": {
      "structuredReasoning": "My analysis of the authentication system...",
      "selfReflect": true,
      "reflectPrompt": "Evaluate my reasoning for security considerations I might have missed",
      "storeInMemory": true
    }
  }
  ```
- The reflection is appended to your original reasoning and saved together when using `storeInMemory: true`

#### Inline Research Integration
- Enable mid-reasoning research by setting `allowResearch: true` in your think tool parameters
- Insert research queries directly in your reasoning using the format: `[research: your search query]`
- The system will automatically:
  - Detect and process these research requests
  - Replace the markers with formatted research results
  - Include source citations for each result
- You can also set an initial `researchQuery` parameter for preliminary research before your reasoning starts
- Example tool call with research:
  ```json
  {
    "tool": "think",
    "parameters": {
      "structuredReasoning": "I need to understand the latest advancements in [research: quantum error correction 2023] before designing our system.",
      "allowResearch": true,
      "storeInMemory": true
    }
  }
  ```
- Multiple research requests can be included in a single reasoning step
- All research results and sources are stored with your reasoning when using `storeInMemory: true`
- Research sources are added as relations in the knowledge graph for traceability

#### Structured Markdown Formatting
- The think tool automatically formats output as structured markdown for improved readability
- Available format types:
  - `general`: Generic reasoning with introduction, analysis, and conclusion sections
  - `problem`: Problem-solving format with problem definition, analysis, and solution sections
  - `comparison`: Comparative analysis format that preserves tables and highlights options
- Control formatting with these parameters:
  - `formatOutput: true/false` - Enable or disable formatting (default: true)
  - `formatType: 'auto'/'general'/'problem'/'comparison'` - Select format type (default: auto)
- When `formatType` is 'auto', the system analyzes your content to determine the most appropriate format
- Example tool call with specific formatting:
  ```json
  {
    "tool": "think",
    "parameters": {
      "structuredReasoning": "My analysis comparing different database options...",
      "formatType": "comparison",
      "storeInMemory": true
    }
  }
  ```
- Formatted output includes:
  - Clear section headers
  - Metadata section with context and category
  - Features section showing enabled capabilities (reflection, research)
  - Properly structured content based on the format type
- This formatting improves both human readability and machine parsing of the reasoning

> ⚠️ **Important:**
> The `storeInMemory` parameter is not activly used by the user, the user simply writes "Please save this reasoning in memory for future reference" and the tool will save the reasoning in the knowledge graph.

### 2. Research Tools
- Use `exa_search` for web search and `exa_answer` for sourced answers.
- Always cite sources and, when relevant, summarize findings in memory using `add_observations` or by saving a `think` entry.
- Research tools require a valid `EXA_API_KEY` in your MCP server configuration.
- Integrate research findings into your code and reasoning for robust, up-to-date solutions.
- Includes intelligent error handling for non-JSON responses and content caching for better performance.

### 3. Task Manager Tools
- Use `plan_tasks` to create and organize project tasks.
- Use `list_tasks`, `next_task`, `complete_task`, and `update_tasks` to manage your workflow.
- All tasks are synchronized with the knowledge graph, enabling persistent, queryable project management.
- For large projects, leverage task dependencies and priorities to maintain clarity and momentum.

### 4. Memory Tools
- Use `create_entities`, `add_observations`, `create_relations`, and related tools to build and maintain your project's knowledge graph.
- Store key decisions, reusable patterns, and architectural choices for future reference.
- Before starting new work, search memory for relevant prior knowledge to avoid duplication and leverage past insights.
- File and URL operations benefit from content-based caching for improved performance.

## ⚡ Performance Optimization

MCP Think Tank includes built-in performance optimizations:

### Content Caching
- Automatic caching of file and URL content based on cryptographic hashing
- Prevents redundant file reads and network requests
- In tests, cached URL fetches were over 1000× faster than the initial fetch
- File reads showed significant improvements with 2-5× speedup on subsequent reads
- Cache size and TTL are configurable via environment variables

### Tool Call Optimization
- Identical tool calls are automatically cached to prevent counting duplicates against your limit
- Intelligent error handling, especially for Exa search, prevents failures from non-JSON responses
- Tool limit safeguards prevent runaway tool usage while providing graceful degradation

---

**Best Practices for Cursor/Claude and Large Projects:**
- Use the `think` tool liberally for all non-trivial reasoning and always persist important thoughts.
- Integrate research and task management into your coding workflow for seamless project development.
- Regularly review and update your knowledge graph to keep project memory relevant and actionable.
- Reference and build upon previous decisions and patterns for consistent, high-quality code.
- Be mindful of tool limits in complex workflows, and use the cache stats utilities to monitor usage.

---

Keep this section up to date as new tools or workflows are added.

### 3. Reference Links

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [MCP Model Context Protocol](https://docs.cursor.com/context/model-context-protocol)
- [Exa API](https://exa.ai/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol/typescript-sdk)
- [FastMCP](https://github.com/jlowin/fastmcp)
- [Claude 3.7 Sonnet](https://www.anthropic.com/claude)

## 📚 Further Reading

- [Anthropic's Research on Structured Thinking](https://www.anthropic.com/research)
- [Model Context Protocol Documentation](https://github.com/modelcontextprotocol)
- [Claude Desktop Integration Guide](https://docs.anthropic.com/claude/docs)

---

<div align="center">
  <p>Developed by <a href="https://github.com/flight505">flight505</a></p>
  <p>Give a ⭐️ if this project helped you!</p>
</div>