# Google OAuth Setup Guide for PLANNR

This guide will help you set up real Google OAuth authentication for your PLANNR application.

## Files Created/Updated

- ✅ `src/lib/auth.ts` - Auth utility functions for Supabase authentication
- ✅ `src/routes/auth/callback.tsx` - OAuth callback handler
- ✅ `src/routes/welcome.tsx` - Updated with Google sign-in button

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create a New Project
1. Click "Select a Project" at the top
2. Click "NEW PROJECT"
3. Enter project name: `PLANNR` (or your preferred name)
4. Click "CREATE"
5. Wait for the project to be created

### 1.3 Enable OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** as the User Type
3. Click **CREATE**
4. Fill in the Application Information:
   - **App name**: PLANNR
   - **User support email**: your-email@example.com
   - **Developer contact information**: your-email@example.com
5. Click **SAVE AND CONTINUE**
6. On the "Scopes" page, click **SAVE AND CONTINUE** (default scopes are fine)
7. On the "Test users" page, click **ADD USERS** and add your email for testing
8. Click **SAVE AND CONTINUE**
9. Review and click **BACK TO DASHBOARD**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application** as the Application type
4. Name it: `PLANNR Web`
5. Under **Authorized redirect URIs**, add:
   ```
   https://fvfkqjxefxoguhuxhjfx.supabase.co/auth/v1/callback
   ```
   (Replace `fvfkqjxefxoguhuxhjfx` with your actual Supabase project ID from `.env`)
6. Click **CREATE**
7. Copy your **Client ID** and **Client Secret** (you'll need these next)

## Step 2: Configure Google OAuth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: **fvfkqjxefxoguhuxhjfx**
3. In the left sidebar, go to **Authentication** → **Providers**
4. Click on **Google**
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Toggle **Enabled** to ON
8. Click **SAVE**

## Step 3: Set Environment Variables (Already Done ✅)

Your `.env` file already has:
```
VITE_SUPABASE_URL=https://fvfkqjxefxoguhuxhjfx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

These are all you need! The auth functions use these to initialize the Supabase client.

## Step 4: Test Your Google OAuth Implementation

1. Start your dev server:
   ```bash
   bun run dev
   ```

2. Navigate to `http://localhost:5173/welcome`

3. Click **"Continue with Google"** button

4. You should be redirected to Google login

5. After authenticating, you should be redirected back to your app at `/auth/callback`

6. If successful, you'll be redirected to the home page `/`

## Troubleshooting

### "Redirect URI mismatch" Error
- Make sure your Google OAuth redirect URI matches exactly:
  `https://fvfkqjxefxoguhuxhjfx.supabase.co/auth/v1/callback`
- Replace the project ID with your actual Supabase project ID

### User Not Redirected After Google Login
- Check browser console (F12) for any error messages
- Verify your Supabase API key is correct in `.env`
- Make sure Google OAuth is enabled in your Supabase project

### "Invalid Client" Error
- Verify your Client ID and Client Secret are correctly copied from Google Cloud Console
- Check that they don't have extra spaces

## Advanced: Use User Information After Login

Once a user logs in with Google, you can access their information:

```typescript
import { getCurrentUser, getSession } from '@/lib/auth';

// Get the current user
const user = await getCurrentUser();
console.log(user?.email, user?.user_metadata);

// Get the session with tokens
const session = await getSession();
console.log(session?.access_token);
```

## Additional Features Available

Your auth setup also supports:
- ✅ Email/Password login (already in UI)
- ✅ Email/Password signup (already in UI)
- ✅ Password reset
- ✅ Session management

See `src/lib/auth.ts` for all available functions.

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to git
- The `VITE_SUPABASE_PUBLISHABLE_KEY` is public (safe to expose)
- For production, configure allowed domains in Supabase Auth settings
- Test OAuth with your actual domain before deploying to production

## Next Steps

1. **Add User Profile Table**: Store additional user data in your database
2. **Add Logout Button**: Users need a way to sign out
3. **Protected Routes**: Redirect unauthenticated users from certain pages
4. **Role-Based Access**: Implement user roles and permissions

For more details, see [Supabase Auth Docs](https://supabase.com/docs/guides/auth).
