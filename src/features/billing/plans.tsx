import { createElement } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

import type { PricingPlanId } from "./pricing-config";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: string;
  cadence: string;
  icon: typeof Sparkles;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    cadence: "lifetime",
    icon: Sparkles,
    desc: "Best for trying PLANNR with a single generation.",
    features: ["1 generation lifetime", "PRD + Architecture", "ZIP export", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rs 49",
    cadence: "/ month",
    icon: Zap,
    desc: "For founders who need monthly generation capacity.",
    features: ["5 generations / month", "All 7 docs", "Priority AI", "GitHub sync (soon)", "Email support"],
    cta: "Get Pro",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Rs 150",
    cadence: "/ month",
    icon: Crown,
    desc: "For teams that need the highest monthly generation limit.",
    features: ["10 generations / month", "Everything in Pro", "Priority support"],
    cta: "Get enterprise",
    highlight: false,
  },
];

export function PricingCards({
  compact = false,
  onFreeAction,
  onPlanAction,
  busyPlan,
}: {
  compact?: boolean;
  onFreeAction?: () => void;
  onPlanAction?: (plan: PricingPlanId) => void;
  busyPlan?: PricingPlanId | null;
}) {
  const visiblePlans = PRICING_PLANS;

  return (
    <div className={compact ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4" : "mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
      {visiblePlans.map((plan) => {
        const featureCount = compact ? Math.min(plan.features.length, 2) : plan.features.length;
        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border transition-all flex flex-col ${
              compact
                ? "p-4 bg-surface/35"
                : "p-6 bg-surface/40"
            } ${
              plan.highlight
                ? "border-primary bg-surface/80 glow-primary-sm"
                : "border-border hover:border-primary/30"
            }`}
          >
            {plan.highlight && !compact && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider font-bold">
                Most popular
              </div>
            )}
            <div className={`rounded-lg bg-accent flex items-center justify-center ${compact ? "w-9 h-9 mb-4" : "w-10 h-10 mb-5"}`}>
              {createElement(plan.icon, { className: compact ? "w-4 h-4 text-primary" : "w-5 h-5 text-primary" })}
            </div>
            <h3 className={`${compact ? "font-semibold text-xl" : "font-display text-2xl font-bold"}`}>{plan.name}</h3>
            <p className={`${compact ? "text-xs mt-1 mb-4 min-h-[28px]" : "text-sm mt-1 mb-6 min-h-[40px]"} text-muted-foreground`}>
              {plan.desc}
            </p>
            <div className={compact ? "mb-4" : "mb-6"}>
              <span className={`${compact ? "text-3xl" : "text-4xl"} font-display font-bold`}>{plan.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{plan.cadence}</span>
            </div>
            <ul className={`${compact ? "space-y-2 mb-5" : "space-y-3 mb-8"} flex-1`}>
              {plan.features.slice(0, featureCount).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => (plan.id === "free" ? onFreeAction?.() : onPlanAction?.(plan.id))}
              disabled={plan.id !== "free" && busyPlan === plan.id}
              className={`btn-3d btn-3d-sm w-full ${plan.highlight ? "" : "btn-3d-outline"}`}
            >
              {plan.id !== "free" && busyPlan === plan.id ? "Opening checkout..." : plan.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}
