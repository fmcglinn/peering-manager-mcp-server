import { z } from "zod";
import { list, get } from "../client.js";
function extractCommonFields(session, type) {
    const as_ = session.autonomous_system;
    let routerName = null;
    if (type === "direct") {
        const router = session.router;
        routerName = router?.name ?? null;
    }
    else {
        const conn = session.ixp_connection;
        const router = conn?.router;
        routerName = router?.name ?? null;
    }
    return {
        id: session.id,
        session_type: type,
        autonomous_system: {
            id: as_?.id ?? 0,
            asn: as_?.asn ?? 0,
            name: as_?.name ?? "",
        },
        ip_address: session.ip_address ?? "",
        status: session.status ?? "",
        bgp_state: session.bgp_state ?? "",
        received_prefix_count: session.received_prefix_count ?? 0,
        accepted_prefix_count: session.accepted_prefix_count ?? 0,
        advertised_prefix_count: session.advertised_prefix_count ?? 0,
        router: routerName,
        multihop_ttl: session.multihop_ttl ?? 0,
        passive: session.passive ?? false,
        bfd: session.bfd ?? null,
        service_reference: session.service_reference ?? "",
        comments: session.comments ?? "",
        tags: session.tags ?? [],
    };
}
export function registerBgpSessionTools(server) {
    server.tool("list_bgp_sessions", "List BGP sessions across both direct peering and IXP sessions. Returns unified view with common fields.", {
        asn: z.number().optional().describe("Filter by remote AS number"),
        router: z.string().optional().describe("Filter by router name"),
        ixp: z.number().optional().describe("Filter by internet exchange ID"),
        status: z.string().optional().describe("Filter by status (e.g. enabled, disabled, maintenance)"),
        bgp_state: z.string().optional().describe("Filter by BGP state (e.g. established, active, idle)"),
        address_family: z.number().optional().describe("Filter by address family (4 or 6)"),
        is_route_server: z.boolean().optional().describe("Filter IXP sessions by route server status (IXP sessions only)"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const directParams = {};
        const ixpParams = {};
        if (params.asn !== undefined) {
            directParams.autonomous_system_asn = params.asn;
            ixpParams.autonomous_system_asn = params.asn;
        }
        if (params.router !== undefined) {
            directParams.router_name = params.router;
        }
        if (params.ixp !== undefined) {
            ixpParams.internet_exchange_id = params.ixp;
        }
        if (params.status !== undefined) {
            directParams.status = params.status;
            ixpParams.status = params.status;
        }
        if (params.bgp_state !== undefined) {
            directParams.bgp_state = params.bgp_state;
            ixpParams.bgp_state = params.bgp_state;
        }
        if (params.address_family !== undefined) {
            directParams.address_family = params.address_family;
            ixpParams.address_family = params.address_family;
        }
        if (params.is_route_server !== undefined) {
            ixpParams.is_route_server = params.is_route_server;
        }
        const skipDirect = params.is_route_server !== undefined || params.ixp !== undefined;
        const limit = params.limit ?? 100;
        const offset = params.offset ?? 0;
        const [directResult, ixpResult] = await Promise.all([
            skipDirect
                ? Promise.resolve({ total_count: 0, results: [] })
                : list("/api/peering/direct-peering-sessions/", {
                    params: directParams,
                    limit,
                    offset,
                }),
            list("/api/peering/internet-exchange-peering-sessions/", {
                params: ixpParams,
                limit,
                offset,
            }),
        ]);
        const sessions = [
            ...directResult.results.map((s) => extractCommonFields(s, "direct")),
            ...ixpResult.results.map((s) => extractCommonFields(s, "ixp")),
        ];
        const result = {
            total_count: directResult.total_count + ixpResult.total_count,
            results: sessions,
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
    server.tool("get_bgp_session_detail", "Get full detail for a single BGP session. Returns type-specific fields based on session type.", {
        id: z.number().describe("Session ID"),
        session_type: z.enum(["direct", "ixp"]).describe("Session type: 'direct' for direct peering, 'ixp' for internet exchange"),
    }, async ({ id, session_type }) => {
        const path = session_type === "direct"
            ? `/api/peering/direct-peering-sessions/${id}/`
            : `/api/peering/internet-exchange-peering-sessions/${id}/`;
        const session = await get(path);
        return { content: [{ type: "text", text: JSON.stringify(session, null, 2) }] };
    });
}
