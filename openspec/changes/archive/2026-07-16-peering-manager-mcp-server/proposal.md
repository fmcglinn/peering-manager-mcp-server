## Why

Peering Manager holds all our BGP session state, IXP connections, routing policies, and cached PeeringDB data — but querying it means navigating a REST API with 30+ endpoints across 8 apps. An MCP server lets Claude query this data conversationally: "which sessions are down?", "what IXPs do we share with AS64501?", "show me the config for this router." Read-only keeps it safe for exploratory use without risk of modifying production peering state.

## What Changes

- New TypeScript MCP server exposing 13 curated, intent-based tools over Peering Manager's REST API
- stdio transport for Claude Code integration (HTTP transport can be added later)
- All tools are read-only (GET requests only) — no session polling, syncing, or config deployment
- BGP sessions from two separate API models (DirectPeeringSession + InternetExchangePeeringSession) are unified in list view with common fields, then split into type-specific detail views with no dead fields
- Two-tier timeout strategy: 30s default, 120s for config rendering (Jinja2 + possible IRR lookups)
- Pagination with default limit of 100 results, total_count in responses

## Capabilities

### New Capabilities
- `bgp-session-tools`: Unified BGP session listing (merging direct + IXP sessions) and type-specific session detail retrieval
- `network-tools`: Autonomous system listing/detail with shared IXPs/facilities, and IXP listing/detail with available peers
- `infrastructure-tools`: Router listing, IXP connection listing, and rendered router configuration retrieval (long timeout)
- `policy-tools`: Routing policy and BGP community listing
- `discovery-tools`: Multi-resource PeeringDB search across cached networks, IXPs, facilities, and network-ixlans
- `audit-tools`: Object change history from the audit log
- `api-client`: Core HTTP client handling authentication (API token), pagination, timeouts, and error handling against the Peering Manager REST API

### Modified Capabilities

## Impact

- New package in the project root with TypeScript build tooling (tsconfig, package.json with @modelcontextprotocol/sdk dependency)
- Requires network access to a running Peering Manager instance
- Configuration via environment variables: `PM_URL` (base URL) and `PM_API_TOKEN` (API token)
- Claude Code MCP config entry needed to register the server
