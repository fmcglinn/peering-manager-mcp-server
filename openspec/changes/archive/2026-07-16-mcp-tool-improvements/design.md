## Context

The MCP server is a thin pass-through: each tool builds query params, calls the Peering Manager REST API via `client.ts`, and returns the JSON response verbatim (or with light extraction in the case of `list_bgp_sessions`). The upstream API returns full nested objects on every endpoint — useful for a web UI, expensive for an LLM context window.

The codebase is small (7 tool files, 1 client, 1 types file) with no test suite. The `bgp-sessions.ts` file already demonstrates the response-shaping pattern via `extractCommonFields()`.

Upstream Peering Manager filtersets expose `q` (routed to a `search()` method), `name`, `hostname`, and `_name`/`_id` suffixed relation filters on every relevant model. Our tools currently pass through only a fraction of these.

## Goals / Non-Goals

**Goals:**
- Reduce AS response payload from 2.3MB to <50KB by stripping IRR-derived fields
- Reduce IXP/router/connection list payloads by trimming repeated nested objects
- Expose upstream `q` search on all endpoints that support it
- Add `name`/`hostname` direct filters where upstream supports them
- Normalize param naming to a consistent convention across tools
- Fix the silent IXP session router filter gap

**Non-Goals:**
- Modifying the upstream Peering Manager API or serializers
- Adding write/mutation tools
- Building aggregate/summary endpoints (valuable, but separate change)
- Exposing every upstream filter — only add the ones useful to LLM workflows
- Adding a test suite (separate effort)

## Decisions

### 1. Response shaping: strip in the MCP tool layer, not the client

**Decision**: Each tool function strips/reshapes the API response before returning it. The `client.ts` `list()` and `get()` functions remain generic pass-throughs.

**Rationale**: The shaping logic is tool-specific (AS records need prefix counts; IXP records need trimmed `local_autonomous_system`). Pushing this into the client would either require per-endpoint config or make the client aware of domain models. The `extractCommonFields` pattern in `bgp-sessions.ts` already proves this approach.

**Alternative considered**: A generic `fields` parameter on `list()` that strips keys. Rejected because some transformations are additive (computing `prefix_count_v4` from `prefixes.ipv4.length`), not just subtractive.

### 2. AS payload: strip `prefixes`, `as_list`, `as_list` count and prefix counts as replacements

**Decision**: Remove `prefixes` and `as_list` from both `list_autonomous_systems` and `get_autonomous_system` responses. Add `prefix_count_v4`, `prefix_count_v6`, `as_list_count` integer fields.

**Rationale**: These fields account for 97% of the AS response size. They contain IRR-expanded data used only by Jinja2 config templates. An LLM needs to know "this AS has 22K prefixes", never the actual prefix list. The `get_router_configuration` tool already returns the rendered config containing these prefix-lists — that's the right access path for the actual data.

**No opt-in for raw fields**: YAGNI. If a future use case needs raw prefixes, add a dedicated `get_autonomous_system_prefixes` tool rather than a flag on the list/detail tools.

### 3. Nested object trimming: utility function per entity type

**Decision**: Create small helper functions (`summarizeAS()`, `summarizePolicy()`, etc.) that reduce a full nested object to `{id, name}` (or `{id, asn, name}` for AS). Apply these in list endpoint handlers. Detail endpoints return full nested objects.

**Rationale**: The same `local_autonomous_system` block (with all its fields) repeats identically across every IXP record in a list response. For 20 IXPs with the same local AS, that's 19 redundant copies. The `{id, asn, name}` summary gives enough context for the LLM to identify the entity and call the detail endpoint if needed.

### 4. Search filter: map `search` param to upstream `q`

**Decision**: Add a `search` string parameter to `list_routers`, `list_internet_exchanges`, `list_connections`, and `list_bgp_sessions`. Map it to the upstream `q` query parameter.

**Rationale**: Every upstream filterset we checked has a `search()` method that `q` routes to. The search methods are well-designed — they cover the fields an LLM would naturally search by (name, hostname, AS name, IP address, comments). Using our own `search` param name (not `q`) is consistent with `list_autonomous_systems` which already does this mapping.

### 5. BGP sessions: use `q` search for IXP router filtering

**Decision**: When `list_bgp_sessions` receives a `router_name` param, apply `router_name` to direct session params (as today) AND apply `q=<router_name>` to IXP session params as a best-effort filter.

**Rationale**: The upstream `InternetExchangePeeringSessionFilterSet` has no `router_name` or `router_id` filter — the router is accessed through `ixp_connection`. But its `search()` method does search `ixp_connection__router__name` and `ixp_connection__router__hostname`. Using `q` is imprecise (it also matches other fields), but it's strictly better than the current behavior of returning completely unfiltered IXP sessions.

**Trade-off**: The `q` search is a superset — it might return IXP sessions where the router name appears in a comment but the session is on a different router. Acceptable: false positives are better than no filtering.

### 6. Parameter naming convention

**Decision**: Adopt the pattern `<entity>_name` for name-based string filters and `<entity>_id` for numeric ID filters. Match upstream param names where possible.

Concrete renames in `list_bgp_sessions`:
- `router` → `router_name` (was already mapping to upstream `router_name`)
- Add `router_hostname` → upstream `router` (which confusingly matches hostname)
- `ixp` → `internet_exchange_id` (was already mapping to upstream `internet_exchange_id`)

New params in `list_connections`:
- `router_name` → upstream `router_name`
- `internet_exchange_point` → upstream `internet_exchange_point` (by name)

New params in `list_routers`:
- `name` → upstream `name` (exact match, already in Meta.fields)
- `hostname` → upstream `hostname` (maps to `router__hostname`)

New params in `list_internet_exchanges`:
- `name` — the upstream `InternetExchangeFilterSet` does NOT have `name` in Meta.fields. Use `q` search instead for name lookups. Don't add a fake `name` filter that silently uses search.

**Rationale**: `_name`/`_id` is the upstream convention. Aligning with it means our param names map 1:1 to upstream query params, reducing confusion and bugs (like the current `router` → `router_name` mismatch).

## Risks / Trade-offs

**[Breaking param renames]** → Mitigated by this being a young project with limited adoption. Document the renames in the change notes. The old param names were actively misleading (e.g., `router` meaning "name" when upstream `router` means "hostname"), so the break is worth it.

**[Response shaping hides data]** → Mitigated by keeping detail endpoints richer than list endpoints, and by the stripped fields (IRR prefixes) being accessible via `get_router_configuration`. If a future use case needs raw prefix data, a dedicated tool can be added without changing existing tool contracts.

**[`q` search as router filter for IXP sessions is imprecise]** → Acceptable because false positives are better than the current silent no-op. Document the behavior in the tool description.

**[No tests]** → Existing risk, not introduced by this change. Manual verification via MCP tool calls (as we did for the affiliated filter diagnosis) is the current validation path.
