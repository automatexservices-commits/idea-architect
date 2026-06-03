import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  ChevronRight,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import razorpayLogo from "@/assets/razorpay-logo.png";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/features/auth";
import {
  fetchBillingDashboard,
  openPricingCheckout,
  type BillingDashboardResponse,
  type BillingPaymentRecord,
  type PricingPlanId,
} from "@/features/billing/checkout";
import { PricingCards } from "@/features/billing/plans";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "PLANNR Dashboard | Your Daily Command Center" },
      { name: "description", content: "Track tasks, deadlines, priorities, and progress in PLANNR's dashboard built for focused study and work." },
      { property: "og:title", content: "PLANNR Dashboard | Your Daily Command Center" },
      { property: "og:description", content: "Track tasks, deadlines, priorities, and progress in PLANNR's dashboard built for focused study and work." },
    ],
  }),
  component: BillingDashboardPage,
});

function BillingDashboardPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [billing, setBilling] = useState<BillingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<PricingPlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    return (
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.user_metadata?.name as string | undefined) ||
      user?.email ||
      "Guest builder"
    );
  }, [user]);

  const email = user?.email ?? "guest@plannr.app";

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        if (mounted) {
          setBilling(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchBillingDashboard();
        if (mounted) {
          setBilling(data);
        }
      } catch (err) {
        if (mounted) {
          setBilling(null);
          setError(err instanceof Error ? err.message : "Unable to load billing dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session?.accessToken]);

  const currentPlan = billing?.summary.currentPlan ?? (session?.user ? "Hobby" : "Guest");
  const totalSpent = `Rs ${(billing?.summary.totalSpentInInr ?? 0).toFixed(2)}`;
  const paymentCount = billing?.summary.paymentCount ?? 0;
  const latestPayment = billing?.summary.latestPaymentAt
    ? new Date(billing.summary.latestPaymentAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No verified payment yet";

  const refreshBilling = async () => {
    if (!session?.accessToken) return;
    const data = await fetchBillingDashboard();
    setBilling(data);
  };

  const startCheckout = async () => {
    await handlePlanCheckout("pro");
  };

  const handlePlanCheckout = async (plan: PricingPlanId) => {
    if (plan === "free") {
      navigate({ to: "/build" });
      return;
    }

    if (!session?.accessToken) {
      setNotice(null);
      setError("Please sign in before starting Razorpay checkout.");
      return;
    }

    setBusyPlan(plan);
    setNotice(null);
    setError(null);
    try {
      const payment = await openPricingCheckout(plan, {
        email: user?.email ?? undefined,
        name: displayName,
      });
      if (payment) {
        setNotice(`Payment recorded: ${payment.payment_id}. Your billing history is updated.`);
        await refreshBilling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setBusyPlan(null);
    }
  };

  const planCards = (
    <PricingCards
      compact
      onFreeAction={() => navigate({ to: "/build" })}
      onPlanAction={handlePlanCheckout}
      busyPlan={busyPlan}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-35 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        <div className="absolute left-[-8%] top-10 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[5%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.28em] text-muted-foreground">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  Billing dashboard
                </div>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Hello, <span className="text-primary">{displayName}</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Manage your subscription, payment methods, and verified payment history from one polished dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Compare plans
                </Link>
                <button
                  type="button"
                  onClick={startCheckout}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_6px_0_0_rgb(15_118_110)] transition-transform hover:translate-y-[1px] disabled:opacity-70"
                  disabled={busyPlan !== null}
                >
                  {busyPlan ? "Opening checkout..." : "Upgrade now"}
                </button>
              </div>
            </div>
          </section>

          {notice && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="mt-8 rounded-[2rem] border border-border bg-white/80 p-5 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Plans</div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Compact pricing</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: "/pricing" })}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-transform hover:scale-[1.01]"
              >
                Expand plans
              </button>
            </div>
            <div className="mt-5">{planCards}</div>
          </section>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <section className="rounded-[2rem] border border-primary/20 bg-white/80 p-5 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.35)] lg:col-span-2 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Current plan</div>
                    <div className="font-display text-3xl font-bold tracking-tight text-foreground">{currentPlan}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold text-foreground">
                    {billing?.summary.accountRole === "pro" ? "Paid" : "Free"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {billing?.summary.accountRole === "pro" ? "active subscription" : "forever"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Plan type</div>
                  <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    {billing?.summary.accountRole === "pro" ? "Pro subscription" : "Free tier"}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Account</div>
                  <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {email}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Verified payments</div>
                    <div className="mt-2 text-2xl font-semibold">{paymentCount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Latest payment</div>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                      <Zap className="h-4 w-4 text-primary" />
                      {latestPayment}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-primary/15">
                  <div className="h-2 w-[12%] rounded-full bg-primary" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Total spent</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">{totalSpent}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Verified by Razorpay</div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Payment method</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">UPI + Razorpay</div>
                  <div className="mt-1 text-sm text-muted-foreground">Live checkout enabled</div>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Status</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">
                    {loading ? "Loading" : billing?.summary.accountRole === "pro" ? "Active" : "Free"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {loading ? "Syncing billing data" : "Account ready"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startCheckout}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_6px_0_0_rgb(15_118_110)] transition-transform hover:translate-y-[1px] disabled:opacity-70"
                  disabled={busyPlan !== null}
                >
                  <CreditCard className="h-4 w-4" />
                  Upgrade with Razorpay
                </button>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.01]"
                >
                  View pricing
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-border bg-white/80 p-5 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Banknote className="h-5 w-5 text-primary" />
                Payment methods
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-border bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f172a] shadow-sm ring-1 ring-border">
                        <img src={razorpayLogo} alt="Razorpay logo" className="h-4 w-auto object-contain" />
                      </div>
                      <div>
                        <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Razorpay</div>
                        <div className="mt-1 text-lg font-semibold">Checkout powered</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-border bg-white px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      Secure
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Accepts UPI, cards, netbanking, wallets, and other Razorpay-supported methods.
                  </p>
                  <button
                    type="button"
                    onClick={startCheckout}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.01] disabled:opacity-70"
                    disabled={busyPlan !== null}
                  >
                    Open Razorpay checkout
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/60 p-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <p>
                    Razorpay payments are verified before they are written to your billing history. UPI opens your native app
                    using the configured payee ID.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-8 rounded-[2rem] border border-border bg-white/80 p-5 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Billing history</div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Verified payments</h2>
              </div>
              <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
                {billing?.payments.length ?? 0} records
              </div>
            </div>

            {loading && <div className="mt-5 text-sm text-muted-foreground">Loading billing history...</div>}

            {!loading && (billing?.payments.length ?? 0) === 0 && (
              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted-foreground">
                No verified payments yet. Once a Razorpay payment succeeds, it will appear here automatically.
              </div>
            )}

            {!loading && (billing?.payments.length ?? 0) > 0 && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-border">
                <table className="min-w-full divide-y divide-border text-left">
                  <thead className="bg-surface/60">
                    <tr className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Plan</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Method</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {(billing?.payments ?? []).map((payment) => (
                      <tr key={payment.id} className="text-sm">
                        <td className="px-5 py-5 text-muted-foreground">{formatPaymentDate(payment)}</td>
                        <td className="px-5 py-5 font-medium text-foreground">{formatPlanLabel(payment.plan)}</td>
                        <td className="px-5 py-5 font-semibold text-foreground">Rs {payment.amount_in_inr.toFixed(2)}</td>
                        <td className="px-5 py-5 text-foreground">{payment.method ?? "razorpay"}</td>
                        <td className="px-5 py-5">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                              payment.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : payment.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700",
                            ].join(" ")}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="text-sm font-medium text-foreground">{shortReference(payment.payment_id)}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{payment.receipt}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface/50 p-4">
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Payment speed</div>
                <div className="mt-2 text-lg font-semibold">Instant UPI first</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface/50 p-4">
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Security</div>
                <div className="mt-2 text-lg font-semibold">Razorpay verified</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface/50 p-4">
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">Billing cycle</div>
                <div className="mt-2 text-lg font-semibold">Monthly renewal</div>
              </div>
            </div>

            {!session?.user && (
              <div className="mt-4 text-sm text-muted-foreground">
                Sign in to sync your billing state and verified payment history.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function formatPaymentDate(payment: BillingPaymentRecord) {
  return new Date(payment.paid_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPlanLabel(plan: BillingPaymentRecord["plan"]) {
  if (plan === "pro") return "Pro Monthly";
  if (plan === "enterprise") return "Enterprise";
  return "Custom";
}

function shortReference(reference: string) {
  if (reference.length <= 10) return reference;
  return `${reference.slice(0, 5)}...${reference.slice(-4)}`;
}
