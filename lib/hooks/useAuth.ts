"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/client";
import { API_ENDPOINTS } from "../config/api";
import { AuthResponse, SignInDto, SignUpDto, User } from "../types";
import { storage } from "../utils/storage";
import { useAppDispatch } from "../store/hooks";
import { setUser, clearUser } from "../store/userSlice";

// Query Keys
export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * Sign Up Mutation
 */
export function useSignUp() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignUpDto) => {
      return callApi<AuthResponse>({
        method: "POST",
        url: API_ENDPOINTS.auth.signup,
        data,
      });
    },
    onSuccess: (data) => {
      storage.setToken(data.accessToken);
      dispatch(setUser(data.user));
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });
}

/**
 * Sign In Mutation
 */
export function useSignIn() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignInDto) => {
      return callApi<AuthResponse>({
        method: "POST",
        url: API_ENDPOINTS.auth.signin,
        data,
      });
    },
    onSuccess: (data) => {
      storage.setToken(data.accessToken);
      dispatch(setUser(data.user));
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });
}

/**
 * Get Current User Query
 */
export function useCurrentUser() {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const data = await callApi<User>({
        method: "GET",
        url: API_ENDPOINTS.auth.me,
      });
      dispatch(setUser(data));
      return data;
    },
    enabled: storage.hasToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Logout Mutation
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Just clear local state - no server call needed
      storage.removeToken();
      dispatch(clearUser());
      queryClient.clear();
    },
  });
}
