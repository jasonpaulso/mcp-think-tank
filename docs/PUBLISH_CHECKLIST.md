# MCP Think Tank Publication Checklist

This checklist must be followed before publishing new versions to npm to ensure the package works correctly when installed by users.

## Pre-Publication Checks

### 1️⃣ Code Quality Checks
- [ ] Run `npm run lint` to check for code quality issues
- [ ] Run `npm test` to ensure all unit tests pass, including new integration tests
- [ ] Confirm all critical files exist and are included in the package

### 2️⃣ Build Verification
- [ ] Run `npm run build` to compile TypeScript code
- [ ] Verify `node dist/src/server.js --version` succeeds and outputs correct version
- [ ] Check that `dist/` directory contains all expected files and subdirectories:
  - [ ] dist/src/memory/
  - [ ] dist/src/research/
  - [ ] dist/src/tasks/
  - [ ] dist/src/think/
  - [ ] dist/src/utils/
  - [ ] dist/src/server.js
  - [ ] dist/src/config.js

### 3️⃣ Package Verification
- [ ] Run `npm pack --dry-run` and check that output contains:
  - [ ] dist/src/server.js
  - [ ] bin/mcp-think-tank.js
- [ ] Run `npm pack` to create the actual package file
- [ ] Test the packed file with `npx -y ./mcp-think-tank-<version>.tgz --version`
- [ ] Verify it exits with code 0 and displays the correct version

### 4️⃣ Integration Testing
- [ ] Update test Cursor configuration with the new version:
  ```json
  {
    "mcpServers": {
      "think-tool": {
        "command": "npx",
        "args": ["-y", "mcp-think-tank@<new-version>"],
        "type": "stdio",
        "env": {
          "MEMORY_PATH": "/path/to/memory.jsonl",
          "EXA_API_KEY": "<your-api-key>"
        }
      }
    }
  }
  ```
- [ ] Verify MCP server connects (green light in Cursor)
- [ ] Test at least one tool from each category:
  - [ ] Memory tool (e.g., create_entities)
  - [ ] Think tool (e.g., think)
  - [ ] Task tool (e.g., plan_tasks)
  - [ ] Research tool (e.g., exa_search if you have an API key)

### 5️⃣ Documentation
- [ ] Update CHANGELOG.md with all changes since previous version
- [ ] Make sure version number is consistent across:
  - [ ] package.json
  - [ ] CHANGELOG.md
  - [ ] src/config.ts (should now read from package.json)

### 6️⃣ Final Verification Sequence
Run the comprehensive verification script:
```bash
npm run verify-publish
```

This command runs lint, test, build, and smoke tests in sequence.

## Publication Process

### 7️⃣ Publication
- [ ] Publish with `npm publish`
- [ ] Test the published package with:
  ```bash
  npx -y mcp-think-tank@<published-version> --version
  ```

### 8️⃣ Post-Publication
- [ ] Update sample mcp.json in documentation
- [ ] Test with actual Cursor installation using the published version
- [ ] Verify tools are correctly registered in Cursor
- [ ] Tag the release in git
  ```bash
  git tag v<version>
  git push origin v<version>
  ```

## Critical Errors to Avoid

1. **Missing CLI file**: The `bin` field must point to an existing file.
2. **Broken `main` entry**: The `main` field must point to the correct entry point.
3. **Version inconsistency**: Versions must match between package.json and code.
4. **Missing build files**: The package must include all compiled files.
5. **Unhandled startup exceptions**: All startup exceptions must be caught and logged.

## Troubleshooting Common Issues

- **"Client closed" error in Cursor**: Usually means the MCP server failed to start or crashed immediately. Check that all required files exist and the server can start with the `--version` flag.
- **Missing dependencies**: Ensure all dependencies are correctly specified in package.json.
- **Path resolution issues**: Use absolute paths with import.meta.url for file operations.

Remember: **Never publish a package until `npm pack --dry-run && node bin/mcp-think-tank.js --version` both succeed inside a clean environment.** 