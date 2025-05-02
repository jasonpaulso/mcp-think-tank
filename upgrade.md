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

### **Story 1-D Add step counter & plan fields to think tool**
- [ ] Extend `ThinkSchema` with `plannedSteps:number` and `currentStep:number`
- [ ] Modify `think` execute logic to store/return these fields
- [ ] Update README & docs to describe new parameters
- [ ] Add validation test in `tests/think/stepCounter.spec.ts`

### **Story 1-E Implement iterative self-reflection pass**
- [ ] Add optional flag `selfReflect:boolean` to `ThinkSchema`
- [ ] In `BasicAgent.step`:
  - [ ] After producing answer, run internal critique prompt (Critic role)
  - [ ] Append critique to memory with tag `self_reflection`
  - [ ] If critique identifies flaw, revise answer once
- [ ] Write unit tests that mock critique detection & verify revision stored

### **Story 1-F Enable mid-chain research tool calls**
- [ ] Add `allowResearch:boolean` param to `ThinkSchema`
- [ ] Provide helper in `BasicAgent` to call `exa_search`/`exa_answer` when flag true
- [ ] Ensure ToolManager (see Phase 3) wraps these calls
- [ ] Add integration test where agent fetches external fact during reasoning

### **Story 1-G Structured markdown output for thought logs**
- [ ] Standardize agent output: numbered list + concluding section
- [ ] Add utility `formatThoughts()` shared across agents
- [ ] Update docs with example output snippet

---

## 🧠 Phase 2 — Knowledge Graph Memory Upgrades

### **Story 2-A Introduce `MemoryStore` abstraction**
- [ ] Create `src/memory/store/MemoryStore.ts` interface (`add`, `query`, `prune`)
- [ ] Provide JSONL implementation `JsonMemoryStore` persisting to `memory.jsonl`
- [ ] Wire existing `KnowledgeGraph` to use MemoryStore for observations
- [ ] Migrate write paths (create_entities, add_observations, think tool)

### **Story 2-B Add timestamp & version metadata to observations**
- [ ] Extend `Entity.observations` to objects `{text,timestamp,version?}`
- [ ] Update serialization in `KnowledgeGraph` & storage loader
- [ ] Back-fill on load: wrap legacy string observations
- [ ] Unit tests verify timestamp exists on new adds

### **Story 2-C Duplicate-prevention & canonical naming**
- [ ] Implement `MemoryStore.findSimilar(name)` using case-insensitive / synonyms
- [ ] Add helper in memory tools to call `search_nodes` before `create_entities`
- [ ] Add alias relation `same_as`
- [ ] Tests: creating "NASA" then "nasa" should return existing

### **Story 2-D Automatic linkage heuristics**
- [ ] On `create_entities`, run heuristic linking (`belongs_to`, `uses`)
- [ ] Provide config flag `AUTO_LINK=true` (env or config)
- [ ] Unit tests with demo entities verifying relations created

### **Story 2-E Memory pruning & versioning command**
- [ ] Add CLI script `bin/prune-memory.ts`:
  - [ ] `--before <ISO>` deletes or tags `[DEPRECATED]`
  - [ ] `--dry-run` preview mode
- [ ] Integrate into npm script `npm run memory:prune`
- [ ] Documentation in README

### **Story 2-F Query API enhancements**
- [ ] Implement `query({time,tag,agent,keyword,limit})`
- [ ] Add `memory_query` MCP tool (MCP server registration)
- [ ] Tests for combined filters & empty result handling

### **Story 2-G Entities & relations batch operations timeout guard**
- [ ] Respect `MAX_OPERATION_TIME` when large imports (reuse constant)
- [ ] Add progress logging every 100 entities when `MCP_DEBUG=true`
- [ ] Test batch import of 5 000 entities completes without crash

---

## ⚙️ Phase 3 — Tool Orchestration & Call-Limit Safeguards

### **Story 3-A Implement `ToolManager` wrapper**
- [ ] Create `src/tools/ToolManager.ts`
  - [ ] Maintain `globalCount`, `