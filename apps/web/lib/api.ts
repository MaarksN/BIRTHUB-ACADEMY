export const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
    throw new ApiError(typeof record.message === 'string' ? record.message : 'Falha na requisição', response.status, data);
  }
  return data as T;
}

