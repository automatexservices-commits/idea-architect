import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Sparkles,
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
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Plans — PLANNR" },
      { name: "description", content: "Manage your PLANNR subscription, payment methods, invoices, and usage in one professional billing dashboard." },
      { property: "og:title", content: "Billing Dashboard — PLANNR" },
      { property: "og:description", content: "Subscription, payments, invoices and usage for your PLANNR workspace." },
    ],
  }),
  component: BillingPage,
});

const UPI_ID = "7984390066@ptyes";

type PlanKey = "hobby" | "pro" | "enterprise";

const PLAN_META: Record<PlanKey, { name: string; price: string; cadence: string; icon: typeof Sparkles; quota: number }> = {
  hobby: { name: "Hobby", price: "Free", cadence: "forever", icon: Sparkles, quota: 3 },
  pro: { name: "Pro", price: "₹49", cadence: "/ month", icon: Zap, quota: 999 },
  enterprise: { name: "Enterprise", price: "₹150", cadence: "/ month", icon: Crown, quota: 9999 },
};

type Invoice = {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: "Paid" | "Pending" | "Failed";
};

const SAMPLE_INVOICES: Invoice[] = [
  { id: "INV-2026-0421", date: "Apr 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2026-0321", date: "Mar 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2026-0221", date: "Feb 21, 2026", amount: "₹49.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2026-0121", date: "Jan 21, 2026", amount: "₹0.00", plan: "Hobby · Free", status: "Paid" },
];

function loadUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("plannr-history");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function loadPlan(): PlanKey {
  if (typeof window === "undefined") return "hobby";
  try {
    const p = localStorage.getItem("plannr-plan");
    if (p === "pro" || p === "enterprise" || p === "hobby") return p;
  } catch {}
  return "hobby";
}

function BillingPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanKey>("hobby");
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    setPlan(loadPlan());
    setUsage(loadUsage());
  }, []);

  const meta = PLAN_META[plan];
  const PlanIcon = meta.icon;
  const isPaid = plan !== "hobby";
  const usagePct = Math.min(100, Math.round((usage / meta.quota) * 100));

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Guest builder";
  const email = user?.email || "guest@plannr.app";

  // Next renewal: 30 days from "now" (display only)
  const nextRenewal = new Date();
  nextRenewal.setDate(nextRenewal.getDate() + 21);
  const renewalStr = nextRenewal.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              <Receipt className="w-3 h-3" />
              Billing dashboard
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                  Hello, <span className="gradient-text">{displayName}</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your subscription, payment methods, and invoices.
                </p>
              </div>
              <Link to="/pricing" className="btn-3d btn-3d-sm btn-3d-outline self-start md:self-end">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Compare plans
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-3 gap-6">
          {/* Current plan card */}
          <div className="lg:col-span-2 rounded-2xl border border-primary/40 bg-surface/60 p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <PlanIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Current plan
                  </div>
                  <div className="font-display text-2xl font-bold leading-tight">{meta.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-bold">{meta.price}</div>
                <div className="text-xs text-muted-foreground">{meta.cadence}</div>
              </div>
            </div>

            {/* Usage */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Spec generations this cycle
                </span>
                <span className="font-mono">
                  {usage} / {meta.quota === 999 || meta.quota === 9999 ? "∞" : meta.quota}
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                  style={{ width: `${meta.quota >= 999 ? 12 : usagePct}%` }}
                />
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {isPaid ? "Renews on" : "Plan type"}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {isPaid ? renewalStr : "Free forever"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Account
                  </div>
                  <div className="text-sm font-medium truncate">{email}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/pricing" className="btn-3d btn-3d-sm">
                <Zap className="w-3.5 h-3.5" />
                {isPaid ? "Change plan" : "Upgrade"}
              </Link>
              {isPaid && (
                <button
                  type="button"
                  onClick={() => {
                    try { localStorage.setItem("plannr-plan", "hobby"); } catch {}
                    setPlan("hobby");
                  }}
                  className="btn-3d btn-3d-sm btn-3d-outline"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-border bg-surface/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="font-display text-lg font-bold">Payment method</h2>
              </div>
            </div>

            {/* UPI card */}
            <div className="relative rounded-xl p-5 bg-gradient-to-br from-primary/15 via-surface to-background border border-primary/30 overflow-hidden">
              <div className="absolute top-2 right-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                Default
              </div>
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
              <div className="mt-3 text-[10px] text-muted-foreground">
                GPay · PhonePe · Paytm · BHIM
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add card or new method
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
              <span>Cards & Stripe coming soon. UPI is the active method today.</span>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Total spent", value: isPaid ? "₹147.00" : "₹0.00", sub: isPaid ? "Last 3 cycles" : "No charges yet" },
              { label: "Specs generated", value: String(usage), sub: "Lifetime" },
              { label: "Member since", value: "Apr 2026", sub: email },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface/40 p-5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="font-display text-2xl font-bold mt-1">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Invoices */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <h2 className="font-display text-lg font-bold">Invoices</h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {SAMPLE_INVOICES.length} records
              </span>
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
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            inv.status === "Paid"
                              ? "bg-primary/15 text-primary"
                              : inv.status === "Pending"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {inv.status === "Paid" && <Check className="w-3 h-3" />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
