import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { waitForSession } from "@/features/auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing in..." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        console.log("[auth/callback] waiting for InsForge session");
        const session = await waitForSession();

        if (!session) {
          throw new Error("No session found");
        }

        // Mark user as entered
        try {
          sessionStorage.setItem("plannr-entered", "1");
        } catch {}

        // Redirect to home
        setTimeout(() => {
          navigate({ to: "/", replace: true });
        }, 500);
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => {
          navigate({ to: "/welcome", replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md text-center">
        {isLoading && (
          <>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Signing you in...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we complete your authentication.
            </p>
          </>
        )}

        {error && (
          <>
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Redirecting back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
