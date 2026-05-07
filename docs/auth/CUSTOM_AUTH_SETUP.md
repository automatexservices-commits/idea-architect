# Custom Backend Authentication Setup

This document explains the custom authentication system built for PLANNR using your own backend instead of relying on Supabase's OAuth.

## Architecture Overview

```
┌─────────────┐
│  Browser    │
└──────┬──────┘
       │
       │ 1. User clicks "Sign up/Log in with Google"
       │
       ▼
┌─────────────────────────────────────┐
│  Welcome Page (src/routes/welcome)  │
└──────┬──────────────────────────────┘
       │
       │ 2. Call getGoogleOAuthUrl()
       │
       ▼
┌─────────────────────────────────┐
│  API Route                      │
│  (/api/auth/google/url)         │
└──────┬──────────────────────────┘
       │
       │ 3. Return Google Auth URL
       │
       ▼
┌──────────────────────────────────────┐
│  Google OAuth                        │
│  accounts.google.com/o/oauth2/...   │
└──────┬───────────────────────────────┘
       │
       │ 4. User authenticates with Google
       │
       ▼
┌──────────────────────────────────────┐
│  Google Redirect to Callback         │
│  /auth/google/callback?code=...      │
└──────┬───────────────────────────────┘
       │
       │ 5. Exchange code for tokens
       │
       ▼
┌──────────────────────────────────────┐
│  Callback Handler (handleGoogleCall) │
│  (src/routes/auth/google/callback)   │
└──────┬───────────────────────────────┘
       │
       │ 6. Create/Sign in user in Supabase
       │
       ▼
┌──────────────────────────────────────┐
│  Home Page (/)                       │
│  User authenticated ✓                │
└──────────────────────────────────────┘
```

## Files Created

### 1. Server Authentication Functions
**File:** `src/lib/server-auth.ts`

Contains TanStack server functions for:
- `serverSignUp()` - Email/password registration
- `serverSignIn()` - Email/password login
- `getGoogleOAuthUrl()` - Generate Google OAuth URL
- `handleGoogleCallback()` - Process OAuth callback
- `serverSignOut()` - Sign out user
- `serverResetPassword()` - Send password reset email

```typescript
// Usage in components:
import { serverSignUp } from '@/lib/server-auth';

const result = await serverSignUp({
  email: 'user@example.com',
  password: 'secure_password',
  fullName: 'John Doe',
});
```

### 2. useAuth Hook
**File:** `src/hooks/useAuth.ts`

React hooks for auth state management:
- `useAuth()` - Track current user, session, and loading state
- `useAuthActions()` - Sign out and Google sign-in actions

```typescript
// Usage:
const { user, session, loading } = useAuth();
const { signOut, signInWithGoogle } = useAuthActions();
```

### 3. Welcome Page
**File:** `src/routes/welcome.tsx`

Modern UI with:
- Toggle between Login and Sign Up tabs
- Google OAuth button (custom implementation)
- Email/password forms
- Error and success messages
- Password visibility toggle
- "Explore without account" option

### 4. Google OAuth Callback
**File:** `src/routes/auth/google/callback.tsx`

Handles:
- Receiving authorization code from Google
- Exchanging code for tokens
- Creating/signing in user
- Error handling and redirect

### 5. API Route
**File:** `src/routes/api/auth/google/url.ts`

REST endpoint that returns Google OAuth URL:
```
GET /api/auth/google/url
→ { success: true, url: "https://accounts.google.com/o/oauth2/..." }
```

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Name: PLANNR
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
5. Copy **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to `.env`:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_from_google
GOOGLE_CLIENT_SECRET=your_client_secret_from_google
VITE_APP_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Step 3: Update Environment Variables for Production

When deploying, update `.env` or your deployment platform:
```bash
VITE_APP_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### Step 4: Ensure Supabase Auth is Enabled

Your Supabase project already has:
- ✅ Email/password auth enabled
- ✅ User creation and sign-in enabled

No changes needed here.

## How It Works

### Email/Password Flow

1. User enters email and password on Welcome page
2. Clicks "Log in" or "Sign up"
3. Calls `serverSignUp()` or `serverSignIn()`
4. Supabase handles auth
5. User redirected to home page

### Google OAuth Flow

1. User clicks "Continue with Google"
2. Frontend calls `/api/auth/google/url`
3. Backend returns OAuth URL
4. User redirected to Google login
5. Google redirects to `/auth/google/callback` with `code`
6. Backend exchanges `code` for tokens
7. Backend creates/signs in user in Supabase
8. User redirected to home page

## Security Features

✅ **Client Secret** stored server-side (in `.env`)
✅ **Authorization Code** exchange on server
✅ **HTTPS only** in production
✅ **State parameter** support (can be added)
✅ **Secure token storage** via Supabase
✅ **CORS protection** on API routes

## Future Migration

When you build your own complete backend:

1. Replace Supabase calls with your API
2. Keep the same function signatures
3. Update `src/lib/server-auth.ts` to call your backend:

```typescript
// Current (Supabase)
const { data, error } = await supabase.auth.signUp(...)

// Future (Your backend)
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

## Testing OAuth Locally

1. Start dev server:
   ```bash
   bun run dev
   ```

2. Visit `http://localhost:5173/welcome`

3. Click "Continue with Google"

4. You'll be redirected to Google
   - Use test account if not publishing
   - Or add yourself as test user in Google Cloud Console

5. After authentication, you'll be redirected back

## Error Handling

The system handles:
- Missing Google credentials
- Invalid authorization code
- Token exchange failures
- User creation conflicts
- Network errors

All errors are caught and displayed to the user with friendly messages.

## Environment Variables Checklist

- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console  
- [ ] `VITE_APP_URL` - Your app URL
- [ ] `GOOGLE_REDIRECT_URI` - OAuth callback URL
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_PUBLISHABLE_KEY` - Supabase public key

## Troubleshooting

### "Google OAuth not configured" Error
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Restart dev server after changing `.env`

### "Redirect URI mismatch" Error
- Ensure `GOOGLE_REDIRECT_URI` in `.env` matches
- Must also match Google Cloud Console settings
- Include protocol: `http://` or `https://`

### User Not Created
- Check Supabase auth is enabled
- Verify Supabase credentials in `.env`
- Check browser console for errors (F12)

### Infinite Redirect Loop
- Clear browser localStorage
- Check redirect URLs are correct
- Verify auth state is being stored

## Next Steps

1. ✅ Test Google OAuth locally
2. ✅ Test email/password signup
3. ✅ Test email/password login
4. Add user profile page
5. Add logout button
6. Add session persistence
7. Add protected routes
8. Deploy to production with updated URLs

For questions, check the TanStack React Start docs:
- https://tanstack.com/start/latest/docs
- Supabase: https://supabase.com/docs/guides/auth
