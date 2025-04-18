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

## 📦 Installation

> ⚠️ **Important:**
> MCP Think Tank requires a pre-built server. Do **not** use on-the-fly TypeScript compilation. Always ensure `dist/server.js` exists before running. Use the `--built` flag if available, and do not use `npx mcp-think-tank` without a pre-built dist.

### NPX (Recommended)

The easiest way to use MCP Think Tank is via NPX:

```bash
npx mcp-think-tank@1.3.3 --built
```

### Global Installation

```bash
npm install -g mcp-think-tank@1.3.3
mcp-think-tank --built
```

### Unix-based Systems (MacOS/Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/flight505/mcp-think-tank/main/install.sh | bash
```

### Windows

```bash
curl -o install.bat https://raw.githubusercontent.com/flight505/mcp-think-tank/main/install.bat && install.bat
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
- Before each log write, the file size is checked. If it exceeds 10MB, the log file is deleted and a new one is started.
- No log rotation, backups, or extra dependencies are used—only Node.js built-in modules.
- This ensures logs never grow unbounded, prevents disk exhaustion, and keeps logging simple and reliable.

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

```mdc
---
description: >
  Unified guidance for using MCP Think Tank tools in this project.
  Always apply this rule to provide agents and users with structured reasoning, memory, task management, and research capabilities.
globs: 
alwaysApply: true
---

# MCP Think Tank: Unified Project Rule

This project uses MCP Think Tank for structured reasoning, persistent memory, advanced task management, and web research.  
**All agents and users should follow these guidelines to ensure consistent, effective use of the MCP server and its tools.**

---

## 1. Thinking & Reasoning

- Use the `think` tool for all complex decisions, architecture planning, and problem-solving.
- Break down problems into clear steps and reflect on reasoning.
- Store important decisions and patterns in memory for future reference.

## 2. Memory & Knowledge Graph

- Use memory tools (`create_entities`, `add_observations`, `create_relations`, etc.) to:
  - Commit key decisions, reusable patterns, and architectural choices.
  - Build relationships between concepts and reference previous knowledge.
- Before creating new solutions, search memory for relevant prior work.

## 3. Task Management

- Use the task tools (`plan_tasks`, `list_tasks`, `next_task`, `complete_task`, `update_tasks`) to:
  - Plan, track, and update project tasks.
  - Mark tasks as complete when finished and update their status as work progresses.
  - Use task dependencies and priorities to organize work.

## 4. Web Research

- Use the Exa tools (`exa_search`, `exa_answer`) for all web research and fact-finding.
- Always cite sources and summarize findings in memory when relevant.
- **Note:** Exa tools require a valid `EXA_API_KEY` in your MCP server configuration.

## 5. Logging & Debugging

- Use the logging system for all operational events.
- Check logs for troubleshooting and ensure log rotation is configured.

## 6. General Workflow

- Reference and build upon previous decisions and patterns.
- Document all significant changes and rationale.
- Maintain consistent coding and architectural patterns.
- Update this rule as new tools or workflows are added.

---

## 🛠️ Available Tools (with Example Usage)

| Tool         | Purpose                                      | Example Usage                                                                 |
|--------------|----------------------------------------------|-------------------------------------------------------------------------------|
| `think`      | Structured reasoning & reflection            | `think("Design auth system for microservices...")`                            |
| `create_entities` | Add new concepts to memory              | `create_entities([{name: "AuthSystem", ...}])`                                |
| `add_observations` | Add facts to existing entities         | `add_observations([{entityName: "AuthSystem", contents: ["Uses JWT"]}])`      |
| `create_relations` | Link concepts in the knowledge graph   | `create_relations([{from: "AuthSystem", to: "Security", relationType: "enhances"}])` |
| `plan_tasks` | Create multiple project tasks                | `plan_tasks([{description: "Implement login", priority: "high"}])`            |
| `list_tasks` | List tasks by status/priority                | `list_tasks({status: "todo"})`                                                |
| `next_task`  | Get and start the next highest priority task | `next_task({})`                                                               |
| `complete_task` | Mark a task as done                       | `complete_task({id: "task-uuid"})`                                            |
| `exa_search` | Web search via Exa API                       | `exa_search({query: "latest in LLMs"})`                                       |
| `exa_answer` | Get sourced answers from the web             | `exa_answer({question: "What is quantum advantage?"})`                        |

---

## 🤖 Agent/IDE Instructions

- When a user requests research, use `exa_search` or `exa_answer`.
- For complex reasoning, always use the `think` tool and commit important findings to memory.
- Use task tools to manage and update project tasks.
- Reference memory before proposing new solutions.
- Follow the workflow and update this rule as needed.

---

**Keep this rule up to date as new tools or workflows are added.**
```

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