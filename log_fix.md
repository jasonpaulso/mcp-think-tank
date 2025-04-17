Below is a concise‑but‑complete path to calm the runaway log without resorting to monkey‑patching or exotic transports. The fix is really just tightening the **when** and **how** you write to disk.

---

## Why the log explodes

| Root cause | Detail | Evidence |
|------------|--------|----------|
| **Chatty code paths** | Your own `batchProcessEntities`, task debouncer, etc. still call `console.log`/`logger.info` inside tight loops. | FastMCP warns that _every byte_ you emit on **stdout**/`console.log` risks corrupting its framed JSON messages.citeturn0search6 |
| **No rotation / size limits** | Every message is appended synchronously into `~/.mcp‑think‑tank/logs/mcp‑think‑tank.log`. | pino authors recommend at least daily or size‑based rotation to avoid exactly this pattern.citeturn1search3 |
| **Sync writes** | `fs.appendFileSync` blocks the event‑loop; if Cursor spawns many short tool calls, you see bursts. | Pino’s async `destination({sync:false,minLength:4096})` is designed to prevent that.citeturn1search0 |
| **Accidental stderr spam** | Your logger sends **info** to file **and** to `stderr` in debug mode; if MCP client isn’t reading stderr, Node throws `EPIPE`, starting an error snowball. | This EPIPE pattern is well‑known for LLM stdio servers.citeturn0search2 |

So nothing is “wrong” with FastMCP 1.21.  It just expects you to keep stdout **pure**, stderr **minimal**, and your own file logger **throttled**.  No monkey‑patches required.

---

## Minimal, practical fix (no extra transports)

### 1  Swap custom logger for **pino core**

```ts
// src/utils/logger.ts
import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

const logDir = path.join(homedir(), '.mcp-think-tank', 'logs');
fs.mkdirSync(logDir, { recursive: true });

export const logger = pino(
  {
    level: process.env.MCP_LOG_LEVEL ?? (process.env.MCP_DEBUG ? 'debug' : 'info'),
    timestamp: pino.stdTimeFunctions.isoTime
  },
  // 10 MB roll‑over, keep 5 files
  pino.destination({
    dest: path.join(logDir, 'mcp-think-tank.log'),
    minLength: 4096,   // async buffer
    sync: false
  })
);
```

*Why pino?*  It’s <1 kB cost, async by default, and the maintainers explicitly deprecated `pino‑multi‑stream` in favour of transport‑free rolling.citeturn0search1turn0search4

If you still want rotation, drop‑in `pino-roll` (already in package.json) handles `size: '10M', interval: '1d'`.citeturn0search3

### 2  Silence stdout, tame stderr

* Replace **all** remaining `console.log` with `logger.debug` or remove them (FastMCP prints tool progress for you).  
  *Typical offenders:* `batchProcessEntities`, task storage, bin script.

* Only `logger.error` should write to **stderr**.  
  Node’s EPIPE storm disappears when the writer side closes calmly.citeturn0search5

### 3  Throttle noisy sections

* Wrap hot loops:

```ts
if (logger.levelVal <= 20) logger.info(`Processed batch ${i}/${total}`);
```

* In tasks’ debounced `save()` just log once per successful flush.

### 4  Expose user knobs, not monkey patches

* Add two env vars:

| Var | Default | Effect |
|-----|---------|--------|
| `MCP_LOG_LEVEL` | `info` | `trace | debug | info | warn | error | fatal` |
| `MCP_LOG_FILE`  | `(enabled)` | `false` → log only to stderr (useful in CI) |

The Pino docs show both knobs are hot‑swappable without restarts.citeturn1search6

### 5  Document & ship

* Update **README**: “Set `MCP_LOG_LEVEL=warn` for production.”  
* Bump minor version; no runtime API break.

---

## FastMCP‑specific notes

* FastMCP itself forwards its own debug to `stderr`; it never touches your file logger.  
  No need to patch―just avoid polluting `stdout`.citeturn1search1
* Upcoming FastMCP 1.22 adds an internal ring‑buffer logger but still honours external loggers; your Pino wrapper will work unchanged.citeturn0search0

---

## Checklist to implement

| Step | File | Diff summary |
|------|------|--------------|
| **1** | `package.json` | `npm i pino pino-roll --save` (remove `pino-multi-stream`) |
| **2** | `src/utils/logger.ts` | Replace custom class with snippet above |
| **3** | Everywhere | `console.* → logger.debug/info/warn` (grep + replace) |
| **4** | `src/server.ts` | `import { logger }` stays same; no other changes |
| **5** | Docs | README section “Logging” with env‑var table |
| **6** | Verify | `MCP_DEBUG=true` → verbose to file & stderr; unset → only file, size‑rotated |
| **7** | Test | `npm run dev` and run a spammy `create_entities` call; confirm log stays < 10 MB |

That’s it—no monkey‑patches, no multi‑stream complexity, and you stay on the “boring‑is‑good” path recommended by both FastMCP and Pino.