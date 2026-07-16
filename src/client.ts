const PM_URL = process.env.PM_URL;
const PM_API_TOKEN = process.env.PM_API_TOKEN;
const PM_CONFIG_TIMEOUT = parseInt(process.env.PM_CONFIG_TIMEOUT || "120", 10) * 1000;
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

if (!PM_URL) {
  console.error("PM_URL environment variable is required");
  process.exit(1);
}
if (!PM_API_TOKEN) {
  console.error("PM_API_TOKEN environment variable is required");
  process.exit(1);
}

const baseUrl = PM_URL.replace(/\/+$/, "");

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

class PeeringManagerError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleResponse(response: Response): Promise<unknown> {
  if (response.ok) {
    return response.json();
  }

  let message: string;
  try {
    const body = await response.json();
    message = body.detail || JSON.stringify(body);
  } catch {
    message = response.statusText;
  }

  if (response.status === 401) {
    throw new PeeringManagerError(401, `Authentication failed: invalid or expired API token`);
  }
  if (response.status === 404) {
    throw new PeeringManagerError(404, `Not found`);
  }
  throw new PeeringManagerError(response.status, `Peering Manager API error (${response.status}): ${message}`);
}

export async function get(path: string, options: RequestOptions = {}): Promise<unknown> {
  const url = new URL(`${baseUrl}${path}`);
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Token ${PM_API_TOKEN}` },
      signal: controller.signal,
    });
    return handleResponse(response);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new PeeringManagerError(408, `Request timed out after ${timeout / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function list<T = unknown>(path: string, options: RequestOptions = {}): Promise<PaginatedResponse<T>> {
  const limit = Math.min(options.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options.offset ?? 0;

  const result = await get(path, {
    ...options,
    params: { ...options.params, limit, offset },
  }) as { count: number; results: T[] };

  return {
    total_count: result.count,
    results: result.results,
  };
}

export function getConfigTimeout(): number {
  return PM_CONFIG_TIMEOUT;
}
