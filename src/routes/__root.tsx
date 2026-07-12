import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { InteractiveGrid } from "@/components/InteractiveGrid";
import { SplashIntro } from "@/components/SplashIntro";
import { AuthProvider, useAuth } from "@/features/auth";
import {
  getCanonicalUrl,
  getRobotsContent,
  organizationSchema,
  softwareApplicationSchema,
} from "@/lib/seo";

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
      {
        name: "description",
        content:
          "Turn vague app ideas into PRDs, architecture, API specs, and design systems. AI-powered project specs in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "PLANNR — From idea to production-ready spec" },
      { name: "twitter:title", content: "PLANNR — From idea to production-ready spec" },
      {
        property: "og:description",
        content:
          "Turn vague app ideas into PRDs, architecture, API specs, and design systems. AI-powered project specs in minutes.",
      },
      {
        name: "twitter:description",
        content:
          "Turn vague app ideas into PRDs, architecture, API specs, and design systems. AI-powered project specs in minutes.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3376e456-7d36-452e-97ca-7205f77bafa5/id-preview-5a036a14--ad20b996-2401-4e85-8968-55b0d919e141.lovable.app-1777460823725.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3376e456-7d36-452e-97ca-7205f77bafa5/id-preview-5a036a14--ad20b996-2401-4e85-8968-55b0d919e141.lovable.app-1777460823725.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png", sizes: "512x512" },
      { rel: "icon", type: "image/png", href: "/favicon-192.png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/favicon-192.png" },
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
  const { pathname } = useLocation();
  const canonical = getCanonicalUrl(pathname);

  return (
    <html lang="en">
      <head>
      <HeadContent />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="PLANNR" />
      <meta name="twitter:site" content="@plannrdev" />
      <meta name="robots" content={getRobotsContent(pathname)} />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2985848646146180"
        crossOrigin="anonymous"
      ></script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareApplicationSchema)}</script>
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
  const showInteractiveGrid =
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname === "/pricing" ||
    pathname === "/examples" ||
    pathname === "/docs" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/cookies" ||
    pathname === "/contact" ||
    pathname === "/refund";
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <AuthProvider>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "2px",
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #16a34a, #22c55e, #4ade80)",
          zIndex: 9999,
          transition: "width 0.05s linear",
          pointerEvents: "none",
        }}
      />
        <>
          {showIntroChrome ? <SplashIntro /> : null}
          {showInteractiveGrid ? <InteractiveGrid /> : null}
          <div className="relative z-10">
            <Outlet />
          </div>
        </>
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
