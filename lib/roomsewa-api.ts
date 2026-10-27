import 'server-only';

import type { ApiResponse } from '@/types/roomsewa';

/**
 * Core server-side HTTP client for the Room Sewa Business Jobs API.
 *
 * - Auth headers (`X-Team-Id`, `X-Business-Token`) are attached on every call
 *   from server-only env vars; `X-User-Id` is added when acting for a user.
 * - Never throws: HTTP 401, API-level failures (`success: false`), non-JSON
 *   responses, timeouts and network errors all resolve to `success: false`
 *   so Server Components can render an error state instead of crashing.
 */

if (typeof window !== 'undefined') {
  throw new Error('lib/roomsewa-api.ts is server-only and must never be imported in the browser.');
}

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * `ApiResponse<T>` plus the HTTP status, discriminated on `success`.
 * `status` is 0 when the API could not be reached (network error / timeout).
 */
export type RoomSewaResponse<T> =
  | (ApiResponse<T> & { success: true; status: number })
  | (ApiResponse<null> & { success: false; message: string; status: number });

export type RoomSewaQueryParams = Record<string, string | number | boolean | undefined>;

export interface RoomSewaRequestOptions {
  method?: 'GET' | 'POST';
  params?: RoomSewaQueryParams;
  /** Multipart body. Content-Type is intentionally NOT set so fetch adds the boundary. */
  formData?: FormData;
  /** Team user to act for — sent as `X-User-Id`. */
  userId?: string | number;
  /** Defaults to `'no-store'` so live job data is always fresh. */
  cache?: RequestCache;
}

const REQUEST_TIMEOUT_MS = 15_000;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function failure(message: string, status: number): RoomSewaResponse<never> {
  return { success: false, message, body: null, status };
}

function buildUrl(baseUrl: string, endpoint: string, params?: RoomSewaQueryParams): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = endpoint === '' || endpoint === '/' ? '' : `/${endpoint.replace(/^\/+/, '')}`;
  const url = new URL(`${base}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      const str = String(value).trim();
      if (str !== '') url.searchParams.set(key, str);
    }
  }
  return url.toString();
}

/* -------------------------------------------------------------------------- */
/*                                Core request                                */
/* -------------------------------------------------------------------------- */

export async function roomSewaRequest<T>(
  endpoint: string,
  options: RoomSewaRequestOptions = {},
): Promise<RoomSewaResponse<T>> {
  const baseUrl = process.env.ROOMSEWA_API_BASE_URL;
  const teamId = process.env.ROOMSEWA_TEAM_ID;
  const token = process.env.ROOMSEWA_BUSINESS_TOKEN;

  if (!baseUrl || !teamId || !token) {
    console.error('[roomsewa] Missing ROOMSEWA_API_BASE_URL / ROOMSEWA_TEAM_ID / ROOMSEWA_BUSINESS_TOKEN');
    return failure('Room Sewa API is not configured on the server.', 500);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Team-Id': teamId,
    'X-Business-Token': token,
  };
  if (options.userId !== undefined && options.userId !== null && String(options.userId) !== '') {
    headers['X-User-Id'] = String(options.userId);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(baseUrl, endpoint, options.params), {
      method: options.method ?? (options.formData ? 'POST' : 'GET'),
      headers,
      body: options.formData, // passed as-is: fetch generates multipart/form-data; boundary=...
      cache: options.cache ?? 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    console.error(`[roomsewa] ${timedOut ? 'Timeout' : 'Network error'} on ${endpoint || '/'}`, error);
    return failure(
      timedOut ? 'Room Sewa API timed out. Please try again.' : 'Unable to reach Room Sewa API. Please try again.',
      0,
    );
  }

  let data: (Partial<ApiResponse<T>> & { error?: string }) | null = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. gateway error page) — handled below.
  }

  if (res.status === 401) {
    return failure(data?.message ?? 'Unauthorized: invalid or missing Room Sewa business token.', 401);
  }

  if (!res.ok) {
    return failure(data?.message ?? data?.error ?? `Room Sewa API request failed (HTTP ${res.status}).`, res.status);
  }

  if (!data || typeof data !== 'object') {
    return failure('Room Sewa API returned an invalid response.', res.status);
  }

  if (data.success !== true) {
    return failure(data.message ?? 'Room Sewa API returned an unsuccessful response.', res.status);
  }

  return { success: true, message: data.message, body: data.body as T, status: res.status };
}

