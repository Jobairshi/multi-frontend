"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/client";
import { API_ENDPOINTS } from "../config/api";
import { CreateNewsDto, News, UpdateNewsDto } from "../types";

// Query Keys
export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: () => [...newsKeys.lists()] as const,
  myNews: () => [...newsKeys.all, "my-news"] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};

/**
 * Get All News Query (Public, Cached)
 */
export function useNews() {
  return useQuery({
    queryKey: newsKeys.list(),
    queryFn: async () => {
      return callApi<News[]>({
        method: "GET",
        url: API_ENDPOINTS.news.list,
      });
    },
    staleTime: 60 * 1000, // 60 seconds (matches backend cache)
    refetchOnWindowFocus: true,
  });
}

/**
 * Get Single News Query (Public, Cached)
 */
export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: async () => {
      return callApi<News>({
        method: "GET",
        url: API_ENDPOINTS.news.detail(id),
      });
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds (matches backend cache)
  });
}

/**
 * Get My News Query (Protected)
 */
export function useMyNews() {
  return useQuery({
    queryKey: newsKeys.myNews(),
    queryFn: async () => {
      return callApi<News[]>({
        method: "GET",
        url: API_ENDPOINTS.news.myNews,
      });
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Create News Mutation (Protected)
 */
export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNewsDto) => {
      return callApi<News>({
        method: "POST",
        url: API_ENDPOINTS.news.create,
        data,
      });
    },
    onSuccess: () => {
      // Invalidate news lists to refetch
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.myNews() });
    },
  });
}

/**
 * Update News Mutation (Protected)
 */
export function useUpdateNews(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateNewsDto) => {
      return callApi<News>({
        method: "PATCH",
        url: API_ENDPOINTS.news.update(id),
        data,
      });
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(newsKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.myNews() });
    },
  });
}

/**
 * Delete News Mutation (Protected)
 */
export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return callApi<void>({
        method: "DELETE",
        url: API_ENDPOINTS.news.delete(id),
      });
    },
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: newsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.myNews() });
    },
  });
}
