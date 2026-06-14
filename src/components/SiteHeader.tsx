import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import plannrLogo from "@/assets/plannr-logo.png";
import { MobileProfileMenuSection, ProfileMenu } from "@/components/ProfileMenu";
import { useAuth } from "@/features/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const router = useRouter();
  const { pathname } = useLocation();
  const { session } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const showBack = isHydrated && pathname !== "/";
  const showMarkOnly = isHydrated && pathname === "/";

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
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

          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" aria-label="PLANNR home">
            <span className="inline-flex items-center justify-center rounded-full bg-white p-1.5 sm:p-1.5 ring-1 ring-border/60 transition-transform group-hover:scale-[1.03] shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 overflow-hidden">
              <img
                src={plannrLogo}
                alt="PLANNR"
                className="block h-full w-full rounded-full object-contain object-center"
              />
            </span>
            <span className="hidden sm:flex flex-col leading-tight min-w-0">
              <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
                PLANNR
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground font-medium tracking-wide truncate">
                Vibe coding, made easy & effective.
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Home
            </Link>
            <Link to="/examples" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Examples
            </Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Pricing
            </Link>
            <Link to="/docs" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Docs
            </Link>
            <Link to="/build" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Build
            </Link>
          </nav>
          <Link to="/build" className="hidden sm:inline-flex btn-3d btn-3d-sm whitespace-nowrap">
            Start Building
          </Link>

          <div className="hidden sm:block">
            <ProfileMenu />
          </div>

          <div className="sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-surface transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm p-5 overflow-y-auto flex flex-col">
                <SheetHeader className="text-left">
                  <SheetTitle className="font-display text-2xl">PLANNR</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <MobileProfileMenuSection isOpen={mobileOpen} onNavigate={closeMobileMenu} />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/examples"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Examples
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/docs"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    to="/build"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Build
                  </Link>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Link to="/build" onClick={closeMobileMenu} className="btn-3d btn-3d-sm w-full">
                    Start Building
                  </Link>
                  {!session?.user && (
                    <Link to="/welcome" onClick={closeMobileMenu} className="btn-3d btn-3d-sm btn-3d-outline w-full">
                      Sign in
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
