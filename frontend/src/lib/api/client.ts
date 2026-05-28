'use client';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lazy import of auth store to avoid circular dependency at module load time
function getAccessToken(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/store/authStore') as {
      useAuthStore: { getState: () => { accessToken: string | null } };
    };
    return useAuthStore.getState().accessToken;
  } catch {
    return null;
  }
}

function setAccessToken(token: string | null): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/store/authStore') as {
      useAuthStore: { getState: () => { setAuth: (t: string, u: unknown) => void; clearAuth: () => void } };
    };
    if (!token) useAuthStore.getState().clearAuth();
  } catch {
    // ignore
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;

        // Update store with new token (keep existing user data)
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useAuthStore } = require('@/store/authStore') as {
            useAuthStore: { getState: () => { setToken: (t: string) => void } };
          };
          useAuthStore.getState().setToken(newToken);
        } catch {
          // ignore
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
