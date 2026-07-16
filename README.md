# Peering Manager MCP Server

A read-only [Model Context Protocol](https://modelcontextprotocol.io) server for [Peering Manager](https://peering-manager.net). Exposes peering infrastructure data as conversational tools for use with Claude Code, claude.ai, or any MCP-compatible client.

## Tools

| Tool | Description |
|------|-------------|
| `list_bgp_sessions` | Unified view of BGP sessions across direct peering and IXP sessions |
| `get_bgp_session_detail` | Full detail for a single session with type-specific fields |
| `list_autonomous_systems` | Search/filter autonomous systems |
| `get_autonomous_system` | AS detail with shared IXPs and facilities |
| `list_routers` | Routers with status and platform info |
| `list_internet_exchanges` | Internet exchange points |
| `get_internet_exchange` | IXP detail with available peers |
| `list_connections` | IXP connections with IP/VLAN/router mapping |
| `list_routing_policies` | Import/export routing policies |
| `list_communities` | BGP communities |
| `get_router_configuration` | Rendered Jinja2 configuration for a router |
| `search_peeringdb` | Query cached PeeringDB data (networks, IXPs, facilities, network-ixlans) |
| `list_changes` | Audit log of recent object changes |

All tools are read-only. No write operations are exposed.

## Requirements

- Node.js 18+
- A running Peering Manager instance with API access
- An API token with read permissions

## Install

```bash
npm install -g git+https://github.com/yourorg/peering-manager-mcp-server.git
```

This installs the `peering-manager-mcp-server` command globally.

## Configuration

The server reads two required environment variables:

| Variable | Description |
|----------|-------------|
| `PM_URL` | Base URL of your Peering Manager instance (e.g. `https://pm.example.com`) |
| `PM_API_TOKEN` | API token for authentication |
| `PM_CONFIG_TIMEOUT` | Optional. Timeout in seconds for config rendering (default: `120`) |

## Usage

### Claude Code

Add to your global MCP settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "peering-manager": {
      "command": "peering-manager-mcp-server",
      "env": {
        "PM_URL": "https://pm.example.com",
        "PM_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### MCP Inspector

```bash
PM_URL=https://pm.example.com PM_API_TOKEN=your-token npx @modelcontextprotocol/inspector peering-manager-mcp-server
```

### Development

```bash
git clone https://github.com/yourorg/peering-manager-mcp-server.git
cd peering-manager-mcp-server
npm install
npm run build
PM_URL=https://pm.example.com PM_API_TOKEN=your-token npm start
```

## Example queries

Once connected, you can ask Claude things like:

- "Which BGP sessions are not established?"
- "Show me all peers at AMS-IX"
- "What IXPs do we share with AS13335?"
- "Show me the config for router core-1"
- "What routing policies are applied to our transit peers?"
- "What changed in the last week?"

## Filtering and pagination

All list tools accept `limit` (default 100, max 1000) and `offset` for pagination. Responses include `total_count` so you know when there are more results.

Session-specific filters:

- `list_bgp_sessions`: `asn`, `router`, `ixp`, `status`, `bgp_state`, `address_family`, `is_route_server`
- `list_autonomous_systems`: `asn`, `name`, `affiliated`, `search`
- `list_routers`: `status`, `platform_id`, `local_autonomous_system_id`
- `list_internet_exchanges`: `status`, `local_autonomous_system_id`, `local_autonomous_system_asn`
- `list_connections`: `status`, `internet_exchange_point_id`, `router_id`
- `list_routing_policies`: `type`, `address_family`
- `list_communities`: `type`
- `search_peeringdb`: `resource_type` (required), `search`, `asn`, `name`
- `list_changes`: `action`, `changed_object_type`, `user`, `time_after`, `time_before`

## BGP session model

Peering Manager stores direct peering sessions and IXP peering sessions as separate models. This server unifies them:

- **`list_bgp_sessions`** merges both types into a single list with common fields and a `session_type` field (`"direct"` or `"ixp"`)
- **`get_bgp_session_detail`** returns the full type-specific response — direct sessions include `relationship`, `bgp_group`, `local_ip_address`; IXP sessions include `ixp_connection`, `is_route_server`, `exists_in_peeringdb`

## Timeouts

Most API calls use a 30-second timeout. `get_router_configuration` uses 120 seconds by default (configurable via `PM_CONFIG_TIMEOUT`) because config rendering may involve Jinja2 template processing and IRR/AS-SET lookups.

## License

MIT
