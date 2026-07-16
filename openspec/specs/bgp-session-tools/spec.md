## ADDED Requirements

### Requirement: Unified BGP session listing
The server SHALL expose a `list_bgp_sessions` tool that queries both DirectPeeringSession and InternetExchangePeeringSession endpoints and returns a merged list with common fields. Each result SHALL include a `session_type` field with value `"direct"` or `"ixp"`.

Common fields returned: `id`, `session_type`, `autonomous_system` (id, asn, name), `ip_address`, `status`, `bgp_state`, `received_prefix_count`, `accepted_prefix_count`, `advertised_prefix_count`, `router` (name, derived from connection for IXP sessions), `multihop_ttl`, `passive`, `bfd`, `service_reference`, `comments`, `tags`.

#### Scenario: List all sessions
- **WHEN** `list_bgp_sessions` is called with no filters
- **THEN** the server queries both `/api/peering/direct-peering-sessions/` and `/api/peering/internet-exchange-peering-sessions/`, merges results with common fields, and returns them with `total_count`

#### Scenario: Filter by ASN
- **WHEN** `list_bgp_sessions` is called with `asn: 64501`
- **THEN** the server passes `autonomous_system_asn=64501` to both endpoints and returns only sessions with that remote AS

#### Scenario: Filter by BGP state
- **WHEN** `list_bgp_sessions` is called with `bgp_state: "established"`
- **THEN** the server passes `bgp_state=established` to both endpoints and returns only established sessions

#### Scenario: Filter by IXP-only field
- **WHEN** `list_bgp_sessions` is called with `is_route_server: true`
- **THEN** the server queries only the IXP sessions endpoint (skips direct sessions) and returns matching results

#### Scenario: Pagination
- **WHEN** `list_bgp_sessions` is called with `limit: 50, offset: 100`
- **THEN** the server passes pagination params to both endpoints and returns up to 50 results with the combined `total_count`

### Requirement: Type-specific BGP session detail
The server SHALL expose a `get_bgp_session_detail` tool that retrieves full detail for a single BGP session. It SHALL accept `id` (number) and `session_type` (`"direct"` or `"ixp"`) as required parameters.

For direct sessions, the response SHALL include: `relationship`, `bgp_group`, `local_ip_address`, `local_autonomous_system`, `connection`, `password` (masked), `encrypted_password`, plus all common fields with full nested objects.

For IXP sessions, the response SHALL include: `ixp_connection`, `is_route_server`, `exists_in_peeringdb`, `is_abandoned`, `internet_exchange` (derived from connection), plus all common fields with full nested objects.

No fields SHALL be included with null values for type-inapplicable data.

#### Scenario: Get direct session detail
- **WHEN** `get_bgp_session_detail` is called with `id: 42, session_type: "direct"`
- **THEN** the server queries `/api/peering/direct-peering-sessions/42/` and returns the full direct-session response with relationship, bgp_group, and local_ip_address fields

#### Scenario: Get IXP session detail
- **WHEN** `get_bgp_session_detail` is called with `id: 17, session_type: "ixp"`
- **THEN** the server queries `/api/peering/internet-exchange-peering-sessions/17/` and returns the full IXP-session response with ixp_connection, is_route_server, and is_abandoned fields

#### Scenario: Invalid session type
- **WHEN** `get_bgp_session_detail` is called with an invalid `session_type`
- **THEN** the server returns an error indicating valid session types are "direct" or "ixp"
