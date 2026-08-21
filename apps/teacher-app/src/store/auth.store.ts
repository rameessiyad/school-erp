// src/store/auth.store.ts
import { create } from "zustand";
import { secureStorage } from "../lib/secureStorage";
import { LoginResponse } from "../api/auth.api";

interface AuthState {
  user: LoginResponse["user"] | null;
  isAuthenticated: boolean;
  isHydrating: boolean; // true while checking SecureStore on app boot
  setSession: (data: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,

  setSession: async ({ accessToken, user }) => {
    await secureStorage.setToken(accessToken);
    await secureStorage.setUser(user);
    await secureStorage.setLastSchoolId(""); // set properly from login.tsx after success
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await secureStorage.clearSession();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = await secureStorage.getToken();
    const user = await secureStorage.getUser<LoginResponse["user"]>();
    set({
      user: token && user ? user : null,
      isAuthenticated: Boolean(token && user),
      isHydrating: false,
    });
  },
}));
