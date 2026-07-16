## Context

Peering Manager is a Django application with a REST API (~30 endpoints across 8 apps) for managing BGP peering infrastructure. It stores autonomous systems, BGP sessions (direct and IXP-based), routers, IXP connections, routing policies, communities, and a cached copy of PeeringDB. Authentication is via API tokens. The API returns paginated JSON with filtering via query parameters.

This project is a greenfield TypeScript package — no existing code to integrate with.

## Goals / Non-Goals

**Goals:**
- Expose Peering Manager data through 13 intent-based MCP tools for conversational querying
- Unify the two BGP session models (DirectPeeringSession + InternetExchangePeeringSession) into a coherent list/detail pattern
- Handle pagination, filtering, authentication, and error handling cleanly
- Keep tool count under 15 for reliable model tool selection

**Non-Goals:**
- Write operations (create/update/delete sessions, deploy configs, trigger polls)
- HTTP/SSE transport (stdio only for now; transport is a one-line swap later)
- Caching or local state — every tool call hits the Peering Manager API fresh
- PeeringDB sync triggering — only query the already-cached data
- User management or multi-tenant access control

## Decisions

### 1. TypeScript with @modelcontextprotocol/sdk

The official MCP TypeScript SDK is the reference implementation with the most mature stdio transport. The server is a thin proxy (validate → fetch → return), so language choice matters little — TS gives us type safety on tool input schemas for free.

Alternative considered: Python SDK — equally viable but less mature for stdio. No strong reason to prefer it.

### 2. Thin proxy architecture (no ORM, no local state)

Each tool maps directly to one or two GET requests. No caching, no local database, no data transformation beyond field selection and merging. The Peering Manager instance is the single source of truth.

Alternative considered: Local caching layer (SQLite) to reduce API calls. Rejected — adds complexity, staleness risk, and the API is already fast for read queries. The MCP server should be stateless.

### 3. Unified session list with type-specific detail

`list_bgp_sessions` queries both `/api/peering/direct-peering-sessions/` and `/api/peering/internet-exchange-peering-sessions/`, extracts common fields, tags with `session_type`, and merges. `get_bgp_session_detail` takes `id` + `session_type` and returns the full type-specific response with no null padding.

The merge in list view: query both endpoints in parallel (Promise.all), map each to the common field set, concatenate, sort by status (non-established first) then ASN. Apply client-side filtering for any filters that don't map 1:1 to both APIs (e.g. `is_route_server` only applies to IXP sessions — skip direct sessions when that filter is set).

Alternative considered: Two separate list tools. Rejected — forces the user/model to know Peering Manager's internal data model distinction, and "which sessions are down" is the most common query.

### 4. Two-tier timeouts

Most tools make simple database-backed API calls — 30s is generous. `get_router_configuration` triggers Jinja2 template rendering which may resolve AS-SETs via IRR queries — 120s timeout with AbortController.

### 5. Pagination strategy

All list tools accept `limit` (default 100, max 1000) and `offset` params. Responses include `total_count` alongside results so the model can tell the user "showing 100 of 347 sessions" and request more if needed. No auto-pagination — keeps responses bounded for context window management.

### 6. Single API client module

One shared module handles: base URL construction, Authorization header injection, query string building from tool params, timeout via AbortController, HTTP error handling (map 401→auth error, 404→not found, 5xx→server error with message), and response envelope unwrapping (extract `results` + `count` from paginated responses).

### 7. Project structure

```
peering-manager/
├── src/
│   ├── index.ts              # Entry point, server setup, stdio transport
│   ├── client.ts             # Peering Manager API client
│   ├── types.ts              # Shared TypeScript types
│   └── tools/
│       ├── bgp-sessions.ts   # list_bgp_sessions, get_bgp_session_detail
│       ├── autonomous-systems.ts  # list_autonomous_systems, get_autonomous_system
│       ├── infrastructure.ts # list_routers, list_internet_exchanges, get_internet_exchange, list_connections
│       ├── policy.ts         # list_routing_policies, list_communities
│       ├── config.ts         # get_router_configuration
│       ├── peeringdb.ts      # search_peeringdb
│       └── audit.ts          # list_changes
├── package.json
└── tsconfig.json
```

Tool files export a registration function that takes the MCP server instance and the API client, and registers their tools with input schemas and handlers.

## Risks / Trade-offs

- **[Large merged responses]** → `list_bgp_sessions` with hundreds of sessions on both types could produce large JSON. Mitigation: default limit of 100, model can narrow with filters.
- **[API version drift]** → Peering Manager API fields may change across versions. Mitigation: the server is a thin proxy returning upstream JSON; field changes flow through transparently. Only the common-field extraction in `list_bgp_sessions` is brittle — document which PM version was targeted.
- **[Config render timeout]** → 120s may still not be enough for very large networks with complex IRR resolution. Mitigation: configurable via `PM_CONFIG_TIMEOUT` env var, defaulting to 120s.
- **[No rate limiting]** → A conversational loop could hammer the PM API. Mitigation: acceptable for single-user CLI use; add rate limiting if this moves to multi-user HTTP transport.
