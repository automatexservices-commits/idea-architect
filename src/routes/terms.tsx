import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — PLANNR" },
      { name: "description", content: "Read PLANNR's Terms of Service governing use of our spec generation platform." },
      { property: "og:title", content: "Terms of Service — PLANNR" },
      { property: "og:description", content: "The terms that govern your use of PLANNR." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 prose-content">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated: April 2026</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-8">Terms of Service</h1>

          <Section title="1. Acceptance of terms">
            By accessing or using PLANNR ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </Section>

          <Section title="2. The service">
            PLANNR generates product requirement documents, architecture, API specs, design systems and folder structures from short user prompts. Outputs are AI-generated drafts intended to assist your work — not a substitute for professional engineering judgement.
          </Section>

          <Section title="3. Account & eligibility">
            You must be 13 years or older to use PLANNR. You are responsible for safeguarding your account credentials and for all activity that occurs under your account.
          </Section>

          <Section title="4. Acceptable use">
            You agree not to (a) use PLANNR to generate unlawful, harmful, or infringing content; (b) attempt to reverse engineer the Service; (c) resell access to PLANNR without written permission; or (d) use the Service to build a directly competing product.
          </Section>

          <Section title="5. Intellectual property">
            You retain ownership of the prompts you submit and the generated outputs you download. PLANNR retains all rights to the underlying platform, branding and code. A worldwide, non-exclusive licence is granted to PLANNR to process your prompts solely to provide the Service.
          </Section>

          <Section title="6. Payments">
            Paid plans are billed in INR via Razorpay checkout and any other payment methods shown at checkout. Plans renew automatically unless cancelled before the renewal date. All payments are final unless a separate written agreement says otherwise or applicable law requires a different outcome.
          </Section>

          <Section title="7. Disclaimers">
            The Service is provided "as is" without warranties of any kind. AI-generated outputs may contain inaccuracies — review every spec before relying on it for a real project.
          </Section>

          <Section title="8. Limitation of liability">
            To the fullest extent permitted by law, PLANNR shall not be liable for any indirect, incidental, special or consequential damages arising out of your use of the Service.
          </Section>

          <Section title="9. Changes">
            We may update these Terms from time to time. Material changes will be notified in-app or by email. Continued use of the Service constitutes acceptance.
          </Section>

          <Section title="10. Contact">
            Questions? Reach out at <a href="mailto:hello@plannr.app" className="text-primary hover:underline">hello@plannr.app</a>.
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
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
