import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Billing Policy - PLANNR" },
      { name: "description", content: "Billing, cancellation, and payment handling for PLANNR." },
      { property: "og:title", content: "Billing Policy - PLANNR" },
      { property: "og:description", content: "Billing and cancellation details for PLANNR plans." },
    ],
  }),
  component: BillingPolicyPage,
});

function BillingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 prose-content">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated: April 2026</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-8">Billing Policy</h1>

          <Section title="No refunds">
            PLANNR does not offer refunds on subscription or custom plan purchases unless we state otherwise in writing or unless applicable law requires it.
          </Section>

          <Section title="Cancellations">
            You can cancel recurring plans from your account or by contacting support. Access stays active until the end of the current billing cycle.
          </Section>

          <Section title="Payment processing">
            Payments are handled by Razorpay. We do not store card numbers, UPI credentials, or other sensitive payment details on our servers.
          </Section>

          <Section title="Billing help">
            If a charge looks incorrect, email <a href="mailto:billing@plannr.app" className="text-primary hover:underline">billing@plannr.app</a> and include your transaction ID.
          </Section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}
