# MCP Think Server

<div align="center">
  
![MCP Think Server](https://raw.githubusercontent.com/flight505/mcp-think-server/main/assets/think-banner.png)

[![npm version](https://img.shields.io/npm/v/mcp-think-server.svg?style=flat-square)](https://www.npmjs.com/package/mcp-think-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Claude Compatibility](https://img.shields.io/badge/Claude-Compatible-9370DB.svg)](https://www.anthropic.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-orange.svg)](https://github.com/modelcontextprotocol)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Voyage AI](https://img.shields.io/badge/Voyage_AI-Powered-blue.svg)](https://voyageai.com/)

</div>

## Overview

MCP Think Server provides Claude with a dedicated space for structured reasoning in complex scenarios, allowing the model to systematically work through problems with enhanced deliberation. This implementation includes persistent memory capabilities through a knowledge graph, enabling recall and connections between previously encountered information.

## 🧠 The Power of Structured Reasoning

Recent studies by Anthropic demonstrate remarkable improvements when using the "think" tool:

- **54% relative improvement** in the airline domain (0.570 vs. 0.370 on pass^1 metric)
- **Significantly better performance** in the retail domain (0.812 vs. 0.783 baseline)
- **Enhanced consistency** across multiple trials of the same task
- **Improved performance** on software engineering benchmarks
- **1.6% average improvement** on SWE-Bench, contributing to Claude 3.7 Sonnet's state-of-the-art score of 0.623

The "think" tool creates a dedicated space for Claude to reason explicitly about complex problems, improving both accuracy and consistency when handling challenging tasks.

## 🚀 Key Features

- 💭 **Structured Thinking**: Dedicated space for step-by-step reasoning
- 🧩 **Knowledge Graph Memory**: Persistent, relationship-based memory storage
- 🔍 **Semantic Search**: Find relevant information using natural language queries
- 🔄 **Extended Timeout**: Configurable timeout settings to prevent disconnections
- 🤝 **Client Support**: Works with Claude, Cursor, and other MCP clients
- 🛠️ **Tool Optimization**: Batched processing and efficient embedding generation
- 📊 **Voyage AI Integration**: High-quality embedding model for semantic search

## 📦 Installation

### NPX (Recommended)

The easiest way to use MCP Think Server is via NPX:

```bash
npx mcp-think-server
```

With custom options:
```bash
npx mcp-think-server --request-timeout=300 --memory-path=/custom/path/memory.jsonl
```

### Global Installation

```bash
npm install -g mcp-think-server
mcp-think-server
```

### Unix-based Systems (MacOS/Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/flight505/mcp-think-server/main/install.sh | bash
```

### Windows

```bash
curl -o install.bat https://raw.githubusercontent.com/flight505/mcp-think-server/main/install.bat && install.bat
```

## ⚙️ Configuration

### Quick Start

For immediate use with default settings:

```bash
npx mcp-think-server
```

### Memory Path Configuration

By default, the knowledge graph is stored in `~/.mcp-think-server/memory.jsonl`. You can specify a custom path:

```bash
mcp-think-server --memory-path=/path/to/your/memory.json
```

### Request Timeout Configuration

Configure timeouts to prevent client disconnections during long-running operations:

```bash
# Set timeout to 10 minutes (600 seconds)
REQUEST_TIMEOUT=600 mcp-think-server

# Or via command line
mcp-think-server --request-timeout=600
```

### Embedding Configuration

Configure the semantic search embedding model (Voyage AI):

```bash
# Set API key
VOYAGE_API_KEY=your_api_key mcp-think-server

# Set specific model
EMBEDDING_MODEL=voyage-3-large mcp-think-server

# Set embedding dimensions
EMBEDDING_DIMENSIONS=1024 mcp-think-server
```

## 🔌 Client Integration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-server",
      "env": {
        "REQUEST_TIMEOUT": "300",
        "VOYAGE_API_KEY": "your_voyage_api_key"
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
      "args": ["-y", "mcp-think-server", "--request-timeout=300"],
      "type": "stdio"
    }
  }
}
```

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
- `semantic_search`: Find entities using semantic similarity
- `generate_embeddings`: Generate embeddings for all entities

## 🧠 How it Works

1. **Dedicated Reasoning Space**: The `think` tool provides Claude with a dedicated space to think through complex problems systematically.

2. **Knowledge Storage**: Information is stored in a knowledge graph consisting of:
   - **Entities**: Named items with properties and observations
   - **Relations**: Connections between entities
   - **Embeddings**: Vector representations for semantic search

3. **Semantic Search**: Find relevant information using natural language queries powered by Voyage AI's embeddings.

4. **Persistence**: All information remains available across sessions through file-based storage.

## 📊 Performance Optimization

The server includes several optimizations:

- **Extended timeouts**: Prevent disconnections during complex operations
- **Batched processing**: Efficiently handle large numbers of entities
- **Embedding caching**: Avoid regenerating embeddings for known entities
- **Progressive feedback**: Detailed progress information for long-running tasks

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

Let's use semantic search to find information related to "quantum physics":

[Claude calls semantic_search]
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
