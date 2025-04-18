Here's a markdown summary of the actionable points from log_fix.md, organized for clarity and direct implementation:

---

# MCP Think Tank: Log Fix Action Points

## 1. Eliminate Non-JSON Output on stdout
- [ ] **Problem:** Compiler/diagnostic output (e.g., tsc --help) is sent to stdout, breaking FastMCP's JSON-RPC parser.
- [ ] **Action:**  
  - Route all compiler/diagnostic output to stderr.
  - Never write plain text to stdout in an MCP server.

---

## 2. Remove Broken TypeScript Fallbacks
- [ ] **Problem:** Legacy ESM bin scripts import removed subpaths (e.g., "ts-node/register/index.js").
- [ ] **Action:**  
  - Replace with import "ts-node/register" or remove ts-node fallback entirely.

---

## 3. Prevent Server Crashes and EPIPE Errors
- [ ] **Problem:** Server crashes cause EPIPE when the client writes to a dead subprocess.
- [ ] **Action:**  
  - Ensure the server exits cleanly instead of crashing.

---

## 4. Enforce Pre-Built Server Usage
- [ ] **Problem:** FastMCP ≥1.8 requires pre-built servers; on-the-fly compilation is unsupported.
- [ ] **Action:**  
  - Do not use `npx mcp-think-tank` (which tries to compile).
  - Use `npx mcp-think-tank@latest --built` to run only `dist/server.js`.
  - Update documentation to stress the pre-built requirement.

---

## 5. Minimal Patch-Set Implementation

### 5.1 Remove On-the-Fly Compiler Path
- [ ] **Action:**  
  - Create `bin/mcp-think-tank.js`:
    ```js
    #!/usr/bin/env node
    import { fileURLToPath } from "url";
    import { dirname, resolve } from "path";
    const here = dirname(fileURLToPath(import.meta.url));
    const server = resolve(here, "..", "dist", "server.js");
    import("node:" + server);
    ```
  - Delete all legacy logic that shells out to npm run build, ts-node, or tsc.
  - Mark the script as executable (`chmod +x`) in the post-build step.

### 5.2 Enforce Build in package.json
- [ ] **Action:**  
  - Change:
    ```diff
    - "prepublishOnly": "npm run build"
    + "prepack": "npm run build"
    ```
  - Ensures `dist/**` exists in every published version.

### 5.3 Route Diagnostics to stderr
- [ ] **Action:**  
  - In `src/server.ts`, hijack console.log:
    ```js
    console.log = (...args) => console.error(...args);
    ```

### 5.4 Improve File Logger Safety
- [ ] **Action:**  
  - In `src/utils/logger.ts`, replace:
    ```diff
    - fs.unlinkSync(logFile); // Delete the log if too big
    + fs.renameSync(logFile, `${logFile}.${Date.now()}.old`);
    ```
  - Prevents silent data loss.

---

## 6. JSON → JSONL Migration Helper

- [ ] **Action:**  
  - Add CLI script `src/cli/migrate-jsonl.ts`:
    ```ts
    import fs from "fs";
    const [ , , src, dst ] = process.argv;
    const items = JSON.parse(fs.readFileSync(src, "utf8"));
    fs.writeFileSync(dst, items.map(o => JSON.stringify(o)).join("\n")+"\n");
    console.error(`Wrote ${items.length} lines to ${dst}`);
    ```
  - (Optional) Register in "bin" for CLI use.

---

## 7. Recovery Playbook

- [ ] **Upgrade:**  
  - `npm i -g mcp-think-tank@1.3.2` (after publishing with above fixes)
- [ ] **Clean Install (Clients):**
  - `rm -rf ~/.mcp-think-tank/logs ~/.mcp-think-tank/*.{log,json,jsonl}`
  - `npx mcp-think-tank --built`
- [ ] **Verify:**  
  - Use `fastmcp inspect` to check for tool list and absence of JSON parse noise.
- [ ] **Re-enable tasks & Exa tools** once handshake is stable.

---

## 8. Future-Proof Checklist

- [ ] **CI Gate:**  
  - Fail build if `dist/**` is missing or if any source writes to stdout.
- [ ] **Unit Test:**  
  - Spawn server, send empty JSON-RPC envelope, assert first response is `{"jsonrpc":"2.0","result":"ok","id":0}`.
- [ ] **Docs:**  
  - Update README to stress pre-built requirement.
- [ ] **Version Floor:**  
  - Require FastMCP ≥ 1.21 in peerDependencies.

---

**Reference this checklist for implementation and maintenance.**
