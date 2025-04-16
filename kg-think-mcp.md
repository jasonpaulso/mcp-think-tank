# Knowledge Graph Memory Implementation for Think MCP Server

## Project Overview

This implementation plan outlines the process for enhancing the MCP Think Server with persistent memory capabilities using a knowledge graph. The enhanced server will enable Claude to:

- Store and retrieve information across conversations
- Build semantic connections between pieces of information
- Access previous reasoning and conclusions
- Maintain contextual awareness of user preferences and past interactions

## System Architecture

The knowledge graph memory system will be implemented with the following components:

- **Core Data Model**: Entity-relation model for knowledge representation
- **Storage Layer**: File-based persistence for the knowledge graph
- **Tool Interfaces**: MCP tools for interacting with the knowledge graph
- **Integration**: Seamless connection with the existing "think" tool

## Implementation Tasks

### Phase 1: Project Setup and Core Infrastructure

- [x] Create branch for knowledge graph implementation
- [x] Update `package.json` with required dependencies
- [x] Setup TypeScript interfaces for knowledge graph components
- [x] Create knowledge graph file structure
  - [x] `src/memory/knowledgeGraph.ts`
  - [x] `src/memory/storage.ts`
  - [x] `src/memory/tools.ts`
  - [x] `src/utils/validation.ts`
  - [x] `src/config.ts`
- [x] Implement command-line argument handling for memory path configuration

### Phase 2: Knowledge Graph Core Implementation

- [x] Implement knowledge graph data structures
  - [x] Entity management
  - [x] Relation management
  - [x] Observation handling
- [x] Implement persistence layer
  - [x] JSON file storage
  - [x] Automatic saving on changes
  - [x] Loading from existing files
- [x] Add basic in-memory query functionality
  - [x] Entity lookup
  - [x] Relation traversal
  - [x] Text search

### Phase 3: MCP Tool Implementation

- [x] Implement entity management tools
  - [x] `create_entities` - Create multiple entities
  - [x] `update_entities` - Update entity properties
  - [x] `delete_entities` - Remove entities
- [x] Implement relation management tools
  - [x] `create_relations` - Create connections between entities
  - [x] `update_relations` - Update relation properties
  - [x] `delete_relations` - Remove relations
- [x] Implement observation tools
  - [x] `add_observations` - Add new observations to entities
  - [x] `delete_observations` - Remove observations

### Phase 4: Query and Retrieval Tools

- [x] Implement graph reading tools
  - [x] `read_graph` - Get entire knowledge graph
  - [x] `open_nodes` - Retrieve specific entities
- [x] Implement search functionality
  - [x] `search_nodes` - Find entities by query

### Phase 4.1: knowledge about current file tree

We don't want to interrupt the creative flow of code generation with constant index updates and checks. Let me think about how to make this more flow-friendly.

Ran tool
Now I see a better approach! Here's a refined proposal:

Implement a "smart context" system:

1. Simple File Context Tracker:
   - Tracks only SAVED/COMMITTED files
   - Ignores files currently being edited
   - Updates on file save/commit
   - Focuses on:
     - Imported modules
     - External function calls
     - Shared types/interfaces
     - Public APIs

2. Usage Pattern:
   - When writing new code:
     ✓ Complete freedom to create functions
     ✓ No validation interruptions
     ✓ Natural code flow maintained
   
   - When referencing existing code:
     ✓ Quick check if module exists
     ✓ Verify imported functions
     ✓ Validate shared type usage

3. Benefits:
   - Prevents most common hallucinations (invalid imports/references)
   - Doesn't slow down new code generation
   - Updates happen at natural break points (save/commit)
   - Lightweight and unintrusive


This approach is much more flow-friendly because:
1. It doesn't interrupt the creative process of writing new code
2. Only validates references to existing code
3. Updates happen at natural break points
4. Focuses on preventing the most problematic hallucinations (invalid imports and external references)

For example:
- When writing a new component with multiple new functions: No interruptions or validation
- When importing from another file: Quick check if the import exists
- When calling an existing utility function: Verify it exists in the saved codebase

Would this approach better align with your vision of maintaining code flow while still preventing the most problematic hallucinations?


### Phase 4.2 – Task Manager Integration  
*(adds task queue, CRUD tools, graph sync)*  

## 4.2.1 Project Scaffold  
- **Create files / folders**  
  - `src/tasks/schemas.ts`  
  - `src/tasks/storage.ts`  
  - `src/tasks/tools.ts`  
  - `tests/tasks.spec.ts`  
  - ✅ *Done‑when*: files exist and compile (`npm run build`).  

## 4.2.2 Task Data Model (`src/tasks/schemas.ts`)  
- **Import Zod**:  
  ```ts
  import { z } from "zod";
  ```  
- **Define** `TaskSchema` – every field strictly typed for the LLM:  
  ```ts
  export const TaskSchema = z.object({
    id:          z.string().uuid(),
    description: z.string().min(3, "Task must be >2 chars"),
    status:      z.enum(["todo","in‑progress","blocked","done"]).default("todo"),
    priority:    z.enum(["low","medium","high"]).default("medium"),
    due:         z.string().datetime().optional(),
    tags:        z.array(z.string()).optional(),
    dependsOn:   z.array(z.string()).uuid().optional()
  });
  export type Task = z.infer<typeof TaskSchema>;
  ```  
  - **Concern**: many assistants omit `.uuid()`. Be explicit.  

## 4.2.3 Queue & Persistence (`src/tasks/storage.ts`)  
- **Setup path** (re‑use memory folder):  
  ```ts
  const tasksPath = process.env.TASKS_PATH
     || path.join(os.homedir(), ".mcp-think-tank/tasks.jsonl");
  ```  
- **Class `TaskStorage`**  
  1. `private tasks: Map<string, Task>` in‑memory.  
  2. `load()` – read file line‑by‑line, `JSON.parse`.  
  3. `save()` – **append** on every mutation (`fs.appendFileSync`).  
  4. Batch‑save alternative: debounce 5 s with `setTimeout`.  
  5. `logOperation(op: string, task: Task)` – mirror logger pattern.  
  - **Concern**: Do **not** overwrite the file on every save → race in Cursor. Use append or tmp‑rename.  

## 4.2.4 CRUD Tool Registration (`src/tasks/tools.ts`)  
*(Import `FastMCP`, `TaskSchema`, storage instance, KG tools)*  

| Tool | Parameters (Zod) | Logic outline | KG interaction |
|------|------------------|---------------|----------------|
| `plan_tasks` | `{ tasks: z.array(TaskSchema.omit({id:true,status:true}).extend({priority:z.enum([...]).default("medium")})) }` | - generate `uuidv4` for each<br>- push to storage | `create_entities` with `entityType:"task"` + description obs. |
| `list_tasks` | `{ status?:string, priority?:string }` | filter storage | none |
| `next_task` | `{}` | pop first `status==="todo"` → mark `in‑progress` | add observation “started <ISO>” |
| `complete_task` | `{ id:string }` | set `status:"done"` | `add_observations`: “completed <ISO>” |
| `update_tasks` | `{ updates: z.array(TaskSchema.partial()) }` | merge fields | sync changed description/priority in KG (`update_entities`) |

**Common concern:** after *every* mutation call `taskStorage.save()` **then** return tool result; else data loss on crash.

### Add to server (in `src/server.ts`)  
```ts
import { registerTaskTools } from "./tasks/tools.js";
...
registerTaskTools(server);
```

#### 4.2.5 Tests (`tests/tasks.spec.ts`)  
- mock graph & storage; test:  
  - plan→list length matches  
  - next_task changes status  
  - complete_task writes “completed” observation  
- **Concern**: use `vi.useFakeTimers()` or Jest timers to test debounce.  

---

### Phase 4.3 – Exa Integration  

## 4.3.1 Dependencies  
```bash
npm i exa-js
```

## 4.3.2 Keep `exa_search` (copy from egoist implementation)  
- Place in `src/research/search.ts`; register with same name.  
- **Concern**: ensure `process.env.EXA_API_KEY` guard; throw descriptive FastMCP error if missing.

## 4.3.3 Add `exa_answer` tool (`src/research/answer.ts`)  
```ts
import Exa from "exa-js";
import { z } from "zod";
export const registerAnswerTool = (server:FastMCP)=>{
  server.addTool({
    name:"exa_answer",
    description:"Ask a question and get a sourced answer via Exa /answer.",
    parameters: z.object({
      question: z.string().min(5),
      max_citations: z.number().min(1).max(10).default(5)
    }),
    execute: async ({question,max_citations})=>{
      if(!process.env.EXA_API_KEY) throw new Error("Set EXA_API_KEY");
      const exa=new Exa(process.env.EXA_API_KEY);
      return await exa.answer(question,{citations:max_citations});
    }
  });
};
```  
- **Concern**: Assistants may forget `await`; ensure `return` is awaited JSON.  
- **Concern**: `/answer` returns `{ answer, citations:[{url,quote}] }`; keep shape.  

## 4.3.4 Streaming variant (optional)  
- Wrap `exa.streamAnswer(question)`; stream chunks via `yield` (FastMCP `stream` option).  
- **Concern**: Cursor auto‑aborts after 20 s; set citation default to 3 for speed.

## 4.3.5 Tests  
- `mockedExa.answer` returns fixed payload; assert tool passes through.

---

# Utility – show_memory_path Tool  

```ts
server.addTool({
  name:"show_memory_path",
  description:"Return absolute path of the active knowledge‑graph file.",
  parameters: z.object({}),
  execute:async()=> process.env.MEMORY_PATH
         || path.join(os.homedir(),".mcp-think-tank/memory.jsonl")
});
```
- **Concern**: Must import `path` & `os`; assistants sometimes forget ESM `import path from "path";`.

---

# Release Checklist  

1. **Version bump** `package.json` → `1.2.0`.  
2. Update **CHANGELOG.md** with 4.2 & 4.3 entries.  
3. Update **README**:  
   - Task tools usage examples.  
   - `exa_answer` docs + pricing note.  
   - `show_memory_path` debug tip.  
4. **Build & test**  
   ```bash
   npm run build && npm test
   ```  
5. **Publish**  
   ```bash
   npm publish
   ```  
6. Verify via **Cursor**:  
   ```jsonc
   {
     "command":"npx",
     "args":["-y","mcp-think-tank"],
     "env":{
       "MEMORY_PATH":"./memory.jsonl",
       "EXA_API_KEY":"sk‑live‑..."
     }
   }
   ```  
   - Run `show_memory_path {}` → returns `./memory.jsonl`.  
   - Run `plan_tasks`, `list_tasks`, `exa_answer`.  

---

## General Coding Concerns for Assistants  

- **ESM imports**: project uses `"type":"module"` → use `import` not `require`.  
- **Path handling**: always `path.join` for cross‑platform; avoid string concatenation.  
- **UUID generation**: use `import { v4 as uuidv4 } from "uuid";` – add to deps.  
- **Error messages**: write to **stderr** or throw; don’t `console.log` plain JSON (breaks FastMCP).  
- **Timeout awareness**: FastMCP v1 hard‑codes request timeout (env `REQUEST_TIMEOUT`); keep Exa calls ≤ 10 s.  
- **No global state leaks**: do not keep long promises un‑awaited; they survive into next tool call.  


### Phase 5: Integration with Think Tool

- [x] Enhance existing think tool
  - [x] Add optional memory parameters
  - [x] Implement memory saving functionality
  - [x] Ensure backward compatibility
  - [x] Improve think tool description for better self-reflection and reasoning guidance
  - [ ] 

  ### Phase 5.1: logging issues
  <chatName="Fix excessive logging in MCP Think Tank"/>

Let me analyze the logging issue and propose a solution:

1. Problem Analysis:
- Current logging system writes to both stderr and log file for every operation
- No rate limiting or log rotation implemented
- Debug mode appears to be too verbose
- Log file path is in home directory which can fill up disk space quickly

2. Root Causes:
- The Logger class in `src/utils/logger.ts` writes to file unconditionally
- No size limits or rotation for log files
- Debug logging may be too aggressive in memory operations

3. Solution Components:

a) Logger Class Modifications (src/utils/logger.ts):
- Add log rotation with maximum file size
- Implement log level filtering
- Add daily log rotation
- Make file logging optional

```typescript
// Proposed changes to Logger class
class Logger {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private maxFiles = 5;
  private logToFile = true; // Configurable
  
  private rotateLogs() {
    if (fs.existsSync(this.logFile) {
      const stats = fs.statSync(this.logFile);
      if (stats.size > this.maxFileSize) {
        // Rotate logs
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${this.logFile}.${i}`;
          const newFile = `${this.logFile}.${i + 1}`;
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
          }
        }
        fs.renameSync(this.logFile, `${this.logFile}.1`);
      }
    }
  }

  private writeToFile(message: string) {
    if (!this.logToFile) return;
    
    try {
      this.rotateLogs();
      const timestamp = new Date().toISOString();
      fs.appendFileSync(this.logFile, `${timestamp} - ${message}\n`);
    } catch (err) {
      // Fallback to console if file writing fails
      console.error(`Failed to write to log file: ${err.message}`);
    }
  }
}
```

b) Configuration Updates (src/config.ts):
- Add logging configuration options
- Set reasonable defaults

```typescript
export const config = {
  // Add these new properties
  logging: {
    enabled: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    level: process.env.MCP_LOG_LEVEL || 'info' // 'error', 'warn', 'info', 'debug'
  }
};
```

c) Memory Tools Logging (src/memory/tools.ts):
- Reduce debug logging frequency
- Add batch logging for bulk operations

4. Implementation Steps:

1. Modify Logger class:
   - Add log rotation
   - Implement size limits
   - Add configurable log levels
   - Make file logging optional

2. Update config.ts:
   - Add logging configuration options
   - Set sensible defaults

3. Modify memory tools:
   - Reduce verbose logging
   - Batch log messages where possible

4. Update server.ts:
   - Initialize logger with config
   - Add startup logging configuration

5. Update documentation:
   - Document new logging configuration options
   - Add troubleshooting section for logging

5. Impact Analysis:
- Will significantly reduce disk usage
- Prevents system slowdowns from excessive logging
- Maintains ability to debug when needed
- Backward compatible with existing installations

6. Additional Recommendations:
- Add periodic log cleanup (e.g., delete logs older than 30 days)
- Consider adding a `flushLogs()` method for critical errors
- Add warning when log directory is approaching capacity

Would you like me to elaborate on any specific part of this solution?
 


### Phase 6: Testing and Documentation

- [ ] Create unit tests
  - [ ] Knowledge graph operations
  - [ ] Storage functionality
  - [ ] Tool implementations
- [ ] Create integration tests
  - [ ] End-to-end server operation
  - [ ] Tool interaction patterns
  - [ ] Persistence across server restarts
- [x] Update documentation
  - [x] Update README.md with memory capabilities
  - [x] Create usage examples
  - [x] Document API and tool interfaces

### Phase 7: Deployment and Distribution

- [ ] Update installation scripts
  - [ ] `install.sh` for Unix-based systems
  - [ ] `install.bat` for Windows
- [ ] Update Smithery configuration
- [ ] Update npm package configurations

## Dependencies

- **Required Dependencies**:
  - [x] TypeScript and related type definitions
  - [x] FastMCP for server functionality
  - [x] Storage solution (JSON-based)
  - [x] Zod for validation

## Technical Specifications

### Knowledge Graph Data Model

```typescript
// Entity structure
interface Entity {
  name: string;            // Unique identifier
  entityType: string;      // Type classification
  observations: string[];  // Facts/observations
}

// Relation structure
interface Relation {
  from: string;            // Source entity name
  to: string;              // Target entity name  
  relationType: string;    // Relationship type (active voice)
}

// Knowledge Graph
interface KnowledgeGraph {
  entities: Map<string, Entity>;
  relations: Map<string, Set<Relation>>;
}
```

### Tool Specifications

1. **create_entities**
   - Input: Array of entity objects
   - Behavior: Creates new entities if they don't exist
   - Output: Confirmation or error

2. **create_relations**
   - Input: Array of relation objects
   - Behavior: Creates relations between existing entities
   - Output: Confirmation or error

3. **add_observations**
   - Input: Entity name and array of observations
   - Behavior: Adds observations to an entity
   - Output: Confirmation or error

4. **read_graph**
   - Input: None
   - Behavior: Returns the entire knowledge graph
   - Output: Knowledge graph structure

5. **search_nodes**
   - Input: Search query
   - Behavior: Searches for matching entities
   - Output: Array of matching entities

6. **open_nodes**
   - Input: Array of entity names
   - Behavior: Retrieves specific entities
   - Output: Array of entity objects

## Future Enhancements

- [ ] Add proper smithery config (need to ask me to create account at smithery.com)
- [x] We have multiple tools can we improuve the way they cross-talk to each other? - we should research this it they are not already connected. 
  - [x] Implement event-based communication pattern
  - [x] Use shared memory for efficient data exchange
  - [x] Add batched operations to reduce overhead
- [ ] Add a task-master tool into this project based on the same pattern as https://github.com/eyaltoledano/claude-task-master
- [ ] Add memory visualization tools
- [ ] Memory visualization tools