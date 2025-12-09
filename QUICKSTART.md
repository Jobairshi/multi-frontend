# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Backend running on `http://localhost:8080`

## Setup in 5 Minutes

### 1. Install Dependencies

```bash
cd d:\multi-layered-cache\multi-frontend
pnpm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test the App

#### Create Account
1. Click "Sign Up" in navbar
2. Enter name, email, password
3. Click "Sign Up" button

#### Create News Article
1. Click "Create News" in navbar
2. Enter title and content
3. Click "Create Article"

#### View News
1. Home page shows all articles
2. Click any article to view details
3. View count increments

#### Manage Your News
1. Click "My News" in navbar
2. See your articles
3. Delete articles as needed

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                 │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Redux      │         │ React Query  │            │
│  │  (Client     │         │   (Server    │            │
│  │   State)     │         │    State)    │            │
│  └──────────────┘         └──────────────┘            │
│         │                         │                    │
│         │                         │                    │
│         ▼                         ▼                    │
│  ┌──────────────────────────────────────────────┐    │
│  │            React Components                   │    │
│  │  (Auth, News, Layout, Providers)             │    │
│  └──────────────────────────────────────────────┘    │
│                       │                              │
│                       │                              │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐    │
│  │         API Layer (callApi / serverApi)      │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ HTTP / Axios
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (NestJS) :8080                 │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Auth API   │         │   News API   │            │
│  │  /auth/*     │         │   /news/*    │            │
│  └──────────────┘         └──────────────┘            │
│         │                         │                    │
│         │                         ▼                    │
│         │              ┌──────────────────┐            │
│         │              │  Redis Cache     │            │
│         │              │  (60s / 30s TTL) │            │
│         │              └──────────────────┘            │
│         │                                              │
│         ▼                                              │
│  ┌──────────────────────────────────────────────┐    │
│  │        In-Memory Storage (Users/News)        │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Key Technologies

| Technology | Purpose | Why Used |
|------------|---------|----------|
| **Next.js 15** | Framework | Server/Client components, routing |
| **React Query** | Server State | Caching, auto-refetch, optimistic updates |
| **Redux Toolkit** | Client State | Global auth state, cross-component access |
| **Axios** | HTTP Client | Request/response interceptors |
| **TypeScript** | Type Safety | Catch errors at compile time |
| **Tailwind CSS** | Styling | Utility-first, responsive design |

## File Structure Explained

```
multi-frontend/
│
├── app/                         # Next.js App Router
│   ├── auth/                    # Authentication pages
│   │   ├── signin/page.tsx      # Sign in page
│   │   └── signup/page.tsx      # Sign up page
│   ├── news/                    # News pages
│   │   ├── [id]/page.tsx        # Dynamic news detail
│   │   ├── create/page.tsx      # Create news form
│   │   └── my-news/page.tsx     # User's news list
│   ├── layout.tsx               # Root layout (providers)
│   ├── page.tsx                 # Home page (news list)
│   └── globals.css              # Global styles
│
├── components/                  # React components
│   ├── auth/                    # Auth forms
│   │   ├── SignInForm.tsx       # Sign in form
│   │   └── SignUpForm.tsx       # Sign up form
│   ├── layout/                  # Layout components
│   │   └── Navbar.tsx           # Navigation bar
│   ├── news/                    # News components
│   │   ├── CreateNewsForm.tsx   # Create/edit form
│   │   ├── MyNewsList.tsx       # User's articles
│   │   ├── NewsDetail.tsx       # Single article view
│   │   └── NewsList.tsx         # Public article list
│   └── providers/               # Context providers
│       ├── AuthInitializer.tsx  # Auto-load user
│       ├── ReactQueryProvider.tsx # React Query setup
│       └── ReduxProvider.tsx    # Redux store setup
│
├── lib/                         # Core logic
│   ├── api/                     # API utilities
│   │   ├── client.ts            # Browser API (callApi)
│   │   └── server.ts            # Server API (serverApi)
│   ├── config/                  # Configuration
│   │   └── api.ts               # API endpoints config
│   ├── hooks/                   # React Query hooks
│   │   ├── useAuth.ts           # Auth mutations/queries
│   │   └── useNews.ts           # News mutations/queries
│   ├── store/                   # Redux store
│   │   ├── hooks.ts             # Typed hooks
│   │   ├── index.ts             # Store config
│   │   └── userSlice.ts         # User state slice
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # All interfaces
│   └── utils/                   # Utilities
│       └── storage.ts           # LocalStorage helpers
│
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Documentation
```

## State Management Flow

### Authentication Flow

```
1. User fills sign in form
   ↓
2. useSignIn() mutation called
   ↓
3. callApi() sends POST to /auth/signin
   ↓
4. Backend validates and returns JWT + user
   ↓
5. Token saved to localStorage
   ↓
6. Redux store updated (setUser)
   ↓
7. React Query cache updated
   ↓
8. User redirected to home
   ↓
9. Navbar shows user name + logout
```

### Create News Flow

```
1. User fills create form
   ↓
2. useCreateNews() mutation called
   ↓
3. callApi() sends POST to /news with token
   ↓
4. Backend creates news in database
   ↓
5. Backend invalidates Redis cache
   ↓
6. Frontend receives new news object
   ↓
7. React Query invalidates news lists
   ↓
8. Home page automatically refetches
   ↓
9. New article appears in list
```

## API Endpoints Used

### Auth Endpoints
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login
- `GET /auth/me` - Get current user

### News Endpoints
- `GET /news` - Get all news (public, cached 60s)
- `GET /news/:id` - Get single news (public, cached 30s)
- `GET /news/my-news` - Get user's news (protected)
- `POST /news` - Create news (protected)
- `PATCH /news/:id` - Update news (protected, author only)
- `DELETE /news/:id` - Delete news (protected, author only)

## Caching Strategy

### React Query Cache

| Endpoint | Stale Time | Behavior |
|----------|-----------|----------|
| `GET /news` | 60s | Auto-refetch after 60s |
| `GET /news/:id` | 30s | Auto-refetch after 30s |
| `GET /news/my-news` | 30s | Protected, manual refetch |

### Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
// Creating news invalidates:
- useNews() query
- useMyNews() query

// Updating news invalidates:
- useNewsDetail(id) query
- useNews() query
- useMyNews() query

// Deleting news invalidates:
- Removes useNewsDetail(id) cache
- useNews() query
- useMyNews() query
```

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (port 3000)

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Clean
rm -rf .next          # Remove build cache
rm -rf node_modules   # Remove dependencies
pnpm install          # Reinstall dependencies
```

## Troubleshooting

### Issue: "Failed to fetch" or "Network Error"
**Solution**: Ensure backend is running on `http://localhost:8080`

```bash
# In backend directory
pnpm run start:dev
```

### Issue: "Unauthorized" or 401 errors
**Solution**: Sign in again. Token may have expired.

### Issue: Changes not showing
**Solution**: 
1. Check React Query cache (may be stale)
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear localStorage and sign in again

### Issue: TypeScript errors
**Solution**:
```bash
pnpm build
# Fix any errors shown
```

### Issue: Port 3000 already in use
**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
pnpm dev -p 3001
```

## Next Steps

1. ✅ Create account and sign in
2. ✅ Create a few news articles
3. ✅ Test view counts (open article multiple times)
4. ✅ Test edit/delete in "My News"
5. ✅ Test sign out and sign in again
6. 📚 Read full [README.md](./README.md)
7. 📚 Read [API Documentation](./docs/API.md)

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Check the [API.md](./docs/API.md)
3. Review backend logs
4. Check browser console for errors

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
