import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PLANNR" },
      { name: "description", content: "How PLANNR collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — PLANNR" },
      { property: "og:description", content: "Our commitment to your privacy and how your data is handled." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated: April 2026</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-8">Privacy Policy</h1>

          <Section title="What we collect">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><b>Account data</b> — email, display name, hashed password.</li>
              <li><b>Prompts & specs</b> — the inputs you submit and the outputs we generate.</li>
              <li><b>Usage data</b> — pages visited, features used, errors encountered (anonymised).</li>
              <li><b>Payment data</b> — handled by our payment partners; we never store card numbers.</li>
            </ul>
          </Section>

          <Section title="How we use it">
            To operate the Service, generate specs, improve quality, prevent abuse, and communicate important updates. We do not sell your personal data.
          </Section>

          <Section title="AI processing">
            Your prompts are sent to AI model providers strictly to generate your spec. We do not use your prompts to train foundation models without explicit opt-in.
          </Section>

          <Section title="Data retention">
            Generated specs are stored as long as your account is active. You can delete any spec at any time. Account deletion removes your data within 30 days.
          </Section>

          <Section title="Your rights">
            You may access, correct, export, or delete your personal data at any time by contacting <a href="mailto:privacy@plannr.app" className="text-primary hover:underline">privacy@plannr.app</a>.
          </Section>

          <Section title="Security">
            We use industry-standard encryption in transit (TLS) and at rest. Access to production data is restricted and audited.
          </Section>

          <Section title="Children">
            PLANNR is not directed to children under 13.
          </Section>

          <Section title="Contact">
            Questions about privacy? Email <a href="mailto:privacy@plannr.app" className="text-primary hover:underline">privacy@plannr.app</a>.
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
