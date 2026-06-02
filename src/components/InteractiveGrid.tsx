import { useEffect, useRef } from "react";

/**
 * InteractiveGrid — Antigravity-inspired animated background.
 *
 * Renders a fixed full-viewport grid that:
 *  - Stays subtle by default
 *  - Reveals a vivid neon-green spotlight that follows the cursor
 *  - Smoothly trails the pointer with eased lerp animation
 *
 * Uses CSS variables driven by requestAnimationFrame — no re-renders.
 */
export function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reduceMotion.matches || coarsePointer.matches) {
      el.style.setProperty("--grid-opacity", "0.65");
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;
    let active = false;
    let running = false;
    let inactivityTimer = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      active = true;
      el.style.setProperty("--grid-opacity", "1");
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer);
      }
      inactivityTimer = window.setTimeout(() => {
        settle();
      }, 180);
      start();
    };

    const settle = () => {
      active = false;
      el.style.setProperty("--grid-opacity", "0.75");
      start();
    };

    const tick = () => {
      // Eased follow for that smooth Antigravity trail
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      el.style.setProperty("--mx", `${currentX}px`);
      el.style.setProperty("--my", `${currentY}px`);

      const delta = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
      if (active || delta > 0.5) {
        raf = requestAnimationFrame(tick);
        running = true;
        return;
      }

      running = false;
      raf = 0;
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", settle);
    document.addEventListener("visibilitychange", settle);
    start();

    return () => {
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", settle);
      document.removeEventListener("visibilitychange", settle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="interactive-grid pointer-events-none fixed inset-0 z-0"
    />
  );
}
