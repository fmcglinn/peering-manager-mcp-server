export interface CommonSessionFields {
  id: number;
  session_type: "direct" | "ixp";
  autonomous_system: { id: number; asn: number; name: string };
  ip_address: string;
  status: string;
  bgp_state: string;
  received_prefix_count: number;
  accepted_prefix_count: number;
  advertised_prefix_count: number;
  router: string | null;
  multihop_ttl: number;
  passive: boolean;
  bfd: unknown;
  service_reference: string;
  comments: string;
  tags: unknown[];
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
