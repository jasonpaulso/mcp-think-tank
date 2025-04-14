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
[![Claude Compatibility](https://img.shields.io/badge/Claude-Compatible-9370DB.svg)](https://www.anthropic.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Tank-orange.svg)](https://github.com/modelcontextprotocol)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## Overview

MCP Think Tank provides Claude with a dedicated space for structured reasoning and self-reflection. Through elegant simplicity, it enhances Claude's natural capabilities for systematic problem-solving while maintaining persistent memory through a knowledge graph.

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
- 🔍 **Memory Tools**: Easy-to-use tools for storing and retrieving information
- 🤝 **Client Support**: Seamless integration with Claude, Cursor, and other MCP clients

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

By default, the knowledge graph is stored in `~/.mcp-think-tank/memory.jsonl`. For custom paths, you can:

1. Use command-line arguments:
```bash
mcp-think-tank --memory-path=/absolute/path/to/your/memory.jsonl
```

2. Set the MEMORY_PATH environment variable:
```bash
MEMORY_PATH=/absolute/path/to/your/memory.jsonl mcp-think-tank
```

3. Configure in your MCP client configuration:

#### Cursor Example

In your `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "think-tool": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank"],
      "type": "stdio",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/memory.jsonl"
      },
      "enabled": true
    }
  }
}
```

#### Claude Desktop Example

In your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-tank",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/memory.jsonl" 
      }
    }
  }
}
```

**Important Notes:**
- Always use absolute paths for file references
- The directory will be created automatically if it doesn't exist
- If the file doesn't exist, an empty knowledge graph will be initialized
- The `.jsonl` extension is recommended for the storage file

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

### Think Tool
The core tool for structured reasoning:

```typescript
think(structuredReasoning: string, options?: {
  category?: string,
  tags?: string[],
  associateWithEntity?: string,
  storeInMemory?: boolean
})
```

The tool provides a dedicated space for systematic thinking, encouraging:
- Problem definition
- Context gathering
- Analysis steps
- Self-reflection
- Clear conclusions

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

## 📝 Example Usage

Here's how the think tool enables better reasoning through gentle guidance:

```
I need to evaluate different approaches for implementing a caching system.

[Claude uses the think tool]

Problem Definition:
Need to design an efficient caching system for a high-traffic web application.

Relevant Context:
- Current system serves 100K requests per minute
- Cache hit rate needs improvement
- Memory constraints: 8GB available
- Existing implementation uses simple LRU

Analysis Steps:
1. Evaluated different caching strategies:
   - LRU: Simple but not always optimal
   - LFU: Better for stable access patterns
   - ARC: Adaptive but more complex
   - W-TinyLFU: Modern, efficient approach

2. Considered implementation factors:
   - Memory overhead per entry
   - Concurrency requirements
   - Maintenance complexity
   - Integration effort

Self-Reflection:
I notice I initially focused too much on algorithmic efficiency without considering operational complexity. The best solution isn't always the most sophisticated one - sometimes a well-implemented simple approach is better than a complex one that's hard to maintain.

Conclusion:
Recommend staying with an enhanced LRU implementation:
1. Add size-aware eviction
2. Implement concurrent access
3. Add basic statistics tracking
This balances performance improvements with maintainability and operational simplicity.
```

This example demonstrates how the think tool's gentle guidance encourages:
- Clear problem structuring
- Comprehensive context consideration
- Systematic analysis
- Valuable self-reflection
- Well-reasoned conclusions

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