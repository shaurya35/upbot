"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  authApi,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
  type Session,
  type User,
} from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const refreshDelay = (token: string) => {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return exp ? Math.max(exp * 1000 - Date.now() - 30_000, 0) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAuth = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setAccessToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback(
    (session: Session) => {
      setAccessToken(session.accessToken);
      setUser(session.user);

      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      const delay = refreshDelay(session.accessToken);
      if (delay !== null) {
        refreshTimer.current = setTimeout(async () => {
          const next = await refreshSession();
          if (next) applySession(next);
          else clearAuth();
        }, delay);
      }
    },
    [clearAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.signout();
    } catch (error) {
      console.log("Failed to sign out on the server:", error);
    }
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    setSessionExpiredHandler(clearAuth);
    refreshSession()
      .then((session) => (session ? applySession(session) : clearAuth()))
      .finally(() => setLoading(false));

    return () => {
      setSessionExpiredHandler(null);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [applySession, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, login: applySession, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
