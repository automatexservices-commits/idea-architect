import { useEffect, useState } from "react";
import plannrLogo from "@/assets/plannr-logo.png";

/**
 * Brief, premium-feeling intro animation shown on first load per session.
 * - Fades in a centered logo + wordmark
 * - Sweeps a neon line across the wordmark
 * - Auto-dismisses with a smooth fade-out
 */
export function SplashIntro() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Show only once per browser session
    const seen = sessionStorage.getItem("plannr-splash-seen");
    if (seen) {
      setVisible(false);
      return;
    }
    setMounted(true);
    const t1 = setTimeout(() => setLeaving(true), 1900);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("plannr-splash-seen", "1");
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible || !mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Soft radial glow backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.78 0.27 145 / 0.18), transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 splash-rise">
        {/* Logo plate */}
        <div className="relative">
          <span className="absolute inset-0 rounded-2xl splash-pulse" />
          <span className="relative inline-flex items-center justify-center rounded-2xl bg-white p-3 ring-1 ring-border/60 shadow-[0_10px_40px_-10px_oklch(0.78_0.27_145/0.55)]">
            <img src={plannrLogo} alt="PLANNR" className="h-20 w-auto object-contain" />
          </span>
        </div>

        {/* Wordmark with sweep */}
        <div className="relative overflow-hidden">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            PLANNR
          </h1>
          <span className="splash-sweep" />
        </div>

        {/* Tagline */}
        <p className="text-sm md:text-base text-muted-foreground tracking-wide splash-fade-delay">
          Vibe coding, made easy &amp; effective.
        </p>

        {/* Loader bar */}
        <div className="mt-4 h-[3px] w-44 overflow-hidden rounded-full bg-border/60">
          <span className="block h-full splash-bar" />
        </div>
      </div>
    </div>
  );
}
