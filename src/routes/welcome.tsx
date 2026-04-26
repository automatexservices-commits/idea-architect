import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, Lock, Sparkles, Zap, Layers } from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to PLANNR — Login or Explore" },
      { name: "description", content: "Sign in to save your specs, or explore PLANNR — the thinking system that turns ideas into production-ready specs." },
      { property: "og:title", content: "Welcome to PLANNR" },
      { property: "og:description", content: "Login or explore PLANNR — vibe coding made easy and effective." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Mark user as having entered, then go to landing
    try { sessionStorage.setItem("plannr-entered", "1"); } catch {}
    setTimeout(() => navigate({ to: "/" }), 350);
  };

  const explore = () => {
    try { sessionStorage.setItem("plannr-entered", "1"); } catch {}
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* ─────────────  LEFT: Brand visual  ───────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
        {/* Layered neon background */}
        <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <div className="absolute inset-0 -z-10 [background:radial-gradient(ellipse_at_top_left,oklch(0.78_0.27_145/0.30),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.86_0.26_145/0.18),transparent_60%)]" />
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-primary/25 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full bg-primary-glow/20 blur-[140px] animate-float-slow" style={{ animationDelay: "2s" }} />

        {/* Top: Logo */}
        <Link to="/welcome" className="inline-flex items-center gap-3 group w-fit">
          <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-border/60 transition-transform group-hover:scale-[1.03]">
            <img src={plannrLogo} alt="PLANNR" className="h-12 w-auto object-contain" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">PLANNR</span>
            <span className="text-xs text-muted-foreground font-medium tracking-wide">Vibe coding, made easy & effective.</span>
          </span>
        </Link>

        {/* Middle: Headline */}
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/60 backdrop-blur-md text-xs text-muted-foreground mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Product Thinking System
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05]">
            From <span className="gradient-text">vibe</span> to
            <br />
            <span className="text-glow">production spec.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            One sentence in. A complete project package out — PRD, architecture, API spec, design system, and folder structure.
          </p>

          {/* Floating feature chips */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { icon: Sparkles, label: "7 structured docs" },
              { icon: Zap, label: "Under 5 min" },
              { icon: Layers, label: "Stack picker" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/70 backdrop-blur-md text-xs font-medium text-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: footnote */}
        <div className="text-xs text-muted-foreground font-mono">
          © PLANNR · Built for vibe coders
        </div>
      </aside>

      {/* ─────────────  RIGHT: Auth card  ───────────── */}
      <main className="relative flex items-center justify-center p-6 sm:p-10">
        {/* subtle background tint on right side */}
        <div className="absolute inset-0 -z-10 bg-card" />

        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <Link to="/welcome" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-border/60">
              <img src={plannrLogo} alt="PLANNR" className="h-9 w-auto object-contain" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">PLANNR</span>
          </Link>

          <div className="text-center mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {mode === "login" ? "Log in" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login" ? (
                <>or{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    create an account
                  </button>
                </>
              ) : (
                <>already have one?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-3d w-full !rounded-full">
              {submitting ? "Signing you in..." : mode === "login" ? "Log in" : "Sign up"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {mode === "login" && (
              <div className="text-center">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </a>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Explore now */}
          <button
            type="button"
            onClick={explore}
            className="btn-3d btn-3d-outline w-full !rounded-full"
          >
            Explore now
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to PLANNR's Terms & Privacy.
          </p>
        </div>
      </main>
    </div>
  );
}
