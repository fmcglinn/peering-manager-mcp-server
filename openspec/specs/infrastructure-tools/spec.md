## ADDED Requirements

### Requirement: Router listing
The server SHALL expose a `list_routers` tool that queries `/api/devices/routers/` and returns a list of routers. Supported filters: `status`, `platform_id`, `local_autonomous_system_id`.

#### Scenario: List all routers
- **WHEN** `list_routers` is called with no filters
- **THEN** the server returns a paginated list of routers with id, name, hostname, platform, status, local_autonomous_system, and poll_bgp_sessions_last_updated fields

#### Scenario: Filter by status
- **WHEN** `list_routers` is called with `status: "enabled"`
- **THEN** the server returns only routers with enabled status

### Requirement: Connection listing
The server SHALL expose a `list_connections` tool that queries `/api/net/connections/` and returns a list of IXP connections. Supported filters: `status`, `internet_exchange_point_id`, `router_id`.

#### Scenario: List all connections
- **WHEN** `list_connections` is called with no filters
- **THEN** the server returns a paginated list of connections with id, name, status, ipv4_address, ipv6_address, mac_address, vlan, internet_exchange_point, router, and interface fields

#### Scenario: Filter by router
- **WHEN** `list_connections` is called with `router_id: 7`
- **THEN** the server returns only connections associated with router 7
