## MODIFIED Requirements

### Requirement: Router configuration retrieval
The server SHALL expose a `get_router_configuration` tool that retrieves the rendered configuration for a specific router. It SHALL accept three optional parameters: `id` (number), `name` (string), and `hostname` (string). Exactly one of the three MUST be provided; the tool SHALL return an error if zero or more than one are given.

When `name` or `hostname` is provided, the tool SHALL resolve the router ID by querying `/api/devices/routers/` with the corresponding filter and `limit=2`. If zero results are returned, the tool SHALL return a "router not found" error. If two results are returned (ambiguous match), the tool SHALL return an error listing the matching routers. If exactly one result is returned, the tool SHALL use its ID to fetch the configuration.

The tool SHALL query `/api/devices/routers/{id}/configuration/` and return the rendered configuration text. This tool SHALL use the extended timeout (120s default, configurable via `PM_CONFIG_TIMEOUT`).

#### Scenario: Get configuration by ID
- **WHEN** `get_router_configuration` is called with `id: 7`
- **THEN** the server queries `/api/devices/routers/7/configuration/` with the extended timeout and returns the rendered configuration

#### Scenario: Get configuration by name
- **WHEN** `get_router_configuration` is called with `name: "esg1-cor1"`
- **THEN** the server queries `/api/devices/routers/?name=esg1-cor1&limit=2`, finds exactly one match with id 5, then queries `/api/devices/routers/5/configuration/` and returns the rendered configuration

#### Scenario: Get configuration by hostname
- **WHEN** `get_router_configuration` is called with `hostname: "esg1-cor1.rise.net.ph"`
- **THEN** the server queries `/api/devices/routers/?hostname=esg1-cor1.rise.net.ph&limit=2`, finds exactly one match, then fetches and returns its configuration

#### Scenario: Router not found by name
- **WHEN** `get_router_configuration` is called with `name: "nonexistent-router"`
- **THEN** the server queries the router list, finds zero results, and returns an error: "No router found with name 'nonexistent-router'"

#### Scenario: Ambiguous name match
- **WHEN** `get_router_configuration` is called with `name: "core"` and two routers match
- **THEN** the server returns an error listing the matching routers: "Multiple routers match name 'core': router-a (id: 3), router-b (id: 7). Use a more specific name or pass id directly."

#### Scenario: Multiple identifiers provided
- **WHEN** `get_router_configuration` is called with `id: 7, name: "esg1-cor1"`
- **THEN** the server returns an error: "Provide exactly one of id, name, or hostname"

#### Scenario: No identifier provided
- **WHEN** `get_router_configuration` is called with no id, name, or hostname
- **THEN** the server returns an error: "Provide exactly one of id, name, or hostname"

#### Scenario: Router not found by ID
- **WHEN** `get_router_configuration` is called with an id that does not exist
- **THEN** the server returns an error indicating the router was not found
