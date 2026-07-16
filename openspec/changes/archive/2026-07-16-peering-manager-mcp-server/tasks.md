## 1. Project Setup

- [x] 1.1 Initialize package.json with name, type: module, scripts (build, start), and dependencies (@modelcontextprotocol/sdk)
- [x] 1.2 Create tsconfig.json targeting ES2022 with Node module resolution
- [x] 1.3 Create src/ directory structure: index.ts, client.ts, types.ts, tools/

## 2. API Client

- [x] 2.1 Implement client.ts: read PM_URL and PM_API_TOKEN from env, fail at startup if missing
- [x] 2.2 Add GET request method with Authorization header, query string building, and response envelope unwrapping (extract results + count)
- [x] 2.3 Add timeout handling with AbortController (30s default, configurable extended timeout for config render via PM_CONFIG_TIMEOUT)
- [x] 2.4 Add HTTP error mapping (401 → auth error, 404 → not found, 5xx → server error with message)
- [x] 2.5 Add pagination support: accept limit (default 100, max 1000) and offset params, return total_count + results

## 3. Server Entry Point

- [x] 3.1 Implement index.ts: create MCP server instance, register all tools, start stdio transport

## 4. BGP Session Tools

- [x] 4.1 Implement list_bgp_sessions: query both direct and IXP session endpoints in parallel, extract common fields, tag with session_type, merge results
- [x] 4.2 Add filters: asn, router, ixp, status, bgp_state, address_family, is_route_server (skip direct endpoint when IXP-only filter is set)
- [x] 4.3 Implement get_bgp_session_detail: accept id + session_type, return full type-specific response (direct fields OR ixp fields, no nulls)

## 5. Network Tools

- [x] 5.1 Implement list_autonomous_systems with filters: asn, name, affiliated, search
- [x] 5.2 Implement get_autonomous_system: fetch AS detail + shared_ixps + shared_facilities in parallel, merge into single response
- [x] 5.3 Implement list_internet_exchanges with filters: status, local_autonomous_system_id, local_autonomous_system_asn
- [x] 5.4 Implement get_internet_exchange: fetch IXP detail + available_peers, merge into single response

## 6. Infrastructure Tools

- [x] 6.1 Implement list_routers with filters: status, platform_id, local_autonomous_system_id
- [x] 6.2 Implement list_connections with filters: status, internet_exchange_point_id, router_id

## 7. Policy Tools

- [x] 7.1 Implement list_routing_policies with filters: type, address_family
- [x] 7.2 Implement list_communities with filters: type

## 8. Configuration Tool

- [x] 8.1 Implement get_router_configuration: fetch rendered config from /api/devices/routers/{id}/configuration/ with extended timeout (120s default)

## 9. Discovery & Audit Tools

- [x] 9.1 Implement search_peeringdb: accept resource_type (networks, internet-exchanges, facilities, network-ixlans) + search + filters, map to correct endpoint
- [x] 9.2 Implement list_changes with filters: action, changed_object_type, user, time_after, time_before

## 10. Type Definitions

- [x] 10.1 Define TypeScript types in types.ts for tool input schemas, common session fields, and API response shapes

## 11. Build & Test

- [x] 11.1 Verify the project builds cleanly with tsc
- [x] 11.2 Test server starts and lists tools via stdio (npx @modelcontextprotocol/inspector or manual JSON-RPC)
