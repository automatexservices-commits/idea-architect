import { Link } from "@tanstack/react-router";
import plannrLogo from "@/assets/plannr-logo.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center group" aria-label="PLANNR home">
          <img
            src={plannrLogo}
            alt="PLANNR"
            className="h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-[1.03] drop-shadow-[0_0_18px_oklch(0.78_0.27_145/0.45)]"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
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
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary-sm"
        >
          Start Building
        </Link>
      </div>
    </header>
  );
}
