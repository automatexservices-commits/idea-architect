import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { waitForSession } from "@/features/auth";

export const Route = createFileRoute("/auth/google/callback")({
  head: () => ({
    meta: [{ title: "Completing Google Sign-In..." }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    insforge_code: search.insforge_code as string | undefined,
    insforge_status: search.insforge_status as string | undefined,
    insforge_error: search.insforge_error as string | undefined,
  }),
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/auth/google/callback" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const oauthStatus = searchParams?.insforge_status as string | undefined;
  const oauthError = searchParams?.insforge_error as string | undefined;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);

        if (oauthError) {
          throw new Error(oauthError);
        }

        if (oauthStatus === "error" || oauthError) {
          throw new Error(oauthError || "Authentication failed");
        }

        console.log("[auth/google/callback] waiting for InsForge session");
        const session = await waitForSession();
        if (!session) {
          throw new Error("No session found");
        }

        try {
          sessionStorage.setItem("plannr-entered", "1");
        } catch {}

        setTimeout(() => {
          navigate({ to: "/", replace: true });
        }, 500);
      } catch (err) {
        console.error("Google callback error:", err);
        const message = err instanceof Error ? err.message : "Authentication failed";
        setError(message);
        setTimeout(() => {
          navigate({ to: "/welcome", replace: true });
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [oauthStatus, oauthError, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md text-center px-4">
        {isLoading && !error && (
          <>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Completing your sign-in...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we authenticate with Google.
            </p>
          </>
        )}

        {error && (
          <>
            <div className="text-5xl mb-4">âš ï¸</div>
            <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Redirecting back to login in 3 seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
