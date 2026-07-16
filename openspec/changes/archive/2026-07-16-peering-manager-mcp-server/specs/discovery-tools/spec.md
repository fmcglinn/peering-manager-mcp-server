## ADDED Requirements

### Requirement: PeeringDB search
The server SHALL expose a `search_peeringdb` tool that queries the cached PeeringDB data in Peering Manager. It SHALL accept a required `resource_type` parameter with values: `"networks"`, `"internet-exchanges"`, `"facilities"`, `"network-ixlans"`.

For each resource type, the tool SHALL map to the corresponding endpoint:
- `networks` → `/api/peeringdb/networks/`
- `internet-exchanges` → `/api/peeringdb/internet-exchanges/`
- `facilities` → `/api/peeringdb/facilities/`
- `network-ixlans` → `/api/peeringdb/network-ixlans/`

The tool SHALL accept a `search` parameter for free-text filtering and a `filters` object for type-specific query parameters passed through to the API.

#### Scenario: Search PeeringDB networks
- **WHEN** `search_peeringdb` is called with `resource_type: "networks", search: "cloudflare"`
- **THEN** the server queries `/api/peeringdb/networks/?search=cloudflare` and returns matching cached PeeringDB network records

#### Scenario: Search network-ixlans by ASN
- **WHEN** `search_peeringdb` is called with `resource_type: "network-ixlans", filters: { asn: 13335 }`
- **THEN** the server queries `/api/peeringdb/network-ixlans/?asn=13335` and returns IXP LAN entries for that ASN

#### Scenario: Search facilities
- **WHEN** `search_peeringdb` is called with `resource_type: "facilities", search: "equinix"`
- **THEN** the server queries `/api/peeringdb/facilities/?search=equinix` and returns matching facility records

#### Scenario: Invalid resource type
- **WHEN** `search_peeringdb` is called with an invalid `resource_type`
- **THEN** the server returns an error listing valid resource types
