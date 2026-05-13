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

console.log("AuthContext ");
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  console.log("AuthContext AuthProvider");

  const loadToken = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) setUserToken(token);
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await loginApi(username, password);
    console.log("token token AuthContext", response);

    await SecureStore.setItemAsync("token", response.token);
    setUserToken(response.token);
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
