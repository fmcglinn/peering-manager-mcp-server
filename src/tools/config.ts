import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, getConfigTimeout } from "../client.js";

export function registerConfigTools(server: McpServer) {
  server.tool(
    "get_router_configuration",
    "Get the rendered configuration for a specific router. Uses extended timeout due to Jinja2 rendering and possible IRR lookups.",
    {
      id: z.number().describe("Router ID"),
    },
    async ({ id }) => {
      const result = await get(`/api/devices/routers/${id}/configuration/`, {
        timeout: getConfigTimeout(),
      });

      const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
