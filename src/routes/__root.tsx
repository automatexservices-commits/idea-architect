import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import plannrFavicon from "@/assets/plannr-logo.png";
import { InteractiveGrid } from "@/components/InteractiveGrid";
import { SplashIntro } from "@/components/SplashIntro";
import { AuthProvider, useAuth } from "@/features/auth";

/**
 * Gate: on first session visit, redirect "/" -> "/welcome" so the user
 * sees the login / explore-now choice before entering the site.
 */
function WelcomeGate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;
    try {
      if (!sessionStorage.getItem("plannr-entered")) {
        navigate({ to: "/welcome", replace: true });
      }
    } catch {}
  }, [pathname, navigate]);
  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PLANNR — From idea to production-ready spec" },
      { name: "description", content: "Turn vague app ideas into PRDs, architecture, API specs, and design systems. AI-powered project specs in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
        { rel: "icon", href: plannrFavicon },
        { rel: "apple-touch-icon", href: plannrFavicon },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const showIntroChrome = pathname === "/" || pathname === "/welcome";

  return (
    <AuthProvider>
      <AuthGate>
        {showIntroChrome ? <SplashIntro /> : null}
        <WelcomeGate />
        <InteractiveGrid />
        <div className="relative z-10">
          <Outlet />
        </div>
      </AuthGate>
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" aria-busy="true" aria-live="polite" />;
  }

  return <>{children}</>;
}
