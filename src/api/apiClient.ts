import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  saveToken,
} from "@/services/secureStorage";
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

// کنترل concurrent refresh: وقتی در حال refresh هستیم درخواست‌ها در صف بمانند
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

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — در صورت 401 تلاش برای refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {
    const originalRequest = error.config;

    // اگر originalRequest تعریف نشده یا status غیر 401 است → reject
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // اگر قبلا سعی به ری‌تری شده باشه، reject کن
    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // push request to queue while refresh in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      }).then(() => {
        // بعد از refresh، دوباره درخواست را اجرا کن
        return api(originalRequest);
      });
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      // درخواست refresh به بک‌اند (سرویس refreshApi را می‌توانی استفاده کنی)
      const refreshResponse = await axios.post<RefreshResponse>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      );

      const newAccessToken = refreshResponse.data.accessToken;
      await saveToken(newAccessToken);

      processQueue(null, newAccessToken);

      // update header and retry original request
      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);

      // پاکسازی توکن‌ها و ری‌جکت
      await removeToken();
      await removeRefreshToken();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
