import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="py-12 border-t border-border/50 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <div className="font-display font-bold text-lg">PLANNR</div>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Vibe coding, made easy & effective. Turn one-line ideas into production-ready specs.
            </p>
          </div>

          <div>
            <div className="font-display font-semibold text-sm mb-3">Product</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/build" className="hover:text-foreground transition-colors">
                  Build
                </Link>
              </li>
              <li>
                <Link to="/examples" className="hover:text-foreground transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-foreground transition-colors">
                  Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-display font-semibold text-sm mb-3">Legal</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="font-mono">
            © {new Date().getFullYear()} PLANNR · Built for vibe coders
          </div>
        </div>
      </div>
    </footer>
  );
}
