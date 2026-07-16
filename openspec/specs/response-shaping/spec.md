## Requirements

### Requirement: AS response payload stripping
The server SHALL remove `prefixes` and `as_list` fields from all autonomous system responses (both list and detail endpoints). In their place, the server SHALL include `prefix_count_v4` (integer), `prefix_count_v6` (integer), and `as_list_count` (integer) summary fields computed from the stripped data.

#### Scenario: List AS returns counts instead of raw data
- **WHEN** `list_autonomous_systems` is called
- **THEN** each AS result SHALL NOT contain `prefixes` or `as_list` fields AND SHALL contain `prefix_count_v4`, `prefix_count_v6`, and `as_list_count` integer fields

#### Scenario: Detail AS returns counts instead of raw data
- **WHEN** `get_autonomous_system` is called with any valid id
- **THEN** the response SHALL NOT contain `prefixes` or `as_list` fields AND SHALL contain `prefix_count_v4`, `prefix_count_v6`, and `as_list_count` integer fields

#### Scenario: Counts are accurate
- **WHEN** an AS record has `prefixes.ipv4` with 100 entries, `prefixes.ipv6` with 50 entries, and `as_list` with 25 entries
- **THEN** the response SHALL contain `prefix_count_v4: 100`, `prefix_count_v6: 50`, `as_list_count: 25`

#### Scenario: Empty or missing prefix data
- **WHEN** an AS record has no `prefixes` field or empty prefix arrays
- **THEN** the response SHALL contain `prefix_count_v4: 0`, `prefix_count_v6: 0`, `as_list_count: 0`

### Requirement: Nested object trimming in list responses
The server SHALL replace full nested objects with summary objects in list endpoint responses. Summary objects SHALL contain only `id` and `name` fields (plus `asn` for autonomous system summaries).

The following nested objects SHALL be trimmed in list responses:
- `local_autonomous_system` → `{id, asn, name}`
- `routing_policies` (import and export) → array of `{id, name}`
- `tags` → array of `{id, name}`

Detail endpoints (`get_*` tools) SHALL continue to return full nested objects.

#### Scenario: IXP list trims local_autonomous_system
- **WHEN** `list_internet_exchanges` is called
- **THEN** each IXP result's `local_autonomous_system` field SHALL contain only `{id, asn, name}` instead of the full AS object

#### Scenario: IXP list trims routing policies
- **WHEN** `list_internet_exchanges` is called
- **THEN** each IXP result's `import_routing_policies` and `export_routing_policies` arrays SHALL contain objects with only `{id, name}`

#### Scenario: Detail endpoints return full objects
- **WHEN** `get_internet_exchange` is called with a valid id
- **THEN** the response SHALL contain full nested objects for `local_autonomous_system`, routing policies, and tags
