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
rule type: always
---

# MCP Think Tank - Enhance Your AI Agent's Capabilities

This project uses MCP Think Tank to extend your AI assistant with structured reasoning, persistent memory, task management, and web research capabilities. All agents should follow these guidelines to leverage these powerful tools.

## 🧠 Tool Categories & When To Use Them

### 1️⃣ Thinking Tools
- `think` - Use for complex reasoning, architecture planning, and step-by-step problem-solving
  - **When to use**: For important decisions requiring structured analysis or reflection
  - **Pro tip**: Add `storeInMemory: true` to save important thoughts in the knowledge graph
  - **Example**: `think({structuredReasoning: "Analyzing pros/cons of database options...", storeInMemory: true})`

### 2️⃣ Memory & Knowledge Graph
- `create_entities` - Add new concepts to the knowledge graph
  - **When to use**: To document important concepts, systems, or components
  - **Example**: `create_entities([{name: "AuthSystem", entityType: "System", observations: ["Uses JWT"]}])`

- `add_observations` - Add facts to existing entities
  - **When to use**: When new information about an existing entity is discovered
  - **Example**: `add_observations([{entityName: "AuthSystem", contents: ["Expires tokens after 24h"]}])`

- `create_relations` - Create relationships between entities
  - **When to use**: To connect related concepts in the knowledge graph
  - **Example**: `create_relations([{from: "AuthSystem", to: "Security", relationType: "enhances"}])`

- `read_graph` - Get the entire knowledge graph
  - **When to use**: To understand the full project context before making major decisions

- `search_nodes` - Find entities matching search criteria
  - **When to use**: To retrieve relevant knowledge before solving a problem
  - **Example**: `search_nodes({query: "authentication"})`

- `open_nodes` - Retrieve specific entities by name
  - **When to use**: When you need details about a specific known entity
  - **Example**: `open_nodes({names: ["AuthSystem"]})`

- `update_entities` - Modify existing entities
  - **When to use**: When core information about an entity changes
  - **Example**: `update_entities([{name: "AuthSystem", entityType: "Security"}])`

- `update_relations` - Modify relationships between entities
  - **When to use**: When the nature of a relationship changes
  - **Example**: `update_relations([{from: "AuthSystem", to: "Security", relationType: "implements"}])`

- `delete_entities` - Remove entities from the knowledge graph
  - **When to use**: When concepts become obsolete or are merged
  - **Example**: `delete_entities({entityNames: ["OldSystem"]})`

- `delete_observations` - Remove specific facts from entities
  - **When to use**: When information becomes outdated or incorrect
  - **Example**: `delete_observations([{entityName: "AuthSystem", observations: ["Uses MD5"]}])`

- `delete_relations` - Remove relationships between entities
  - **When to use**: When connections are no longer valid
  - **Example**: `delete_relations([{from: "AuthSystem", to: "Legacy", relationType: "depends on"}])`

### 3️⃣ Task Management
- `plan_tasks` - Create and organize project tasks
  - **When to use**: At project start or when planning new features
  - **Example**: `plan_tasks([{description: "Implement login", priority: "high"}])`

- `list_tasks` - Retrieve tasks filtered by status/priority
  - **When to use**: To understand current work status
  - **Example**: `list_tasks({status: "todo"})`

- `next_task` - Get and start the highest priority task
  - **When to use**: When ready to work on the next priority
  - **Example**: `next_task({random_string: ""})`

- `complete_task` - Mark tasks as done
  - **When to use**: When a task is finished
  - **Example**: `complete_task({id: "task-uuid"})`

- `update_tasks` - Modify existing tasks
  - **When to use**: When priorities change or task details need updating
  - **Example**: `update_tasks([{id: "task-uuid", priority: "high"}])`

- `show_memory_path` - Get the location of the knowledge graph file
  - **When to use**: For debugging or when examining stored knowledge directly
  - **Example**: `show_memory_path({random_string: ""})`

### 4️⃣ Web Research
- `exa_search` - Search the web for information
  - **When to use**: When current context is insufficient and you need external facts
  - **Example**: `exa_search({query: "latest React state management"})`

- `exa_answer` - Get sourced answers to specific questions
  - **When to use**: For factual questions requiring cited sources
  - **Example**: `exa_answer({question: "What is quantum computing?"})`

## 📋 Best Practices

### Thinking Process
- Use the `think` tool for all complex decisions to ensure thorough analysis
- Structure your reasoning with clear problem definition, context, analysis, and conclusion
- Set `storeInMemory: true` for important decisions that should be accessible later

### Knowledge Management
- Before creating new entities, search the graph for related concepts
- Create a clear entity type hierarchy and consistent naming
- Link related entities to build a comprehensive knowledge web
- Regularly update entities with new observations as the project evolves

### Task Workflow
1. Use `plan_tasks` to break down features into clear steps
2. Use `list_tasks` to review current priorities
3. Use `next_task` to identify what to work on next
4. Use `complete_task` when finished with an item
5. Use `update_tasks` to adjust priorities as needs change

### Research Protocol
- Always cite sources when using web research tools
- Save important findings to the knowledge graph
- Combine research with structured thinking for best results

## 📝 How To Save Important Thoughts

When using the `think` tool with important reasoning, set `storeInMemory: true` or simply tell the agent "Please save this reasoning in memory for future reference."

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

### 3. Task Manager Tools
- Use `plan_tasks` to create and organize project tasks.
- Use `list_tasks`, `next_task`, `complete_task`, and `update_tasks` to manage your workflow.
- All tasks are synchronized with the knowledge graph, enabling persistent, queryable project management.
- For large projects, leverage task dependencies and priorities to maintain clarity and momentum.

### 4. Memory Tools
- Use `create_entities`, `add_observations`, `create_relations`, and related tools to build and maintain your project's knowledge graph.
- Store key decisions, reusable patterns, and architectural choices for future reference.
- Before starting new work, search memory for relevant prior knowledge to avoid duplication and leverage past insights.

---

**Best Practices for Cursor/Claude and Large Projects:**
- Use the `think` tool liberally for all non-trivial reasoning and always persist important thoughts.
- Integrate research and task management into your coding workflow for seamless project development.
- Regularly review and update your knowledge graph to keep project memory relevant and actionable.
- Reference and build upon previous decisions and patterns for consistent, high-quality code.

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