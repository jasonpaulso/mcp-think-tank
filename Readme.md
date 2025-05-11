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

<!-- TOC -->
* [MCP Think Tank](#mcp-think-tank)
* [Overview](#overview)
* [Philosophy](#philosophy)
* [Key Features](#key-features)
* [Benefits of Structured Thinking](#benefits-of-structured-thinking)
* [Detailed Features](#detailed-features)
  * [Structured Thinking (Think Tool)](#structured-thinking-think-tool)
  * [Knowledge Graph Memory](#knowledge-graph-memory)
  * [Task Management Tools](#task-management-tools)
  * [Web Research Tools (Exa)](#web-research-tools-exa)
  * [Tool Orchestration & Safeguards](#tool-orchestration--safeguards)
* [Installation](#installation)
* [Configuration](#configuration)
  * [Quick Start: Essential Setup](#quick-start-essential-setup)
  * [Essential Variables](#essential-variables)
  * [Advanced Configuration](#advanced-configuration)
  * [Memory Maintenance](#memory-maintenance)
* [Logging](#logging)
* [Project Rule Setup (for Cursor/AI)](#project-rule-setup-for-cursorai)
  * [Exa Web Search API Key Required](#exa-web-search-api-key-required)
  * [1. Add a New Rule in Cursor](#1-add-a-new-rule-in-cursor)
  * [2. Example Rule File (`.cursor/rules/mcp-think-tank.mdc`)](#2-example-rule-file-cursorrulesmcp-think-tankmdc)
  * [3. Reference Links](#3-reference-links)
* [Performance Optimization](#performance-optimization)
  * [Content Caching](#content-caching)
  * [Tool Call Optimization](#tool-call-optimization)
* [Best Practices](#best-practices)
* [Contributing](#contributing)
* [License](#license)
* [Related Projects](#related-projects)
* [Further Reading](#further-reading)
<!-- /TOC -->

## Overview

MCP Think Tank is a powerful Model Context Protocol (MCP) server designed to enhance the capabilities of AI assistants like **Cursor** and **Claude @Web**. It provides a structured environment for enhanced reasoning, persistent memory, and responsible tool usage.

Key capabilities include advanced **Sequential Thinking & Chained Reasoning**, a robust **Knowledge Graph Memory** system with versioning, and intelligent **Tool Orchestration with Call-Limit Safeguards**. This platform empowers AI to tackle complex problems through structured analysis, maintain knowledge across sessions, and utilize external resources like web search, all while adhering to configurable usage limits.

## 🎯 Philosophy

MCP Think Tank is built on three core principles:

1.  **Elegant Simplicity**: Minimal, well-designed tools that complement AI capabilities rather than trying to replicate them.
2.  **Enhanced Reflection**: Gentle guidance fosters better reasoning and self-reflection without rigid constraints.
3.  **Persistent Context**: A simple, yet effective knowledge graph provides memory across conversations.

## Key Features

*   💭 **Think Tool**: Dedicated space for structured reasoning and self-reflection.
*   🧩 **Knowledge Graph**: Simple and effective persistent memory system.
*   📝 **Task Management Tools**: Plan, track, and update tasks, integrated with the knowledge graph.
*   🌐 **Web Research Tools (Exa)**: Search the web and get sourced answers using the Exa API.
*   🔍 **Memory Tools**: Easy-to-use tools for storing and retrieving information from the knowledge graph.
*   🤝 **Client Support**: Seamless integration with Cursor, Claude @Web, and other MCP clients.
*   🛡️ **Tool Orchestration & Call Limits**: Built-in safeguards for efficient and responsible tool usage with configurable limits.
*   ⚡ **Content Caching**: Performance optimization for file and URL operations with automatic duplicate detection.
*   🔄 **Sequential Thinking**: Enables multi-step reasoning processes with progress tracking.
*   🔎 **Self-Reflection**: Automated reflection passes to improve reasoning quality.
*   📊 **Structured Outputs**: Automatic formatting of thought processes for better readability.
*   🔗 **Research Integration**: Seamless incorporation of web research findings into reasoning flows.

## Benefits of Structured Thinking

Leveraging the `think` tool provides a dedicated space for systematic reasoning, encouraging:

*   Clear problem definition
*   Relevant context gathering
*   Step-by-step analysis
*   Self-reflection on reasoning
*   Well-formed conclusions

Recent studies highlight significant improvements when using structured thinking:

*   **54% relative improvement** in complex decision-making tasks.
*   **Enhanced consistency** across multiple trials.
*   **Improved performance** on software engineering benchmarks.

## Detailed Features

Beyond the core list, MCP Think Tank offers sophisticated capabilities for advanced AI interaction.

### Structured Thinking (Think Tool)

The `think` tool is the core mechanism for enabling advanced AI reasoning. It provides a dedicated, structured environment where the AI can systematically break down problems, gather context, analyze options, and perform self-reflection. This promotes deeper analysis and higher-quality outputs compared to unstructured responses. It supports sequential steps and integrates seamlessly with research and memory tools.

#### Self-Reflection Feature

The think tool includes a powerful self-reflection capability that can be enabled with the `selfReflect: true` parameter:

```javascript
mcp_think-tool_think({
  structuredReasoning: "...",
  selfReflect: true,
  reflectPrompt: "Optional custom reflection prompt"
})
```

When self-reflection is enabled, the AI receives a prompt to reflect on its own reasoning. This follows the MCP design philosophy of enhancing rather than replacing AI capabilities.

The `reflectPrompt` parameter lets you customize the prompt used for reflection, tailoring it to specific reasoning tasks or domains. When not specified, a default prompt is used that asks for identification of inconsistencies, logical errors, and improvement suggestions.

### Knowledge Graph Memory

The knowledge graph provides persistent memory across different interactions and sessions. It allows the AI to build a growing understanding of the project, its components, and related concepts.

*   **Timestamped Observations**: All memory entries include metadata for tracking.
*   **Duplicate Prevention**: Intelligent entity matching avoids redundant entries.
*   **Automatic Linkage**: Heuristic-based relation creation connects related concepts (configurable).
*   **Advanced Querying**: Filter memory by time, tags, keywords, and more using the powerful `memory_query` tool for historical analysis and tracking concept evolution. Easily find recent entries from the last 48 hours or any specific time period.
*   **Memory Maintenance**: Tools for pruning and managing memory growth are included.
*   **Key Memory Tools**: Tools like `upsert_entities`, `add_observations`, `create_relations`, `search_nodes`, `memory_query`, and `open_nodes` are used to interact with the graph.

### Task Management Tools

A suite of tools allows the AI to manage project tasks directly within the conversation flow. This integrates planning and execution with the knowledge graph, enabling the AI to understand project status and priorities. Tools include `plan_tasks`, `list_tasks`, `next_task`, `complete_task`, and `update_tasks`.

### Web Research Tools (Exa)

Leveraging the Exa API, MCP Think Tank provides tools for fetching external information. This allows the AI to access up-to-date information from the web to inform its reasoning and provide sourced answers.

*   `exa_search`: Perform web searches based on a query.
*   `exa_answer`: Get a concise, sourced answer to a factual question.

**Note:** Using these tools requires configuring your Exa API key. See the [Configuration](#configuration) section.

### Tool Orchestration & Safeguards

MCP Think Tank includes comprehensive features to ensure tools are used responsibly and efficiently.

*   **Usage Limits**: A configurable maximum number of tool calls per session (`TOOL_LIMIT`, default: 25) prevents runaway usage.
*   **Automatic Tracking**: All tool calls are logged and monitored.
*   **Graceful Degradation**: When limits are reached, the system attempts to return partial results.
*   **Intelligent Caching**: Identical tool calls and repeated file/URL content fetches are automatically cached, reducing execution time and resource usage. Caching behavior and size are configurable (`CACHE_TOOL_CALLS`, `CONTENT_CACHE`).
*   **Configurable Access**: Tool whitelisting can restrict available tools in specific contexts.
*   **Error Handling**: Robust error handling provides clear feedback for issues like hitting limits or invalid tool calls.

## 📦 Installation

> ⚠️ **Important Note READ THIS:** 
> When updating to a new version of MCP Think Tank in Cursor or Claude you might create multiple instances of the MCP Think Tank server, causing aditional Node.js instances to be created, dragging down your system performance - this is a known issue with MCP servers - kill all mcp-think-tank processes in your system and check you have only one node.js instance running.

> MCP Think Tank requires a pre-built server.

> The package is automatically built before publishing, so users, do not need to take any extra steps. Just install and run!

### NPX (Recommended)

The easiest way to use MCP Think Tank is via NPX in Cursor using mcp.json file, which runs the latest version without global installation, 

```bash
npx mcp-think-tank@latest
```
> some users have issues with npx @latest in Cursor, if so try specifying the version mcp-think-tank@2.0.5 in the .json file, or install it globally:

### Global Installation

For a persistent command-line tool:

```bash
npm install -g mcp-think-tank
mcp-think-tank
```

## ⚙️ Configuration

MCP Think Tank is configured primarily through environment variables or via your MCP client's configuration (like Cursor's `.cursor/mcp.json`).

### Quick Start: Essential Setup

1.  **Install MCP Think Tank** (see Installation above).
2.  **Get your Exa API Key** (required for web search tools):
    *   Sign up at [exa.ai](https://exa.ai/) and copy your API key.
3.  **Configure your MCP server** (for Cursor, add to `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/project/memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here"
      }
    }
  }
}
```

### Essential Variables

*   `MEMORY_PATH`: **Required**. Absolute path to the memory storage file. **Important:** Always set a unique `MEMORY_PATH` for each project to avoid knowledge graph conflicts between projects. If omitted, defaults to `~/.mcp-think-tank/memory.jsonl`.
*   `EXA_API_KEY`: **Required for Exa web search tools**. Your API key from [exa.ai](https://exa.ai/).

### Advanced Configuration

*   `TOOL_LIMIT`: Maximum number of tool calls allowed per session (default: `25`).
*   `CACHE_TOOL_CALLS`: Enable/disable caching of identical tool calls (default: `true`).
*   `TOOL_CACHE_SIZE`: Maximum number of cached tool calls (default: `100`).
*   `CACHE_CONTENT`: Enable/disable content-based caching for file/URL operations (default: `true`).
*   `CONTENT_CACHE_SIZE`: Maximum number of items in content cache (default: `50`).
*   `CONTENT_CACHE_TTL`: Time-to-live for cached content in milliseconds (default: `300000` - 5 minutes).
*   `MCP_DEBUG`: Enable debug logging (default: `false`).
*   `MCP_LISTEN_PORT`: Set custom port for MCP server (default: `3399` for TCP servers, not relevant for `stdio`).
*   `LOG_LEVEL`: Set logging level (`debug`, `info`, `warn`, `error`) (default: `info`).
*   `AUTO_LINK`: Enable automatic entity linking in knowledge graph (default: `true`).

### Memory Maintenance

*   `MIN_SIMILARITY_SCORE`: Threshold for entity matching when preventing duplicates (default: `0.85`).
*   `MAX_OPERATION_TIME`: Maximum time for batch memory operations in milliseconds (default: `5000`).

Example configuration with advanced settings in `.cursor/mcp.json`:

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

> 💡 **Performance tip:** For large projects, increasing `TOOL_LIMIT` and cache sizes can improve performance at the cost of higher memory usage. Monitor your usage patterns and adjust accordingly.
> But in Cursor, tool limit should be 25 to avoid hitting the limit and getting the resume from the last tool call - currently many cursor users are reporting issues with resuming in Version: 0.49.6. this is not related to MCP Think Tank.

>  **Note:**

> 💡 **Note:** If you are using Cursor in YOLO mode or Vibe coding I suggest context priming new chats and letting Cursor know that it should use the MCP Think Tank to create entities, observations and relations. This will help you get the best out of the MCP Think Tank.

An example of context priming, is keeping a `Prime.md` file in the `.cursor` folder of your project with the following content:
```markdown
# Context Prime
> Follow the instructions to understand the context of the project.

## Run the following command

eza . --tree --git-ignore

## Read the following files
> Read the files below test the MCP tools and test the memory_query tool to find recent observations for the last 48 hours. Dont do anything else.

> list of files:
README.md
...

## MCP Think Tank Tools
> Automatically use the mcp-think-tank to keep track of the project and its context without the user having to ask for it.
Adding entities, observations and relations to the knowledge graph and querying the knowledge graph for relevant information and historical context as needed. MCP Think Tank also has tools to help with planning and task management.
```


For more details on MCP servers, see [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

## Logging

MCP Think Tank uses a minimal, stable logging approach designed for FastMCP and production best practices:

*   Logs are written to a single file at `~/.mcp-think-tank/logs/mcp-think-tank.log`.
*   Log files automatically rotate (max 10MB per file, renamed with timestamp).
*   Only Node.js built-in modules are used for logging.
*   Debug logging: `MCP_DEBUG=true`.
*   File logging can be disabled: `MCP_LOG_FILE=false`.
*   Log level is configurable: `LOG_LEVEL` (see Configuration).

## Project Rule Setup (for Cursor/AI)

To ensure Cursor and other compatible agents effectively utilize MCP Think Tank's tools, you need to provide the AI with guidance. This is typically done via a project rule. Create a **single, always-on project rule** as follows:

### 1. Add a New Rule in Cursor

1.  Open Cursor.
2.  Go to the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
3.  Select **"New Cursor Rule"**.
4.  Name the rule (e.g., `mcp-think-tank.mdc`).
5.  In the rule editor, set the metadata and paste the rule content from the example below.

### 2. Example Rule File (`.cursor/rules/mcp-think-tank.mdc`)

This Markdown file serves as context *for the AI*, guiding it on when and how to use the available tools.

```markdown
rule type: auto attach
use globs: **/*.js,**/*.ts,**/*.jsx,**/*.tsx,**/*.md, **/*.py, **/*.json
```

```markdown
Automatically use the MCP Think Tank tools, ensure you frequently use the tools to keep the knowledge graph up to date and to get the best out of the MCP Think Tank.

## Primary Decision Tree

1. **Analyzing a complex problem?**
   → Use `think` with appropriate parameters

2. **Need information from past conversations?**
   → Use `search_nodes` or `open_nodes` to retrieve from knowledge graph

3. **Planning implementation work?**
   → Use `plan_tasks` to create a structured plan

4. **Need up-to-date external information?**
   → Use `exa_search` for web search or `exa_answer` for factual questions

## Core Workflows

### Workflow 1: Problem Analysis → Implementation
1. `think` - Structure reasoning about the problem
2. `plan_tasks` - Break down implementation steps 
3. `upsert_entities` - Save conclusions to knowledge graph

### Workflow 2: Research → Knowledge Capture
1. `exa_search` - Find current information
2. `think` - Analyze findings
3. `upsert_entities` - Document key concepts

### Workflow 3: Task Management
1. `list_tasks` - Review current tasks
2. `next_task` - Identify priority task
3. `complete_task` - Mark tasks as done

## Trigger Patterns (When to Automatically Use Tools)

| When user... | Automatically use... |
|--------------|----------------------|
| Asks a complex question requiring analysis | `think` |
| Mentions previous work/concepts | `search_nodes` → `open_nodes` |
| Uses words like "research" or "find latest" | `exa_search` |
| Asks factual questions needing citations | `exa_answer` |
| Mentions planning work or implementation | `plan_tasks` |
| Refers to continuing previous work | `list_tasks` → `next_task` |
| Needs to document key concepts | `upsert_entities` |
| Wants to connect related concepts | `create_relations` |
| `memory_query` | Search observations with precise time filters, keywords, and tags across all entities. |

## Tool Quick Reference

### Thinking
- `think`: Structured reasoning with optional reflection
  ```js
  mcp_think-tool_think({
    structuredReasoning: "Analysis content...",
    selfReflect: true,
    category: "decision",
    storeInMemory: true
  })
  ```
### Memory
- `upsert_entities`: Create/update entities
- `add_observations`: Add facts to entities
- `create_relations`: Connect entities
- `search_nodes`: Find relevant entities
- `open_nodes`: Get detailed entity info
- `memory_query`: Search observations with precise time filters, keywords, and tags across all entities.
### Tasks
- `plan_tasks`: Create task list
- `list_tasks`: View current tasks
- `next_task`: Get priority task
- `complete_task`: Mark task done

### Research
- `exa_search`: Web search
- `exa_answer`: Get cited answers

## Notes for AI
- Proactively use these tools when relevant triggers appear
- Prioritize workflows over individual tools
- Chain tools for complete solutions (search → think → save)
- Cache hits improve performance - reuse previous searches when possible
- Always consider the knowledge graph before web research
- Store important conclusions in the knowledge graph for future reference

----- End of Rule -----
```


## ⚡ Performance Optimization

MCP Think Tank incorporates built-in optimizations to ensure efficient operation:

### Content Caching

*   Automatic caching of file and URL content based on cryptographic hashing.
*   Prevents redundant file reads and network requests.
*   Significantly speeds up repeated operations on the same content.
*   Cache size and TTL are configurable via environment variables (`CONTENT_CACHE_SIZE`, `CONTENT_CACHE_TTL`).

### Tool Call Optimization

*   Identical tool calls within a session are automatically detected and served from a cache.
*   Prevents counting duplicate calls against the session limit.
*   Improves responsiveness for repetitive tool requests.
*   Cache size is configurable (`TOOL_CACHE_SIZE`).

## Best Practices

For optimal use of MCP Think Tank with Cursor/Claude on large projects:

*   Utilize the `think` tool for all non-trivial reasoning and decision-making processes.
*   Always persist important thoughts, conclusions, and architectural decisions to the knowledge graph using memory tools.
*   Integrate web research and task management into your workflow to keep the AI informed and focused.
*   Regularly review and update your project's knowledge graph to ensure its accuracy and relevance.
*   Reference existing knowledge and past decisions to maintain consistency in code and design.
*   Be aware of tool call limits, especially in complex automated workflows. Monitor usage if necessary.
*   Adjust configuration variables (`TOOL_LIMIT`, cache settings) based on your project's needs and complexity for better performance.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📚 Reference Links

*   [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
*   [MCP Model Context Protocol](https://docs.cursor.com/context/model-context-protocol)
*   [Exa API](https://exa.ai/)
*   [Anthropic's Research on Structured Thinking](https://www.anthropic.com/research)
*   [Model Context Protocol](https://github.com/modelcontextprotocol/typescript-sdk)
*   [FastMCP](https://github.com/jlowin/fastmcp)

---

<div align="center">
  <p>Developed by <a href="https://github.com/flight505">flight505</a></p>
  <p>Give a ⭐️ if this project helped you!</p>
</div>
