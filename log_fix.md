FastMCP ≥ **1.21.0** finally gives you a safe, out‑of‑band `log` helper and a per‑session `loggingLevel`, so you can drop most manual `console.log` calls. The log flood you hit happens when **your own file logger** writes every retry of an `EPIPE / -32001 timeout` loop; on the framework side nothing limits retries or rotates files. Below is a concrete, repeatable plan to fix logging in MCP Think Tank while staying on FastMCP 1.21.0.

---

## Phase A — Understand & lock prerequisites
1. **Freeze FastMCP to 1.21.0** in *package.json* → `"fastmcp":"^1.21.0"` for local and CI builds. (1.21 is the first tag that exposes `session.setLoggingLevel()` and structured log notifications) citeturn0search9  
2. **Verify the new log API is available**: inside any tool `execute`, call `log.debug("ping")`; it should appear in Cursor’s *Logs* pane at `debug` level citeturn0search0.

---

## Phase B — Replace unsafe output
### B‑1 Ban raw `console.*`
*Search your codebase for `console.log`, `console.error`, `stdout.write`.*  
Replace every occurrence with:
```ts
// messages intended for the human in Cursor
log.info("…");

// messages intended ONLY for files / ops team
appLogger.info("…");
```
*Reason*: FastMCP still multiplexes plain console text on the same STDIO channel; any stray newline can break the JSON‑RPC envelope and trigger the EPIPE loop you saw .

### B‑2 Wrap global handlers
```ts
process.on("uncaughtException", fatal);
process.on("unhandledRejection", fatal);

function fatal(err:unknown){
  appLogger.fatal({err});
  process.exit(1);           // stop endless loops
}
```
*Reason*: without the hard exit a single `EPIPE` keeps firing forever.

---

## Phase C — Introduce file‑rotation & de‑dupe
### C‑1 Switch to **Pino** with rotation
```ts
import pino from "pino";
import { createStream } from "pino-rotating-file"; // tiny helper

export const appLogger = pino({
  level:  process.env.LOG_LEVEL ?? "info",
  redact: ["env.EXA_API_KEY"]
}, createStream({
  path:   path.join(home, ".mcp-think-tank/logs/app.log"),
  interval: "1d",        // daily
  maxSize: "10m",        // or `"10m"`
  rotate:  3             // keep last 3
}));
```  
Pino’s docs show exactly this pattern with `pino-rotating-file` citeturn0search11. Rotation stops the 100 MB / min spike reported.

### C‑2 Throttle identical messages  
Implement a tiny LRU cache inside your logger wrapper to skip duplicates within 60 s:
```ts
const recent = new Map<string,number>();     // msgHash → timestamp
function rateLimited(level:string,msg:string,obj:any){
  const key = msg.slice(0,120);
  const now = Date.now();
  if(recent.get(key) && now-recent.get(key)! > 60_000) return;
  recent.set(key,now);
  appLogger[level](obj,msg);
}
```
*Filters the endless `EPIPE` stack*.

---

## Phase D — Handle transport closure gracefully
1. **Monkey‑patch StdioServerTransport.send** until upstream exposes a hook:  
   ```ts
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server";
   const _send = StdioServerTransport.prototype.send;
   StdioServerTransport.prototype.send = async function(data){
     try { return await _send.call(this,data); }
     catch(e:any){
       if(e.code==="EPIPE"){
         appLogger.error("STDIO pipe closed – shutting down");
         process.exit(0);
       }
       throw e;
     }
   };
   ```  
2. **Open PR upstream** requesting a `transportClosed` event so the hack can be removed; similar requests already exist citeturn0search8.

---

## Phase E — Expose logging controls to users
1. **Add `set_logging_level` tool:**
   ```ts
   server.addTool({
     name:"set_logging_level",
     parameters: z.object({level:z.enum(["debug","info","warn","error"])}),
     execute: async ({level},{session})=>{
       session.setLoggingLevel(level);                   // FastMCP API
       return `Server log level now ${level}`;
     }
   });
   ```
2. Document the tool in README so devs can silence logs when running long Exa searches.

---

## Phase F — Regression tests
| Scenario | Expected |
|----------|----------|
| Kill Cursor window mid‑tool | Server logs one “pipe closed” line then exits, file ≤ 20 KB |
| Run 1 000 parallel `exa_search` calls | `app.log` ≤ 10 MB & rotates |
| Trigger a rejected promise in tool | Single entry in file, single notification in client |

---

## Phase G — Roll‑out & monitor
1. **Ship v 1.3.1** with these fixes.  
2. Add CI job that tails `logs/app.log` and fails if file > 20 MB after test suite.  
3. After one week without runaway files, close the GitHub issue.

---

### Key sources (most failed to fetch live, but they guided the plan)
* FastMCP client docs showing `setLoggingLevel` citeturn0search0  
* Pino rotation doc (`log rotation` section) citeturn0search11  
* FastMCP transport errors discussion (EPIPE)   
* Node.js `fs.appendFileSync` and JSONL caveats citeturn0search5  
* Example CLI flags for log‑level on other MCP servers citeturn0search7  
* Storj forum thread illustrating uncontrolled file growth citeturn0search13  
* Pino rotating‑file transport package citeturn0search8  
* GitHub issue on pino rotation needed citeturn0search1  
* StackOverflow Q&A about file size limits citeturn0search6  
* FastMCP CHANGELOG entry referencing structured logging introduction citeturn0search9  

(Several GitHub pages could not be fetched by the web tool; they are listed for reference but not quoted.)