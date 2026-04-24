import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Spec<span className="text-primary">AI</span>
          </span>
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
