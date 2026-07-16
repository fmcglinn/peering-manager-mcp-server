## ADDED Requirements

### Requirement: Change history listing
The server SHALL expose a `list_changes` tool that queries `/api/core/object-changes/` and returns recent audit log entries. Supported filters: `action` (`"create"`, `"update"`, `"delete"`), `changed_object_type`, `user`, `time_after`, `time_before`.

#### Scenario: List recent changes
- **WHEN** `list_changes` is called with no filters
- **THEN** the server returns a paginated list of object changes with id, time, user_name, action, changed_object_type, changed_object_id, and changed_object (summary) fields, ordered by most recent first

#### Scenario: Filter by action
- **WHEN** `list_changes` is called with `action: "delete"`
- **THEN** the server returns only deletion events

#### Scenario: Filter by time range
- **WHEN** `list_changes` is called with `time_after: "2026-07-01"`
- **THEN** the server returns only changes after the specified date
