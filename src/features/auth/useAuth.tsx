import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
const WIZARD_STORAGE_PREFIX = "plannr_wizard";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>(null);
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<AuthSession>(null);
  const userRef = useRef<AuthUser>(null);

  useEffect(() => {
    sessionRef.current = session;
    userRef.current = user;
  }, [session, user]);

  const refreshAuth = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const previousSession = sessionRef.current;
    try {
      // Keep the app mounted during background auth refreshes.
      // We still refresh the auth session on focus/visibility, but we avoid
      // flipping the global loading gate unless this is the initial load.
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Always ask InsForge for the current session.
      // Browser mode can restore auth from its own cookie/session state even
      // when our localStorage cache is empty after a refresh or port change.
      let nextSession = await getSession();
      if (!nextSession?.accessToken) {
        await sleep(250);
        nextSession = await getSession();
      }

      if (!nextSession?.accessToken && silent) {
        // Background refreshes should not clear the current session on a
        // transient failure. Keep the existing UI mounted and try again later.
        return previousSession;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      return nextSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load auth state";
      if (!silent) {
        setError(message);
        setSession(null);
        setUser(null);
      } else {
        console.warn("[auth] background refresh failed", message);
      }
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const onFocus = () => void refreshAuth({ silent: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshAuth({ silent: true });
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
  const { refreshAuth, user } = useAuth();

  const clearWizardDraft = () => {
    if (typeof window === "undefined") return;
    const userId = user?.id;
    if (!userId) return;

    const prefix = `${WIZARD_STORAGE_PREFIX}_${userId}_`;
    const keys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  };

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
        clearWizardDraft();
        await signOut();
        await refreshAuth();
      },
      resetPassword,
      updatePassword,
      refreshAuth,
    }),
    [refreshAuth, user?.id],
  );
}
