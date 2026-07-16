export declare function summarizeAS(obj: Record<string, unknown> | undefined): {
    id: number;
    asn: number;
    name: string;
} | null;
export declare function summarizeNamed(obj: Record<string, unknown> | undefined): {
    id: number;
    name: string;
} | null;
export declare function trimListRecord(record: Record<string, unknown>): Record<string, unknown>;
