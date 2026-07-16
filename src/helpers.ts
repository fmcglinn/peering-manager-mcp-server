export function summarizeAS(obj: Record<string, unknown> | undefined): { id: number; asn: number; name: string } | null {
  if (!obj) return null;
  return { id: obj.id as number, asn: obj.asn as number, name: (obj.name as string) ?? "" };
}

export function summarizeNamed(obj: Record<string, unknown> | undefined): { id: number; name: string } | null {
  if (!obj) return null;
  return { id: obj.id as number, name: (obj.name as string) ?? "" };
}

export function trimListRecord(record: Record<string, unknown>): Record<string, unknown> {
  const result = { ...record };

  if (result.local_autonomous_system) {
    result.local_autonomous_system = summarizeAS(result.local_autonomous_system as Record<string, unknown>);
  }
  for (const key of ["import_routing_policies", "export_routing_policies"]) {
    if (Array.isArray(result[key])) {
      result[key] = (result[key] as Record<string, unknown>[]).map(summarizeNamed);
    }
  }
  if (Array.isArray(result.tags)) {
    result.tags = (result.tags as Record<string, unknown>[]).map(summarizeNamed);
  }
  if (Array.isArray(result.communities)) {
    result.communities = (result.communities as Record<string, unknown>[]).map(summarizeNamed);
  }

  return result;
}
