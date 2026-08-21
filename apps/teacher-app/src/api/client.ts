// src/api/client.ts
import axios from "axios";
import { API_BASE_URL } from "../constants/config";
import { secureStorage } from "../lib/secureStorage";

console.log("API_BASE_URL configured as:", API_BASE_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  console.log(
    "→ REQUEST:",
    config.method?.toUpperCase(),
    (config.baseURL ?? "") + (config.url ?? ""),
  );
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("← RESPONSE:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log(
      "← ERROR RESPONSE:",
      error.response?.status,
      error.config?.url,
      error.message,
    );
    if (error.response?.status === 401) {
      await secureStorage.clearSession();
    }
    return Promise.reject(error);
  },
);
