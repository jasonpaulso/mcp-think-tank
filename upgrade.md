# MCP Think Tank v2 Upgrade — Comprehensive Implementation Checklist  
*All tasks are **1 story point** (≈0.5–1 dev-day) and include granular unchecked subtasks.  
Strictly follow every sub-task in order; no details may be skipped.*

---

## 📦 Phase 1 — Sequential Thinking & Chained Reasoning

### **Story 1-A Create core multi-agent interfaces**
- [x] **Create `src/agents/IAgent.ts`**
  - [x] Export `IAgent` with async methods `init(ctx)`, `step(input)`, `finalize()`
  - [x] Include `agentId:string`, `memory:MemoryStore` properties
  - [x] Document JSDoc contract & expected side-effects
- [x] **Add barrel file `src/agents/index.ts`** exporting interface and concrete agents

### **Story 1-B Refactor existing single-agent logic into `BasicAgent`**
- [x] Move code in `think/tools.ts` reasoning loop to new class `BasicAgent` (`src/agents/BasicAgent.ts`)
- [x] Inject `think` tool params via constructor
- [x] Adapt to `IAgent` lifecycle (store output to memory on `finalize()`)
- [x] Write unit test (`tests/agents/basicAgent.spec.ts`) verifying `step` & memory write

### **Story 1-C Introduce Orchestrator & coordination strategies**
- [x] Create `src/orchestrator/Orchestrator.ts`
  - [x] Accept `agents:IAgent[]`, `strategy:CoordinationStrategy`
  - [x] Emit `run(input):Promise<OrchestrationResult>`
- [x] Add `CoordinationStrategy` interface (`nextAgent()`, `combine(outputs)`)
- [x] Implement `SequentialStrategy` (round-robin until `done`)
- [x] Implement `ParallelStrategy` (Promise.all & merge)
- [x] Unit tests covering agent order & merge correctness

### **Story 1-D Add step counter & plan fields to think tool**
- [x] Add `plannedSteps`, `currentStep` to `ThinkSchema` (implement as `ExtendedThinkSchema`)
- [x] Calculate current as % of planned or estimate based on text complexity
- [x] Test multi-step plans in IDE with same agent, verify continuity across calls
- [x] Update Readme with multi-step instructions

### **Story 1-E Implement iterative self-reflection pass**
- [x] Extend `ThinkSchema` with `selfReflect:boolean` (default: false)
- [x] Add optional `reflectPrompt:string` for custom reflection
- [x] Update agent to perform reflection on its reasoning when enabled
- [x] Store reflection result and original reasoning when `storeInMemory:true`
- [x] Test in IDE with self-reflection, verify output quality

### **Story 1-F Enable mid-chain research tool calls**
- [x] Add `allowResearch:boolean` option to `ExtendedThinkSchema` (default: false)
- [x] Support optional `researchQuery:string` parameter for initial research
- [x] Implement detection of inline research requests using `[research: query]` syntax
- [x] Parse results into structured format and append to reasoning + memory
- [x] Add relevant relations for research sources
- [x] Create tests verifying research feature

### **Story 1-G Structured markdown output for thought logs**
- [x] Add formatters for different reasoning types (general, comparison, problem-solving)
- [x] Include auto-detection based on content
- [x] Add `formatOutput:boolean` and `formatType:string` options to schema
- [x] Modify BasicAgent to apply formatting before returning results
- [x] Update tests to verify formatting behavior
- [x] Update README with formatting documentation

### **Phase 1 Completion**
✅ **All Phase 1 tasks successfully completed and tested**  
- [x] All 62 tests passing
- [x] Package built and verified with local smoke test
- [x] Published to npm as v1.4.1
- [x] Tested with global installation (`npm install -g mcp-think-tank@1.4.1`)
- [x] Successfully integrated with Cursor via global installation in mcp.json
- [x] Sequential thinking and chained reasoning functions verified in live environment

---

## 🧠 Phase 2 — Knowledge Graph Memory Upgrades

### **Story 2-A Introduce `MemoryStore` abstraction**
- [ ] Create `src/memory/store/MemoryStore.ts` interface (`add`, `query`, `prune`)
- [ ] Provide JSONL implementation `JsonMemoryStore` persisting to `memory.jsonl`
- [ ] Wire existing `KnowledgeGraph` to use MemoryStore for observations
- [ ] Migrate write paths (create_entities, add_observations, think tool)

### **Story 2-B Add timestamp & version metadata to observations**
- [ ] Extend `Entity.observations` to objects `{text,timestamp,version?}`
- [ ] Update serialization in `KnowledgeGraph` & storage loader
- [ ] Back-fill on load: wrap legacy string observations
- [ ] Unit tests verify timestamp exists on new adds

### **Story 2-C Duplicate-prevention & canonical naming**
- [ ] Implement `MemoryStore.findSimilar(name)` using case-insensitive / synonyms
- [ ] Add helper in memory tools to call `search_nodes` before `create_entities`
- [ ] Add alias relation `same_as`
- [ ] Tests: creating "NASA" then "nasa" should return existing

### **Story 2-D Automatic linkage heuristics**
- [ ] On `create_entities`, run heuristic linking (`belongs_to`, `uses`)
- [ ] Provide config flag `AUTO_LINK=true` (env or config)
- [ ] Unit tests with demo entities verifying relations created

### **Story 2-E Memory pruning & versioning command**
- [ ] Add CLI script `bin/prune-memory.ts`:
  - [ ] `--before <ISO>` deletes or tags `[DEPRECATED]`
  - [ ] `--dry-run` preview mode
- [ ] Integrate into npm script `npm run memory:prune`
- [ ] Documentation in README

### **Story 2-F Query API enhancements**
- [ ] Implement `query({time,tag,agent,keyword,limit})`
- [ ] Add `memory_query` MCP tool (MCP server registration)
- [ ] Tests for combined filters & empty result handling

### **Story 2-G Entities & relations batch operations timeout guard**
- [ ] Respect `MAX_OPERATION_TIME` when large imports (reuse constant)
- [ ] Add progress logging every 100 entities when `MCP_DEBUG=true`
- [ ] Test batch import of 5 000 entities completes without crash

---

## ⚙️ Phase 3 — Tool Orchestration & Call-Limit Safeguards

### **Story 3-A Implement `ToolManager` wrapper**
- [ ] Create `src/tools/ToolManager.ts`
  - [ ] Maintain `globalCount`, `perAgentCount` maps
  - [ ] Expose `callTool(agentId,name,params)`
  - [ ] If `globalCount >= MAX_TOOL_CALLS` throw `ToolLimitError`
- [ ] Add `MAX_TOOL_CALLS` const (default 25, overridable via `TOOL_LIMIT`)
- [ ] Log each call (`timestamp`, `agentId`, `toolName`, `params.summary`)

### **Story 3-B Refactor all existing tools to use ToolManager**
- [ ] Wrap calls in `think`, `research`, `tasks`, `memory` modules
- [ ] Provide lightweight adapter for internal function calls
- [ ] Ensure return shapes unchanged for upstream logic
- [ ] Grep repository to confirm no direct tool calls remain

### **Story 3-C Concurrency-safe counter increment**
- [ ] Since Node JS is single-threaded, use atomic increment in shared module
- [ ] If worker_threads used (parallel strategy), protect with `Atomics` + `SharedArrayBuffer`
- [ ] Add fallback lock using `async-mutex` library
- [ ] Unit stress test spawning 10 workers each making 5 calls — expect cap at 25

### **Story 3-D Duplicate-call cache**
- [ ] Inside ToolManager, keep LRU cache (size 100) keyed by `{toolName,JSON.stringify(params)}`
- [ ] If identical call exists in cache, return cached result without incrementing count
- [ ] Env flag `CACHE_TOOL_CALLS=true/false`
- [ ] Tests verifying hit/miss behavior & no count bump on hit

### **Story 3-E Configurable tool whitelists per task**
- [ ] Add Orchestrator param `allowedTools:string[]`
- [ ] During agent step, ToolManager checks whitelist before execution
- [ ] If disallowed, throw `ToolNotPermittedError`
- [ ] Unit test: agent blocked from `exa_search` when whitelist excludes it

### **Story 3-F Tool-limit feedback & graceful halt**
- [ ] Catch `ToolLimitError` in orchestrator
- [ ] Write memory log with tag `limit_reached`
- [ ] Return partial results to caller with status `"HALTED_LIMIT"`
- [ ] Integration test loops until 26 calls; expect halt + memory entry

### **Story 3-G Execution cache for file/URL reads**
- [ ] Extend ToolManager with secondary cache for `open`, `find`, etc.
- [ ] Store SHA-1 of content to detect unchanged reads
- [ ] Skip repeat reads in same session and reuse parsed content
