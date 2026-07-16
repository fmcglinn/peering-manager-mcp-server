## Context

`get_router_configuration` in `src/tools/config.ts` is a 15-line function that takes an `id`, calls `get(/api/devices/routers/${id}/configuration/)` with extended timeout, and returns the result. The upstream router list API supports `name` and `hostname` as exact-match filters (confirmed in `RouterFilterSet.Meta.fields`).

The `mcp-tool-improvements` change (in progress) adds `name`, `hostname`, and `search` filters to `list_routers`. This change builds on that — it uses the same upstream filters for resolution.

## Goals / Non-Goals

**Goals:**
- Allow `get_router_configuration` to accept `name` or `hostname` instead of `id`
- Fail clearly on zero or multiple matches
- Keep the tool schema simple — one tool, three mutually-exclusive identifier params

**Non-Goals:**
- Adding a generic "resolve by name" pattern to the client layer (YAGNI — this is the only `get_*` tool where name resolution matters today)
- Caching router name→ID mappings
- Supporting partial/fuzzy name matching (use `list_routers(search: ...)` for that)

## Decisions

### 1. Mutually-exclusive params with runtime validation

**Decision**: The tool schema defines `id` (number, optional), `name` (string, optional), `hostname` (string, optional) — all optional. The handler validates that exactly one is provided and returns a clear error otherwise.

**Rationale**: Zod doesn't natively express "exactly one of three" in a way that MCP tool schemas render well. Making all three optional with runtime validation keeps the schema clean for LLM tool-calling while still enforcing correctness.

**Alternative considered**: Three separate tools (`get_router_configuration_by_id`, `_by_name`, `_by_hostname`). Rejected — it triples the tool surface for a trivial variation, and LLMs handle optional params fine.

### 2. Resolution via list endpoint with limit=2

**Decision**: When resolving by `name` or `hostname`, call `list("/api/devices/routers/", { params: { name | hostname }, limit: 2 })`. If 0 results → "not found" error. If 2 results → "ambiguous" error listing matches. If exactly 1 → use its `id` for the config fetch.

**Rationale**: `limit: 2` is the minimum needed to distinguish "unique match" from "ambiguous". We don't need the full list — just enough to detect the problem. The `name` and `hostname` filters are exact-match in the upstream filterset (they're in `Meta.fields`, not the `search()` method), so partial matches won't pollute results.

### 3. Sequential calls, not parallel

**Decision**: Resolve the router ID first, then fetch config. Don't try to parallelize.

**Rationale**: The config fetch needs the ID from the resolution step. And the resolution call is ~100ms while the config render is 2-30 seconds — overlapping them would save nothing meaningful.

## Risks / Trade-offs

**[Extra API call on name/hostname path]** → Negligible. The config render itself dominates latency. The resolution call adds ~100ms to a 2-30 second operation.

**[Name/hostname might not be unique]** → Mitigated by the ambiguity check (limit=2). The error message lists matching routers so the user can refine. In practice, router names are almost always unique in a deployment.
