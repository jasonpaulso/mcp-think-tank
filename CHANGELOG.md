# Changelog

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