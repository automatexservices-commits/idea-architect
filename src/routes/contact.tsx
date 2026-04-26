import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Twitter } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PLANNR" },
      { name: "description", content: "Get in touch with the PLANNR team — support, sales, or feedback." },
      { property: "og:title", content: "Contact — PLANNR" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const cards = [
    { icon: Mail, title: "Support", desc: "Bug reports & how-to questions.", action: "hello@plannr.app", href: "mailto:hello@plannr.app" },
    { icon: MessageSquare, title: "Sales", desc: "Enterprise & custom plans.", action: "sales@plannr.app", href: "mailto:sales@plannr.app" },
    { icon: Twitter, title: "Twitter", desc: "Product updates & community.", action: "@plannr", href: "https://twitter.com" },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
            Let's <span className="gradient-text">talk.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            We read every message. Pick the channel that fits your question.
          </p>

          <div className="mt-14 grid sm:grid-cols-3 gap-5">
            {cards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group p-6 rounded-2xl border border-border bg-surface/60 hover:border-primary/40 hover:bg-surface transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:glow-primary-sm transition-all">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{c.desc}</p>
                <div className="text-sm font-mono text-primary">{c.action} →</div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
