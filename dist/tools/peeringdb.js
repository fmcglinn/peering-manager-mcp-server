import { z } from "zod";
import { list } from "../client.js";
const RESOURCE_MAP = {
    networks: "/api/peeringdb/networks/",
    "internet-exchanges": "/api/peeringdb/internet-exchanges/",
    facilities: "/api/peeringdb/facilities/",
    "network-ixlans": "/api/peeringdb/network-ixlans/",
};
export function registerPeeringDbTools(server) {
    server.tool("search_peeringdb", "Search cached PeeringDB data. Supports networks, internet-exchanges, facilities, and network-ixlans.", {
        resource_type: z.enum(["networks", "internet-exchanges", "facilities", "network-ixlans"])
            .describe("PeeringDB resource type to query"),
        search: z.string().optional().describe("Free-text search"),
        asn: z.number().optional().describe("Filter by AS number (networks and network-ixlans)"),
        name: z.string().optional().describe("Filter by name"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const path = RESOURCE_MAP[params.resource_type];
        const result = await list(path, {
            params: {
                q: params.search,
                asn: params.asn,
                name: params.name,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
}
