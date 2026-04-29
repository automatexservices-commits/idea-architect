import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Zap, Layers, Loader2, ShieldCheck } from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to PLANNR — Login or Sign up" },
      { name: "description", content: "Sign up or log in to PLANNR — vibe coding made easy and effective. Continue with Google or explore as guest." },
      { property: "og:title", content: "Welcome to PLANNR" },
      { property: "og:description", content: "Sign up or log in to PLANNR — vibe coding made easy and effective." },
    ],
  }),
  component: WelcomePage,
});

type Mode = "login" | "signup";

function WelcomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        try { sessionStorage.setItem("plannr-entered", "1"); } catch {}
        navigate({ to: "/" });
      }
    });
  }, [navigate]);

  const enterApp = () => {
    try { sessionStorage.setItem("plannr-entered", "1"); } catch {}
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message || "Google sign-in failed. Please try again.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      enterApp();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    // Transparent background — InteractiveGrid (white + neon checks) shows through
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-transparent relative">
      {/* ─────────────  LEFT: Brand visual (unchanged)  ───────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
        <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <div className="absolute inset-0 -z-10 [background:radial-gradient(ellipse_at_top_left,oklch(0.78_0.27_145/0.30),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.86_0.26_145/0.18),transparent_60%)]" />
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-primary/25 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full bg-primary-glow/20 blur-[140px] animate-float-slow" style={{ animationDelay: "2s" }} />

        <Link to="/welcome" className="inline-flex items-center gap-3 group w-fit">
          <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-border/60 transition-transform group-hover:scale-[1.03]">
            <img src={plannrLogo} alt="PLANNR" className="h-12 w-auto object-contain" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">PLANNR</span>
            <span className="text-xs text-muted-foreground font-medium tracking-wide">Vibe coding, made easy & effective.</span>
          </span>
        </Link>

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

        <div className="text-xs text-muted-foreground font-mono">
          © PLANNR · Built for vibe coders
        </div>
      </aside>

      {/* ─────────────  RIGHT: Crazy auth card on the white grid  ───────────── */}
      <main className="relative flex items-center justify-center p-6 sm:p-10">
        {/* Drifting neon orbs (subtle, on white) */}
        <span className="auth-orb auth-orb-a" aria-hidden />
        <span className="auth-orb auth-orb-b" aria-hidden />

        {/* Sparkles around the card area */}
        <span className="sparkle" style={{ top: "12%", left: "18%" }} aria-hidden />
        <span className="sparkle" style={{ top: "70%", left: "10%", animationDelay: "1.2s" }} aria-hidden />
        <span className="sparkle" style={{ top: "22%", right: "12%", animationDelay: "0.6s" }} aria-hidden />
        <span className="sparkle" style={{ bottom: "14%", right: "18%", animationDelay: "1.8s" }} aria-hidden />

        <div className="auth-card-wrap w-full max-w-md animate-fade-up">
          <div className="auth-card p-7 sm:p-9">
            {/* Mobile brand */}
            <Link to="/welcome" className="lg:hidden inline-flex items-center gap-2 mb-7">
              <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-border/60">
                <img src={plannrLogo} alt="PLANNR" className="h-9 w-auto object-contain" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">PLANNR</span>
            </Link>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[11px] font-medium text-muted-foreground mb-5 chip-float">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Secured by Google OAuth
            </div>

            {/* Tabs */}
            <div className="auth-tabs relative mb-7 w-full rounded-full p-1 grid grid-cols-2 text-sm font-medium">
              <span
                aria-hidden
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-b from-primary to-primary-glow shadow-[0_8px_24px_-6px_oklch(0.78_0.27_145/0.55)] transition-transform duration-300 ease-out"
                style={{ transform: mode === "login" ? "translateX(4px)" : "translateX(calc(100% + 4px))" }}
              />
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`relative z-10 h-10 rounded-full transition-colors ${mode === "login" ? "text-primary-foreground" : "text-foreground/65 hover:text-foreground"}`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                className={`relative z-10 h-10 rounded-full transition-colors ${mode === "signup" ? "text-primary-foreground" : "text-foreground/65 hover:text-foreground"}`}
              >
                Sign up
              </button>
            </div>

            <div className="mb-7">
              <h2 className="font-display text-3xl sm:text-[2rem] font-bold tracking-tight">
                {mode === "login" ? (
                  <>Welcome <span className="gradient-text">back.</span></>
                ) : (
                  <>Let's build <span className="gradient-text">something wild.</span></>
                )}
              </h2>
              <p className="auth-muted mt-2 text-sm">
                {mode === "login"
                  ? "Log in to continue your specs."
                  : "Sign up — no card, no friction. Just ideas."}
              </p>
            </div>

            {/* Google CTA — spinning halo */}
            <button
              type="button"
              onClick={onGoogle}
              disabled={googleLoading}
              className="google-cta"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
              {mode === "login" ? "Log in with Google" : "Sign up with Google"}
            </button>

            {error && (
              <div className="mt-4 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px auth-divider" />
              <span className="text-[11px] uppercase tracking-[0.18em] auth-muted">or</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            <button type="button" onClick={enterApp} className="explore-cta">
              Explore now
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="mt-6 text-center text-[11px] auth-muted">
              By continuing you agree to PLANNR's{" "}
              <Link to="/terms" className="text-foreground hover:text-primary underline-offset-2 hover:underline">Terms</Link>
              {" "}&{" "}
              <Link to="/privacy" className="text-foreground hover:text-primary underline-offset-2 hover:underline">Privacy</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.6 34.7 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8L6 32.5C9.2 39.5 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.8 5.2l6.5 5.3C42.1 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
