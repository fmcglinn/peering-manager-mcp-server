import { z } from "zod";
import { list } from "../client.js";
export function registerAuditTools(server) {
    server.tool("list_changes", "List recent object changes from the Peering Manager audit log.", {
        action: z.string().optional().describe("Filter by action: create, update, delete"),
        changed_object_type: z.string().optional().describe("Filter by object type (e.g. peering.directpeeringsession)"),
        user: z.string().optional().describe("Filter by username"),
        time_after: z.string().optional().describe("Filter changes after this date (ISO format, e.g. 2026-07-01)"),
        time_before: z.string().optional().describe("Filter changes before this date (ISO format)"),
        limit: z.number().optional().describe("Max results to return (default 100, max 1000)"),
        offset: z.number().optional().describe("Offset for pagination"),
    }, async (params) => {
        const result = await list("/api/core/object-changes/", {
            params: {
                action: params.action,
                changed_object_type: params.changed_object_type,
                user: params.user,
                time_after: params.time_after,
                time_before: params.time_before,
            },
            limit: params.limit,
            offset: params.offset,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
}
