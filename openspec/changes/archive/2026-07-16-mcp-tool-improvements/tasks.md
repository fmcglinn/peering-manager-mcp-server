## 1. Response shaping helpers

- [x] 1.1 Add `stripAsPayload()` helper in `src/tools/autonomous-systems.ts` that removes `prefixes` and `as_list` from an AS record and injects `prefix_count_v4`, `prefix_count_v6`, `as_list_count` computed from the stripped data (defaulting to 0 for missing/empty fields)
- [x] 1.2 Add `summarizeAS()`, `summarizePolicy()`, `summarizeTag()` helper functions (can live in a shared `src/helpers.ts` or inline) that reduce nested objects to `{id, asn, name}` / `{id, name}` summaries
- [x] 1.3 Add `trimListRecord()` helper that applies nested object trimming to a generic record — replaces `local_autonomous_system` with `summarizeAS()`, `import_routing_policies`/`export_routing_policies` with mapped `summarizePolicy()`, `tags` with mapped `summarizeTag()`

## 2. Autonomous system tools

- [x] 2.1 Apply `stripAsPayload()` to each result in `list_autonomous_systems` before returning
- [x] 2.2 Apply `stripAsPayload()` to the detail response in `get_autonomous_system` before returning
- [x] 2.3 Verify via MCP tool call: `list_autonomous_systems(affiliated: true)` returns response under 50KB with `prefix_count_v4`/`prefix_count_v6`/`as_list_count` fields present and `prefixes`/`as_list` absent (requires MCP server restart)

## 3. Infrastructure tools — filters

- [x] 3.1 Add `search`, `name`, `hostname` params to `list_routers` tool schema. Map `search` → `q`, `name` → `name`, `hostname` → `hostname` in the API query
- [x] 3.2 Add `search` param to `list_internet_exchanges` tool schema. Map `search` → `q` in the API query
- [x] 3.3 Add `router_name` (string) and `internet_exchange_point` (string, by name) params to `list_connections` tool schema. Map to upstream `router_name` and `internet_exchange_point` query params
- [x] 3.4 Add `search` param to `list_connections` tool schema. Map `search` → `q` in the API query

## 4. Infrastructure tools — response trimming

- [x] 4.1 Apply `trimListRecord()` to each result in `list_routers` before returning
- [x] 4.2 Apply `trimListRecord()` to each result in `list_internet_exchanges` before returning
- [x] 4.3 Apply `trimListRecord()` to each result in `list_connections` before returning

## 5. BGP session tools — filters and param renames

- [x] 5.1 Rename `router` param to `router_name` in `list_bgp_sessions` tool schema. Update the direct session param mapping from `directParams.router_name = params.router` to `directParams.router_name = params.router_name`
- [x] 5.2 Add `router_hostname` param. Map to `directParams.router = params.router_hostname` for direct sessions (upstream `router` filter matches hostname)
- [x] 5.3 For IXP sessions: when `router_name` or `router_hostname` is provided, set `ixpParams.q` to the value as best-effort router filtering via search
- [x] 5.4 Rename `ixp` param to `internet_exchange_id`. Update the IXP session param mapping accordingly
- [x] 5.5 Add `search` param. Map to `directParams.q` and `ixpParams.q` for both endpoints. When `search` and `router_name`/`router_hostname` are both provided, `search` takes precedence for `ixpParams.q`
- [x] 5.6 Update the `skipDirect` logic: include `internet_exchange_id` (renamed from `ixp`) in the condition
- [x] 5.7 Update the `list_bgp_sessions` tool description to note that router filtering for IXP sessions uses best-effort search matching

## 6. Build and verify

- [x] 6.1 Run `npm run build` and fix any TypeScript errors
- [x] 6.2 Verify `list_routers(search: "esg1")` returns matching routers
- [x] 6.3 Verify `list_internet_exchanges(search: "...")` returns matching IXPs
- [x] 6.4 Verify `list_bgp_sessions(router_name: "...", search: "...")` works for both direct and IXP sessions
- [x] 6.5 Verify IXP list responses have trimmed nested objects (local_autonomous_system as {id, asn, name})
