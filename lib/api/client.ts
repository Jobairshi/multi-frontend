"use client";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api";
import { storage } from "../utils/storage";
import { ApiError } from "../types";

/**
 * Client-side API instance
 * Used for client components and browser-side API calls
 */
const createClientApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        storage.removeToken();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth")
        ) {
          window.location.href = "/auth/signin";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const clientApi = createClientApi();

/**
 * Generic client API call wrapper
 */
export async function callApi<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await clientApi.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw new Error(
        Array.isArray(apiError?.message)
          ? apiError.message.join(", ")
          : apiError?.message || "An error occurred"
      );
    }
    throw error;
  }
}
