# API Endpoints & Function Reference

## 🔌 Server Functions (Backend)

These are TanStack server functions that run on the server. They can be called from the client with type-safety.

### Authentication Functions

#### `serverSignUp(data)`
Sign up with email and password.

**Parameters:**
```typescript
{
  email: string;              // User's email
  password: string;           // User's password
  fullName?: string;          // Optional: user's full name
}
```

**Returns:**
```typescript
{
  success: boolean;
  user?: User;               // Created user object
  error?: string;            // Error message if failed
  message?: string;          // Success message
}
```

**Usage:**
```typescript
const result = await serverSignUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  fullName: 'John Doe'
});

if (result.success) {
  console.log('Account created!');
} else {
  console.log('Error:', result.error);
}
```

---

#### `serverSignIn(data)`
Sign in with email and password.

**Parameters:**
```typescript
{
  email: string;    // User's email
  password: string; // User's password
}
```

**Returns:**
```typescript
{
  success: boolean;
  user?: User;      // Authenticated user
  session?: Session; // Auth session
  error?: string;   // Error message
}
```

**Usage:**
```typescript
const result = await serverSignIn({
  email: 'user@example.com',
  password: 'SecurePass123'
});

if (result.success) {
  navigate({ to: '/' });
} else {
  setError(result.error);
}
```

---

#### `getGoogleOAuthUrl()`
Get the Google OAuth authorization URL.

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  url?: string;     // Google OAuth URL to redirect to
  error?: string;   // Error message if failed
}
```

**Usage:**
```typescript
const result = await getGoogleOAuthUrl();

if (result.success) {
  window.location.href = result.url; // Redirect to Google
} else {
  setError(result.error);
}
```

---

#### `handleGoogleCallback(data)`
Process Google OAuth callback after user returns from Google.

**Parameters:**
```typescript
{
  code: string;  // Authorization code from Google
}
```

**Returns:**
```typescript
{
  success: boolean;
  user?: User;      // Authenticated/created user
  session?: Session; // Auth session
  isNewUser?: boolean; // True if user was just created
  error?: string;   // Error message
}
```

**Usage:**
```typescript
// This is handled automatically in /auth/google/callback route
const result = await handleGoogleCallback({ code });

if (result.success) {
  // User is now authenticated
  navigate({ to: '/' });
} else {
  // Show error
  setError(result.error);
}
```

---

#### `serverSignOut()`
Sign out the current user.

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  error?: string;   // Error message if failed
}
```

**Usage:**
```typescript
const result = await serverSignOut();

if (result.success) {
  navigate({ to: '/welcome' });
} else {
  console.error('Sign out failed:', result.error);
}
```

---

#### `serverResetPassword(data)`
Send password reset email to user.

**Parameters:**
```typescript
{
  email: string;  // User's email
}
```

**Returns:**
```typescript
{
  success: boolean;
  message?: string; // Success message
  error?: string;   // Error message
}
```

**Usage:**
```typescript
const result = await serverResetPassword({
  email: 'user@example.com'
});

if (result.success) {
  alert('Check your email for reset link');
} else {
  setError(result.error);
}
```

---

## 🪝 React Hooks

Hooks for managing authentication state in React components.

### `useAuth()`
Get current user and session information.

**Returns:**
```typescript
{
  user: User | null;        // Current user or null
  session: Session | null;  // Current session or null
  loading: boolean;         // True while checking session
  error: string | null;     // Error message if any
}
```

**Usage:**
```typescript
function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <h1>Welcome, {user.email}</h1>;
}
```

---

### `useAuthActions()`
Functions for signing out and logging in with Google.

**Returns:**
```typescript
{
  signOut: () => Promise<boolean>;  // Sign out, returns success
  signInWithGoogle: () => Promise<void>; // Redirect to Google
  loading: boolean;  // True during auth action
  error: string | null; // Error message if any
}
```

**Usage:**
```typescript
function LogoutButton() {
  const { signOut, loading } = useAuthActions();

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      navigate({ to: '/welcome' });
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
```

---

## 🌐 REST API Endpoints

### `GET /api/auth/google/url`

Get the Google OAuth authorization URL.

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=..."
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Google OAuth not configured"
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Usage:**
```typescript
// Fetch from API
const response = await fetch('/api/auth/google/url');
const data = await response.json();

if (data.success) {
  window.location.href = data.url;
} else {
  console.error(data.error);
}
```

---

## 📍 Page Routes

### `/welcome`
Login and signup page with tabbed interface.

**URL:** `http://localhost:5173/welcome`

**Features:**
- Toggle between login and signup tabs
- Google OAuth button
- Email/password form
- Error messages
- Success messages

---

### `/auth/google/callback`
OAuth callback handler (internal redirect, user doesn't see this).

**URL Parameters:**
- `code` - Authorization code from Google
- `state` - State parameter (CSRF protection)
- `error` - Error message if auth failed

**Behavior:**
- Exchanges code for tokens
- Creates or signs in user
- Redirects to `/` (home)

---

### `/api/auth/google/url`
API endpoint to get Google OAuth URL.

**URL:** `/api/auth/google/url`
**Method:** GET
**Response:** JSON with OAuth URL

---

## 🔑 Types Reference

### User
```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    provider?: string;
  };
}
```

### Session
```typescript
interface Session {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  expires_at: number;
  token_type: 'bearer';
  user: User;
}
```

### AuthResult
```typescript
interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  message?: string;
}
```

---

## 🔗 Complete Flow Examples

### Email Signup Flow
```typescript
import { serverSignUp } from '@/lib/server-auth';

async function handleSignUp(email, password, fullName) {
  const result = await serverSignUp({
    email,
    password,
    fullName
  });

  if (result.success) {
    // User created
    // In real app, verify email first
    navigate({ to: '/' });
  } else {
    setError(result.error);
  }
}
```

### Email Login Flow
```typescript
import { serverSignIn } from '@/lib/server-auth';

async function handleLogin(email, password) {
  const result = await serverSignIn({
    email,
    password
  });

  if (result.success) {
    // User authenticated
    navigate({ to: '/' });
  } else {
    setError(result.error); // "Invalid credentials"
  }
}
```

### Google OAuth Flow
```typescript
import { getGoogleOAuthUrl } from '@/lib/server-auth';

async function handleGoogleSignIn() {
  const result = await getGoogleOAuthUrl();

  if (result.success) {
    // Redirect to Google
    window.location.href = result.url;
    // Google redirects back to /auth/google/callback
    // Which is handled automatically
  } else {
    setError(result.error);
  }
}
```

### Check Current User
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Login />;

  return <Dashboard user={user} />;
}
```

### Logout
```typescript
import { useAuthActions } from '@/hooks/useAuth';

function LogoutButton() {
  const { signOut } = useAuthActions();

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      navigate({ to: '/welcome' });
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## ⚙️ Environment Variables

Required environment variables:

```bash
# Supabase (already configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-key

# Google OAuth (add these)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
VITE_APP_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

---

## 🚀 Ready to Use!

All endpoints are:
- ✅ Documented
- ✅ Type-safe (TypeScript)
- ✅ Error-handled
- ✅ Production-ready

Start with the examples above and customize as needed!
