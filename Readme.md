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

MCP Think Tank provides **Cursor** and **Claude @Web** with a sophisticated environment for enhanced reasoning capabilities. It now features advanced **Sequential Thinking & Chained Reasoning** processes, a robust **Knowledge Graph Memory** system with versioning, and intelligent **Tool Orchestration with Call-Limit Safeguards**.

This platform enables AI assistants to approach complex problems through structured multi-step reasoning, maintain persistent knowledge across conversations, and utilize web research and task management capabilities—all while ensuring responsible and efficient tool usage through built-in safeguards.

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
- 🔄 **Sequential Thinking**: Multi-step reasoning processes with progress tracking and plan awareness
- 🔎 **Self-Reflection**: Automated reflection on reasoning to improve output quality
- 📊 **Structured Outputs**: Automatic formatting of thought processes for better readability
- 🔗 **Research Integration**: Seamless incorporation of web research into reasoning flows

### Sequential Thinking & Chained Reasoning

The latest version introduces powerful multi-step reasoning capabilities:

- **Step-by-Step Planning**: Break down complex problems into manageable sequential steps
- **Progress Tracking**: Monitor progress through multi-step reasoning with step counters
- **Self-Reflection**: Automatically evaluate reasoning quality with optional reflection passes
- **Research Integration**: Incorporate web research seamlessly within reasoning chains
- **Structured Formatting**: Output reasoning in clean, organized formats for better understanding

### Enhanced Knowledge Graph Memory

The knowledge graph system has been significantly upgraded:

- **Timestamped Observations**: All memory entries now include metadata for better tracking
- **Duplicate Prevention**: Intelligent entity matching to avoid redundant entries
- **Automatic Linkage**: Heuristic-based relation creation between related entities
- **Advanced Querying**: Filter memory by time, tags, keywords, and more
- **Memory Maintenance**: Tools for pruning and managing memory growth over time

### Tool Orchestration & Safeguards

New intelligent tool management features ensure responsible and efficient tool usage:

- **Usage Limits**: Configurable caps on tool calls (default: 25) to prevent runaway usage
- **Call Caching**: Automatic detection and reuse of duplicate tool calls for efficiency
- **Content Caching**: SHA-1 based caching for file and URL operations to reduce redundant reads
- **Graceful Degradation**: Clean handling of limit errors with partial results returned
- **Tool Whitelisting**: Configurable restrictions on which tools can be used in specific contexts

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

### Environment Variables

#### Essential Variables

- `MEMORY_PATH`: Path to the memory storage file (default: `~/.mcp-think-tank/memory.jsonl`)
- `EXA_API_KEY` (**required for Exa web search**): Enables `exa_search` and `exa_answer` tools

#### Advanced Configuration

- `MCP_DEBUG`: Enable debug logging (default: `false`)
- `MCP_LISTEN_PORT`: Set custom port for MCP server (default: `3399`)
- `LOG_LEVEL`: Set logging level (`debug`, `info`, `warn`, `error`) (default: `info`)
- `AUTO_LINK`: Enable automatic entity linking in knowledge graph (default: `true`)

#### New Tool Orchestration & Caching Settings

- `TOOL_LIMIT`: Maximum number of tool calls per session (default: `25`)
- `CACHE_TOOL_CALLS`: Enable/disable duplicate tool call caching (default: `true`)
- `TOOL_CACHE_SIZE`: Maximum number of cached tool calls (default: `100`)
- `CACHE_CONTENT`: Enable/disable content-based caching for file/URL operations (default: `true`)
- `CONTENT_CACHE_SIZE`: Maximum number of items in content cache (default: `50`)
- `CONTENT_CACHE_TTL`: Time-to-live for cached content in milliseconds (default: `300000` - 5 minutes)

#### Memory Maintenance

- `MIN_SIMILARITY_SCORE`: Threshold for entity matching (default: `0.85`)
- `MAX_OPERATION_TIME`: Maximum time for batch operations in milliseconds (default: `5000`)

Example configuration with advanced settings:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio",
      "env": {
        "MEMORY_PATH": "./project-memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here",
        "TOOL_LIMIT": "50",
        "CACHE_CONTENT": "true",
        "CONTENT_CACHE_SIZE": "100",
        "MCP_DEBUG": "false",
        "AUTO_LINK": "true"
      }
    }
  }
}
```

> 💡 **Performance tip:**
> For large projects, increasing `TOOL_LIMIT` and cache sizes can improve performance at the cost of higher memory usage. Monitor your usage patterns and adjust accordingly.

> For more details on MCP servers, see [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

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
    | `upsert_entities` | Document important concepts or components or update existing entities with the update flag |
    | `add_observations` | Add new facts to existing entities |
    | `create_relations` | Connect related concepts |
    | `search_nodes` | Find relevant knowledge before solving problems |
    | `open_nodes` | Retrieve specific entity details |

    ```javascript
    // Documenting architectural components
    mcp_think-tool_upsert_entities({
      entities: [
        {name: "AuthService", entityType: "System", observations: ["Handles authentication"]}
      ]
    })
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

    ### 2. Memory & Knowledge Graph

    Use when information should be preserved across conversations:

    | Tool | When to Use |
    |------|-------------|
    | `upsert_entities` | Document important concepts or components or update existing entities with the update flag |
    | `add_observations` | Add new facts to existing entities |
    | `create_relations` | Connect related concepts |
    | `search_nodes` | Find relevant knowledge before solving problems |
    | `open_nodes` | Retrieve specific entity details |

    ```javascript
    // Documenting architectural components
    mcp_think-tool_upsert_entities({
      entities: [
        {name: "AuthService", entityType: "System", observations: ["Handles authentication"]}
      ]
    })
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

## 🛡️ Tool Orchestration & Safeguards

MCP Think Tank v2.0.2 includes comprehensive tool management features to ensure responsible and efficient usage:

### Usage Limits & Monitoring

- **Default limit**: 25 tool calls per session (configurable via `TOOL_LIMIT` environment variable)
- **Automatic tracking**: All tool calls are logged with timestamps, agent IDs, and parameters
- **Graceful degradation**: When limits are reached, the system returns partial results rather than failing completely
- **Status tracking**: Tool calls that exceed limits are tagged with `HALTED_LIMIT` status

### Intelligent Caching

- **Duplicate detection**: Identical tool calls are automatically detected and served from cache
- **Content hashing**: File and URL operations use SHA-1 hashing to identify unchanged content
- **Configurable caching**: Enable/disable caching behavior through environment variables
- **Cache statistics**: Monitor cache hit/miss rates for performance analysis

### Tool Access Control

- **Configurable whitelists**: Restrict which tools can be used in specific contexts
- **Permission errors**: Clear error messages when disallowed tools are requested
- **Orchestration strategies**: Multiple coordination strategies for sequential or parallel execution
- **Agent isolation**: Tool usage tracked per agent to prevent cross-contamination

### Implementation

The safeguards are implemented through a dedicated `ToolManager` that wraps all tool calls:

- Atomic counters ensure accurate tracking even in concurrent environments
- LRU cache prevents redundant operations while maintaining memory efficiency
- Comprehensive error handling provides meaningful feedback rather than cryptic failures
- All limits and caching behavior are configurable without code changes

> 🔒 **Security note:**
> The tool orchestration system ensures that even if a prompt attempts to force excessive tool usage, it will be gracefully limited according to your configuration.

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
