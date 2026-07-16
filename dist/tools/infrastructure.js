import { z } from "zod";
import { list, get } from "../client.js";
import { trimListRecord } from "../helpers.js";
export function registerInfrastructureTools(server) {
    server.tool("list_routers", "List routers configured in Peering Manager.", {
        name: z.string().optional().describe("Filter by exact router name"),
        hostname: z.string().optional().describe("Filter by exact hostname"),
        search: z.string().optional().describe("Free-text search across name, hostname, and platform"),
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        platform_id: z.number().optional().describe("Filter by platform ID"),
        local_autonomous_system_id: z.number().optional().describe("Filter by local AS ID"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/devices/routers/", {
            params: {
                name: params.name,
                hostname: params.hostname,
                q: params.search,
                status: params.status,
                platform_id: params.platform_id,
                local_autonomous_system_id: params.local_autonomous_system_id,
            },
            limit: params.limit,
            offset: params.offset,
        });
        const shaped = { ...result, results: result.results.map(trimListRecord) };
        return { content: [{ type: "text", text: JSON.stringify(shaped, null, 2) }] };
    });
    server.tool("list_internet_exchanges", "List internet exchange points configured in Peering Manager.", {
        search: z.string().optional().describe("Free-text search across IXP name, slug, and local AS"),
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        local_autonomous_system_id: z.number().optional().describe("Filter by local AS ID"),
        local_autonomous_system_asn: z.number().optional().describe("Filter by local AS number"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/peering/internet-exchanges/", {
            params: {
                q: params.search,
                status: params.status,
                local_autonomous_system_id: params.local_autonomous_system_id,
                local_autonomous_system_asn: params.local_autonomous_system_asn,
            },
            limit: params.limit,
            offset: params.offset,
        });
        const shaped = { ...result, results: result.results.map(trimListRecord) };
        return { content: [{ type: "text", text: JSON.stringify(shaped, null, 2) }] };
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
        search: z.string().optional().describe("Free-text search across interface, description, and router name/hostname"),
        status: z.string().optional().describe("Filter by status (enabled, disabled, maintenance, etc.)"),
        internet_exchange_point_id: z.number().optional().describe("Filter by IXP ID"),
        internet_exchange_point: z.string().optional().describe("Filter by IXP name"),
        router_id: z.number().optional().describe("Filter by router ID"),
        router_name: z.string().optional().describe("Filter by router name"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/net/connections/", {
            params: {
                q: params.search,
                status: params.status,
                internet_exchange_point_id: params.internet_exchange_point_id,
                internet_exchange_point: params.internet_exchange_point,
                router_id: params.router_id,
                router_name: params.router_name,
            },
            limit: params.limit,
            offset: params.offset,
        });
        const shaped = { ...result, results: result.results.map(trimListRecord) };
        return { content: [{ type: "text", text: JSON.stringify(shaped, null, 2) }] };
    });
}
