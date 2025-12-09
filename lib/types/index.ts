// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Auth Types
export interface SignUpDto {
  email: string;
  password: string;
  name: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// News Types
export interface News {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  author: string;
}

export interface UpdateNewsDto {
  title?: string;
  content?: string;
}

// API Error Type
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
