import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";

import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  saveRefreshToken,
  saveToken,
} from "@/services/secureStorage";

import type { User, LoginResponse, RefreshResponse, AuthContextType } from "@/types/auth";
import type { Props } from "@/types/common";

import { loginApi, refreshApi } from "../services/authService";



export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const refresh = await getRefreshToken();

      if (token && refresh) {
        setAccessToken(token);

        // اگر لازم داشتی:
        // const profile = await getProfileApi()
        // setUser(profile)

        setUser(null);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load auth from storage", err);
      setError("Failed to load auth");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res: LoginResponse = await loginApi(username, password);

      await saveToken(res.token);
      await saveRefreshToken(res.refreshToken);

      setAccessToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await removeToken();
      await removeRefreshToken();
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();
      if (!refresh) throw new Error("No refresh token");

      const res: RefreshResponse = await refreshApi(refresh);

      await saveToken(res.accessToken);
      setAccessToken(res.accessToken);
    } catch (err) {
      console.error("Refresh failed", err);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    error,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};