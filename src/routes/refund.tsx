import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — PLANNR" },
      { name: "description", content: "Our refund and cancellation policy for paid plans." },
      { property: "og:title", content: "Refund Policy — PLANNR" },
      { property: "og:description", content: "Clear, fair refunds. Cancel anytime." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated: April 2026</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-8">Refund Policy</h1>

          <Section title="7-day money back">
            If you're not satisfied with a paid plan, request a full refund within 7 days of purchase — no questions asked.
          </Section>

          <Section title="How to request a refund">
            Email <a href="mailto:billing@plannr.app" className="text-primary hover:underline">billing@plannr.app</a> from your account email with your transaction ID. We process refunds within 5–7 business days back to the original payment method.
          </Section>

          <Section title="Cancellations">
            You can cancel anytime from your account. Your plan stays active until the end of the current billing cycle.
          </Section>

          <Section title="Exceptions">
            Refunds may be denied if there is evidence of abuse — for example, generating thousands of specs and then requesting a refund.
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
