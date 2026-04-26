import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";

export function SiteHeader() {
  const router = useRouter();
  const { pathname } = useLocation();
  const showBack = pathname !== "/";

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-24 flex items-center justify-between gap-6">
        {/* Left: Back + Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {showBack && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-background hover:bg-surface hover:border-primary/50 transition-colors text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group" aria-label="PLANNR home">
            <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-border/60 transition-transform group-hover:scale-[1.03]">
              <img
                src={plannrLogo}
                alt=""
                className="h-12 md:h-14 w-auto object-contain"
              />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
                PLANNR
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground font-medium tracking-wide">
                Vibe coding, made easy & effective.
              </span>
            </span>
          </Link>
        </div>

        {/* Right side: nav links + CTA */}
        <div className="flex items-center gap-6 md:gap-8">
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/examples" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Examples
            </Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Pricing
            </Link>
            <Link to="/docs" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Docs
            </Link>
          </nav>
          <Link
            to="/build"
            className="btn-3d btn-3d-sm whitespace-nowrap"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
