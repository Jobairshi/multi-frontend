# Testing Checklist

Use this checklist to verify all features are working correctly.

## Prerequisites

- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Redis is running (for backend cache)
- [ ] Browser console is open (F12) to check for errors

---

## 1. Initial Setup

### Environment
- [ ] `.env.local` exists with `NEXT_PUBLIC_API_URL=http://localhost:8080`
- [ ] Dependencies installed (`pnpm install`)
- [ ] No console errors on page load

### UI Check
- [ ] Page loads successfully
- [ ] Navbar appears at top
- [ ] "Sign Up" and "Sign In" buttons visible
- [ ] Home page shows "Latest News"

---

## 2. Authentication Flow

### Sign Up
- [ ] Navigate to `/auth/signup`
- [ ] Form displays correctly
- [ ] Fill in:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `password123`
- [ ] Click "Sign Up" button
- [ ] Loading state shows ("Creating account...")
- [ ] Success: Redirected to home page
- [ ] Navbar shows user name: "Test User"
- [ ] "Logout" button appears in navbar

### Token Storage
- [ ] Open DevTools → Application → Local Storage
- [ ] Check `auth_token` exists
- [ ] Token is a JWT string

### Sign Out
- [ ] Click "Logout" button in navbar
- [ ] Redirected to `/auth/signin`
- [ ] Token removed from localStorage
- [ ] Navbar shows "Sign In" and "Sign Up" again

### Sign In
- [ ] Fill in credentials:
  - Email: `test@example.com`
  - Password: `password123`
- [ ] Click "Sign In" button
- [ ] Loading state shows ("Signing in...")
- [ ] Success: Redirected to home page
- [ ] User name appears in navbar
- [ ] Token stored in localStorage

---

## 3. News Management

### Create News Article
- [ ] Ensure you're signed in
- [ ] Click "Create News" in navbar
- [ ] Form displays correctly
- [ ] Fill in:
  - Title: `My First Article`
  - Content: `This is my first news article. It's quite interesting!`
- [ ] Click "Create Article" button
- [ ] Loading state shows ("Creating...")
- [ ] Success: Redirected to home page
- [ ] New article appears in news list

### View All News
- [ ] Home page (`/`) displays news grid
- [ ] Articles show:
  - Title
  - Content preview (truncated)
  - Author name
  - View count
  - Created date
- [ ] Click on an article card
- [ ] Redirected to `/news/[id]`
- [ ] Full article displays

### View Single Article
- [ ] Article page shows:
  - Full title
  - Full content
  - Author name
  - Created date
  - View count
  - "Back" button
- [ ] Click "Back" button
- [ ] Returns to home page
- [ ] View count incremented

### Caching Test
- [ ] Open DevTools → Network tab
- [ ] Navigate to home page
- [ ] Note: Request to `/news` made
- [ ] Refresh page within 60 seconds
- [ ] Note: No new request (served from cache)
- [ ] Wait 60+ seconds
- [ ] Refresh page
- [ ] Note: New request made (cache expired)

### My News
- [ ] Click "My News" in navbar
- [ ] Page displays only your articles
- [ ] Each article has:
  - Title
  - Content preview
  - View count
  - "View" button
  - "Delete" button

### Delete Article
- [ ] In "My News" page
- [ ] Click "Delete" button on an article
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Article removed from list
- [ ] Home page updated (article gone)

---

## 4. Protected Routes

### Logged Out State
- [ ] Sign out (click "Logout")
- [ ] Try to navigate to `/news/create`
- [ ] Should redirect to `/auth/signin` or show error

### Logged In State
- [ ] Sign in again
- [ ] Navigate to `/news/create`
- [ ] Form accessible
- [ ] Navigate to `/news/my-news`
- [ ] List accessible

---

## 5. Error Handling

### Invalid Credentials
- [ ] Navigate to `/auth/signin`
- [ ] Enter wrong credentials:
  - Email: `wrong@example.com`
  - Password: `wrongpassword`
- [ ] Click "Sign In"
- [ ] Error message displays: "Invalid credentials"
- [ ] Form stays on page

### Duplicate Email
- [ ] Navigate to `/auth/signup`
- [ ] Enter existing email: `test@example.com`
- [ ] Click "Sign Up"
- [ ] Error message displays: "User with this email already exists"

### Network Error
- [ ] Stop the backend server
- [ ] Try to sign in
- [ ] Error message displays: "Network error" or similar
- [ ] Start backend again
- [ ] Retry - should work

### Missing Fields
- [ ] Navigate to `/auth/signup`
- [ ] Leave fields empty
- [ ] Try to submit
- [ ] Browser validation prevents submission
- [ ] Fill in only email
- [ ] Try to submit
- [ ] Browser requires name and password

---

## 6. UI/UX Testing

### Responsive Design
- [ ] Open DevTools → Device toolbar
- [ ] Test on mobile size (375px)
  - [ ] Navbar collapses correctly
  - [ ] News grid shows 1 column
  - [ ] Forms are readable
  - [ ] Buttons are tappable
- [ ] Test on tablet size (768px)
  - [ ] News grid shows 2 columns
- [ ] Test on desktop size (1024px+)
  - [ ] News grid shows 3 columns

### Dark Mode (if browser supports)
- [ ] Enable dark mode in OS
- [ ] Page switches to dark theme
- [ ] Text is readable
- [ ] Contrast is good

### Loading States
- [ ] Sign in loading: "Signing in..."
- [ ] Create news loading: "Creating..."
- [ ] Delete news loading: "Deleting..."
- [ ] News list loading: Spinner shows

### Empty States
- [ ] Create new user account
- [ ] Navigate to "My News"
- [ ] Shows: "You haven't created any news articles yet"
- [ ] Shows: "Create Your First Article" button

---

## 7. Redux State

### Check Redux DevTools (if installed)
- [ ] Install Redux DevTools extension
- [ ] Open DevTools → Redux tab
- [ ] Sign in
- [ ] Action dispatched: `user/setUser`
- [ ] State updated:
  ```json
  {
    "user": {
      "currentUser": { ... },
      "isAuthenticated": true,
      "isLoading": false
    }
  }
  ```
- [ ] Sign out
- [ ] Action dispatched: `user/clearUser`
- [ ] State cleared

---

## 8. React Query Cache

### Check React Query DevTools (optional)
If you add `@tanstack/react-query-devtools`:

```tsx
// Add to ReactQueryProvider.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

- [ ] View cached queries
- [ ] See query states (fresh, stale, fetching)
- [ ] Manually invalidate queries
- [ ] See refetch behavior

---

## 9. Performance Testing

### Page Load
- [ ] Disable cache in DevTools
- [ ] Reload home page
- [ ] Page loads in < 2 seconds

### Navigation
- [ ] Navigate between pages
- [ ] Transitions are instant (client-side routing)
- [ ] No full page reloads

### Mutation Speed
- [ ] Create news article
- [ ] UI updates instantly (optimistic update)
- [ ] No visible delay

---

## 10. Backend Integration

### Verify API Calls
Open DevTools → Network tab, filter by XHR/Fetch:

#### Sign Up
- [ ] POST to `http://localhost:8080/auth/signup`
- [ ] Request body contains email, password, name
- [ ] Response includes accessToken and user

#### Sign In
- [ ] POST to `http://localhost:8080/auth/signin`
- [ ] Request body contains email, password
- [ ] Response includes accessToken and user

#### Get Current User
- [ ] GET to `http://localhost:8080/auth/me`
- [ ] Request includes `Authorization: Bearer <token>` header
- [ ] Response includes user data

#### Get All News
- [ ] GET to `http://localhost:8080/news`
- [ ] No auth header required
- [ ] Response is array of news articles

#### Get Single News
- [ ] GET to `http://localhost:8080/news/[id]`
- [ ] No auth header required
- [ ] Response is single news article

#### Create News
- [ ] POST to `http://localhost:8080/news`
- [ ] Request includes `Authorization: Bearer <token>` header
- [ ] Request body contains title, content, author
- [ ] Response is created news article

#### Delete News
- [ ] DELETE to `http://localhost:8080/news/[id]`
- [ ] Request includes `Authorization: Bearer <token>` header
- [ ] Response is 200 OK

---

## 11. Edge Cases

### Token Expiry (if JWT_EXPIRES_IN is set)
- [ ] Wait for token to expire
- [ ] Make authenticated request
- [ ] Should redirect to sign in

### Concurrent Requests
- [ ] Open multiple tabs
- [ ] Sign in on one tab
- [ ] Create article on another tab
- [ ] Both tabs should see new article (after refresh)

### Author-Only Delete
- [ ] Create article with User A
- [ ] Sign in with User B
- [ ] Try to delete User A's article
- [ ] Should fail with error

### Long Content
- [ ] Create article with 10,000+ characters
- [ ] Should display correctly
- [ ] Should truncate on list view
- [ ] Should show full content on detail view

---

## 12. Console Errors

### No Errors Should Appear For:
- [ ] Page load
- [ ] Navigation
- [ ] Sign in/sign up
- [ ] Creating news
- [ ] Viewing news
- [ ] Deleting news
- [ ] Sign out

### Expected Warnings (safe to ignore):
- React DevTools warnings about development mode
- Source map warnings in development

---

## ✅ Final Checklist

- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] Caching works correctly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Responsive design works
- [ ] Redux state updates correctly
- [ ] No console errors
- [ ] Backend integration verified
- [ ] Edge cases handled

---

## 🐛 Bug Report Template

If you find issues, use this template:

```
**Description:**
[What went wrong?]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [What happened]

**Expected Behavior:**
[What should have happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Node: [e.g., 18.17.0]

**Console Errors:**
[Copy any errors from browser console]
```

---

## 📊 Test Results

### Pass/Fail Summary
- Authentication: [ ] Pass / [ ] Fail
- News CRUD: [ ] Pass / [ ] Fail
- Caching: [ ] Pass / [ ] Fail
- Error Handling: [ ] Pass / [ ] Fail
- UI/UX: [ ] Pass / [ ] Fail
- Backend Integration: [ ] Pass / [ ] Fail

### Notes:
[Add any observations or issues here]

---

**Testing completed on:** [Date]
**Tested by:** [Your name]
**Overall result:** [ ] ✅ All tests passed / [ ] ⚠️ Some issues found
