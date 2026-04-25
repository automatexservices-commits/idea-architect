import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Crown, Building2, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PLANNR" },
      { name: "description", content: "Simple plans for indie devs, founders, and teams. Pay instantly via UPI. Start free." },
      { property: "og:title", content: "Pricing — PLANNR" },
      { property: "og:description", content: "Free for solo builders. Pro for shipping startups. Enterprise for organizations. UPI payments supported." },
    ],
  }),
  component: PricingPage,
});

/* ─────────── UPI configuration ─────────── */
const UPI_ID = "7984390066@ptyes";
const UPI_NAME = "PLANNR";

/** Build a UPI deeplink (upi://pay) — opens GPay / PhonePe / Paytm / any UPI app. */
function upiLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

type Tier = {
  name: string;
  price: string;
  cadence: string;
  icon: typeof Sparkles;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
  /** UPI amount in INR — undefined means no UPI charge (free / contact-sales). */
  amount?: number;
  /** Override the CTA href (e.g. mailto for sales). */
  href?: string;
};

const TIERS: Tier[] = [
  {
    name: "Hobby",
    price: "Free",
    cadence: "forever",
    icon: Sparkles,
    desc: "For weekend builders kicking the tires.",
    features: ["3 specs / month", "PRD + Architecture", "ZIP export", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹49",
    cadence: "/ month",
    icon: Zap,
    desc: "For founders shipping real products.",
    features: ["Unlimited specs", "All 7 docs", "Priority AI", "GitHub sync (soon)", "Email support"],
    cta: "Pay ₹49 via UPI",
    highlight: true,
    amount: 49,
  },
  {
    name: "Enterprise",
    price: "₹150",
    cadence: "/ month",
    icon: Crown,
    desc: "For agencies and product teams.",
    features: ["Everything in Pro", "5 seats included", "Shared workspace", "Custom templates", "Priority support"],
    cta: "Pay ₹150 via UPI",
    highlight: false,
    amount: 150,
  },
  {
    name: "Custom",
    price: "Let's talk",
    cadence: "tailored",
    icon: Building2,
    desc: "Bespoke deployments, SLAs, and security reviews.",
    features: ["Unlimited seats", "On-prem / VPC option", "Custom integrations", "Dedicated success manager", "24/7 SLA support"],
    cta: "Contact sales",
    highlight: false,
    href: "mailto:hello@plannr.app?subject=Custom%20plan%20enquiry",
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
              Pay for <span className="gradient-text">specs</span>, not seats.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Start free. Upgrade when you ship. Cancel anytime — your specs stay yours.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative rounded-2xl border p-6 transition-all flex flex-col ${
                    t.highlight
                      ? "border-primary bg-surface/80 glow-primary-sm lg:scale-[1.03]"
                      : "border-border bg-surface/40 hover:border-primary/30"
                  }`}
                >
                  {t.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider font-bold">
                      Most popular
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-5">
                    <t.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-6 min-h-[40px]">{t.desc}</p>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold">{t.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{t.cadence}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {t.amount ? (
                    <a
                      href={upiLink(t.amount, `PLANNR ${t.name} plan`)}
                      className={`btn-3d btn-3d-sm w-full ${t.highlight ? "" : "btn-3d-outline"}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {t.cta}
                    </a>
                  ) : t.href ? (
                    <a
                      href={t.href}
                      className={`btn-3d btn-3d-sm w-full ${t.highlight ? "" : "btn-3d-outline"}`}
                    >
                      {t.cta}
                    </a>
                  ) : (
                    <Link
                      to="/build"
                      className={`btn-3d btn-3d-sm w-full ${t.highlight ? "" : "btn-3d-outline"}`}
                    >
                      {t.cta}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* UPI payment panel */}
            <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-border bg-surface/60 p-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-mono uppercase tracking-wider mb-4">
                <Smartphone className="w-3 h-3" /> UPI · India
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Instant payment via UPI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tap any paid plan above and your UPI app (GPay, PhonePe, Paytm, BHIM) opens with the amount pre-filled.
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background border border-border font-mono text-sm">
                <span className="text-muted-foreground">UPI ID:</span>
                <span className="font-semibold text-foreground select-all">{UPI_ID}</span>
              </div>
            </div>

            <div className="mt-10 text-center text-sm text-muted-foreground">
              All plans include unlimited downloads and lifetime access to specs you generate.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
