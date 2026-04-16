// src/services/authService.ts
import { AxiosResponse } from "axios";
import { api } from "../api/apiClient";

import type { LoginResponse, RefreshResponse } from "@/types/auth";

export async function loginApi(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch("http://10.0.2.2:5171/api/Account/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password }),
  });

  console.log("response response", response);
  // if (!response.ok) console.log("Login failed");
  if (!response.ok) throw new Error("Login failed");

  const data: LoginResponse = await response.json();

  return data;
}

export async function refreshApi(
  refreshToken: string,
): Promise<RefreshResponse> {
  const res: AxiosResponse<RefreshResponse> = await api.post("/auth/refresh", {
    refreshToken,
  });
  return res.data;
}
