# MCP Think Tank

<div align="center">
  
![MCP Think Tank](https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/think-banner.png)

[![npm version](https://img.shields.io/npm/v/mcp-think-tank.svg?style=flat-square)](https://www.npmjs.com/package/mcp-think-tank)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Claude Compatibility](https://img.shields.io/badge/Claude-Compatible-9370DB.svg)](https://www.anthropic.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Tank-orange.svg)](https://github.com/modelcontextprotocol)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## Overview

MCP Think Tank provides Claude with a dedicated space for structured reasoning in complex scenarios, allowing the model to systematically work through problems with enhanced deliberation. This implementation includes persistent memory capabilities through a knowledge graph, enabling recall and connections between previously encountered information.

## 🧠 The Power of Structured Reasoning

Recent studies by Anthropic demonstrate remarkable improvements when using the "think" tool:

- **54% relative improvement** in the airline domain (0.570 vs. 0.370 on pass^1 metric)
- **Significantly better performance** in the retail domain (0.812 vs. 0.783 baseline)
- **Enhanced consistency** across multiple trials of the same task
- **Improved performance** on software engineering benchmarks
- **1.6% average improvement** on SWE-Bench, contributing to Claude 3.7 Sonnet's state-of-the-art score of 0.623

## 🚀 Key Features

- 💭 **Structured Thinking**: Dedicated space for step-by-step reasoning
- 🧩 **Knowledge Graph Memory**: Persistent, relationship-based memory storage
- 🔍 **Text Search**: Find relevant information using text-based queries
- 🤝 **Client Support**: Works with Claude, Cursor, and other MCP clients
- 🛠️ **Tool Optimization**: Batched processing for efficient operations

## 📦 Installation

### NPX (Recommended)

The easiest way to use MCP Think Tank is via NPX:

```bash
npx mcp-think-tank
```

### Global Installation

```bash
npm install -g mcp-think-tank
mcp-think-tank
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

### Memory Path Configuration

By default, the knowledge graph is stored in `~/.mcp-think-tank/memory.jsonl`. For custom paths, always use absolute paths:

```bash
mcp-think-tank --memory-path=/absolute/path/to/your/memory.json
```

## 🔌 Client Integration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-tank"
    }
  }
}
```

Important notes:
- Use absolute paths for any file references
- The server inherits only basic environment variables (USER, HOME, PATH)
- For custom environment variables, use the `env` field:
```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-tank",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Cursor

In Cursor's MCP Server settings:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio"
    }
  }
}
```

## 🔍 Debugging

To view server logs:
```bash
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log
```

Common issues to check:
1. Working directory issues - use absolute paths
2. Missing environment variables
3. Permission problems
4. Invalid configuration syntax

## 🧰 Available Tools

The server provides the following MCP tools:

### Think Tool
- `think`: Create a dedicated space for structured reasoning during complex tasks

### Memory Tools
- `create_entities`: Create new entities in the knowledge graph
- `create_relations`: Create relationships between entities
- `add_observations`: Add new observations to existing entities
- `update_entities`: Update existing entity properties
- `update_relations`: Update existing relationships
- `delete_entities`: Remove entities from the knowledge graph
- `delete_observations`: Remove specific observations from entities
- `delete_relations`: Remove relationships between entities
- `read_graph`: Get the entire knowledge graph
- `open_nodes`: Retrieve specific entities by name
- `search_nodes`: Find entities using text-based search

## 🧠 How it Works

1. **Dedicated Reasoning Space**: The `think` tool provides Claude with a dedicated space to think through complex problems systematically.

2. **Knowledge Storage**: Information is stored in a knowledge graph consisting of:
   - **Entities**: Named items with properties and observations
   - **Relations**: Connections between entities

3. **Text Search**: Find relevant information using text-based queries.

4. **Persistence**: All information remains available across sessions through file-based storage.

## 📝 Example Usage

Working with the think tool:

```
I need to think about how to solve this complex algorithm problem.

[Claude calls the think tool]

Problem definition: We need to find an efficient algorithm for finding the shortest path between two points in a weighted graph.

Relevant facts/context:
- Dijkstra's algorithm works for graphs with non-negative weights
- Bellman-Ford can handle negative weights but is slower
- A* is more efficient when a good heuristic is available
- We need to consider time complexity and space requirements

Analysis steps:
1. If all weights are non-negative, Dijkstra's algorithm is optimal with O((V+E)logV) time complexity
2. If negative weights exist, Bellman-Ford is required but has O(VE) complexity
3. If we have a good distance heuristic, A* can improve performance
4. For extremely large graphs, we might need approximation algorithms

Conclusion/decision:
The best approach is to start with Dijkstra's algorithm implemented with a priority queue for its balance of efficiency and simplicity. For special cases with negative weights, we can fall back to Bellman-Ford.
```

Working with the knowledge graph:

```
Let me create some entities about scientists and their discoveries:

[Claude calls create_entities]

Now let's create relations between our scientists and discoveries:

[Claude calls create_relations]

Let's search for information about "quantum physics":

[Claude calls search_nodes]
```

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

---

<div align="center">
  <p>Developed by <a href="https://github.com/flight505">flight505</a></p>
  <p>Give a ⭐️ if this project helped you!</p>
</div>