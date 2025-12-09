# Multi-Layered Cache Frontend

A Next.js 15 frontend application with React Query, Redux Toolkit, and TypeScript integration. This application connects to the Multi-Layered Cache Backend for news management and authentication.

## Features

- ✨ **Next.js 15** with App Router
- 🎨 **Tailwind CSS** for styling
- 🔄 **React Query (TanStack Query)** for server state management
- 🗃️ **Redux Toolkit** for client state management
- 🔐 **JWT Authentication** with token management
- 📰 **News Management** (CRUD operations)
- 🌓 **Dark Mode** support
- 🎯 **TypeScript** for type safety
- 📱 **Responsive Design**

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Running the App

Make sure the backend is running on `http://localhost:8080` first!

```bash
# Development mode
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

The app will be available at `http://localhost:3000`

## Architecture

### State Management Strategy

This application uses a **hybrid state management approach**:

#### 1. Redux Toolkit (Client State)
- **Purpose**: Tracks current user authentication state
- **State**:
  - `currentUser`: User object or null
  - `isAuthenticated`: Boolean flag
  - `isLoading`: Loading state

#### 2. React Query (Server State)
- **Purpose**: Manages all API calls and server data
- **Features**:
  - Automatic caching (matches backend cache TTL)
  - Optimistic updates
  - Automatic refetching
  - Loading and error states

### API Architecture

#### Client-Side API (`callApi`)
- Used in **Client Components**
- Automatically adds JWT token from localStorage
- Handles 401 errors (redirects to sign in)

#### Server-Side API (`serverApi`)
- Used in **Server Components** and API routes
- Can accept token as parameter or read from cookies
- Direct server-to-server communication

## Project Structure

```
app/
├── auth/signin/page.tsx         # Sign in page
├── auth/signup/page.tsx         # Sign up page
├── news/[id]/page.tsx           # News detail page
├── news/create/page.tsx         # Create news page
├── news/my-news/page.tsx        # My news page
├── layout.tsx                   # Root layout with providers
└── page.tsx                     # Home page

components/
├── auth/                        # Auth forms
├── news/                        # News components
├── layout/                      # Navigation
└── providers/                   # Context providers

lib/
├── api/                         # API utilities
├── hooks/                       # React Query hooks
├── store/                       # Redux store
├── types/                       # TypeScript types
└── utils/                       # Utilities
```

## React Query Hooks

### Authentication
- `useSignUp()` - Create account
- `useSignIn()` - Login
- `useCurrentUser()` - Get current user
- `useLogout()` - Logout

### News
- `useNews()` - Get all news (60s cache)
- `useNewsDetail(id)` - Get single news (30s cache)
- `useMyNews()` - Get user's news
- `useCreateNews()` - Create article
- `useUpdateNews(id)` - Update article
- `useDeleteNews()` - Delete article

## Pages & Routes

### Public Routes
- `/` - Home (news list)
- `/news/[id]` - News detail
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up

### Protected Routes
- `/news/create` - Create news
- `/news/my-news` - Manage your news

## Testing the App

1. **Sign Up**: Navigate to `/auth/signup` and create an account
2. **Sign In**: Login with your credentials
3. **Create News**: Click "Create News" and publish an article
4. **View News**: Browse and read articles
5. **Manage News**: View and delete your articles in "My News"

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

## Technologies Used

- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Query 5
- Redux Toolkit 2
- Axios

## License

UNLICENSED

