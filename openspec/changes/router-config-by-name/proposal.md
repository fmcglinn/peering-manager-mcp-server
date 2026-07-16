## Why

`get_router_configuration` requires a numeric router ID, but an LLM almost never knows router IDs upfront — it knows names like "esg1-cor1". Today this forces a two-call pattern: `list_routers(name: "esg1-cor1")` to discover ID 5, then `get_router_configuration(id: 5)`. Since config rendering is the most common end-goal for router lookups, this round-trip doubles latency and context cost for the single most common workflow.

## What Changes

- **Add `name` and `hostname` optional parameters to `get_router_configuration`**: When provided instead of `id`, the tool resolves the router by querying the list endpoint first, then fetches the configuration. Exactly one of `id`, `name`, or `hostname` must be provided.
- **Error on ambiguous match**: If `name` or `hostname` matches multiple routers, the tool SHALL return an error listing the matches rather than picking one silently.
- **Error on no match**: If `name` or `hostname` matches zero routers, the tool SHALL return a clear "router not found" error.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `api-client`: The `get_router_configuration` requirement changes to accept `name` or `hostname` as alternatives to `id`, with internal resolution via the router list API.

## Impact

- **Files modified**: `src/tools/config.ts` (add name/hostname params, add resolution logic), `src/client.ts` (no changes — resolution uses existing `list()`)
- **No breaking changes**: `id` remains supported; `name`/`hostname` are additive.
- **Performance**: Adds one extra API call when resolving by name/hostname (list routers with name filter, then fetch config). This is acceptable — the config render itself takes seconds due to Jinja2/IRR lookups, so an extra ~100ms list call is negligible.
