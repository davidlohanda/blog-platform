import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  tags?: string[];
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { tags, ...fetchOptions } = options;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (refreshToken) {
    headers.Cookie = `refreshToken=${refreshToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    ...(tags ? { next: { tags } } : {}),
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({ message: 'Request failed' }))) as {
      message?: string;
    };
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
