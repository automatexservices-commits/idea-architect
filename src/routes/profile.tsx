import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  CreditCard,
  History,
  Settings,
  FileText,
  Sparkles,
  LogOut,
  Zap,
  Crown,
  Download,
  Check,
  Plus,
  Smartphone,
  Calendar,
  Receipt,
  TrendingUp,
  Shield,
  AlertCircle,
  ArrowUpRight,
  Bell,
  Mail,
  Trash2,
  Moon,
} from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const profileSearchSchema = z.object({
  tab: z
    .enum(["overview", "billing", "history", "settings", "docs"])
    .optional()
    .default("overview"),
});

export const Route = createFileRoute("/profile")({
  validateSearch: profileSearchSchema,
  head: () => ({
    meta: [
      { title: "Profile — PLANNR" },
      { name: "description", content: "Your PLANNR workspace: profile, billing, history, and settings in one dashboard." },
    ],
  }),
  component: ProfilePage,
});

const UPI_ID = "7984390066@ptyes";
type PlanKey = "hobby" | "pro" | "enterprise";
const PLAN_META: Record<PlanKey, { name: string; price: string; cadence: string; icon: typeof Sparkles; quota: number }> = {
  hobby: { name: "Hobby", price: "Free", cadence: "forever", icon: Sparkles, quota: 3 },
  pro: { name: "Pro", price: "₹49", cadence: "/ month", icon: Zap, quota: 999 },
  enterprise: { name: "Enterprise", price: "₹150", cadence: "/ month", icon: Crown, quota: 9999 },
};
const SAMPLE_INVOICES = [
  { id: "INV-2026-0421", date: "Apr 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" as const },
  { id: "INV-2026-0321", date: "Mar 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" as const },
  { id: "INV-2026-0221", date: "Feb 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" as const },
  { id: "INV-2026-0121", date: "Jan 21, 2026", amount: "₹0.00", plan: "Hobby · Free", status: "Paid" as const },
];

type HistoryItem = { id: string; title: string; ts: number };
function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("plannr-history");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function loadPlan(): PlanKey {
  if (typeof window === "undefined") return "hobby";
  try {
    const p = localStorage.getItem("plannr-plan");
    if (p === "pro" || p === "enterprise" || p === "hobby") return p;
  } catch {}
  return "hobby";
}

const NAV_ITEMS = [
  { key: "overview", label: "Profile", icon: User },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "history", label: "History", icon: History },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "docs", label: "Docs", icon: FileText },
] as const;

function ProfilePage() {
  const { tab } = useSearch({ from: "/profile" });
  const navigate = useNavigate({ from: "/profile" });
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanKey>("hobby");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setPlan(loadPlan());
    setHistory(loadHistory());
  }, []);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Guest builder";
  const email = user?.email || "guest@plannr.app";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    try { sessionStorage.removeItem("plannr-entered"); } catch {}
    window.location.href = "/welcome";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[96px_1fr] gap-5">
          {/* LEFT SIDEBAR — narrow icon rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start rounded-2xl border border-border bg-surface/50 backdrop-blur p-2 h-fit flex flex-col items-stretch gap-1">
            {/* Home */}
            <Link
              to="/"
              className="group flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent transition-all"
            >
              <span className="w-9 h-9 rounded-lg bg-background/70 flex items-center justify-center group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                <Plus className="w-4 h-4" />
              </span>
              Home
            </Link>

            <div className="h-px bg-border/60 mx-2 my-1" />

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate({ search: { tab: item.key } })}
                  className={`group flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl text-[11px] font-medium transition-all leading-tight text-center ${
                    active
                      ? "bg-primary/10 text-foreground border border-primary/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent"
                  }`}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    active ? "bg-primary/20 text-primary" : "bg-background/70 text-muted-foreground group-hover:text-primary"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {item.label}
                </button>
              );
            })}

            <div className="h-px bg-border/60 mx-2 my-1" />

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="group flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-background/70 flex items-center justify-center group-hover:bg-destructive/15 transition-colors">
                  <LogOut className="w-4 h-4" />
                </span>
                Log out
              </button>
            ) : (
              <Link
                to="/welcome"
                className="group flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </span>
                Sign in
              </Link>
            )}

            {/* avatar at bottom */}
            <div className="mt-1 pt-2 border-t border-border/60 flex flex-col items-center gap-1 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow ring-2 ring-primary/30 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div className="text-[10px] font-medium truncate max-w-[80px] text-center" title={displayName}>{displayName}</div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6 md:p-8 min-h-[70vh]">
            {tab === "overview" && <OverviewPanel name={displayName} email={email} plan={plan} historyCount={history.length} />}
            {tab === "billing" && <BillingPanel plan={plan} setPlan={setPlan} email={email} historyCount={history.length} />}
            {tab === "history" && <HistoryPanel history={history} />}
            {tab === "settings" && <SettingsPanel email={email} />}
            {tab === "docs" && <DocsPanel />}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewPanel({ name, email, plan, historyCount }: { name: string; email: string; plan: PlanKey; historyCount: number }) {
  const meta = PLAN_META[plan];
  const PlanIcon = meta.icon;
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <User className="w-3 h-3" /> Overview
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{name}</span>
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">Everything about your account in one place.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Current plan" value={meta.name} sub={`${meta.price} ${meta.cadence}`} icon={PlanIcon} />
        <StatCard label="Specs generated" value={String(historyCount)} sub="Lifetime" icon={Sparkles} />
        <StatCard label="Account" value={email.split("@")[0]} sub={email} icon={Shield} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/profile" search={{ tab: "billing" }} className="group rounded-2xl border border-border bg-surface/40 p-5 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display font-semibold">Billing & Plan</div>
          </div>
          <p className="text-sm text-muted-foreground">Manage subscription, payments and invoices.</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
            Open <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>
        <Link to="/profile" search={{ tab: "history" }} className="group rounded-2xl border border-border bg-surface/40 p-5 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display font-semibold">Recent specs</div>
          </div>
          <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
            Open <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Sparkles }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 truncate">{sub}</div>
    </div>
  );
}

/* ---------------- BILLING ---------------- */
function BillingPanel({ plan, setPlan, email, historyCount }: { plan: PlanKey; setPlan: (p: PlanKey) => void; email: string; historyCount: number }) {
  const meta = PLAN_META[plan];
  const PlanIcon = meta.icon;
  const isPaid = plan !== "hobby";
  const usagePct = Math.min(100, Math.round((historyCount / meta.quota) * 100));
  const nextRenewal = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 21);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            <Receipt className="w-3 h-3" /> Billing dashboard
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Billing & Plan</h1>
          <p className="mt-1 text-muted-foreground text-sm">Subscription, payments, invoices and usage.</p>
        </div>
        <Link to="/pricing" className="btn-3d btn-3d-sm btn-3d-outline">
          <ArrowUpRight className="w-3.5 h-3.5" /> Compare plans
        </Link>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Plan */}
        <div className="lg:col-span-2 rounded-2xl border border-primary/40 bg-surface/60 p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <PlanIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Current plan</div>
                <div className="font-display text-2xl font-bold leading-tight">{meta.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold">{meta.price}</div>
              <div className="text-xs text-muted-foreground">{meta.cadence}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Spec generations this cycle</span>
              <span className="font-mono">{historyCount} / {meta.quota >= 999 ? "∞" : meta.quota}</span>
            </div>
            <div className="h-2 rounded-full bg-accent overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${meta.quota >= 999 ? 12 : usagePct}%` }} />
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{isPaid ? "Renews on" : "Plan type"}</div>
                <div className="text-sm font-medium truncate">{isPaid ? nextRenewal : "Free forever"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Account</div>
                <div className="text-sm font-medium truncate">{email}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/pricing" className="btn-3d btn-3d-sm">
              <Zap className="w-3.5 h-3.5" /> {isPaid ? "Change plan" : "Upgrade"}
            </Link>
            {isPaid && (
              <button
                type="button"
                onClick={() => { try { localStorage.setItem("plannr-plan", "hobby"); } catch {} setPlan("hobby"); }}
                className="btn-3d btn-3d-sm btn-3d-outline"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-bold">Payment method</h2>
          </div>
          <div className="relative rounded-xl p-5 bg-gradient-to-br from-primary/15 via-surface to-background border border-primary/30 overflow-hidden">
            <div className="absolute top-2 right-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Default</div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">UPI</div>
                <div className="text-sm font-semibold">India · Instant</div>
              </div>
            </div>
            <div className="font-mono text-sm text-foreground select-all break-all">{UPI_ID}</div>
            <div className="mt-3 text-[10px] text-muted-foreground">GPay · PhonePe · Paytm · BHIM</div>
          </div>
          <button type="button" className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" /> Add card or new method
          </button>
          <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>Cards & Stripe coming soon. UPI is the active method today.</span>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-bold">Invoices</h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{SAMPLE_INVOICES.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-0 hover:bg-background/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{inv.id}</td>
                  <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                  <td className="px-6 py-4">{inv.plan}</td>
                  <td className="px-6 py-4 font-semibold">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-primary/15 text-primary">
                      <Check className="w-3 h-3" /> {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HISTORY ---------------- */
function HistoryPanel({ history }: { history: HistoryItem[] }) {
  const fmt = (ts: number) => {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <History className="w-3 h-3" /> History
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Recent specs</h1>
        <p className="mt-1 text-muted-foreground text-sm">Your latest generated specs and prompts.</p>
      </header>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-12 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="font-display font-semibold mb-1">No history yet</div>
          <p className="text-sm text-muted-foreground mb-4">Generate your first spec to see it here.</p>
          <Link to="/build" className="btn-3d btn-3d-sm">
            <Sparkles className="w-3.5 h-3.5" /> New spec
          </Link>
        </div>
      ) : (
        <ul className="rounded-2xl border border-border bg-surface/40 overflow-hidden divide-y divide-border/60">
          {history.map((h) => (
            <li key={h.id}>
              <Link to="/build" className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-background/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{h.title}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{fmt(h.ts)}</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */
function SettingsPanel({ email }: { email: string }) {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <Settings className="w-3 h-3" /> Settings
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-muted-foreground text-sm">Personalize your workspace and preferences.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <SettingRow icon={Mail} title="Email" desc={email} action="Change" />
        <SettingRow icon={Bell} title="Notifications" desc="Product updates & releases" action="Manage" />
        <SettingRow icon={Moon} title="Appearance" desc="Toggle dark mode in the header" action="—" />
        <SettingRow icon={Shield} title="Security" desc="Sessions managed via Google" action="Review" />
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-display font-semibold text-destructive">Danger zone</div>
            <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all generated specs. This cannot be undone.</p>
            <button type="button" className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, action }: { icon: typeof Sparkles; title: string; desc: string; action: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{desc}</div>
      </div>
      <button type="button" className="text-xs font-medium text-primary hover:underline shrink-0">{action}</button>
    </div>
  );
}

/* ---------------- DOCS ---------------- */
function DocsPanel() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <FileText className="w-3 h-3" /> Docs
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-1 text-muted-foreground text-sm">Guides, API references, and tips to get the most out of PLANNR.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { t: "Getting started", d: "Install, sign in, and ship your first spec in 2 minutes." },
          { t: "Prompt patterns", d: "How to write prompts that produce the best specs." },
          { t: "API reference", d: "Programmatically generate specs from your stack." },
          { t: "Changelog", d: "What's new across PLANNR releases." },
        ].map((c) => (
          <Link key={c.t} to="/docs" className="group rounded-2xl border border-border bg-surface/40 p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="font-display font-semibold">{c.t}</div>
            </div>
            <p className="text-sm text-muted-foreground">{c.d}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
              Read <ArrowUpRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
