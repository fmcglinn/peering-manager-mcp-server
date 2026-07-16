## Context

`list_bgp_sessions` in `src/tools/bgp-sessions.ts` queries both direct and IXP session endpoints and returns a merged list with `extractCommonFields()`. For a health check ("how many sessions are established per router?"), the LLM must fetch all sessions and count manually — burning context on hundreds of full session records to produce a few numbers.

The upstream Peering Manager API has no aggregation endpoint. All counting must happen in the MCP server by paginating through results.

## Goals / Non-Goals

**Goals:**
- Single-call BGP health overview: session counts by state, grouped by router
- Compact response — tens of lines, not hundreds of session records
- Same filter surface as `list_bgp_sessions` for scoped summaries

**Non-Goals:**
- Real-time streaming or polling (this is a snapshot)
- Per-peer detail in the summary (that's what `list_bgp_sessions` is for)
- Prefix count aggregation (different axis — could be a future tool)
- Upstream API changes

## Decisions

### 1. Paginate internally, return only aggregates

**Decision**: The tool fetches all matching sessions by paginating through both direct and IXP endpoints (1000 per page), counts by router × BGP state in memory, and returns only the summary object. Individual session records are never included in the response.

**Rationale**: The whole point is to avoid dumping session records into context. The counting is trivial — it's a single pass over the results accumulating into a `Map<routerName, Map<bgpState, count>>`. Memory cost is negligible even for thousands of sessions.

**Safety cap**: Stop after 10,000 total sessions (configurable). If hit, include a `truncated: true` flag and `total_sessions_scanned` in the response so the caller knows the counts are approximate.

### 2. Output shape: array of per-router objects + totals

**Decision**:
```
{
  totals: { established: N, active: N, idle: N, ... , total: N },
  routers: [
    { name: "esg1-cor1", established: N, active: N, ... , total: N },
    ...
  ],
  truncated: false,
  sessions_scanned: N
}
```

State keys are the lowercase BGP state values from the API (`established`, `active`, `idle`, `opensent`, `openconfirm`, `connect`). Unknown states go into an `other` bucket.

**Rationale**: Flat per-router objects are easy for an LLM to read and compare. The totals object gives the global view without the LLM having to sum. `sessions_scanned` provides confidence the numbers are complete.

### 3. Reuse existing filter-building logic

**Decision**: Extract the filter-building logic from `list_bgp_sessions` into a shared helper (or inline-duplicate for now), then reuse it in `get_bgp_session_summary`. Both tools accept the same filter params and build the same `directParams`/`ixpParams` objects.

**Rationale**: Keeps the filter behavior identical between list and summary tools. An LLM that knows how to filter `list_bgp_sessions` already knows how to filter the summary.

**Alternative considered**: A `summary: true` flag on `list_bgp_sessions` that changes the response shape. Rejected — mixing return types on one tool is confusing for LLM tool-calling (the schema can't express "returns either sessions or summary depending on a flag").

### 4. Pagination: fetch 1000 per page, both endpoints in parallel

**Decision**: For each page, fetch direct and IXP sessions in parallel (same as `list_bgp_sessions`). Use `limit=1000` (the max our client allows) per request to minimize round-trips. Continue paginating until both endpoints are exhausted or the safety cap is hit.

**Rationale**: 1000/page means a deployment with 500 sessions needs 1 round (2 parallel API calls). A large deployment with 5000 sessions needs 5 rounds. Each round is ~200ms — total pagination time stays under 2 seconds for most deployments.

## Risks / Trade-offs

**[Pagination latency for large deployments]** → Acceptable. Health checks are infrequent, and the alternative (LLM fetching and counting) is slower AND more expensive. The safety cap prevents runaway pagination.

**[Counts may be stale by the time the LLM reads them]** → Inherent to any snapshot. BGP state changes continuously. The summary is "as of the moment the tool ran" — same as `list_bgp_sessions`.

**[Duplicating filter logic]** → Minor maintenance cost. If a future refactor extracts shared filter-building, both tools benefit. For now, the duplication is small (~30 lines) and explicit.
