import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  saveRefreshToken,
  saveToken,
} from "@/services/secureStorage";
import { triggerAuthExpired } from "@/auth/authBridge";
import { isTokenExpiringSoon } from "@/utils/jwtUtils";
import type { RefreshResponse } from "@/types/auth";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { config } from "@/constants/config";

const BASE_URL = config.apiBaseUrl;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Serialize concurrent refresh attempts: queue requests while a refresh is in-flight.
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers["Authorization"] = `Bearer ${token}`;
      }
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

async function doRefresh(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await axios.post<RefreshResponse>(
    `${BASE_URL}/Account/refresh`,
    { refreshToken },
  );

  const { token: newAccessToken, refreshToken: newRefreshToken } =
    response.data;

  await saveToken(newAccessToken);
  if (newRefreshToken) await saveRefreshToken(newRefreshToken);

  return newAccessToken;
}

// Request interceptor — attach token; proactively refresh if expiring soon.
api.interceptors.request.use(
  async (reqConfig) => {
    let token = await getToken();

    if (token && isTokenExpiringSoon(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          token = await doRefresh();
          processQueue(null, token);
        } catch (err) {
          processQueue(err, null);
          await removeToken();
          await removeRefreshToken();
          triggerAuthExpired();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — retry once on 401 after refreshing.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((originalRequest as any)._retry) {
      // Already retried — auth is truly gone.
      await removeToken();
      await removeRefreshToken();
      triggerAuthExpired();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      }).then(() => api(originalRequest));
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await doRefresh();
      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      await removeToken();
      await removeRefreshToken();
      triggerAuthExpired();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
