## ADDED Requirements

### Requirement: Autonomous system listing
The server SHALL expose a `list_autonomous_systems` tool that queries `/api/peering/autonomous-systems/` and returns a list of autonomous systems. Supported filters: `asn`, `name`, `affiliated` (boolean), `search` (free-text).

#### Scenario: List all autonomous systems
- **WHEN** `list_autonomous_systems` is called with no filters
- **THEN** the server returns a paginated list of autonomous systems with id, asn, name, ipv4/ipv6_max_prefixes, affiliated, and irr_as_set fields

#### Scenario: Search by name
- **WHEN** `list_autonomous_systems` is called with `search: "cloudflare"`
- **THEN** the server passes `search=cloudflare` to the API and returns matching ASes

#### Scenario: Filter affiliated only
- **WHEN** `list_autonomous_systems` is called with `affiliated: true`
- **THEN** the server returns only ASes marked as affiliated (local/own ASes)

### Requirement: Autonomous system detail
The server SHALL expose a `get_autonomous_system` tool that retrieves full detail for a single AS by `id`. The response SHALL include all AS fields plus the results of the `shared_ixps` and `shared_facilities` sub-endpoints.

#### Scenario: Get AS with shared infrastructure
- **WHEN** `get_autonomous_system` is called with `id: 5`
- **THEN** the server queries `/api/peering/autonomous-systems/5/`, `/api/peering/autonomous-systems/5/shared_ixps/`, and `/api/peering/autonomous-systems/5/shared_facilities/` and returns the AS detail with `shared_ixps` and `shared_facilities` arrays included

#### Scenario: AS not found
- **WHEN** `get_autonomous_system` is called with an id that does not exist
- **THEN** the server returns an error indicating the AS was not found

### Requirement: Internet exchange listing
The server SHALL expose a `list_internet_exchanges` tool that queries `/api/peering/internet-exchanges/` and returns a list of IXPs. Supported filters: `status`, `local_autonomous_system_id`, `local_autonomous_system_asn`.

#### Scenario: List all IXPs
- **WHEN** `list_internet_exchanges` is called with no filters
- **THEN** the server returns a paginated list of IXPs with id, name, status, local_autonomous_system, and description fields

#### Scenario: Filter by status
- **WHEN** `list_internet_exchanges` is called with `status: "enabled"`
- **THEN** the server returns only IXPs with enabled status

### Requirement: Internet exchange detail with available peers
The server SHALL expose a `get_internet_exchange` tool that retrieves full detail for a single IXP by `id`. The response SHALL include all IXP fields plus the results of the `available_peers` sub-endpoint.

#### Scenario: Get IXP with available peers
- **WHEN** `get_internet_exchange` is called with `id: 3`
- **THEN** the server queries `/api/peering/internet-exchanges/3/` and `/api/peering/internet-exchanges/3/available_peers/` and returns the IXP detail with an `available_peers` array included

#### Scenario: IXP not found
- **WHEN** `get_internet_exchange` is called with an id that does not exist
- **THEN** the server returns an error indicating the IXP was not found
