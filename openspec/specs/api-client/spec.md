## ADDED Requirements

### Requirement: API authentication
The API client SHALL read `PM_URL` and `PM_API_TOKEN` from environment variables. It SHALL include the token as `Authorization: Token <PM_API_TOKEN>` on every request. If either variable is missing, the server SHALL fail at startup with a clear error message.

#### Scenario: Valid configuration
- **WHEN** the server starts with `PM_URL=https://pm.example.com` and `PM_API_TOKEN=abc123`
- **THEN** all API requests are sent to `https://pm.example.com/api/...` with header `Authorization: Token abc123`

#### Scenario: Missing PM_URL
- **WHEN** the server starts without `PM_URL` set
- **THEN** the server exits with an error message indicating PM_URL is required

#### Scenario: Missing PM_API_TOKEN
- **WHEN** the server starts without `PM_API_TOKEN` set
- **THEN** the server exits with an error message indicating PM_API_TOKEN is required

### Requirement: Pagination handling
The API client SHALL accept `limit` and `offset` parameters on all list endpoints. Default limit SHALL be 100. Maximum limit SHALL be 1000. Responses SHALL include `total_count` (from the API's `count` field) alongside `results`.

#### Scenario: Default pagination
- **WHEN** a list tool is called with no pagination params
- **THEN** the client sends `?limit=100&offset=0` and returns `{ total_count, results }`

#### Scenario: Custom pagination
- **WHEN** a list tool is called with `limit: 50, offset: 200`
- **THEN** the client sends `?limit=50&offset=200` and returns the corresponding page

### Requirement: Timeout handling
The API client SHALL enforce a default timeout of 30 seconds on all requests. The `get_router_configuration` tool SHALL use a timeout of 120 seconds. Timeouts SHALL be configurable via `PM_CONFIG_TIMEOUT` environment variable (for config render) with a fallback of 120 seconds.

#### Scenario: Default timeout
- **WHEN** a tool makes an API request that takes longer than 30 seconds
- **THEN** the request is aborted and an error is returned indicating a timeout

#### Scenario: Config render timeout
- **WHEN** `get_router_configuration` makes an API request that takes longer than 120 seconds
- **THEN** the request is aborted and an error is returned indicating a timeout

#### Scenario: Custom config timeout
- **WHEN** `PM_CONFIG_TIMEOUT=180` is set and `get_router_configuration` is called
- **THEN** the config render request uses a 180-second timeout

### Requirement: Error handling
The API client SHALL map HTTP error responses to descriptive MCP tool errors. 401 → authentication error. 404 → not found. 5xx → server error with the response message.

#### Scenario: Authentication failure
- **WHEN** the Peering Manager API returns HTTP 401
- **THEN** the tool returns an error indicating invalid or expired API token

#### Scenario: Resource not found
- **WHEN** the Peering Manager API returns HTTP 404
- **THEN** the tool returns an error indicating the requested resource was not found

#### Scenario: Server error
- **WHEN** the Peering Manager API returns HTTP 500 with a message
- **THEN** the tool returns an error including the server's error message

### Requirement: Router configuration retrieval
The server SHALL expose a `get_router_configuration` tool that retrieves the rendered configuration for a specific router by `id`. It SHALL query `/api/devices/routers/{id}/configuration/` and return the rendered configuration text. This tool SHALL use the extended timeout (120s default, configurable via `PM_CONFIG_TIMEOUT`).

#### Scenario: Get rendered configuration
- **WHEN** `get_router_configuration` is called with `id: 7`
- **THEN** the server queries `/api/devices/routers/7/configuration/` with the extended timeout and returns the rendered configuration

#### Scenario: Router not found
- **WHEN** `get_router_configuration` is called with an id that does not exist
- **THEN** the server returns an error indicating the router was not found
