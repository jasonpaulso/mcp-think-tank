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

### Phase 5: Next-Generation MCP Think Tank Design

- [x] Enhance existing think tool
  - [x] Add optional memory parameters
  - [x] Implement memory saving functionality
  - [x] Ensure backward compatibility
  - [ ] upgrade to FastMCP V2

  Below is a comprehensive, end-to-end checklist for finishing a next-generation MCP Think Tank project. All items are presented as unchecked tasks ([ ]) so you can mark them off as they’re completed. The list accounts for both:
	1.	Continuing with/Upgrading the existing TypeScript FastMCP
	2.	Migrating to a Python-based MCP framework (or another fresh approach)

If you decide to rebuild from scratch or migrate frameworks, the relevant tasks appear in the early phases. Once the underlying framework is chosen, the rest of the steps remain the same.

⸻

Phase 5.0: Decide on Framework & Timeout Constraints
	1.	Assess Current FastMCP TS vs. Alternatives
	•	Review whether the 60-second timeout in TypeScript FastMCP truly blocks advanced usage.
	•	Evaluate Python-based FastMCP, official Model Context Protocol reference, or other frameworks for better timeout handling.
	•	Weigh the pros/cons of rewriting the entire project from scratch vs. applying a patch/fork to the existing TS code.
	•	Document the final decision (stay with TS + custom fork, switch to Python, etc.).
	2.	Plan Migration (If Switching Frameworks or Rebuilding)
	•	Create a new repository or branch dedicated to the new version.
	•	Outline a mini-schedule for rewriting the existing features (think tool, memory/knowledge graph, task manager) in the chosen framework.
	3.	Fork or Patch (Only if you’re staying in TypeScript FastMCP but need extended timeouts)
	•	Clone the FastMCP TS repo.
	•	Locate the hard-coded timeout logic.
	•	Patch or override the server to allow a higher or rolling timeout.
	•	Confirm local tests that the new server can exceed 60 seconds.

⸻

Phase 5.1: Project Setup & High-Level Architecture
	1.	Initialize or Restructure Project
	•	Create a clean folder structure (or a new repo if rebuilding).
	•	If migrating, set up package.json (TS) or pyproject.toml / requirements.txt (Python) with core dependencies:
	•	Framework (e.g. FastMCP or another MCP library)
	•	Zod or pydantic for validations
	•	Any knowledge graph library (or your own custom logic)
	•	Copy or rewrite core files (server.ts or server.py, plus your knowledge-graph code, think tool code, etc.).
	2.	Decide on Data Persistence Layer
	•	Confirm you are using JSON on disk, JSONL, or a local database (SQLite, etc.).
	•	Set a default path or environment variable for memory store (like MEMORY_PATH).
	3.	Set Up Shared State
	•	Create a global or modular SharedState object/class to hold:
	•	Knowledge Graph in-memory instance
	•	Task manager state (list or DB)
	•	Think tool logs or references
	•	Ensure it can load/save from disk (or DB) at server start/stop.
	4.	Enable File System Tools (If your Think Tank must read/write project files)
	•	Implement or migrate read_file, write_file, list_directory, etc.
	•	Decide on any safety checks or user confirmations for writes.
	•	Add partial indexing (optional) to store minimal “file summaries” in knowledge graph.

⸻

Phase 5.2: Implement (or Migrate) Think Tool Enhancements
	1.	Basic Think Tool
	•	Create a think tool endpoint.
	•	Accept a structuredReasoning or thought: string parameter.
	•	Return the same text (or short confirmation) for verification.
	2.	Categorizing Thoughts
	•	Parse the input thought text with either simple heuristics (regex) or a mini NLP step to identify:
	•	Plans vs. Observations vs. Decisions vs. Questions, etc.
	•	Append a metadata tag or structure to the output.
	•	Store these categorized thoughts in the knowledge graph (or a separate table).
	3.	Auto-Updating Memory
	•	For each new thought, create a knowledge-graph “observation” node (or an entity “ReasoningStep”).
	•	Link it to the current conversation/session entity if you want per-session memory.
	•	Optionally auto-detect references to known entities/files in the thought (e.g. if it says “login.py,” link it to that file entity).
	4.	Optional Task Extraction
	•	If the model enumerates tasks in the thought text, automatically add them to the task manager.
	•	Use bullet/numbered-list detection or a specific marker (like “TASK: …”).
	•	Provide a quick safeguard to avoid duplicates in case the same thought arrives multiple times.

⸻

Phase 5.3: Knowledge Graph Memory Integration
	1.	Core Knowledge Graph Structure
	•	Define or migrate an Entity schema (name, type, observations array, etc.).
	•	Define or migrate a Relation schema (from, to, type).
	•	Ensure data can be toJSON and fromJSON for persistence.
	2.	Graph Persistence
	•	Write or adapt a GraphStorage class that loads from file at start, saves on changes.
	•	Confirm that large or frequent writes are handled (batch updates or throttling).
	3.	Memory Tool Endpoints
	•	create_entities
	•	create_relations
	•	add_observations
	•	delete_entities, delete_relations, etc.
	•	read_graph or export_graph
	•	search_nodes by name or content
	•	Confirm all tools produce structured JSON responses for the model.
	4.	Linking to Files & Codebase (Optional, but recommended)
	•	On server startup, scan project directories.
	•	Create an entity for each file (with path, short type).
	•	Possibly parse the top-level function/class definitions.
	•	Add relations like FILE_CONTAINS_FUNCTION or IMPORTS_LIBRARY.
	•	Save these automatically in the knowledge graph.
	5.	Test & Validate
	•	Use real or mock prompts to create, search, and retrieve graph data.
	•	Ensure the model can recall an entity’s observations after a new session.

⸻

Phase 5.4: Task Manager Integration
	1.	Design Task Schema
	•	Decide on columns/fields (id, title, description, status, created_at, maybe depends_on).
	•	If using the knowledge graph for tasks, store them as special “Task” entities with relations. Or use a separate table/JSON array.
	2.	Task Tools
	•	add_task or create_tasks – Input might be a list or just single tasks.
	•	list_tasks – Return JSON with all tasks or only incomplete ones.
	•	complete_task – Mark as done. Possibly store a “completed_at” time.
	•	update_task or delete_task if desired.
	3.	Basic Workflow
	•	Encourage the model (via system prompt) to create tasks whenever it calls think and identifies a to-do item.
	•	The model can then call list_tasks to see the plan, get_next_task to pick the next item, etc.
	•	Verify the model can keep track of multi-step tasks over longer sessions.
	4.	Optional: Automatic Summaries
	•	Each time a task is added or completed, record an observation in the knowledge graph linking the session and task.
	•	For partial completion, store partial results or references.
	5.	Testing
	•	Attempt a multi-step code fix: see if the model calls think, then add_task, then does them in order.
	•	Check the server logs and confirm tasks remain across restarts if the data is persisted.

⸻

Phase 5.5: File Tree Awareness & Code Integration
	1.	Initial File Tree Index
	•	On server startup, run a function to list directories recursively.
	•	Create an entity for each folder/file.
	•	Store minimal info (size, file type, etc.) in the knowledge graph or a separate structure.
	2.	Change Detection
	•	On write_file or external triggers, update the knowledge graph for changed/renamed files.
	•	If the environment (Cursor) can notify us of file changes, handle that event.
	3.	Optional Code Summaries
	•	If feasible, parse each file to gather top-level symbols (function names, classes) for the knowledge graph.
	•	Summarize them for quick lookups: e.g., “File auth.py has login() function.”
	4.	Enhanced Searching
	•	Add a tool that searches the knowledge graph for file or function by name or partial match: search_code(keyword) -> list.
	•	Consider caching file content or partial embeddings if the project is large.
	5.	Practical Testing
	•	Start the server, let it index the project.
	•	Prompt the model: “Where is the login function?” => see if it calls something like search_code(“login”) or queries memory.
	•	Confirm the model then uses read_file only after it knows precisely which file to open.

⸻

Phase 5.6: Tool Collaboration & Cross-Module Enhancements
	1.	Shared MCP or Single Server
	•	If using a single server approach, ensure all tools (think, memory, tasks, file system) share one FastMCP or equivalent instance.
	•	If you prefer microservices, ensure they’re composed so the AI sees them as a single integrated server.
	2.	Cross-Population
	•	Think tool automatically stores relevant thoughts in memory.
	•	Memory or think tool updates tasks if a plan is recognized.
	•	Task completion writes an observation to memory.
	•	On reading a file, add or update the knowledge graph with its last-read timestamp or summary.
	3.	Context Injection (Optional but powerful)
	•	Add a hook so that each time the model calls think, the server automatically fetches relevant knowledge from the graph and includes it in the think tool’s input or output.
	•	Keep it minimal to avoid overwhelming the model.
	4.	Prevent Redundancy
	•	Add a small cache for repeated calls to read_file.
	•	De-duplicate tasks or memory observations if they match.
	5.	Timeout Handling
	•	Ensure the new server (or the patched one) supports a dynamic or at least extended timeout.
	•	Confirm that each tool invocation can complete large file reads or complex knowledge graph queries within the time limit.

⸻

Phase 5.7: Prompt Engineering & Policy Setup
	1.	System/Developer Prompts
	•	Provide a comprehensive system message describing how these tools work together.
	•	Encourage the model to use think for step-by-step reasoning, to store or retrieve data in memory, to manage tasks, and to open files when needed.
	•	Emphasize a recommended workflow (think → plan tasks → do tasks → reflect → store or update memory).
	2.	Example Convo Scripts
	•	Write a short example conversation that shows the ideal usage flow: user requests, model calls think, tasks get created, file gets read, memory is updated, etc.
	•	Test the conversation locally and refine the prompts if the model doesn’t follow the expected sequence.
	3.	Prevent Over/Under-Use of Tools
	•	If the model calls think too often for trivial tasks, clarify in the prompt that think is for complex or multi-step logic.
	•	If the model never calls think, explicitly instruct it to plan or reflect for non-trivial tasks.
	4.	Safety & Approval
	•	If needed, add a user approval flow (like “To confirm file write: …”).
	•	Provide disclaimers or checks around destructive file operations.

⸻

Phase 5.8: Testing & Validation
	1.	Unit Tests
	•	For each tool (think, memory ops, tasks, file ops), write small tests that confirm correct input/output and error handling.
	•	Test creation of entities, reading from memory, searching, etc.
	•	For tasks, ensure all CRUD (create/read/update/delete) actions work if implemented.
	2.	Integration Tests
	•	Simulate a multi-step conversation: user request → model calls think → tasks → memory → file. Validate that the final output is correct.
	•	Confirm the knowledge graph updates persist between sessions.
	•	Try partial or out-of-order usage (model calls tasks first, then think).
	3.	Load & Stress Tests (If project is large)
	•	Import a large codebase to see if file scanning or knowledge graph creation can handle it.
	•	Check that the server remains responsive under many calls or big memory data.
	4.	Timeout & Error Recovery
	•	Test a scenario that might exceed the normal 60s (e.g., scanning a huge directory). Confirm the server or framework either extends time or breaks gracefully.
	•	If an error is returned, ensure the model can read the error response and proceed.
	5.	Final Polishing
	•	Evaluate logs and correctness on real coding tasks.
	•	Possibly gather user feedback and iterate.

⸻

Phase 5.9: Documentation & Release
	1.	Readme / Project Docs
	•	Update Readme.md or docs to reflect the new integrated design.
	•	Include instructions on installing, configuring timeouts, and hooking into Cursor, Claude Desktop, or other MCP clients.
	•	Provide usage examples for the main tools (think, memory, tasks, filesystem).
	2.	In-Code Documentation
	•	Comment each tool’s function thoroughly.
	•	Make sure the data schemas and structure are well-documented.
	3.	Changelog
	•	Write a changelog entry explaining the new approach, tool collaboration, possible breaking changes from the old mcp-think-tank.
	4.	Versioning & Distribution
	•	Bump version in package.json or pyproject.toml.
	•	If publishing to npm/PyPI, finalize any publishing scripts.
	•	Provide installation commands (npm, pip, shell scripts).
	5.	Maintenance Plan
	•	Decide who owns the code, handles PRs, merges, etc.
	•	Document a procedure for updating the knowledge graph schemas or add new tool endpoints.
	•	Possibly schedule future expansions (like more advanced reasoners, vector embeddings, etc.).

⸻

(Optional) Phase 5.10: Advanced Features
	•	Automatic Reasoning Patterns
	•	Implement deeper classification logic for thoughts (like “reflection,” “critique,” “policy check”).
	•	Possibly integrate a secondary small language model to interpret the main model’s thoughts for advanced triggers.
	•	Vector Embeddings or Summaries
	•	For large files, store vector embeddings in a library like Qdrant or FAISS.
	•	Provide a semantic_search tool that finds relevant code or docs by similarity.
	•	Task Dependencies / Project Management
	•	Expand tasks with dependencies (parent/child tasks).
	•	Show or return a DAG or Gantt-like progression for larger projects.
	•	UI/Visualization
	•	A simple web-based dashboard or CLI to show the current knowledge graph, tasks, or recent think logs.
	•	Live updates as the model calls tools.
	•	Complex Policy / Safety
	•	Add user confirmations for major steps (like rewriting code in production).
	•	Additional logging of all model outputs to comply with enterprise security.

⸻

Conclusion

By following this unified, detailed checklist, you (or your AI code assistant) can confidently:
	•	Choose the right MCP framework or rewrite approach
	•	Implement (or re-implement) the think tool, knowledge graph memory, task manager, and optional file operations
	•	Integrate them into a single cohesive server with shared state, advanced reasoning features, and minimal redundancies
	•	Thoroughly test the entire flow for multi-step coding tasks in Cursor or Claude
	•	Document your final solution for easy usage and future upgrades

Tackling these tasks in phases ensures you build a robust, next-generation MCP Think Tank capable of structured reasoning, persistent memory, task orchestration, and file-aware coding assistance — all while resolving the timeouts and limitations of your current setup.

  .... The new plan for implementing Next-Generation MCP Think Tank Design. 

 
### Phase 6: Testing and Documentation

- [ ] tests
  - [ ] I can test all tools workign on Claude
  - [ ] Various tests - depending on what we have
  such as Storage functionality, End-to-end server operation, Tool interaction patterns, Persistence across server restarts. 
- [ ] Update documentation
  - [ ] Update README.md with all new capabilities
  - [ ] Create usage examples based on develloper (coding) examples
  - [ ] Document API and tool interfaces

### Phase 7: Deployment and Distribution

- [ ] Update installation scripts
  - [ ] `install.sh` for Unix-based systems
  - [ ] `install.bat` for Windows
- [ ] Update Smithery configuration
- [ ] Update npm package configurations

## Dependencies

- **Required Dependencies**:
- and check if they are up to date

## Technical Specifications



## Future Enhancements

- [ ] Add proper smithery config (need to ask me to create account at smithery.com)
- [ ] Add memory visualization tool of some kind or a matrix of some kind. 