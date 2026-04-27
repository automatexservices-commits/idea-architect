import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { User, History, Settings, LogOut, Sparkles, FileText, CreditCard, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type HistoryItem = {
  id: string;
  title: string;
  ts: number;
};

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("plannr-history");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 8);
  } catch {
    return [];
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (open) setHistory(loadHistory());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    try { sessionStorage.removeItem("plannr-entered"); } catch {}
    window.location.href = "/welcome";
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Guest builder";
  const subline = user?.email || "Vibe coder · Free plan";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);


  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="profile-3d"
      >
        <User className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden z-50 splash-rise"
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-border bg-gradient-to-br from-surface to-card flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center ring-2 ring-primary/30 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm leading-tight truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono truncate">
                {subline}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="px-2 pt-3 pb-1">
            <div className="px-2 pb-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <History className="w-3 h-3" />
              Recent specs
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center rounded-lg bg-surface/60 mx-1">
                No history yet — generate your first spec.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {history.map((h) => (
                  <li key={h.id}>
                    <Link
                      to="/build"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
                    >
                      <span className="truncate">{h.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {timeAgo(h.ts)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick links */}
          <div className="px-2 py-2 border-t border-border mt-2">
            <Link
              to="/build"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              New spec
            </Link>
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
            >
              <CreditCard className="w-4 h-4 text-primary" />
              Billing & plans
            </Link>
            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
            >
              <FileText className="w-4 h-4 text-primary" />
              Docs
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-primary" />
              Settings
            </button>
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t border-border bg-surface/40">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              <Link
                to="/welcome"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in or Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
