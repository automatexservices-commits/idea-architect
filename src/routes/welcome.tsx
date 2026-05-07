import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Loader, Sparkles, Zap, Layers } from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { signInWithGoogle } from "@/features/auth";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to PLANNR" },
      { name: "description", content: "Continue with Google or explore without an account." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [submitting, setSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      console.log("Auth triggered");
      await signInWithGoogle();
    } catch {
      setSubmitting(false);
    }
  };

  const explore = () => {
    try {
      sessionStorage.setItem("plannr-entered", "1");
    } catch {}
    navigate({ to: "/", replace: true });
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }

  return (
    <div className="relative min-h-screen w-full grid lg:grid-cols-2 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute left-[18%] top-[18%] h-[760px] w-[760px] rounded-full bg-primary/12 blur-[180px]" />
      <div className="absolute right-[-8%] top-[18%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[170px]" />

      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
        <div className="absolute inset-0 -z-10 opacity-90">
          <div className="absolute left-[4%] top-[10%] h-2 w-2 rounded-full bg-primary blur-[1px] animate-pulse" />
          <div className="absolute left-[58%] top-[12%] h-2 w-2 rounded-full bg-primary blur-[1px] animate-pulse" />
          <div className="absolute left-[56%] top-[68%] h-2 w-2 rounded-full bg-primary blur-[1px] animate-pulse" />
          <div className="absolute right-[8%] top-[20%] h-2 w-2 rounded-full bg-primary blur-[1px] animate-pulse" />
          <div className="absolute right-[12%] bottom-[8%] h-2 w-2 rounded-full bg-primary blur-[1px] animate-pulse" />
        </div>

        <Link to="/welcome" className="inline-flex items-center gap-3 group w-fit">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white/75 p-2 ring-1 ring-border/60 backdrop-blur-md transition-transform group-hover:scale-[1.03]">
            <img src={plannrLogo} alt="PLANNR" className="h-11 w-auto object-contain" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">PLANNR</span>
            <span className="text-xs text-muted-foreground font-medium tracking-wide">Vibe coding, made easy & effective.</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/70 backdrop-blur-md text-xs text-muted-foreground mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Product Thinking System
          </div>
          <h1 className="font-display text-[3.25rem] xl:text-[4.2rem] font-bold tracking-tight leading-[0.98]">
            From <span className="gradient-text">vibe</span> to
            <br />
            <span className="text-glow">production spec.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            One sentence in. A complete project package out - PRD, architecture, API spec, design system, and folder structure.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { icon: Sparkles, label: "7 structured docs" },
              { icon: Zap, label: "Under 5 min" },
              { icon: Layers, label: "Stack picker" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/70 backdrop-blur-md text-xs font-medium text-foreground shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Copyright PLANNR - Built for vibe coders
        </div>
      </aside>

      <main className="relative flex items-start justify-center p-4 sm:p-8 lg:p-10 lg:pt-12">
        <div className="absolute inset-0 -z-10 bg-background/90" />
        <div className="absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_32%_18%,oklch(0.78_0.27_145/0.16),transparent_22%),radial-gradient(circle_at_74%_44%,oklch(0.84_0.24_145/0.12),transparent_24%),radial-gradient(circle_at_90%_12%,oklch(0.78_0.27_145/0.08),transparent_18%)]" />

        <div className="w-full max-w-[575px] animate-fade-up">
          <div className="lg:hidden inline-flex items-center gap-2 mb-6">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-border/60">
              <img src={plannrLogo} alt="PLANNR" className="h-9 w-auto object-contain" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">PLANNR</span>
          </div>

          <div className="relative rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.22)] backdrop-blur-2xl px-6 py-7 sm:px-7 sm:py-8 overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/12 to-transparent" />
            <div className="pointer-events-none absolute -top-5 left-12 h-10 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute right-6 top-28 h-80 w-24 rounded-full bg-primary/40 blur-[34px] animate-ribbon-sway" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[2rem] border border-primary/25 opacity-60" />
            <div className="pointer-events-none absolute -bottom-10 left-3 h-28 w-[1px] bg-primary/34 rotate-[44deg]" />
            <div className="pointer-events-none absolute bottom-4 right-0 h-28 w-[1px] bg-primary/52 rotate-[44deg]" />

            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="particle-dot left-[8%] top-[14%]" style={{ animationDuration: "4.8s" }} />
              <div className="particle-dot left-[70%] top-[11%]" style={{ animationDelay: "0.6s", animationDuration: "5.2s" }} />
              <div className="particle-dot left-[92%] top-[28%]" style={{ animationDelay: "0.2s", animationDuration: "4.4s" }} />
              <div className="particle-dot left-[48%] top-[79%]" style={{ animationDelay: "1s", animationDuration: "5.8s" }} />
              <div className="particle-dot left-[86%] top-[92%]" style={{ animationDelay: "0.8s", animationDuration: "4.9s" }} />
              <div className="particle-dot left-[16%] top-[64%]" style={{ animationDelay: "1.4s", animationDuration: "5.6s" }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secured by Google OAuth
              </div>

              <div className="mt-6 flex gap-2 p-1 bg-surface/50 rounded-full border border-border shadow-sm">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-3 px-4 rounded-full font-medium text-sm transition-all ${
                    mode === "login"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-3 px-4 rounded-full font-medium text-sm transition-all ${
                    mode === "signup"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <div className="mt-7 sm:mt-8">
                <h2 className="font-display text-[2.35rem] sm:text-[2.75rem] leading-[1.02] tracking-tight font-bold text-foreground">
                  {mode === "signup" ? (
                    <>Let&apos;s build <span className="text-primary">something</span> wild.</>
                  ) : (
                    <>Welcome back. <span className="text-primary">Continue.</span></>
                  )}
                </h2>
                <p className="mt-4 text-base sm:text-[1.05rem] text-muted-foreground">
                  {mode === "signup"
                    ? "Sign up - no card, no friction. Just ideas."
                    : "Log in - pick up where you left off."}
                </p>
              </div>

              <div className="relative mt-7 sm:mt-8">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-32 -translate-x-1/2 -translate-y-[58%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.46),rgba(34,197,94,0.22)_30%,rgba(34,197,94,0.04)_65%,transparent_78%)] blur-[18px] rotate-[18deg] animate-ribbon-sway" />
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="group relative z-10 w-full h-14 rounded-full border-2 border-primary/70 bg-white text-foreground font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_18px_60px_-18px_oklch(0.78_0.27_145/0.6)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Continuing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={explore}
                className="mt-6 group w-full h-14 rounded-full border border-border bg-white text-foreground font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_18px_48px_-18px_oklch(0.2_0.04_150/0.22)] flex items-center justify-center gap-3"
              >
                Explore now
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <p className="mt-7 text-center text-sm text-muted-foreground">
                By continuing you agree to PLANNR&apos;s Terms &amp; Privacy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
