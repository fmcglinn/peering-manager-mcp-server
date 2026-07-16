## 1. Summary tool skeleton

- [ ] 1.1 Register `get_bgp_session_summary` tool in `src/tools/bgp-sessions.ts` with the same filter params as `list_bgp_sessions` (minus `limit`/`offset`) plus tool description
- [ ] 1.2 Define the summary response type: `{ totals, routers, sessions_scanned, truncated }`

## 2. Filter building

- [ ] 2.1 Extract or duplicate the filter-building logic from `list_bgp_sessions` (the block that builds `directParams`/`ixpParams` from tool params) so it can be reused by the summary tool
- [ ] 2.2 Wire the summary tool's params into the same filter-building logic

## 3. Pagination and aggregation

- [ ] 3.1 Implement internal pagination loop: fetch direct + IXP sessions in parallel per page (limit=1000), extract router name and bgp_state from each result using `extractCommonFields`, accumulate into a `Map<routerName, Map<state, count>>`
- [ ] 3.2 Continue paginating until both endpoints are exhausted or 10,000 total sessions scanned
- [ ] 3.3 Handle null router names by counting under "(unassigned)"
- [ ] 3.4 Handle unknown BGP state values by counting under "other"

## 4. Response formatting

- [ ] 4.1 Build `totals` object by summing across all routers
- [ ] 4.2 Build `routers` array sorted by name, each with state counts and total
- [ ] 4.3 Include `sessions_scanned` and `truncated` fields
- [ ] 4.4 Ensure zero-count states are included in output (don't omit states with 0)

## 5. Build and verify

- [ ] 5.1 Run `npm run build` and fix any TypeScript errors
- [ ] 5.2 Verify `get_bgp_session_summary()` with no filters returns a compact summary
- [ ] 5.3 Verify `get_bgp_session_summary(router_name: "esg1-cor1")` returns only that router's counts
- [ ] 5.4 Verify response size is compact (under 5KB for typical deployments)
