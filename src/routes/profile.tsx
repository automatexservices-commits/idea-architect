import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, CreditCard, FileDown, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { getSession, refreshSessionToken, useAuth } from "@/features/auth";
import { fetchBillingDashboard, type BillingDashboardResponse } from "@/features/billing/checkout";
import { requestInsforgeJson } from "@/lib/insforge-backend";

type HistoryItem = {
  id: string;
  project_name: string;
  idea_input: string;
  file_url: string;
  created_at: string;
};

async function downloadHistoryFile(fileUrl: string, filename: string) {
  const refreshed = await refreshSessionToken();
  let session = refreshed ? { accessToken: refreshed.accessToken, user: refreshed.user } : await getSession();

  if (!session?.accessToken) {
    throw new Error("Please sign in to download files.");
  }

  let response = await fetch(fileUrl, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (response.status === 401) {
    const refreshedAgain = await refreshSessionToken();
    if (refreshedAgain?.accessToken) {
      response = await fetch(fileUrl, {
        headers: { Authorization: `Bearer ${refreshedAgain.accessToken}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  requestAnimationFrame(() => {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  });
}

async function fetchHistory() {
  let session = await getSession();
  if (!session?.accessToken) {
    const refreshed = await refreshSessionToken();
    session = refreshed ? { accessToken: refreshed.accessToken, user: refreshed.user } : null;
  }

  const token = session?.accessToken;
  let { response, body } = await requestInsforgeJson<{ success: boolean; history: HistoryItem[]; error?: string }>(
    "/history",
    {},
    { Authorization: token ? `Bearer ${token}` : "" },
  );
  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed?.accessToken) {
      ({ response, body } = await requestInsforgeJson<{ success: boolean; history: HistoryItem[]; error?: string }>(
        "/history",
        {},
        { Authorization: `Bearer ${refreshed.accessToken}` },
      ));
    }
  }
  if (!response.ok) throw new Error(`Failed to fetch history (${response.status})`);
  if (!body?.success) throw new Error(body?.error || "Failed to load history");
  return body.history as HistoryItem[];
}

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - History" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session } = useAuth();
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [billing, setBilling] = useState<BillingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void (async () => {
      try {
        const [h, b] = await Promise.all([
          fetchHistory(),
          session?.accessToken ? fetchBillingDashboard() : Promise.resolve(null),
        ]);
        if (mounted) {
          setHistory(h);
          setBilling(b);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session?.accessToken]);

  const handleDownload = async (item: HistoryItem) => {
    try {
      setDownloadingId(item.id);
      await downloadHistoryFile(item.file_url, `${item.project_name || "spec"}.zip`);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const billingLabel = !session?.accessToken
    ? "Guest"
    : loading
      ? "Loading plan..."
      : billing?.summary.accountRole === "pro"
        ? "Pro plan active"
        : billing?.summary.accountRole === "free"
          ? "Free tier active"
          : "Plan unavailable";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl p-6">
        <section className="mb-6 rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Profile hub
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">History</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Your generated specs live here, and your billing dashboard is one click away.
              </p>
            </div>
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_6px_0_0_rgb(15_118_110)] transition-transform hover:translate-y-[1px]"
            >
              <CreditCard className="h-4 w-4" />
              Open billing dashboard
            </Link>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Billing & plan</div>
            <div className="mt-2 text-lg font-semibold">{billingLabel}</div>
            <Link to="/billing" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Manage billing <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Exports</div>
            <div className="mt-2 text-lg font-semibold">ZIP receipts available</div>
            <div className="mt-4 text-sm text-muted-foreground">Download any generated spec package from your history below.</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Account</div>
            <div className="mt-2 text-lg font-semibold">Signed in</div>
            <div className="mt-4 text-sm text-muted-foreground">Your current session controls downloads and plan visibility.</div>
          </div>
        </section>

        {loading && <div className="text-muted-foreground">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && history && history.length === 0 && <div className="p-6 border rounded-2xl">No specs generated yet</div>}

        <ul className="space-y-3">
          {history?.map((h) => (
            <li key={h.id} className="p-4 border rounded-2xl bg-white/80 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{h.project_name}</div>
                <div className="text-sm text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => void handleDownload(h)}
                  disabled={downloadingId === h.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-70"
                >
                  <FileDown className="h-4 w-4" />
                  {downloadingId === h.id ? "Downloading..." : "Download"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
