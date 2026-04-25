import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PLANNR" },
      { name: "description", content: "Simple plans for indie devs, founders, and teams. Start free." },
      { property: "og:title", content: "Pricing — PLANNR" },
      { property: "og:description", content: "Free for solo builders. Pro for shipping startups. Team for organizations." },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Hobby",
    price: "$0",
    cadence: "forever",
    icon: Sparkles,
    desc: "For weekend builders kicking the tires.",
    features: ["3 specs / month", "PRD + Architecture", "ZIP export", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    icon: Zap,
    desc: "For founders shipping real products.",
    features: ["Unlimited specs", "All 7 docs", "Priority AI", "GitHub sync (soon)", "Email support"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    cadence: "/ month",
    icon: Crown,
    desc: "For agencies and product teams.",
    features: ["Everything in Pro", "5 seats included", "Shared workspace", "Custom templates", "Priority support"],
    cta: "Contact sales",
    highlight: false,
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
            <div className="grid md:grid-cols-3 gap-5">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative rounded-2xl border p-7 transition-all ${
                    t.highlight
                      ? "border-primary bg-surface/80 glow-primary-sm scale-[1.02]"
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
                  <p className="text-sm text-muted-foreground mt-1 mb-6">{t.desc}</p>
                  <div className="mb-6">
                    <span className="font-display text-5xl font-bold">{t.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{t.cadence}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/build"
                    className={`block text-center px-5 py-3 rounded-xl font-medium transition-all ${
                      t.highlight
                        ? "bg-primary text-primary-foreground glow-primary-sm hover:scale-[1.02]"
                        : "bg-surface border border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center text-sm text-muted-foreground">
              All plans include unlimited downloads and lifetime access to specs you generate.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
