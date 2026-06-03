import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/features/auth";
import { openPricingCheckout, type PricingPlanId } from "@/features/billing/checkout";
import { PricingCards } from "@/features/billing/plans";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "PLANNR Pricing | Find Your Best Fit" },
      { name: "description", content: "Choose a PLANNR plan with 1 lifetime generation on Free, 5 monthly generations on Pro, and 10 monthly generations on Enterprise." },
      { property: "og:title", content: "PLANNR Pricing | Find Your Best Fit" },
      { property: "og:description", content: "Choose a PLANNR plan with 1 lifetime generation on Free, 5 monthly generations on Pro, and 10 monthly generations on Enterprise." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const busyPlan = null;

  const handleFree = () => navigate({ to: "/build" });

  const handlePlan = async (plan: PricingPlanId) => {
    try {
      await openPricingCheckout(plan, {
        email: user?.email ?? undefined,
        name:
          (user?.user_metadata?.full_name as string | undefined) ||
          (user?.user_metadata?.name as string | undefined) ||
          user?.email ||
          undefined,
      });
    } catch {
      // Keep the UI quiet; Razorpay errors already surface through the checkout flow.
    }
  };

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
            <PricingCards compact={false} onFreeAction={handleFree} onPlanAction={handlePlan} busyPlan={busyPlan} />

            {/* Removed the temporary pricing note card per design: keep layout clean */}
          </div>
        </section>
      </main>
    </div>
  );
}
