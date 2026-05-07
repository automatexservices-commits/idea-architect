import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing - PLANNR" },
      { name: "description", content: "Simple plans for indie devs, founders, and teams. Start free." },
      { property: "og:title", content: "Pricing - PLANNR" },
      { property: "og:description", content: "Free for solo builders. Pro for shipping startups. Enterprise for organizations." },
    ],
  }),
  component: PricingPage,
});

type Tier = {
  name: string;
  price: string;
  cadence: string;
  icon: typeof Sparkles;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
  href?: string;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "Free",
    cadence: "lifetime",
    icon: Sparkles,
    desc: "Perfect for solo builders and experimenting with specs.",
    features: ["3 specs", "PRD + Architecture", "ZIP export", "Community support"],
    cta: "Start free",
    highlight: false,
    href: "/build",
  },
  {
    name: "Pro",
    price: "Rs 49",
    cadence: "/ month",
    icon: Zap,
    desc: "For founders shipping real products.",
    features: ["7 specs / month", "All 7 docs", "Priority AI", "GitHub sync (soon)", "Email support"],
    cta: "Get Pro",
    highlight: true,
    href: "/billing",
  },
  {
    name: "Enterprise",
    price: "Rs 150",
    cadence: "/ month",
    icon: Crown,
    desc: "For agencies and product teams.",
    features: ["15 specs / month", "Everything in Pro", "Priority support"],
    cta: "Get enterprise",
    highlight: false,
    href: "/billing",
  },
  {
    name: "Launch Pack",
    price: "Rs 299",
    cadence: "/ year",
    icon: Building2,
    desc: "A limited-time, slightly crazy bundle to help you blast off.",
    features: [
      "100 specs for 3 months",
      "Personal onboarding call",
      "Featured in our community showcase",
      "Early access to new AI features",
      "20% lifetime discount on renewals",
    ],
    cta: "Claim Launch Pack",
    highlight: false,
    href: "/billing",
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
              Start free. Upgrade when you ship. Cancel anytime.
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
                  {t.href ? (
                    <Link
                      to={t.href}
                      className={`btn-3d btn-3d-sm w-full ${t.highlight ? "" : "btn-3d-outline"}`}
                    >
                      {t.cta}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Removed the temporary pricing note card per design: keep layout clean */}
          </div>
        </section>
      </main>
    </div>
  );
}
