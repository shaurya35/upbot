"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  getAuthStateSSR,
  getTokenExpiration,
} from "@/lib/auth";
import { BACKEND_URL } from "@/configs/env";
import axios from "axios"

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
    console.log("Auth Reset!")
  }

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.log("Failed to logout - backend:", error);
    }
    clearAuth();
  };

  const scheduleTokenRefresh = async (token: string) => {
    const exp = getTokenExpiration(token);
    if (exp === null) {
      console.warn("Token expiration could not be determined.");
      return;
    }
    const now = Date.now();
    const delay = exp - now - 5000;

    if (delay > 0) {
      setTimeout(async () => {
        try {
          const data = await getAuthStateSSR();
          if (data) {
            setAccessToken(data.accessToken);
            setUser(data.user);
          } else {
            console.warn("Token refresh failed, resetting auth!");
            clearAuth();
          }
        } catch (err) {
          console.error("Token refresh error:", err);
          clearAuth()
        }
      }, delay);
    }
  };

  const initAuth = async () => {
    setLoading(true);
    try {
      const data = await getAuthStateSSR();
      if (!data) {
        throw new Error("AuthProvider - initAuth Error");
      }
      setAccessToken(data.accessToken);
      setUser(data.user);
      scheduleTokenRefresh(data.accessToken);
    } catch (error) {
      console.log("Auth init Error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const value = {
    user, 
    accessToken,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value as any}>
      {!loading && children}
    </AuthContext.Provider>
  )
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}