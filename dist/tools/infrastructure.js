import { z } from "zod";
import { list, get } from "../client.js";
export function registerInfrastructureTools(server) {
    server.tool("list_routers", "List routers configured in Peering Manager.", {
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        platform_id: z.number().optional().describe("Filter by platform ID"),
        local_autonomous_system_id: z.number().optional().describe("Filter by local AS ID"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/devices/routers/", {
            params: {
                status: params.status,
                platform_id: params.platform_id,
                local_autonomous_system_id: params.local_autonomous_system_id,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
    server.tool("list_internet_exchanges", "List internet exchange points configured in Peering Manager.", {
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        local_autonomous_system_id: z.number().optional().describe("Filter by local AS ID"),
        local_autonomous_system_asn: z.number().optional().describe("Filter by local AS number"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/peering/internet-exchanges/", {
            params: {
                status: params.status,
                local_autonomous_system_id: params.local_autonomous_system_id,
                local_autonomous_system_asn: params.local_autonomous_system_asn,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
    server.tool("get_internet_exchange", "Get full detail for an internet exchange point including available peers.", {
        id: z.number().describe("Internet exchange ID"),
    }, async ({ id }) => {
        const [detail, availablePeers] = await Promise.all([
            get(`/api/peering/internet-exchanges/${id}/`),
            get(`/api/peering/internet-exchanges/${id}/available-peers/`).catch(() => []),
        ]);
        const result = {
            ...detail,
            available_peers: availablePeers,
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
    server.tool("list_connections", "List IXP connections with IP/VLAN/router mapping.", {
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        internet_exchange_point_id: z.number().optional().describe("Filter by IXP ID"),
        router_id: z.number().optional().describe("Filter by router ID"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/net/connections/", {
            params: {
                status: params.status,
                internet_exchange_point_id: params.internet_exchange_point_id,
                router_id: params.router_id,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
}
