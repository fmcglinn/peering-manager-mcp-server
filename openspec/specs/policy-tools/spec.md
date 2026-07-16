## ADDED Requirements

### Requirement: Routing policy listing
The server SHALL expose a `list_routing_policies` tool that queries `/api/peering/routing-policies/` and returns a list of routing policies. Supported filters: `type` (`"export-policy"`, `"import-policy"`, `"import-export-policy"`), `address_family`.

#### Scenario: List all routing policies
- **WHEN** `list_routing_policies` is called with no filters
- **THEN** the server returns a paginated list of routing policies with id, name, slug, type, weight, address_family, and communities fields

#### Scenario: Filter by type
- **WHEN** `list_routing_policies` is called with `type: "import-policy"`
- **THEN** the server returns only import routing policies

### Requirement: Community listing
The server SHALL expose a `list_communities` tool that queries `/api/bgp/communities/` and returns a list of BGP communities. Supported filters: `type` (`"egress"`, `"ingress"`).

#### Scenario: List all communities
- **WHEN** `list_communities` is called with no filters
- **THEN** the server returns a paginated list of communities with id, name, slug, value, type, and kind fields

#### Scenario: Filter by type
- **WHEN** `list_communities` is called with `type: "ingress"`
- **THEN** the server returns only ingress communities
