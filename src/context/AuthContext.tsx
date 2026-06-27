import { registerLogoutCallback } from "@/auth/authBridge";
import { loginApi } from "@/services/authService";
import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  saveRefreshToken,
  saveToken,
} from "@/services/secureStorage";
import { isTokenExpired, isTokenExpiringSoon } from "@/utils/jwtUtils";
import { router } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import api from "@/api/apiClient";
import type { RefreshResponse } from "@/types/auth";

type AuthContextType = {
  userToken: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const appState = useRef(AppState.currentState);

  const logout = async () => {
    await removeToken();
    await removeRefreshToken();
    setUserToken(null);
    router.replace("/(auth)/SignIn");
  };

  // Try to silently refresh the access token using the stored refresh token.
  const tryRefresh = async (): Promise<string | null> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const response = await api.post<RefreshResponse>("/Account/refresh", {
        refreshToken,
      });
      const { token, refreshToken: newRefresh } = response.data;
      await saveToken(token);
      if (newRefresh) await saveRefreshToken(newRefresh);
      return token;
    } catch {
      return null;
    }
  };

  const loadToken = async () => {
    let token = await getToken();

    if (token) {
      if (isTokenExpired(token)) {
        // Access token expired — try to refresh silently.
        token = await tryRefresh();
        if (!token) {
          await logout();
          return;
        }
      }
      setUserToken(token);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  // Register the bridge so apiClient can trigger logout without importing context.
  useEffect(() => {
    registerLogoutCallback(logout);
  }, []);

  // Check token whenever the app comes back to foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          const token = await getToken();
          if (!token) {
            await logout();
            return;
          }

          if (isTokenExpiringSoon(token, 300)) {
            // Token expires in less than 5 min — proactively refresh.
            const refreshed = await tryRefresh();
            if (refreshed) {
              setUserToken(refreshed);
            } else if (isTokenExpired(token)) {
              await logout();
            }
          }
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await loginApi(username, password);
    await saveToken(response.token);
    await saveRefreshToken(response.refreshToken);
    setUserToken(response.token);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
