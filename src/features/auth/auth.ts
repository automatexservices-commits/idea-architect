import { insforge } from '@/integrations/insforge/client';

const ACCESS_TOKEN_KEY = "plannr-insforge-access-token";
const USER_KEY = "plannr-insforge-user";
const DEFAULT_APP_URL = "http://localhost:5173";
const GOOGLE_CALLBACK_PATH = "/auth/google/callback";
const EMAIL_CALLBACK_PATH = "/auth/callback";
const EMAIL_VERIFY_PATH = "/auth/verify";
const PASSWORD_RESET_PATH = "/auth/reset-password";

type AppSession = {
  accessToken: string;
  user: Awaited<ReturnType<typeof getCurrentUser>>;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function describeError(error: unknown) {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: (error as { statusCode?: unknown }).statusCode ?? null,
      code: (error as { code?: unknown }).code ?? null,
    };
  }
  if (typeof error === "object") {
    return error;
  }
  return String(error);
}

function getJwtExpiry(token: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (typeof payload?.exp === "number") {
      return {
        exp: payload.exp,
        expiresAtIso: new Date(payload.exp * 1000).toISOString(),
        expired: Date.now() >= payload.exp * 1000,
      };
    }
  } catch {}
  return null;
}

function getAuthCookieDiagnostics() {
  if (!isBrowser()) return null;
  const csrfCookiePresent = document.cookie.includes("insforge_csrf_token=");
  return {
    csrfCookiePresent,
    refreshCookieReadable: false,
    refreshCookieNote: "InsForge refresh cookie is httpOnly and cannot be read from JavaScript.",
  };
}

function getAppUrl() {
  if (isBrowser() && window.location.origin) return window.location.origin.replace(/\/+$/, "");
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return DEFAULT_APP_URL;
}

function buildRedirectUrl(pathname: string) {
  return new URL(pathname, getAppUrl()).toString();
}

function readStoredValue(key: string) {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string | null) {
  if (!isBrowser()) return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {}
}

function readAccessToken() {
  const headers = insforge.getHttpClient().getHeaders() as Record<string, string>;
  const header = headers.Authorization || headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  const stored = readStoredValue(ACCESS_TOKEN_KEY);
  if (stored) return stored;
  return null;
}

function persistSession(accessToken: string, user?: unknown) {
  insforge.getHttpClient().setAuthToken(accessToken);
  writeStoredValue(ACCESS_TOKEN_KEY, accessToken);
  if (user) {
    writeStoredValue(USER_KEY, JSON.stringify(user));
  }
}

function clearSession() {
  writeStoredValue(ACCESS_TOKEN_KEY, null);
  writeStoredValue(USER_KEY, null);
  insforge.getHttpClient().setAuthToken(null);
}

function readStoredUser() {
  const raw = readStoredValue(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function bootstrapSession() {
  const storedToken = readStoredValue(ACCESS_TOKEN_KEY);
  if (storedToken) {
    insforge.getHttpClient().setAuthToken(storedToken);
  }
}

bootstrapSession();

function isUsableSession(value: unknown): value is { accessToken: string; user: unknown } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "accessToken" in value &&
      typeof (value as { accessToken?: unknown }).accessToken === "string" &&
      (value as { accessToken?: string }).accessToken?.length > 0,
  );
}


export async function waitForSession(timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const session = await getSession();
    if (session?.accessToken) return session;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return null;
}

/**
 * Sign in with Google OAuth
 * Redirects user to Google login, then to callback URL
 */
export async function signInWithGoogle() {
  console.log("Auth triggered");
  try {
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: buildRedirectUrl(GOOGLE_CALLBACK_PATH),
      skipBrowserRedirect: true,
    });

    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }

    if (data?.url) {
      window.location.assign(data.url);
    } else {
      throw new Error("OAuth URL was not returned by InsForge.");
    }

    return data;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }

    if (!data?.user) {
      throw new Error("Invalid email or password.");
    }

    if (!data.user.emailVerified) {
      await insforge.auth.signOut().catch(() => {});
      clearSession();
      throw new Error("Please verify your email before logging in.");
    }

    if (data?.accessToken) {
      persistSession(data.accessToken, data.user);
    } else {
      throw new Error("Login succeeded but no session was established.");
    }

    return data;
  } catch (err) {
    console.error('Email sign-in error:', err);
    throw err;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: fullName || undefined,
      redirectTo: buildRedirectUrl(EMAIL_CALLBACK_PATH),
    });

    if (error) {
      console.error('Sign-up error:', error);
      throw error;
    }

    clearSession();

    return data;
  } catch (err) {
    console.error('Sign-up error:', err);
    throw err;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await insforge.auth.signOut();

    if (error) {
      console.error('Sign-out error:', error);
      throw error;
    }

    clearSession();
  } catch (err) {
    console.error('Sign-out error:', err);
    throw err;
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  try {
    const storedToken = readStoredValue(ACCESS_TOKEN_KEY);
    console.info("[auth] getSession start", {
      hasStoredToken: Boolean(storedToken),
      hasStoredUser: Boolean(readStoredUser()),
      tokenExpiry: getJwtExpiry(storedToken),
      cookies: getAuthCookieDiagnostics(),
    });
    if (storedToken) {
      insforge.getHttpClient().setAuthToken(storedToken);
    }

    let currentUser = null as Awaited<ReturnType<typeof getCurrentUser>>;
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      console.info("[auth] getCurrentUser result", {
        data: data ? { hasUser: Boolean(data.user) } : null,
        error: describeError(error),
      });
      if (error) {
        console.error('Session error:', error);
      }
      currentUser = data?.user ?? null;
    } catch (error) {
      console.info("[auth] getCurrentUser threw", {
        error: describeError(error),
      });
      console.error('Session error:', error);
    }

    let accessToken = readAccessToken();
    const storedUser = readStoredUser();

    if ((!accessToken || !currentUser) && storedToken) {
      console.info("[auth] getSession attempting refresh", {
        hasAccessToken: Boolean(accessToken),
        hasCurrentUser: Boolean(currentUser),
        tokenExpiry: getJwtExpiry(accessToken),
        cookies: getAuthCookieDiagnostics(),
      });
      const refreshed = await refreshSessionToken().catch(() => null);
      if (isUsableSession(refreshed)) {
        return refreshed as AppSession;
      }
      clearSession();
      return null;
    }

    if (!accessToken) {
      return null;
    }

    if (currentUser) {
      persistSession(accessToken, currentUser);
      return {
        accessToken,
        user: currentUser,
      } as AppSession;
    }

    if (storedUser) {
      return {
        accessToken,
        user: storedUser,
      } as AppSession;
    }

    return {
      accessToken,
      user: null,
    } as AppSession;
  } catch (err) {
    console.error('Session error:', err);
    return null;
  }
}

export async function refreshSessionToken() {
  try {
    console.info("[auth] refreshSession start", {
      tokenExpiry: getJwtExpiry(readAccessToken()),
      cookies: getAuthCookieDiagnostics(),
    });
    const { data, error } = await insforge.auth.refreshSession();

    console.info("[auth] refreshSession result", {
      data: data
        ? {
            hasAccessToken: Boolean(data.accessToken),
            hasUser: Boolean(data.user),
            hasRefreshToken: Boolean((data as { refreshToken?: unknown }).refreshToken),
            keys: Object.keys(data as Record<string, unknown>),
          }
        : null,
      error: describeError(error),
    });

    if (error || !data?.accessToken || !data?.user) {
      return null;
    }

    persistSession(data.accessToken, data.user);
    return data;
  } catch (err) {
    console.error("Refresh session error:", err);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    console.info("[auth] getCurrentUser helper start", {
      tokenExpiry: getJwtExpiry(readAccessToken()),
      cookies: getAuthCookieDiagnostics(),
    });
    const { data, error } = await insforge.auth.getCurrentUser();

    console.info("[auth] getCurrentUser helper result", {
      data: data ? { hasUser: Boolean(data.user) } : null,
      error: describeError(error),
    });

    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    const accessToken = readAccessToken();
    if (data?.user && accessToken) {
      persistSession(accessToken, data.user);
    }

    return data?.user ?? readStoredUser();
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

/**
 * Reset password via email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: buildRedirectUrl(PASSWORD_RESET_PATH),
    });

    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    };
  } catch (err) {
    console.error('Reset password error:', err);
    throw err;
  }
}

export async function exchangeResetPasswordToken(email: string, code: string) {
  try {
    const { data, error } = await insforge.auth.exchangeResetPasswordToken({
      email,
      code,
    });

    if (error) {
      console.error("Exchange reset password token error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Exchange reset password token error:", err);
    throw err;
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const { data, error } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: buildRedirectUrl(EMAIL_VERIFY_PATH),
    });

    if (error) {
      console.error("Resend verification error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Resend verification error:", err);
    throw err;
  }
}

export async function verifyEmail(email: string, otp: string) {
  try {
    const { data, error } = await insforge.auth.verifyEmail({
      email,
      otp,
    });

    if (error) {
      console.error("Verify email error:", error);
      throw error;
    }

    if (data?.accessToken && data?.user) {
      persistSession(data.accessToken, data.user);
    }

    return data;
  } catch (err) {
    console.error("Verify email error:", err);
    throw err;
  }
}

export async function sendPasswordResetEmail(email: string) {
  return resetPassword(email);
}

export async function resetPasswordWithOtp(otp: string, newPassword: string) {
  try {
    const { data, error } = await insforge.auth.resetPassword({
      otp,
      newPassword,
    });

    if (error) {
      console.error("Reset password error:", error);
      throw error;
    }

    if (data?.accessToken && data?.user) {
      persistSession(data.accessToken, data.user);
    }

    return data;
  } catch (err) {
    console.error("Reset password error:", err);
    throw err;
  }
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await insforge.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (err) {
    console.error('Update password error:', err);
    throw err;
  }
}
