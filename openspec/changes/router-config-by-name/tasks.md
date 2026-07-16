## 1. Update tool schema

- [ ] 1.1 Change `id` from required to optional in `get_router_configuration` tool schema
- [ ] 1.2 Add `name` (string, optional) and `hostname` (string, optional) params with descriptions
- [ ] 1.3 Update tool description to mention name/hostname resolution

## 2. Implement resolution logic

- [ ] 2.1 Add validation at top of handler: count how many of `id`, `name`, `hostname` are provided; return error if not exactly one
- [ ] 2.2 When `name` or `hostname` is provided, call `list("/api/devices/routers/", { params: { name | hostname }, limit: 2 })` to resolve
- [ ] 2.3 Handle zero results: return "No router found with name/hostname '...'" error
- [ ] 2.4 Handle two results: return "Multiple routers match..." error listing both matches (name + id)
- [ ] 2.5 Extract `id` from the single match and proceed to config fetch as before

## 3. Build and verify

- [ ] 3.1 Run `npm run build` and fix any TypeScript errors
- [ ] 3.2 Verify `get_router_configuration(name: "esg1-cor1")` returns the rendered config
- [ ] 3.3 Verify `get_router_configuration(hostname: "...")` resolves and returns config
- [ ] 3.4 Verify error on nonexistent name
- [ ] 3.5 Verify error when both `id` and `name` are provided
