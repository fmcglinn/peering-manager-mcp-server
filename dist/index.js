#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerBgpSessionTools } from "./tools/bgp-sessions.js";
import { registerAutonomousSystemTools } from "./tools/autonomous-systems.js";
import { registerInfrastructureTools } from "./tools/infrastructure.js";
import { registerPolicyTools } from "./tools/policy.js";
import { registerConfigTools } from "./tools/config.js";
import { registerPeeringDbTools } from "./tools/peeringdb.js";
import { registerAuditTools } from "./tools/audit.js";
const server = new McpServer({
    name: "peering-manager",
    version: "1.0.0",
});
registerBgpSessionTools(server);
registerAutonomousSystemTools(server);
registerInfrastructureTools(server);
registerPolicyTools(server);
registerConfigTools(server);
registerPeeringDbTools(server);
registerAuditTools(server);
const transport = new StdioServerTransport();
await server.connect(transport);
