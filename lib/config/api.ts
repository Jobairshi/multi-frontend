export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    signup: "/auth/signup",
    signin: "/auth/signin",
    me: "/auth/me",
  },
  news: {
    list: "/news",
    myNews: "/news/my-news",
    detail: (id: string) => `/news/${id}`,
    create: "/news",
    update: (id: string) => `/news/${id}`,
    delete: (id: string) => `/news/${id}`,
  },
} as const;
