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

3. In your MCP client configuration, create a new memory.jsonl file in the root of your project. If you don't, it will use the default memory.jsonl file across all projects, which can lead to suboptimal memories for each project.:

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

## 📝 Cursor Rules

To get the most out of MCP Think Tank, you can add custom rules to guide Cursor's behavior. Create these files in your `.cursor/rules` directory:

### Global Rules (instructions.mdc)

```markdown
# Global MCP Think Tank Instructions

You are working with a codebase that uses MCP Think Tank for enhanced reasoning and persistent memory. Follow these guidelines:

## Thinking Process
- Use structured reasoning for complex decisions
- Break down problems into clear steps
- Consider both immediate and long-term implications
- Reflect on your reasoning process

## Memory Usage
- Commit important decisions to memory
- Store reusable patterns and solutions
- Create meaningful relations between concepts
- Reference previous decisions when relevant

## Development Patterns
- Document architectural decisions with rationale
- Maintain consistent coding patterns
- Build on previous solutions
- Review and reflect on implementation choices

## Best Practices
- Start complex tasks with structured thinking
- Commit design decisions to memory
- Reference previous solutions before creating new ones
- Reflect on implementation choices
- Build relationships between related concepts

Remember to:
1. Think through complex problems systematically
2. Store important decisions and patterns
3. Reference and build upon previous knowledge
4. Reflect on and improve solutions
```

### Project-Specific Rules (project.mdc)

```markdown
# Project-Specific MCP Think Tank Guidelines

This project uses MCP Think Tank for maintaining consistent development patterns and architectural decisions.

## Development Workflow
1. Architecture Decisions:
   - Use structured thinking to evaluate options
   - Document decisions with clear rationale
   - Commit important decisions to memory
   - Create relations to existing patterns

2. Implementation:
   - Reference previous decisions
   - Maintain consistent patterns
   - Document key design choices
   - Reflect on trade-offs

3. Code Review:
   - Compare against stored patterns
   - Evaluate consistency with previous decisions
   - Consider long-term maintainability
   - Document significant changes

## Patterns to Maintain
- Store reusable code patterns
- Document component interfaces
- Track technical debt decisions
- Maintain dependency relationships

## Memory Guidelines
- Tag decisions with relevant categories
- Create meaningful entity relationships
- Add clear, actionable observations
- Update existing patterns when improved

Remember: Build on existing knowledge rather than reinventing solutions.
```

These rules help Cursor better assist you by:
- Encouraging systematic thinking
- Promoting consistent memory usage
- Maintaining development patterns
- Building on accumulated knowledge

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

### Logging Configuration

MCP Think Tank uses a dedicated logging system that writes to both a file and stderr (when debug mode is enabled). Logs are stored in `~/.mcp-think-tank/logs/mcp-think-tank.log`.

To enable debug logging, set the `MCP_DEBUG` environment variable:

```bash
MCP_DEBUG=true mcp-think-tank
```

Or in your configuration:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-tank",
      "env": {
        "MCP_DEBUG": "true"
      }
    }
  }
}
```

To view server logs:
```bash
tail -n 20 -F ~/.mcp-think-tank/logs/mcp-think-tank.log
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

### Task Management Tools
A set of tools for tracking and managing tasks within projects:

- `plan_tasks`: Create multiple tasks at once with automatic knowledge graph integration
```typescript
plan_tasks({
  tasks: [
    {
      description: "Implement user authentication",
      priority: "high",
      due: "2024-05-15T09:00:00Z",
      tags: ["auth", "security"]
    },
    {
      description: "Write documentation",
      priority: "medium",
      due: "2024-05-20T09:00:00Z"
    }
  ]
})
```

- `list_tasks`: Get tasks with optional filtering by status and priority
```typescript
list_tasks({
  status: "todo",
  priority: "high"
})
```

- `next_task`: Get the highest priority todo task and mark it as in-progress
```typescript
next_task({})
```

- `complete_task`: Mark a task as done
```typescript
complete_task({
  id: "task-uuid-here"
})
```

- `update_tasks`: Update multiple tasks in batch
```typescript
update_tasks({
  updates: [
    {
      id: "task-uuid-1",
      description: "Updated description",
      priority: "high"
    },
    {
      id: "task-uuid-2",
      status: "blocked"
    }
  ]
})
```

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

### Research Tools
- `exa_search`: Search the web using Exa API
```typescript
exa_search({
  query: "Latest advancements in LLM training",
  num_results: 5,
  category: "research paper",
  type: "neural"
})
```

- `exa_answer`: Get a sourced answer to a question
```typescript
exa_answer({
  question: "What are the latest developments in AI safety?",
  max_citations: 5
})
```

### Utility Tools
- `show_memory_path`: Get the absolute path of the active knowledge graph file

## 📝 Example Usage

Here's a series of examples showing how to effectively use the think and memory tools during development:

### 1. Making Architecture Decisions

```
User: I need to design the authentication system for our new microservices architecture. Please think through this and commit the decision to memory.

[Claude uses the think tool]

Problem Definition:
Design a secure, scalable authentication system for a microservices architecture.

Relevant Context:
- Multiple services need authentication
- Mix of internal and external clients
- Compliance requirements for sensitive data
- Need to support future service additions

Analysis Steps:
1. Authentication approaches:
   - Centralized auth service with JWT
   - Distributed auth with service mesh
   - Hybrid approach with cached tokens
   
2. Key considerations:
   - Token validation overhead
   - Service-to-service auth
   - Secret management
   - Scalability impact

Self-Reflection:
I notice I'm biasing towards complexity when simpler solutions might work. Let me reconsider from first principles.

Conclusion:
Recommend centralized auth service approach:
1. Single OAuth2/OIDC service with JWT
2. Redis-backed token cache
3. Service-specific public keys
4. Sidecar pattern for validation

[Claude commits to memory]
Creating entity 'AuthSystem' with observations about the decision and rationale...
Creating relations to 'Microservices' and 'Security' entities...
```

### 2. Implementation Reference

```
User: I'm starting to implement the auth service we discussed. Can you recall our architecture decision?

[Claude checks memory]
Found entity 'AuthSystem' with related decisions...

Based on our previous analysis, we decided on a centralized auth service using:
- OAuth2/OIDC protocol
- JWT tokens with service-specific signing
- Redis cache for token validation
- Sidecar pattern for service integration

Let me think through the implementation approach...

Problem Definition:
Plan the implementation phases for our chosen auth system.

Analysis Steps:
1. Core Components:
   ```typescript
   interface AuthService {
     issueToken(credentials: UserCredentials): Promise<JWT>;
     validateToken(token: string): Promise<TokenClaims>;
     rotateServiceKeys(): Promise<void>;
   }
   ```

2. Implementation Phases:
   - Core token issuance and validation
   - Redis cache integration
   - Service key management
   - Sidecar implementation

Self-Reflection:
The interface design aligns well with our architecture decision while keeping the implementation flexible.

[Claude commits implementation details to memory]
Adding observations to 'AuthSystem' about implementation structure...
```

### 3. Code Review and Reflection

```
User: Can you review this auth service implementation and reflect on how it aligns with our original design?

[Code shown...]

[Claude uses think tool]

Problem Definition:
Evaluate current implementation against our architectural decisions and best practices.

Relevant Context:
- Previous architecture decisions (loaded from memory)
- Implementation details (loaded from memory)
- Current code review

Analysis Steps:
1. Alignment Check:
   ✅ Centralized OAuth2 implementation
   ✅ JWT with proper signing
   ❌ Missing Redis cache integration
   ⚠️ Sidecar pattern partially implemented

2. Code Quality:
   - Good separation of concerns
   - Clear interface definitions
   - Missing error handling in key rotation
   - Need more logging for audit trail

Self-Reflection:
I see we've drifted from our original caching strategy. This could impact performance under load.

Conclusion:
Recommended changes:
1. Implement Redis cache as planned
2. Add comprehensive error handling
3. Enhance logging for security audit
4. Complete sidecar implementation

[Claude commits review findings]
Adding observations about implementation review...
Creating relation between 'AuthSystem' and 'CodeQuality'...
```

### 4. Using Accumulated Knowledge

```
User: We're seeing performance issues in the auth service. Can you think through potential optimizations based on our experience?

[Claude loads relevant memory entries]
Analyzing previous decisions, implementation details, and review findings...

Problem Definition:
Optimize auth service performance based on our accumulated knowledge.

Analysis Steps:
1. Known Issues (from memory):
   - Missing Redis cache implementation
   - Token validation overhead
   - Incomplete sidecar pattern

2. Performance Data:
   - High latency in token validation
   - Increased load on main auth service
   - Service-to-service call overhead

Self-Reflection:
Our original architecture correctly anticipated these issues, but we didn't fully implement the solutions.

Conclusion:
Prioritized optimizations:
1. Implement Redis cache (as originally planned):
   ```typescript
   class CachedAuthService implements AuthService {
     constructor(
       private redis: Redis,
       private tokenTTL: number
     ) {}

     async validateToken(token: string): Promise<TokenClaims> {
       const cached = await this.redis.get(token);
       if (cached) return JSON.parse(cached);
       
       const claims = await this.validateTokenSignature(token);
       await this.redis.setex(token, this.tokenTTL, JSON.stringify(claims));
       return claims;
     }
   }
   ```

2. Complete sidecar implementation for local validation
3. Add token pre-fetching for known high-traffic patterns

[Claude commits optimization details]
Adding observations about performance optimization...
Updating 'AuthSystem' entity with optimization findings...
```

### 5. Task Planning and Execution

```
User: I need to plan the development tasks for our new API. Can you help me set this up?

[Claude uses plan_tasks tool]

I've created a development plan with the following tasks:

1. High Priority Tasks:
   - Design API schema and endpoints
   - Implement core CRUD operations
   - Add authentication middleware

2. Medium Priority Tasks:
   - Write integration tests
   - Setup CI/CD pipeline
   - Create API documentation

Let's get the most important task to start:

[Claude uses next_task tool]
Next task: Design API schema and endpoints (high priority)

Let me think through this task first...

[Claude uses think tool]
Problem Definition: Plan the API schema design with appropriate endpoints

Analysis Steps:
1. Resource Identification:
   - Users (authentication)
   - Projects (main business object)
   - Tasks (within projects)
   
2. Endpoint Design:
   - RESTful approach for basic CRUD
   - GraphQL for complex queries
   - Versioned paths (/v1/...)

Self-Reflection:
This schema aligns with our microservices architecture while keeping tight domain boundaries.

After design review, let's mark this as complete:

[Claude uses complete_task tool]
Task completed: Design API schema and endpoints

Now let's check what's next:

[Claude uses next_task tool]
Next task: Implement core CRUD operations
```

### 6. Web Research and Knowledge Building

```
User: I need to research the latest developments in quantum computing for a presentation.

[Claude uses exa_search tool]
Searching for: "latest developments quantum computing"

Results:
1. "Recent Breakthroughs in Quantum Computing" (arXiv)
2. "IBM's Latest 1000+ Qubit Quantum Processor" (IBM Research)
3. "Google Claims Quantum Supremacy with New Error-Correction Method" (Nature)
4. "Commercial Applications of Quantum Computing in 2024" (MIT Technology Review)
5. "Quantum Computing Market Report 2024" (Gartner)

Let me get detailed information on these developments:

[Claude uses exa_answer tool]
Question: What are the most significant quantum computing breakthroughs in the past year?

Answer:
The most significant quantum computing breakthroughs in the past year include:

1. Error Correction: IBM and Google have made substantial progress in quantum error correction, with IBM demonstrating a 121-qubit error-corrected logical qubit and Google achieving 99.8% fidelity with their Sycamore processor.

2. Qubit Scaling: IBM released their 1,121-qubit "Condor" processor, breaking the 1,000-qubit barrier, while PsiQuantum announced progress toward their million-qubit photonic quantum computer.

3. Quantum Advantage: Several research groups demonstrated quantum advantage in specific applications, including optimization problems and material science simulations.

4. Algorithm Development: New quantum algorithms for machine learning, cryptography, and simulation have been published, expanding the potential applications.

5. Hardware Diversity: Multiple qubit technologies are advancing in parallel, with superconducting, ion trap, photonic, and neutral atom approaches all seeing significant improvements.

These breakthroughs are pushing quantum computing closer to practical applications in drug discovery, materials science, financial modeling, and cryptography.

[Sources: Nature (Mar 2024), IBM Research Blog (Jan 2024), arXiv:2312.09248, Quantum Science and Technology Journal]

Let me organize this information for your presentation:

[Claude uses think tool]
Problem Definition:
Structure key quantum computing breakthroughs for a presentation format.

Analysis:
The information can be organized into these categories:
1. Hardware Advancements (qubit scaling, error rates)
2. Error Correction Breakthroughs
3. Algorithmic Improvements
4. Practical Applications Emerging
5. Industry Developments (companies, investments)

This structure focuses on both technical aspects and business relevance.

[Claude uses create_entities tool]
Creating knowledge graph entities for key quantum computing concepts and breakthroughs...
```

These examples demonstrate:
- Explicit memory commits for important decisions
- Natural reference to previous decisions
- Structured reflection on implementation
- Using accumulated knowledge for improvements
- Progressive refinement through self-reflection

The key to effective tool usage is:
1. Commit important decisions and patterns to memory
2. Request reflection on previous decisions when needed
3. Build on accumulated knowledge for better solutions
4. Use structured thinking for complex problems

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