import { loginApi } from "@/services/authService";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  console.log("AuthContext ");

  const loadToken = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) setUserToken(token);
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (username: string, password: string) => {
    const token = await loginApi(username, password);
    await SecureStore.setItemAsync("token", token);
    setUserToken(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
