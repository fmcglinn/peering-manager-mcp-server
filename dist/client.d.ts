export interface PaginatedResponse<T = unknown> {
    total_count: number;
    results: T[];
}
export interface RequestOptions {
    params?: Record<string, string | number | boolean | undefined>;
    limit?: number;
    offset?: number;
    timeout?: number;
}
export declare function get(path: string, options?: RequestOptions): Promise<unknown>;
export declare function list<T = unknown>(path: string, options?: RequestOptions): Promise<PaginatedResponse<T>>;
export declare function getConfigTimeout(): number;
