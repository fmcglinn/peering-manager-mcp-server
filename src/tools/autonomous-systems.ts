import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { list, get } from "../client.js";

function stripAsPayload(record: Record<string, unknown>): Record<string, unknown> {
  const prefixes = record.prefixes as { ipv4?: unknown[]; ipv6?: unknown[] } | undefined;
  const asList = record.as_list as unknown[] | undefined;
  const { prefixes: _, as_list: __, ...rest } = record;
  return {
    ...rest,
    prefix_count_v4: prefixes?.ipv4?.length ?? 0,
    prefix_count_v6: prefixes?.ipv6?.length ?? 0,
    as_list_count: asList?.length ?? 0,
  };
}

export function registerAutonomousSystemTools(server: McpServer) {
  server.tool(
    "list_autonomous_systems",
    "List autonomous systems configured in Peering Manager.",
    {
      asn: z.number().optional().describe("Filter by AS number"),
      name: z.string().optional().describe("Filter by name"),
      affiliated: z.boolean().optional().describe("Filter by affiliated status (true = local/own ASes)"),
      search: z.string().optional().describe("Free-text search across AS fields"),
      limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async (params) => {
      const result = await list<Record<string, unknown>>("/api/peering/autonomous-systems/", {
        params: {
          asn: params.asn,
          name: params.name,
          affiliated: params.affiliated,
          q: params.search,
        },
        limit: params.limit,
        offset: params.offset,
      });

      const shaped = {
        ...result,
        results: result.results.map(stripAsPayload),
      };

      return { content: [{ type: "text" as const, text: JSON.stringify(shaped, null, 2) }] };
    }
  );

  server.tool(
    "get_autonomous_system",
    "Get full detail for an autonomous system including shared IXPs and shared facilities.",
    {
      id: z.number().describe("Autonomous system ID"),
    },
    async ({ id }) => {
      const [detail, sharedIxps, sharedFacilities] = await Promise.all([
        get(`/api/peering/autonomous-systems/${id}/`),
        get(`/api/peering/autonomous-systems/${id}/shared-ixps/`).catch(() => []),
        get(`/api/peering/autonomous-systems/${id}/shared-facilities/`).catch(() => []),
      ]);

      const result = stripAsPayload({
        ...(detail as Record<string, unknown>),
        shared_ixps: sharedIxps,
        shared_facilities: sharedFacilities,
      });

      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
