export function summarizeAS(obj) {
    if (!obj)
        return null;
    return { id: obj.id, asn: obj.asn, name: obj.name ?? "" };
}
export function summarizeNamed(obj) {
    if (!obj)
        return null;
    return { id: obj.id, name: obj.name ?? "" };
}
export function trimListRecord(record) {
    const result = { ...record };
    if (result.local_autonomous_system) {
        result.local_autonomous_system = summarizeAS(result.local_autonomous_system);
    }
    for (const key of ["import_routing_policies", "export_routing_policies"]) {
        if (Array.isArray(result[key])) {
            result[key] = result[key].map(summarizeNamed);
        }
    }
    if (Array.isArray(result.tags)) {
        result.tags = result.tags.map(summarizeNamed);
    }
    if (Array.isArray(result.communities)) {
        result.communities = result.communities.map(summarizeNamed);
    }
    return result;
}
