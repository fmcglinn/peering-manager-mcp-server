import { z } from "zod";
import { list } from "../client.js";
export function registerPolicyTools(server) {
    server.tool("list_routing_policies", "List routing policies configured in Peering Manager.", {
        type: z.string().optional().describe("Filter by type: export-policy, import-policy, import-export-policy"),
        address_family: z.number().optional().describe("Filter by address family (0 = both, 4 = IPv4, 6 = IPv6)"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/peering/routing-policies/", {
            params: {
                type: params.type,
                address_family: params.address_family,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
    server.tool("list_communities", "List BGP communities configured in Peering Manager.", {
        type: z.string().optional().describe("Filter by type: egress, ingress"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/bgp/communities/", {
            params: {
                type: params.type,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
}
