Below is a synthesis of what changed between **mcp‑think‑tank 1.3.0** (still works) and ≥ 1.3.1 (Cursor shows “Client closed”), why three runaway Node processes appear, and the concrete patches that stop both problems.

## Key findings (one‑paragraph take‑away)

Starting with **fastmcp ≥ 1.2.4** a breaking change in the MCP handshake **requires every server to expose a `resources` array _and_ a `resourceTemplates` array in the initial `ListOfferings` reply**; if either field is missing Cursor immediately closes the stdio socket. `mcp‑think‑tank 1.3.1+` no longer ships a lock‑file, so a fresh `npx` install pulls the newer fastmcp that enforces this rule, while 1.3.0 still loads the older fastmcp 1.2.2 that accepts an empty response. Cursor then keeps retrying the command every few seconds, leaving two or three orphaned Node children that peg the CPU. In short: **missing (even empty) resource declarations → handshake abort → Client closed → Cursor respawns Node in a tight loop.** Adding stub resources/templates **or** pinning fastmcp to 1.2.2 both restore stability. citeturn0search0turn0search1turn7view0turn9search0

---

## 1  Why 1.3.0 still works  

### 1.3.0 resolves `fastmcp@1.2.2`  
The 1.3.0 tarball was built with a **package‑lock.json** that pins FastMCP < 1.2.4, which does **not** insist on resources during `ListOfferings`. Cursor therefore completes the handshake. citeturn0search2

### 1.3.1 removed that lock  
From 1.3.1 onward the lock‑file and several dev‑dependencies were deleted (“Logging system simplified and dependencies removed” in the changelog). A clean `npx` now accepts the latest compatible version (**fastmcp 1.2.4 or newer**). citeturn0search1

---

## 2  What changed in FastMCP ≥ 1.2.4  

* Mandatory support for **resources & resource templates** was merged (see release notes and docs). citeturn6search6turn4search4  
* Clients (Cursor ≥ 0.46) reject servers that answer `listOfferings` without those arrays – the log snippet in Reddit shows `Error listing resource templates: MCP error -32601: Method not found → Client closed`. citeturn7view0  
* Community threads confirm the quick fix is to “return empty arrays even if you don’t need resources”. citeturn9search0turn9search2

---

## 3  Why you suddenly see three hungry Node processes  

1. Cursor calls your MCP command ➜ handshake fails after ~200 ms.  
2. Cursor **does not** kill the child quickly on Windows/macOS, so Node keeps running.  
3. Cursor retries (exponential back‑off) → another Node starts, and so on.  
4. Each orphan is running your TypeScript runtime + ts-node fallback, hence ~100 % CPU and battery drain. citeturn9search4turn0search3

---

## 4  Other minor culprits you should still patch

| Problem | Why it hurts | Quick fix |
|---------|--------------|-----------|
| **`console.log` redirected too late** | Anything logged while the first modules load (e.g. FastMCP banner) still leaks to **stdout** before you monkey‑patch it, corrupting JSON messages. | Create a one‑line bootstrap entry that patches `console.log` **before** importing `server.js`. |
| **`fastmcp` auto‑upgrade** | Every `npx` run will grab whatever is newest on npm, potentially breaking you again. | Pin `"fastmcp": "1.2.2"` (or `"~1.2.4"` once you ship resources) and publish 1.3.6 with `--save‑exact`. |
| **Synchronous JSONL load** in `GraphStorage.load()` | Large memory files freeze the event loop at startup, causing handshake time‑outs that look identical to a client close. | Stream the file line‑by‑line or use a worker thread. |

---

## 5  Patch that fixes Cursor on ≥ 1.3.1  

```ts
// src/bootstrap.mjs  (NEW – entry point)
import { stderrLog } from './stderr-log.js';   // optional, or inline
stderrLog();                                   // sets console.log -> console.error
import './server.js';
```

```ts
// src/stderr-log.ts
export function stderrLog() {
  // do this before anything else uses console.log
  /* eslint-disable no-global-assign */
  console.log = (...args: unknown[]) => console.error(...args);
}
```

```ts
// src/server.ts  (add immediately after FastMCP instantiation)
const server = new FastMCP({ name: 'MCP Think Tank', version: '1.3.6' });

// --- NEW: satisfy FastMCP 1.2.4+ handshake ---
server.addResource({                       // trivial health‑check resource
  uri: 'status://health',
  name: 'Health',
  mimeType: 'text/plain',
  value: 'ok'
});

server.addResourceTemplate({               // empty template, still required
  uri: 'task://{id}',
  name: 'Task JSON',
  mimeType: 'application/json'
});
```

`package.json` changes ↓

```json
{
  "main": "dist/bootstrap.mjs",
  "bin": { "mcp-think-tank": "bin/mcp-think-tank.js" },
  "dependencies": {
    "fastmcp": "1.2.4"          // or 1.2.2 if you prefer zero‑resource mode
  }
}
```

---

## 6  Validation steps

1. `npm ci && npm run build`  
2. `npx fastmcp inspect dist/bootstrap.mjs` — check that **resources=[], resourceTemplates=[]** are present. citeturn0search2  
3. Point Cursor at the new build; the status dot should stay **green** and only **one** Node process should appear in Activity Monitor / Task Manager.  
4. (Optional) run `mcp-cli listOfferings` to verify the handshake manually. citeturn6search1

---

## 7  Short‑term vs. long‑term routes

| Strategy | When to use | Pros | Cons |
|----------|-------------|------|------|
| **Pin fastmcp 1.2.2 & republish 1.3.6** | Need a hot‑fix today | Zero code change, guaranteed to work | Locks you out of new MCP features |
| **Adopt resources (patch above)** | Ready to release 1.4 | Future‑proof, unlocks Cursor’s resource panel | Requires a minor refactor & tests |

Either route eliminates the “Client closed” loop and the ghost Node processes; the resource‑aware path is favoured because Cursor (and Claude Desktop) are leaning heavily on resources for in‑IDE previews. citeturn4search4turn6search6

---

## 8  Further hardening ideas

* **Stream‑read `memory.jsonl`** on start‑up to avoid blocking the event loop.  
* **Watch for unhandled promise rejections** in Exa tools (network failures bubble up to `unhandledRejection` hook and can crash the process).  
* **Guard against huge Exa payloads** – limit `num_results` in `exa_search` to ≤ 25 by default.  
* **Enable FastMCP’s integrated logger** and drop the manual `console.error` shim once the upstream lib routes logs correctly (planned for fastmcp 1.3). citeturn6search3

---

### Next steps

* **Merge the patches**, cut **v 1.3.6**, and update your Cursor `mcp.json` to pin that version.  
* If you need help streaming the JSONL loader or adding real resource templates (e.g. exposing the knowledge‑graph JSON automatically), let me know and we can iterate on the implementation.