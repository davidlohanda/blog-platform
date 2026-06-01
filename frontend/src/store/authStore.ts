'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  emailVerifiedAt: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isImpersonation: boolean;
  impersonatedUserName: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  setImpersonation: (token: string, user: AuthUser) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isImpersonation: false,
  impersonatedUserName: null,
  setAuth: (accessToken, user) => set({ accessToken, user, isImpersonation: false, impersonatedUserName: null }),
  setImpersonation: (accessToken, user) =>
    set({ accessToken, user, isImpersonation: true, impersonatedUserName: user.name }),
  setToken: (accessToken) => set((state) => ({ ...state, accessToken })),
  clearAuth: () =>
    set({ accessToken: null, user: null, isImpersonation: false, impersonatedUserName: null }),
}));
