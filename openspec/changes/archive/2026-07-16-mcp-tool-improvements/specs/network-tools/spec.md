## MODIFIED Requirements

### Requirement: Autonomous system listing
The server SHALL expose a `list_autonomous_systems` tool that queries `/api/peering/autonomous-systems/` and returns a list of autonomous systems. Supported filters: `asn`, `name`, `affiliated` (boolean), `search` (free-text). Responses SHALL have `prefixes` and `as_list` stripped and replaced with summary counts per the response-shaping spec.

#### Scenario: List all autonomous systems
- **WHEN** `list_autonomous_systems` is called with no filters
- **THEN** the server returns a paginated list of autonomous systems with id, asn, name, ipv4/ipv6_max_prefixes, affiliated, irr_as_set, prefix_count_v4, prefix_count_v6, and as_list_count fields

#### Scenario: Search by name
- **WHEN** `list_autonomous_systems` is called with `search: "cloudflare"`
- **THEN** the server passes `q=cloudflare` to the API and returns matching ASes

#### Scenario: Filter affiliated only
- **WHEN** `list_autonomous_systems` is called with `affiliated: true`
- **THEN** the server returns only ASes marked as affiliated (local/own ASes) with response size under 50KB

#### Scenario: Affiliated AS response is lightweight
- **WHEN** `list_autonomous_systems` is called with `affiliated: true` and the affiliated AS has 22K prefixes
- **THEN** the response SHALL contain `prefix_count_v4` and `prefix_count_v6` integers but NOT the raw `prefixes` object, keeping total response under 50KB

### Requirement: Autonomous system detail
The server SHALL expose a `get_autonomous_system` tool that retrieves full detail for a single AS by `id`. The response SHALL include all AS fields (except `prefixes` and `as_list`, replaced with summary counts) plus the results of the `shared_ixps` and `shared_facilities` sub-endpoints.

#### Scenario: Get AS with shared infrastructure
- **WHEN** `get_autonomous_system` is called with `id: 5`
- **THEN** the server queries `/api/peering/autonomous-systems/5/`, `/api/peering/autonomous-systems/5/shared-ixps/`, and `/api/peering/autonomous-systems/5/shared-facilities/` and returns the AS detail with `shared_ixps` and `shared_facilities` arrays included, with `prefixes`/`as_list` replaced by summary counts

#### Scenario: AS not found
- **WHEN** `get_autonomous_system` is called with an id that does not exist
- **THEN** the server returns an error indicating the AS was not found

### Requirement: Internet exchange listing
The server SHALL expose a `list_internet_exchanges` tool that queries `/api/peering/internet-exchanges/` and returns a list of IXPs. Supported filters: `status`, `local_autonomous_system_id`, `local_autonomous_system_asn`, `search` (free-text). Nested objects SHALL be trimmed per the response-shaping spec.

#### Scenario: List all IXPs
- **WHEN** `list_internet_exchanges` is called with no filters
- **THEN** the server returns a paginated list of IXPs with id, name, status, local_autonomous_system (summarized as {id, asn, name}), and description fields

#### Scenario: Filter by status
- **WHEN** `list_internet_exchanges` is called with `status: "enabled"`
- **THEN** the server returns only IXPs with enabled status

#### Scenario: Search by name
- **WHEN** `list_internet_exchanges` is called with `search: "DE-CIX"`
- **THEN** the server passes `q=DE-CIX` to the API and returns matching IXPs

### Requirement: Internet exchange detail with available peers
The server SHALL expose a `get_internet_exchange` tool that retrieves full detail for a single IXP by `id`. The response SHALL include all IXP fields (with full nested objects) plus the results of the `available_peers` sub-endpoint.

#### Scenario: Get IXP with available peers
- **WHEN** `get_internet_exchange` is called with `id: 3`
- **THEN** the server queries `/api/peering/internet-exchanges/3/` and `/api/peering/internet-exchanges/3/available-peers/` and returns the IXP detail with an `available_peers` array included

#### Scenario: IXP not found
- **WHEN** `get_internet_exchange` is called with an id that does not exist
- **THEN** the server returns an error indicating the IXP was not found
