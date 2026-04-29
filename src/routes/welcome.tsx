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
    <div className="auth-stage min-h-screen w-full flex items-center justify-center p-5 sm:p-8">
      {/* Floating neon orbs */}
      <span className="auth-orb auth-orb-a" aria-hidden />
      <span className="auth-orb auth-orb-b" aria-hidden />
      <span className="auth-orb auth-orb-c" aria-hidden />

      {/* Top brand bar */}
      <Link
        to="/welcome"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center gap-2.5 z-20 group"
      >
        <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-white/20 transition-transform group-hover:scale-[1.04]">
          <img src={plannrLogo} alt="PLANNR" className="h-8 w-auto object-contain" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-white">PLANNR</span>
      </Link>

      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-[11px] font-medium text-white/80">
        <ShieldCheck className="w-3.5 h-3.5 text-[oklch(0.86_0.26_145)]" />
        Secured by Google OAuth
      </div>

      {/* Main two-column inside the stage */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        {/* LEFT — copy / hero */}
        <section className="hidden lg:flex flex-col gap-7 text-white animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-xs text-white/70 w-fit chip-float">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.86_0.26_145)] animate-pulse" />
            AI Product Thinking System
          </div>

          <h1 className="font-display text-5xl xl:text-6xl font-bold tracking-tight leading-[1.02]">
            From a <span className="italic text-[oklch(0.86_0.26_145)]">vibe</span>
            <br />
            to a <span className="text-glow text-[oklch(0.86_0.26_145)]">production spec.</span>
          </h1>

          <p className="text-base xl:text-lg text-white/70 max-w-lg leading-relaxed">
            One sentence in. A complete project package out — PRD, architecture, API spec,
            design system & folder structure. Ship faster, think sharper.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {[
              { icon: Sparkles, label: "7 structured docs" },
              { icon: Zap, label: "Under 5 minutes" },
              { icon: Layers, label: "Stack picker" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-xs font-medium text-white/85"
              >
                <Icon className="w-3.5 h-3.5 text-[oklch(0.86_0.26_145)]" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs text-white/50 font-mono">
            <span>©  PLANNR</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Built for vibe coders</span>
          </div>
        </section>

        {/* RIGHT — auth card */}
        <section className="auth-card p-7 sm:p-9 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {/* Mobile brand */}
          <div className="lg:hidden mb-6 flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-white/20">
              <img src={plannrLogo} alt="PLANNR" className="h-8 w-auto object-contain" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">PLANNR</span>
          </div>

          {/* Tabs */}
          <div className="auth-tabs relative mb-7 w-full rounded-full p-1 grid grid-cols-2 text-sm font-medium">
            <span
              aria-hidden
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-b from-[oklch(0.86_0.26_145)] to-[oklch(0.78_0.27_145)] shadow-[0_8px_24px_-6px_oklch(0.78_0.27_145/0.65)] transition-transform duration-300 ease-out"
              style={{ transform: mode === "login" ? "translateX(4px)" : "translateX(calc(100% + 4px))" }}
            />
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`relative z-10 h-10 rounded-full transition-colors ${mode === "login" ? "text-[oklch(0.16_0.02_150)]" : "text-white/65 hover:text-white"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`relative z-10 h-10 rounded-full transition-colors ${mode === "signup" ? "text-[oklch(0.16_0.02_150)]" : "text-white/65 hover:text-white"}`}
            >
              Sign up
            </button>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-3xl sm:text-[2rem] font-bold tracking-tight text-white">
              {mode === "login" ? "Welcome back." : "Let's build something wild."}
            </h2>
            <p className="auth-muted mt-2 text-sm">
              {mode === "login"
                ? "Log in to continue your specs."
                : "Sign up — no card, no friction. Just ideas."}
            </p>
          </div>

          {/* Google CTA */}
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
            <div className="mt-4 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px auth-divider" />
            <span className="text-[11px] uppercase tracking-[0.18em] auth-muted">or</span>
            <div className="flex-1 h-px auth-divider" />
          </div>

          {/* Explore */}
          <button type="button" onClick={enterApp} className="explore-cta">
            Explore now
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-center text-[11px] auth-muted">
            By continuing you agree to PLANNR's{" "}
            <Link to="/terms" className="text-white/85 hover:text-[oklch(0.86_0.26_145)] underline-offset-2 hover:underline">Terms</Link>
            {" "}&{" "}
            <Link to="/privacy" className="text-white/85 hover:text-[oklch(0.86_0.26_145)] underline-offset-2 hover:underline">Privacy</Link>.
          </p>
        </section>
      </div>
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
