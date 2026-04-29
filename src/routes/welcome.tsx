import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Zap, Layers, Loader2 } from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to PLANNR — Login or Sign up" },
      { name: "description", content: "Sign up or log in to PLANNR — vibe coding made easy and effective. Continue with Google or email." },
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

  // If already signed in, skip the gate and go to landing
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

  const explore = () => enterApp();

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
      if (result.redirected) return; // browser will redirect
      enterApp();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* ─────────────  LEFT: Brand visual  ───────────── */}
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

      {/* ─────────────  RIGHT: Auth card  ───────────── */}
      <main className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute inset-0 -z-10 bg-card" />

        <div className="w-full max-w-md animate-fade-up">
          <Link to="/welcome" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-border/60">
              <img src={plannrLogo} alt="PLANNR" className="h-9 w-auto object-contain" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">PLANNR</span>
          </Link>

          {/* Tab switcher (Log in / Sign up) */}
          <div className="relative mx-auto mb-8 w-full max-w-sm rounded-full border border-border bg-surface p-1 grid grid-cols-2 text-sm font-medium">
            <span
              aria-hidden
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-b from-primary to-primary-glow shadow-[0_6px_24px_-6px_oklch(0.78_0.27_145/0.55)] transition-transform duration-300 ease-out"
              style={{ transform: mode === "login" ? "translateX(4px)" : "translateX(calc(100% + 4px))" }}
            />
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`relative z-10 h-10 rounded-full transition-colors ${mode === "login" ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`relative z-10 h-10 rounded-full transition-colors ${mode === "signup" ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
            >
              Sign up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Log in to continue building with PLANNR."
                : "Join thousands using PLANNR to build faster."}
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="w-full h-12 rounded-full border border-border bg-surface hover:bg-surface/70 transition-colors flex items-center justify-center gap-3 font-medium text-foreground disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {mode === "login" ? "Log in with Google" : "Sign up with Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">or email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "Password" : "Create password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-full bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-foreground bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
                {info}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-3d w-full !rounded-full">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "Logging you in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Log in" : "Sign up"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === "login" && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setError(null); setInfo(null);
                    if (!email.trim()) { setError("Enter your email above first."); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/`,
                    });
                    if (error) setError(error.message);
                    else setInfo("Password reset email sent — check your inbox.");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={explore}
            className="btn-3d btn-3d-outline w-full !rounded-full"
          >
            Explore now
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to PLANNR's{" "}
            <Link to="/terms" className="text-foreground hover:text-primary underline-offset-2 hover:underline">Terms</Link>
            {" "}&{" "}
            <Link to="/privacy" className="text-foreground hover:text-primary underline-offset-2 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.6 34.7 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8L6 32.5C9.2 39.5 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.8 5.2l6.5 5.3C42.1 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
