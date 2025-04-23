### Why 1.3.9 fails to start (and 1.3.0 still works)
| 🔍 Finding | 📌 Evidence in 1.3.9 | 💥 Result at runtime |
|-----------|----------------------|---------------------|
| **Missing CLI file** – the `bin` field points to `bin/mcp-think-tank.js`, but that file no longer exists. | Directory tree you pasted has no `bin/` folder. | `npx mcp-think-tank` immediately exits because Node cannot resolve the executable; Cursor/Claude report **“client closed”**. |
| **Broken `main` entry** – `package.json` says `main:"dist/bootstrap.mjs"` and `build` script copies `src/bootstrap.mjs` into `dist/…`, yet `src/bootstrap.mjs` is also missing. | No `src/bootstrap.mjs` in tree. | When another package does `require("mcp-think-tank")` or when FastMCP’s *inspect* command runs, Node throws **ERR_MODULE_NOT_FOUND**. |
| **Version drift inside the code** – `src/config.ts` hard-codes `version:"1.3.5"` while `package.json` is `1.3.9`. | see `src/config.ts`. | Cursor’s handshake compares versions; the mismatch is logged as a warning and can abort the session on strict clients. |
| **Files whitelist is wrong** – `files:[ "dist","bin","src", … ]` is fine, but because the **build step happens only in _prepack_**, a CI that publishes with `npm publish --ignore-scripts` (common in secure registries) will ship the package **without `dist/`**. | `scripts.prepack="npm run build"` | Users installing with `npm_config_ignore_scripts=true` (Cursor does this for safety) receive an **un-built** package. |
| **Unhandled startup exception ≠ logged** – the `server.start()` call is not wrapped in `try/catch`. Any of the missing-file errors above bubbles up → process exits before FastMCP sends its *ready* JSON → **connection closes**. |

---

## Part A — *Immediate repair check-list* (to publish 1.3.10)

| ✅ Checkpoint | Script / file to touch | Exact fix |
|--------------|-----------------------|-----------|
| **1. Re-introduce CLI launcher** | `bin/mcp-think-tank.js` | ```js #!/usr/bin/env node import('../dist/server.js').catch(e=>{ console.error(e); process.exit(1); });``` &nbsp;→ `chmod +x`. |
| **2. Stop pointing at a phantom file** | `package.json` | *Either*: `main:"dist/server.js"` **or** add back `src/bootstrap.mjs` → copy to `dist/` in `npm run build`. |
| **3. Ship what you build** | `scripts.prepack` | Keep it, **but** add a CI step `npm run build && node dist/server.js --version` to fail if build artefacts are missing. |
| **4. Align version strings** | `src/config.ts` | Replace hard-coded value with `import { readFileSync } from "node:fs"; export const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)).toString()).version;` |
| **5. Wrap startup** | `src/server.ts` | ```ts try { server.start(); } catch (e) { logger.error(`Startup failed: ${e}`); process.exit(1);} ``` |
| **6. Verify publish set** | *CI / local* | `npm pack --dry-run` – assert the tarball contains `dist/**` and `bin/mcp-think-tank.js`. |
| **7. One-shot smoke test** | `tests/integration.spec.ts` (or a new script) | `npx -y ./mcp-think-tank-<tar>.tgz --version` must print the same version and exit 0. |

Publish **1.3.10** after all seven pass; Cursor/Claude configs with  
```json
"args": ["-y","mcp-think-tank@1.3.10"]
```  
should connect again.

---

## Part B — *Rules the code-assistant must obey from now on*

1. **Entrypoints & binaries**  
   - Keep `bin/mcp-think-tank.js` as the only user-facing executable.  
   - If you rename or move `dist/server.js`, update both `bin` and `main` simultaneously.  
   - `npm pack --dry-run` **MUST** show the bin file and the built JS it imports.

2. **Build & publish workflow**  
   - Never rely on post-install or pre-publish scripts being executed by consumers. All compiled code must already be inside the package.  
   - CI checklist before `npm publish`:  
     ```
     npm run lint
     npm test
     npm run build
     node dist/server.js --version           # must succeed
     npm pack --dry-run | grep dist/server   # must output exactly one match
     ```

3. **Version source-of-truth**  
   - Read the version directly from `package.json`; do not copy it into code.  
   - Unit-test that `server.version === require("../package.json").version`.

4. **FastMCP handshake invariants**  
   - `console.log` **never** prints anything except FastMCP JSON frames; all human/debug output goes to `stderr` via `logger.*`.  
   - Provide at least one `resource` and one `resourceTemplate` in `server.start()` to satisfy 1.2.4+ clients.

5. **Logging & stdout discipline**  
   - No `console.log` or `process.stdout.write` outside FastMCP protocol.  
   - Catch **all** top-level async errors (`unhandledRejection`, `uncaughtException`) and exit with non-zero *after* logging.

6. **Packaging tests**  
   - Add a Vitest that spawns `npx -y mcp-think-tank@$(node -p 'require("./package").version') --show-memory-path` and asserts exit 0.  
   - This prevents silent “client closed” regressions.

7. **Semantic versioning guard**  
   - Patch-level releases (x.y.🔼) **must not** change public entrypoints or CLI flags.  
   - If you **must** change them, bump minor (x.🔼.0) and keep compatibility shims for at least one full minor cycle.

8. **Automated changelog lint**  
   - CI fails if `CHANGELOG.md` top entry **doesn’t match** `package.json` version or omits a “Breaking” section when `semver.diff` ≥ minor.

---

### TL;DR for future you
> **Never publish a package until `npm pack --dry-run && node bin/mcp-think-tank.js --version` both succeed inside a clean Docker container.**  
> This one-liner would have caught every issue that broke 1.3.9.

Implement the seven **repair checkpoints**, cut **1.3.10**, and your users will once again be able to add

```jsonc
"args": ["-y","mcp-think-tank@1.3.10"]
```

to their `mcp.json` / `claude_desktop_config.json` without seeing *“client closed”* ever again.