## Why

MCP tool responses blow the LLM context window on routine queries. A single `list_autonomous_systems(affiliated: true)` returns 2.3MB because the AS record embeds 26K IRR prefixes and 1K AS-list entries — fields only useful for Jinja2 config rendering. Beyond payload size, most list endpoints lack the `search`/`name` filters the upstream Peering Manager API already supports, forcing multi-call lookup patterns for basic operations like "find router esg1-cor1". Parameter naming is inconsistent between tools that are often called together.

## What Changes

- **Strip heavy fields from AS responses**: Remove `prefixes` and `as_list` from list and detail responses; inject `prefix_count_v4`, `prefix_count_v6`, `as_list_count` summaries instead.
- **Trim nested objects in list responses**: Replace full embedded objects (e.g. `local_autonomous_system`, `routing_policies`, `tags`) with `{id, name}` summaries in list endpoints. Full objects remain in detail endpoints.
- **Add `search` filter to routers, IXPs, connections, and BGP sessions**: Pass through the upstream `q` parameter that every filterset already supports.
- **Add `name`/`hostname` filters to routers and IXPs**: Enable single-call lookups by name without pulling full lists.
- **Normalize parameter naming across tools**: Align `list_connections` and `list_bgp_sessions` to use consistent `router_name`/`router_id`/`internet_exchange_id` conventions. **BREAKING**: `list_bgp_sessions` `router` param renamed to `router_name`; `ixp` renamed to `internet_exchange_id`.
- **Fix silent IXP session router filter gap**: Use `q` search as best-effort router filter for IXP sessions, since the upstream IXP session filterset has no direct router param.

## Capabilities

### New Capabilities

- `response-shaping`: Response transformation layer that strips heavy fields and trims nested objects to LLM-appropriate summaries in list responses.

### Modified Capabilities

- `network-tools`: Add `search` filter to `list_autonomous_systems` (already has it — no change needed). Strip `prefixes`/`as_list` from responses, add summary counts. Strip heavy nested objects from `get_autonomous_system` detail.
- `infrastructure-tools`: Add `search`, `name`, `hostname` filters to `list_routers`. Add `search` filter to `list_internet_exchanges`. Add `router_name` and `internet_exchange_point` (by name) filters to `list_connections`. Normalize param naming. Trim nested objects in list responses.
- `bgp-session-tools`: Add `search` filter. Rename `router` → `router_name`, add `router_hostname`. Rename `ixp` → `internet_exchange_id`. Use `q` search for IXP session router filtering. Trim nested objects.

## Impact

- **Files modified**: `src/tools/autonomous-systems.ts`, `src/tools/infrastructure.ts`, `src/tools/bgp-sessions.ts`, `src/types.ts`
- **Breaking changes**: `list_bgp_sessions` parameter renames (`router` → `router_name`, `ixp` → `internet_exchange_id`). Any existing prompts or agents using these param names will need updating.
- **No upstream changes**: All fixes are in the MCP tool layer; no changes to Peering Manager itself.
- **No new dependencies**.
