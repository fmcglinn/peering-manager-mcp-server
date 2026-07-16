## Why

Answering "how healthy is my peering?" currently requires pulling every BGP session record and counting client-side. With hundreds of sessions, this burns most of the LLM context window on raw data just to produce a handful of aggregate numbers. A summary tool that returns session counts by state per router would make health-check queries a single lightweight call instead of a context-destroying bulk fetch.

## What Changes

- **New `get_bgp_session_summary` tool**: Returns session counts grouped by router and BGP state. Queries both direct and IXP session endpoints, aggregates the results server-side, and returns a compact summary object.
- **Output shape**: An array of per-router summaries, each containing the router name, total session count, and a breakdown by BGP state (established, active, idle, opensent, openconfirm, connect). Also includes a top-level totals object with the same breakdown across all routers.
- **Filters**: Supports the same filters as `list_bgp_sessions` (`asn`, `router_name`, `internet_exchange_id`, `status`, `address_family`) so you can scope the summary to a subset (e.g., "summary for router esg1-cor1 only" or "summary for IPv6 sessions only").

## Capabilities

### New Capabilities

- `session-summary`: A server-side aggregation tool that computes BGP session health summaries without returning individual session records.

### Modified Capabilities

None.

## Impact

- **Files modified**: `src/tools/bgp-sessions.ts` (add new tool registration)
- **API calls**: The tool must paginate through all matching sessions to build the summary. For large deployments this could mean multiple API round-trips. The tool SHALL paginate internally (fetching up to `limit` records per page) until all matching sessions are counted, up to a configurable max (default 10,000 sessions). This is server-side work the LLM doesn't see — only the compact summary is returned.
- **No breaking changes**: Purely additive — a new tool alongside existing ones.
- **No new dependencies**.
