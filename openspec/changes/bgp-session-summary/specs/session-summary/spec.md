## ADDED Requirements

### Requirement: BGP session health summary
The server SHALL expose a `get_bgp_session_summary` tool that returns BGP session counts grouped by router and BGP state. The tool SHALL query both direct and IXP session endpoints, paginate through all matching results internally, and return only aggregate counts.

Supported filters (same as `list_bgp_sessions`): `asn`, `router_name`, `router_hostname`, `internet_exchange_id`, `status`, `bgp_state`, `address_family`, `is_route_server`.

The tool SHALL paginate internally using 1000 results per page, fetching direct and IXP sessions in parallel per page. The tool SHALL stop after scanning 10,000 total sessions and indicate truncation in the response.

#### Scenario: Full summary with no filters
- **WHEN** `get_bgp_session_summary` is called with no filters
- **THEN** the server paginates through all direct and IXP sessions and returns a summary with per-router state counts and global totals

#### Scenario: Summary scoped to a single router
- **WHEN** `get_bgp_session_summary` is called with `router_name: "esg1-cor1"`
- **THEN** the server returns a summary containing only sessions associated with that router

#### Scenario: Summary scoped to IPv6
- **WHEN** `get_bgp_session_summary` is called with `address_family: 6`
- **THEN** the server returns a summary counting only IPv6 sessions

### Requirement: Summary response shape
The response SHALL contain:
- `totals`: an object with keys for each BGP state (`established`, `active`, `idle`, `opensent`, `openconfirm`, `connect`, `other`) and a `total` key, all integer values
- `routers`: an array of objects, each with `name` (string) and the same state count keys as `totals`, sorted by `name`
- `sessions_scanned`: integer count of total sessions processed
- `truncated`: boolean indicating whether the safety cap was hit

Unknown BGP state values SHALL be counted under the `other` key.

#### Scenario: Response shape with two routers
- **WHEN** the system has router "esg1-cor1" with 10 established and 2 active sessions, and router "esg2-cor1" with 8 established and 1 idle session
- **THEN** the response SHALL be:
  - `totals: { established: 18, active: 2, idle: 1, ..., total: 21 }`
  - `routers: [{ name: "esg1-cor1", established: 10, active: 2, ..., total: 12 }, { name: "esg2-cor1", established: 8, idle: 1, ..., total: 9 }]`
  - `sessions_scanned: 21`
  - `truncated: false`

#### Scenario: Truncated response
- **WHEN** the system has more than 10,000 matching sessions
- **THEN** the response SHALL have `truncated: true` and `sessions_scanned: 10000`, and the counts SHALL reflect only the scanned sessions

#### Scenario: No matching sessions
- **WHEN** `get_bgp_session_summary` is called with filters that match zero sessions
- **THEN** the response SHALL have all counts at 0, an empty `routers` array, `sessions_scanned: 0`, and `truncated: false`

#### Scenario: Sessions with null router
- **WHEN** a session has no associated router (router field is null)
- **THEN** the session SHALL be counted under a router entry with `name: "(unassigned)"`
