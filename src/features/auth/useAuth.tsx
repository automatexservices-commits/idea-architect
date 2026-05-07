import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  getSession,
  resetPassword,
  resetPasswordWithOtp,
  resendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  sendPasswordResetEmail,
  verifyEmail,
  updatePassword,
} from "./auth";

type AuthUser = Awaited<ReturnType<typeof getCurrentUser>>;
type AuthSession = Awaited<ReturnType<typeof getSession>>;

type AuthContextValue = {
  user: AuthUser;
  session: AuthSession;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<AuthSession>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>(null);
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always ask InsForge for the current session.
      // Browser mode can restore auth from its own cookie/session state even
      // when our localStorage cache is empty after a refresh or port change.
      const nextSession = await getSession();
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      return nextSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load auth state";
      setError(message);
      setSession(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const onFocus = () => void refreshAuth();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshAuth();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      error,
      refreshAuth,
    }),
    [user, session, loading, error, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const { refreshAuth } = useAuth();

  return useMemo(
    () => ({
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resendVerificationEmail,
      verifyEmail,
      sendPasswordResetEmail,
      resetPasswordWithOtp,
      signOut: async () => {
        await signOut();
        await refreshAuth();
      },
      resetPassword,
      updatePassword,
      refreshAuth,
    }),
    [refreshAuth],
  );
}
