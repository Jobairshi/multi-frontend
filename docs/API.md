# Frontend API Documentation

## Overview

This document describes how to use the API utilities in the frontend application.

## API Utilities

### Client-Side API (`callApi`)

Used in **Client Components** with `'use client'` directive.

**Location**: `lib/api/client.ts`

**Features**:
- Automatically adds JWT token from localStorage
- Handles 401 errors (auto-redirect to sign in)
- Works in browser environment only

**Usage**:
```typescript
import { callApi } from '@/lib/api/client';

const news = await callApi<News[]>({
  method: 'GET',
  url: '/news',
});
```

### Server-Side API (`serverApi`)

Used in **Server Components** and **Server Actions**.

**Location**: `lib/api/server.ts`

**Features**:
- Can accept token as parameter
- Reads token from cookies automatically
- Server-to-server communication

**Usage**:
```typescript
import { serverApi } from '@/lib/api/server';

// In Server Component
const news = await serverApi<News[]>({
  method: 'GET',
  url: '/news',
});

// With custom token
const news = await serverApi<News[]>(
  { method: 'GET', url: '/news' },
  'custom-token'
);
```

## React Query Hooks

### Authentication Hooks

#### `useSignUp()`

Creates a new user account.

```typescript
import { useSignUp } from '@/lib/hooks/useAuth';

function SignUpForm() {
  const signUp = useSignUp();

  const handleSubmit = async () => {
    try {
      await signUp.mutateAsync({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      // User is now signed in
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={signUp.isPending}>
      {signUp.isPending ? 'Signing up...' : 'Sign Up'}
    </button>
  );
}
```

**Returns**:
```typescript
{
  mutateAsync: (data: SignUpDto) => Promise<AuthResponse>,
  isPending: boolean,
  isError: boolean,
  error: Error | null
}
```

#### `useSignIn()`

Authenticates existing user.

```typescript
import { useSignIn } from '@/lib/hooks/useAuth';

const signIn = useSignIn();

await signIn.mutateAsync({
  email: 'john@example.com',
  password: 'password123'
});
```

#### `useCurrentUser()`

Fetches current user data. Only runs if token exists.

```typescript
import { useCurrentUser } from '@/lib/hooks/useAuth';

function UserProfile() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome {user.name}</div>;
}
```

**Returns**:
```typescript
{
  data: User | undefined,
  isLoading: boolean,
  isError: boolean,
  refetch: () => Promise<void>
}
```

#### `useLogout()`

Clears token and user state.

```typescript
import { useLogout } from '@/lib/hooks/useAuth';

const logout = useLogout();

await logout.mutateAsync();
// User is now logged out
```

### News Hooks

#### `useNews()`

Fetches all news articles (public, cached 60s).

```typescript
import { useNews } from '@/lib/hooks/useNews';

function NewsList() {
  const { data: news, isLoading, isError } = useNews();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading news</div>;

  return (
    <ul>
      {news?.map(article => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
```

**Cache**: 60 seconds (matches backend)

#### `useNewsDetail(id)`

Fetches single news article (public, cached 30s).

```typescript
import { useNewsDetail } from '@/lib/hooks/useNews';

function NewsDetail({ id }: { id: string }) {
  const { data: news } = useNewsDetail(id);

  return <h1>{news?.title}</h1>;
}
```

**Cache**: 30 seconds (matches backend)

**Note**: Increments view count on each fetch

#### `useMyNews()`

Fetches current user's news articles (protected).

```typescript
import { useMyNews } from '@/lib/hooks/useNews';

function MyNews() {
  const { data: myNews } = useMyNews();

  return (
    <div>
      <h2>My Articles</h2>
      {myNews?.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

**Requires**: Authentication

#### `useCreateNews()`

Creates a new news article (protected).

```typescript
import { useCreateNews } from '@/lib/hooks/useNews';

function CreateNews() {
  const createNews = useCreateNews();

  const handleCreate = async () => {
    try {
      await createNews.mutateAsync({
        title: 'Breaking News',
        content: 'This is the content',
        author: 'John Doe'
      });
      // Article created, lists automatically refreshed
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={createNews.isPending}>
      Create
    </button>
  );
}
```

**Cache Invalidation**: Automatically invalidates news lists

#### `useUpdateNews(id)`

Updates existing news article (protected, author only).

```typescript
import { useUpdateNews } from '@/lib/hooks/useNews';

function EditNews({ id }: { id: string }) {
  const updateNews = useUpdateNews(id);

  const handleUpdate = async () => {
    await updateNews.mutateAsync({
      title: 'Updated Title',
      content: 'Updated content'
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

**Cache Invalidation**: Updates detail cache, invalidates lists

#### `useDeleteNews()`

Deletes news article (protected, author only).

```typescript
import { useDeleteNews } from '@/lib/hooks/useNews';

function DeleteButton({ id }: { id: string }) {
  const deleteNews = useDeleteNews();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteNews.mutateAsync(id);
      // Article deleted, caches cleared
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

**Cache Invalidation**: Removes from all caches

## Redux Store

### User Slice

**Location**: `lib/store/userSlice.ts`

**State**:
```typescript
{
  currentUser: User | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions**:
- `setUser(user: User)` - Set current user
- `clearUser()` - Clear user state
- `setLoading(isLoading: boolean)` - Set loading state

**Usage**:
```typescript
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/lib/store/userSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useAppSelector(state => state.user);

  // Set user
  dispatch(setUser(userData));

  // Clear user
  dispatch(clearUser());

  return <div>{currentUser?.name}</div>;
}
```

## TypeScript Types

### User Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
```

### Auth Types

```typescript
interface SignUpDto {
  email: string;
  password: string;
  name: string;
}

interface SignInDto {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}
```

### News Types

```typescript
interface News {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

interface CreateNewsDto {
  title: string;
  content: string;
  author: string;
}

interface UpdateNewsDto {
  title?: string;
  content?: string;
}
```

## Error Handling

All API calls throw errors that can be caught:

```typescript
try {
  await signIn.mutateAsync({ email, password });
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // User-friendly message
  }
}
```

Error responses are automatically formatted from backend:

```typescript
{
  statusCode: 400,
  message: "Validation failed" | ["error1", "error2"],
  error: "Bad Request"
}
```

## Storage Utilities

**Location**: `lib/utils/storage.ts`

```typescript
import { storage } from '@/lib/utils/storage';

// Get token
const token = storage.getToken();

// Set token
storage.setToken('jwt-token');

// Remove token
storage.removeToken();

// Check if token exists
const hasToken = storage.hasToken();
```

## Best Practices

### 1. Use React Query for Server Data

```typescript
// ✅ Good - Use React Query
const { data } = useNews();

// ❌ Bad - Don't use useState for server data
const [news, setNews] = useState([]);
useEffect(() => {
  fetchNews().then(setNews);
}, []);
```

### 2. Use Redux Only for Client State

```typescript
// ✅ Good - Authentication state
const { isAuthenticated } = useAppSelector(state => state.user);

// ❌ Bad - Don't store server data in Redux
dispatch(setNews(newsData)); // Use React Query instead
```

### 3. Handle Loading and Error States

```typescript
const { data, isLoading, isError, error } = useNews();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
return <NewsList news={data} />;
```

### 4. Use Optimistic Updates

```typescript
const deleteNews = useDeleteNews();

await deleteNews.mutateAsync(id);
// UI updates immediately, no need to refetch
```

### 5. Leverage Cache Invalidation

```typescript
// React Query automatically invalidates related queries
await createNews.mutateAsync(newArticle);
// useNews() and useMyNews() automatically refetch
```

## Cache Configuration

### React Query Defaults

```typescript
{
  staleTime: 60 * 1000,      // 1 minute
  refetchOnWindowFocus: false,
  retry: 1
}
```

### Per-Query Configuration

```typescript
// News list - 60s cache (matches backend)
useQuery({
  queryKey: ['news'],
  queryFn: fetchNews,
  staleTime: 60 * 1000
});

// News detail - 30s cache (matches backend)
useQuery({
  queryKey: ['news', id],
  queryFn: () => fetchNewsDetail(id),
  staleTime: 30 * 1000
});
```

## Common Patterns

### Protected Component

```typescript
'use client';

function ProtectedPage() {
  const { isAuthenticated } = useAppSelector(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

### Form with Mutation

```typescript
function CreateForm() {
  const [title, setTitle] = useState('');
  const createNews = useCreateNews();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNews.mutateAsync({ title, content, author });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button disabled={createNews.isPending}>Create</button>
    </form>
  );
}
```

### Conditional Rendering

```typescript
function NewsActions({ article }: { article: News }) {
  const { currentUser } = useAppSelector(state => state.user);
  const isAuthor = currentUser?.id === article.authorId;

  if (!isAuthor) return null;

  return (
    <div>
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
}
```
