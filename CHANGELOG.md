# Changelog

## 2.0.4 (2024-07-28)

### Improved
- Implemented lazy loading for Smithery compatibility
- Modified Exa API tools to only check for API key during execution, not tool listing
- Updated Smithery documentation to clarify tool visibility and configuration requirements
- Enhanced error messages to guide users through proper configuration

### Fixed
- Fixed self-reflection implementation to handle large input strings
- Added proper reflectPrompt parameter handling with appropriate truncation
- Fixed multi-step orchestration tests to work with large content
- Improved string handling in critical sections to prevent RangeError crashes
- Added better documentation for self-reflection feature

## 2.0.3 (2024-07-28)

### Improved
- Added better documentation for memory_query tool in README
- Enhanced tool description in rule files to highlight memory_query capabilities
- Added practical example showing how to query recent observations from the last 48 hours
- Fixed Dockerfile paths for better container compatibility
- Improved smithery.yaml for better display on deployment platforms

## 2.0.1 (2024-07-26)

### Fixed
- Fixed critical console logging issues that were causing JSON parsing errors
- Completely suppressed console.log output in production to prevent interference with JSON responses
- Implemented safer error logging directly to stderr
- Fixed issue in the plan_tasks tool that was causing "Created X" to appear in JSON output
- Updated task storage to use safe error logging

## 2.0.0 (2024-07-25)

### Major Upgrades
- **Sequential Thinking & Chained Reasoning**
  - Added multi-agent interfaces and orchestration capabilities
  - Implemented `BasicAgent` with IAgent lifecycle
  - Added coordination strategies (Sequential and Parallel)
  - Enhanced think tool with step counter and plan fields
  - Added iterative self-reflection for enhanced reasoning
  - Implemented mid-chain research tool calls with [research: query] syntax
  - Added structured markdown output with multiple format types
  - Implemented mid-chain revision capabilities

- **Knowledge Graph Memory Upgrades**
  - Introduced `MemoryStore` abstraction with JSONL implementation
  - Added timestamp & version metadata to observations
  - Implemented duplicate-prevention & canonical naming
  - Added automatic linkage heuristics
  - Added memory pruning & versioning command
  - Enhanced query API with filtering capabilities
  - Improved batch operations with timeout guards

- **Tool Orchestration & Call-Limit Safeguards**
  - Implemented `ToolManager` wrapper for tool calls
  - Added configurable tool call limits (default: 25)
  - Added concurrency-safe counter increment
  - Implemented duplicate-call caching for performance
  - Added configurable tool whitelists per task
  - Improved tool-limit feedback with graceful halting
  - Added execution cache for file/URL operations

### Fixed
- Eliminated console logging that interfered with JSON responses
- Fixed JSON parsing errors in the plan_tasks tool
- Improved error handling in the knowledge graph entity creation
- Redirected all console output to stderr to maintain clean JSON communication
- Simplified API by consolidating `create_entities` and `update_entities` into a unified `upsert_entities` tool

### Improved
- Added an `update` flag to the entity schema to control behavior when an entity already exists
- Updated documentation to reflect the new upsert pattern
- Improved error handling with better feedback when operations fail

## 1.4.1 (2024-07-11)

### Fixed
- Version update to fix publishing error - version 1.4.0 was already in the registry.
- All changes from 1.4.0 are included in this release.

## 1.4.0 (2024-07-11)

### Added & Improved
- Major documentation update: clarified and expanded instructions for using MCP Think Tank in Cursor and Claude, with a new coherent section on tool groups (think, research, task manager, memory).
- Clearly documented the `storeInMemory` workflow: users/agents can simply say "Please save this reasoning in memory for future reference" and the tool will persist the thought in the knowledge graph.
- Improved Readme for large project development and agent/IDE integration.

### Fixed
- Ensured all documentation and workflow changes are reflected in the Readme and project rule setup.
- This version supersedes all previous deprecated versions and is ready for production use.

## 1.3.14 (2024-06-11)
- All versions of `mcp-think-tank` less than or equal to 1.3.14 have been deprecated on npm.
- **Reason:** Critical logging bu$g fixed in 1.3.14. Older versions may generate excessive log files and should not be used.

## 1.3.13 (2024-07-10)

### Added
- Made `context` a first-class feature in the think tool: when `storeInMemory` is true, the context is stored as an observation in the knowledge graph and optionally linked to an associated entity.
- Extended validation and entity schema to support context for future extensibility.

### Fixed
- Updated FastMCP tool context usage to resolve TypeScript errors and ensure compatibility with latest FastMCP versions.

## 1.3.12 (2024-07-10)

### Fixed
- Changed logger to opt-in model: file logging now requires explicit MCP_LOG_FILE=true
- Added automatic cleanup of old log files, keeping only the 5 most recent backups
- Reduced disk usage and system load from excessive logging
- Fixed performance issues caused by rapid log file growth

## 1.3.11 (2024-07-07)

### Fixed
- Critical fix: Console redirection now happens immediately at the top of files, before any imports
- Fixed path resolution in bin/mcp-think-tank.js to correctly point to dist/src/server.js
- Simplified version detection logic to be more robust across different environments
- Added --show-memory-path CLI flag for better diagnostics and testing
- Improved error handling in binary launcher and server startup
- Added smoke-test and verify-publish npm scripts to prevent releasing broken packages
- Restructured memory path handling for better error reporting
- Followed all checkpoint fixes from the fix.md document

## 1.3.10 (2024-07-07)

### Fixed
- Fixed CLI launcher to directly import server.js
- Updated package.json to correctly point to the compiled server.js file
- Added validation during build to ensure all artifacts are present
- Dynamically read version from package.json to ensure consistency
- Added error handling around server startup
- Improved robustness in FastMCP 1.2.4+ handshake protocol
- Removed dependency on bootstrap.mjs to simplify startup flow

## 1.3.9 (2024-07-07)

### Fixed
- Critical fix: Corrected import paths in bootstrap.mjs to properly resolve compiled files
- Ensured compatibility with FastMCP 1.2.4+ handshake requirements
- Fixed npm package structure to work correctly when installed via npx

## 1.3.8 (2024-07-07)

### Fixed
- Fixed compatibility with FastMCP 1.2.4+ by adding proper resource and resourceTemplate handshake support
- Fixed import paths in bootstrap.mjs to correctly locate compiled files in the dist directory
- Pinned FastMCP dependency to version 1.2.4 for stability
- Fixed console output redirection to prevent JSON message corruption
- Improved error handling for the Exa API integration

## 1.3.5 (2024-07-01)

### Fixed
- Fixed memory initialization: the memory.jsonl file is now properly created at startup if it doesn't exist
- Updated mcp.json to use the latest version of the package
- Fixed integration tests to handle protocol format updates correctly
- Fixed various minor bugs and improved error handling

## 1.3.1

- Published to NPM as mcp-think-tank@1.3.1
- Logging system simplified and dependencies removed
- Fully committed to JSONL for knowledge graph and tasks
- Lint and test suite cleaned up
- Version fields updated for consistency

## 1.3.0 (2024-06-13)

### Added
- Exa API Integration for web research
  - Added `exa_search` tool for searching the web
  - Added `exa_answer` tool for getting sourced answers
  - Prepared optional streaming answer implementation (commented out by default)
- Added unit tests for Exa API tools
- Added environment variable checks and improved error handling

### Improved
- Enhanced integration between tools for cross-communication
- Added debounced saving for better performance on batch operations
- Improved error handling and logging for task operations

## 1.2.0 (2024-04-16)

### Added
- Task Management System with Knowledge Graph integration
  - Added `plan_tasks` tool for creating multiple tasks at once
  - Added `list_tasks` tool for filtering tasks by status and priority
  - Added `next_task` tool to get the highest priority task and mark it in-progress
  - Added `complete_task` tool to mark tasks as done
  - Added `update_tasks` tool for batch updates
- Implemented persistent task storage with append-only JSONL format
- Added `show_memory_path` utility tool to help locate knowledge graph file
- Added comprehensive test suite with Vitest

## 1.1.1 (2024-04-14)

### Fixed
- Fixed JSON parsing errors caused by console.log interference with FastMCP stdio
- Implemented proper logging system using stderr and file output
- Added MCP_DEBUG environment variable for controlling debug output
- Improved error handling with better stack traces
- Updated all logging calls to use the new logger utility

## 1.1.0 (2024-04-10)

### Improved
- Updated documentation to recommend npx installation method for Cursor
- Enhanced installation instructions for better clarity
- Added more detailed configuration examples

## 1.0.4 (2024-04-10)

### Fixed
- Improved warning message handling for "FastMCP could not infer client capabilities"
- Added detailed instructions for Cursor integration
- Updated server version to match package version
- Added more troubleshooting steps for Cursor integration

## 1.0.3 (2024-04-10)

### Fixed
- Fixed global installation issues by removing problematic postinstall script
- Enhanced bin script to handle missing compiled files, with fallbacks to compile on demand
- Added better error handling and fallback to ts-node when TypeScript compilation fails

## 1.0.2 (Previous release)

### Features
- Initial public release
- Added support for the "think" tool
- Added compatibility with Cursor and Claude Desktop 

