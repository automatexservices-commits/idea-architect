import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — PLANNR" },
      { name: "description", content: "How PLANNR uses cookies and similar technologies." },
      { property: "og:title", content: "Cookie Policy — PLANNR" },
      { property: "og:description", content: "Cookies, local storage, and analytics — explained." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated: April 2026</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-8">Cookie Policy</h1>

          <Section title="What cookies we use">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><b>Essential</b> — required for login sessions and security.</li>
              <li><b>Preferences</b> — remember your theme, language, and intro state.</li>
              <li><b>Analytics</b> — anonymised usage to improve the product.</li>
            </ul>
          </Section>

          <Section title="Local storage">
            We use browser local & session storage for things like your spec history and the welcome-gate state. This data never leaves your device.
          </Section>

          <Section title="Managing cookies">
            You can clear cookies and local storage at any time from your browser settings. Disabling essential cookies may break login.
          </Section>

          <Section title="Third parties">
            Limited third-party cookies may be set by our analytics and payment providers. We do not allow them to use the data for advertising.
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
