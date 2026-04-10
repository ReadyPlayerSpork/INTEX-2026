/**
 * Centralized API client.
 *
 * All backend calls go through this module so auth handling, error
 * normalisation, and base-URL logic live in one place.
 */

/** Returns the API base URL (empty string in dev so Vite proxy handles it). */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL?.trim();
  const url = env ? env.replace(/\/$/, '') : '';

  if (!url && !import.meta.env.DEV) {
    console.warn(
      '[API] VITE_API_BASE_URL is not configured. Relative /api requests require the deployed frontend host to proxy requests to the backend API.',
    );
  }

  if (import.meta.env.DEV) {
    console.log(`[API] Base URL resolved to: "${url || '(relative)'}"`);
  }

  return url;
}

class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* empty — body may not be JSON */
    }
    throw new ApiError(res.status, `API ${res.status}: ${res.statusText}`, body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

/** HTTP convenience wrappers */
const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },

  delete<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};

/**
 * Download a file from the API with cookies (cross-subdomain production).
 * Use instead of window.open('/api/...') which hits the frontend host and404s.
 */
export async function downloadFromApi(pathWithQuery: string, filename: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}${pathWithQuery}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = (await res.json()) as { title?: string; detail?: string }
      detail = j.detail ?? j.title ?? detail
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}

export { api, ApiError };
