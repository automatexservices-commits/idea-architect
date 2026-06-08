import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { History, LogOut, Sparkles, FileText, CreditCard } from "lucide-react";
import { useAuth, useAuthActions } from "@/features/auth";
import { getSession, refreshSessionToken } from "@/features/auth";
import { requestInsforgeJson } from "@/lib/insforge-backend";
import { ScrollArea } from "@/components/ui/scroll-area";

type HistoryItem = {
  id: string;
  project_name: string;
  created_at: string;
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function getInitials(label: string) {
  return (
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "G"
  );
}

async function fetchRecentHistory(): Promise<HistoryItem[]> {
  let session = await getSession();
  if (!session?.accessToken) {
    const refreshed = await refreshSessionToken();
    session = refreshed ? { accessToken: refreshed.accessToken, user: refreshed.user } : null;
  }

  const token = session?.accessToken;
  let { response, body } = await requestInsforgeJson<{
    success: boolean;
    history: HistoryItem[];
    error?: string;
  }>("/history", {}, { Authorization: token ? `Bearer ${token}` : "" });
  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed?.accessToken) {
      ({ response, body } = await requestInsforgeJson<{
        success: boolean;
        history: HistoryItem[];
        error?: string;
      }>("/history", {}, { Authorization: `Bearer ${refreshed.accessToken}` }));
    }
  }
  if (!response.ok || !body?.success || !Array.isArray(body.history)) return [];
  return (body.history as any[])
    .slice(0, 8)
    .map((r) => ({ id: r.id, project_name: r.project_name, created_at: r.created_at }));
}

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { user, session } = useAuth();
  const { signOut: logout } = useAuthActions();

  useEffect(() => {
    if (open) {
      void (async () => {
        try {
          const h = await fetchRecentHistory();
          setHistory(h);
        } catch {
          setHistory([]);
        }
      })();
    }
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

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "Guest builder";
  const statusLine = session?.user ? "Logged in" : "Free plan";
  const primaryActionLabel = session?.user ? "Log out" : "Log in";
  const initials = getInitials(displayName);

  const handlePrimaryAction = async () => {
    if (session?.user) {
      try {
        await logout();
        sessionStorage.removeItem("plannr-entered");
      } catch {}
      window.location.href = "/welcome";
      return;
    }

    window.location.href = "/welcome";
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="profile-3d"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {initials}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden z-50 splash-rise"
        >
          <div className="px-4 py-4 border-b border-border bg-gradient-to-br from-surface to-card flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-sm font-bold text-primary-foreground">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm leading-tight truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono truncate">
                {user?.email ?? "Not signed in"} · {statusLine}
              </div>
            </div>
          </div>

          <div className="px-2 pt-3 pb-1">
            <div className="px-2 pb-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <History className="w-3 h-3" />
              Recent specs
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center rounded-lg bg-surface/60 mx-1">
                No history yet - generate your first spec.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {history.map((h) => (
                  <li key={h.id}>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
                    >
                      <span className="truncate">{h.project_name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {timeAgo(h.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-2 py-2 border-t border-border mt-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
            >
              <History className="w-4 h-4 text-primary" />
              Profile & history
            </Link>
            <Link
              to="/build"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-surface transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              New spec
            </Link>
            <Link
              to="/billing"
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
          </div>

          <div className="px-3 py-3 border-t border-border bg-surface/40">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:border-destructive/50 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {primaryActionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type MobileProfileMenuProps = {
  isOpen: boolean;
  onNavigate: () => void;
};

export function MobileProfileMenuSection({ isOpen, onNavigate }: MobileProfileMenuProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user, session } = useAuth();
  const { signOut: logout } = useAuthActions();

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    void (async () => {
      try {
        const h = await fetchRecentHistory();
        if (mounted) setHistory(h);
      } catch {
        if (mounted) setHistory([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "Guest builder";
  const statusLine = session?.user ? "Logged in" : "Free plan";
  const primaryActionLabel = session?.user ? "Log out" : "Log in";
  const initials = getInitials(displayName);

  const handlePrimaryAction = async () => {
    onNavigate();
    if (session?.user) {
      try {
        await logout();
        sessionStorage.removeItem("plannr-entered");
      } catch {}
      window.location.href = "/welcome";
      return;
    }

    window.location.href = "/welcome";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center ring-2 ring-primary/30">
            <span className="text-sm font-bold text-primary-foreground">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm leading-tight truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono truncate">
              {user?.email ?? "Not signed in"} Â· {statusLine}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2">
        <div className="px-2 pb-2 pt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Account actions
        </div>
        <div className="flex flex-col gap-0.5">
          <Link
            to="/profile"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-surface transition-colors"
          >
            <History className="w-4 h-4 text-primary" />
            Profile & history
          </Link>
          <Link
            to="/build"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-surface transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            New spec
          </Link>
          <Link
            to="/billing"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-surface transition-colors"
          >
            <CreditCard className="w-4 h-4 text-primary" />
            Billing & plans
          </Link>
          <Link
            to="/docs"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-surface transition-colors"
          >
            <FileText className="w-4 h-4 text-primary" />
            Docs
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2">
        <div className="px-2 pb-2 pt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Recent specs
        </div>
        <ScrollArea className="h-44">
          <div className="px-1 pb-1 pr-3">
            {history.length === 0 ? (
              <div className="mx-1 rounded-xl bg-surface/60 px-3 py-4 text-center text-xs text-muted-foreground">
                No history yet - generate your first spec.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {history.map((h) => (
                  <li key={h.id}>
                    <Link
                      to="/profile"
                      onClick={onNavigate}
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface transition-colors"
                    >
                      <span className="truncate">{h.project_name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {timeAgo(h.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="w-full rounded-xl border border-border px-3 py-3 text-sm font-medium hover:border-destructive/50 hover:text-destructive transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            {primaryActionLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
