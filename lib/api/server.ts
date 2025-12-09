import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api";
import { ApiError } from "../types";
import { cookies } from "next/headers";

/**
 * Server-side API instance
 * Used for Server Components and API routes
 */
const createServerApi = async (token?: string): Promise<AxiosInstance> => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token if provided
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // Try to get token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (authToken) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    }
  }

  return instance;
};

/**
 * Generic server API call wrapper
 */
export async function serverApi<T>(
  config: AxiosRequestConfig,
  token?: string
): Promise<T> {
  try {
    const api = await createServerApi(token);
    const response = await api.request<T>(config);
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

/**
 * Helper to make server-side GET requests
 */
export async function serverGet<T>(url: string, token?: string): Promise<T> {
  return serverApi<T>({ method: "GET", url }, token);
}

/**
 * Helper to make server-side POST requests
 */
export async function serverPost<T>(
  url: string,
  data?: unknown,
  token?: string
): Promise<T> {
  return serverApi<T>({ method: "POST", url, data }, token);
}
