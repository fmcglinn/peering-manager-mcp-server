## MODIFIED Requirements

### Requirement: Router listing
The server SHALL expose a `list_routers` tool that queries `/api/devices/routers/` and returns a list of routers. Supported filters: `status`, `platform_id`, `local_autonomous_system_id`, `name` (exact match), `hostname` (exact match), `search` (free-text search across name, hostname, platform). Nested objects SHALL be trimmed per the response-shaping spec.

#### Scenario: List all routers
- **WHEN** `list_routers` is called with no filters
- **THEN** the server returns a paginated list of routers with id, name, hostname, platform, status, local_autonomous_system (summarized as {id, asn, name}), and poll_bgp_sessions_last_updated fields

#### Scenario: Filter by status
- **WHEN** `list_routers` is called with `status: "enabled"`
- **THEN** the server returns only routers with enabled status

#### Scenario: Filter by name
- **WHEN** `list_routers` is called with `name: "esg1-cor1"`
- **THEN** the server passes `name=esg1-cor1` to the API and returns the matching router(s)

#### Scenario: Filter by hostname
- **WHEN** `list_routers` is called with `hostname: "esg1-cor1.rise.net.ph"`
- **THEN** the server passes `hostname=esg1-cor1.rise.net.ph` to the API and returns the matching router(s)

#### Scenario: Search by text
- **WHEN** `list_routers` is called with `search: "esg1"`
- **THEN** the server passes `q=esg1` to the API and returns routers matching by name, hostname, or platform

### Requirement: Connection listing
The server SHALL expose a `list_connections` tool that queries `/api/net/connections/` and returns a list of IXP connections. Supported filters: `status`, `internet_exchange_point_id`, `router_id`, `router_name` (by name string), `internet_exchange_point` (by name string), `search` (free-text). Nested objects SHALL be trimmed per the response-shaping spec.

#### Scenario: List all connections
- **WHEN** `list_connections` is called with no filters
- **THEN** the server returns a paginated list of connections with id, name, status, ipv4_address, ipv6_address, mac_address, vlan, internet_exchange_point, router, and interface fields

#### Scenario: Filter by router ID
- **WHEN** `list_connections` is called with `router_id: 7`
- **THEN** the server returns only connections associated with router 7

#### Scenario: Filter by router name
- **WHEN** `list_connections` is called with `router_name: "esg1-cor1"`
- **THEN** the server passes `router_name=esg1-cor1` to the API and returns connections on that router

#### Scenario: Filter by IXP name
- **WHEN** `list_connections` is called with `internet_exchange_point: "DE-CIX Frankfurt"`
- **THEN** the server passes `internet_exchange_point=DE-CIX Frankfurt` to the API and returns connections at that IXP

#### Scenario: Search connections
- **WHEN** `list_connections` is called with `search: "ae0"`
- **THEN** the server passes `q=ae0` to the API and returns connections matching by interface, description, or router name/hostname
