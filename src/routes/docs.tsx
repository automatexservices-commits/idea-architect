import { createFileRoute, Link } from "@tanstack/react-router";
import { Book, FileText, Layers, Workflow, Code2, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — PLANNR" },
      { name: "description", content: "Learn how PLANNR structures ideas into shippable specs." },
      { property: "og:title", content: "Docs — PLANNR" },
      { property: "og:description", content: "Guides for getting the most out of PLANNR." },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  { icon: Lightbulb, title: "Getting Started", desc: "Your first spec in under 5 minutes.", id: "start" },
  { icon: Workflow, title: "The 5-Step Flow", desc: "Idea → Clarify → Stack → Generate → Export.", id: "flow" },
  { icon: FileText, title: "What's Generated", desc: "Each of the 7 documents and their structure.", id: "outputs" },
  { icon: Layers, title: "Stack Recommendations", desc: "How PLANNR picks frontend, backend, DB, auth.", id: "stack" },
  { icon: Code2, title: "Using With AI Coders", desc: "Hand-off patterns for Cursor, Claude, Lovable.", id: "handoff" },
  { icon: Book, title: "FAQ", desc: "Answers to common questions.", id: "faq" },
];

function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/50">
          <div className="mx-auto max-w-5xl px-6 pt-20 pb-10">
            <div className="text-xs font-mono uppercase tracking-wider text-primary mb-3">Documentation</div>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
              Everything you need to ship a spec.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Concise guides on each part of the PLANNR workflow.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group flex gap-4 p-5 rounded-2xl border border-border bg-surface/40 hover:border-primary/40 hover:bg-surface/80 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 group-hover:glow-primary-sm transition-all">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="py-10 border-t border-border/50">
          <div className="mx-auto max-w-3xl px-6 space-y-14">
            <Block id="start" title="Getting Started">
              Type a one-liner. Anything from "AI tool for chefs" to a multi-paragraph brief. PLANNR parses it,
              extracts a working project name, and queues 6–8 clarifying questions. No account required to try.
            </Block>
            <Block id="flow" title="The 5-Step Flow">
              <ol className="space-y-2 list-decimal pl-5 marker:text-primary marker:font-mono">
                <li><b>Idea</b> — drop your concept.</li>
                <li><b>Clarify</b> — answer multiple-choice questions (or write your own).</li>
                <li><b>Stack</b> — review and override the recommended stack.</li>
                <li><b>Generate</b> — watch all 7 docs stream in.</li>
                <li><b>Export</b> — download a clean ZIP, or open it in your AI editor.</li>
              </ol>
            </Block>
            <Block id="outputs" title="What's Generated">
              <ul className="space-y-1.5 text-sm">
                <li>📄 <b>PRD.md</b> — vision, users, problems, success metrics.</li>
                <li>📄 <b>SRS.md</b> — functional & non-functional requirements.</li>
                <li>📄 <b>ARCHITECTURE.md</b> — system diagram, data flow, services.</li>
                <li>📄 <b>DESIGN_SYSTEM.md</b> — colors, typography, components.</li>
                <li>📄 <b>API_SPEC.md</b> — endpoints, schemas, auth model.</li>
                <li>📄 <b>FOLDER_STRUCTURE.json</b> — opinionated tree for your stack.</li>
                <li>📄 <b>README.md</b> — onboarding and run instructions.</li>
              </ul>
            </Block>
            <Block id="stack" title="Stack Recommendations">
              PLANNR weighs your answers (scale, team size, platform, AI features) and recommends a coherent stack.
              Override anything — your changes flow into every downstream doc.
            </Block>
            <Block id="handoff" title="Using With AI Coders">
              Drop the ZIP into your editor's project root. Most AI coders (Cursor, Lovable, Claude Code) will
              read README.md and PRD.md first — that's by design. Folder structure gives them scaffold targets.
            </Block>
            <Block id="faq" title="FAQ">
              <p className="text-sm"><b>Does PLANNR write code?</b> No. It produces the planning artifacts your AI coder needs.</p>
              <p className="text-sm mt-2"><b>Can I edit the docs?</b> Yes — they're plain markdown.</p>
              <p className="text-sm mt-2"><b>Is my idea stored?</b> Specs are saved to your account. Delete anytime.</p>
            </Block>
          </div>
        </section>

        <div className="py-16 text-center border-t border-border/50">
          <Link
            to="/build"
            className="btn-3d"
          >
            Try it now
          </Link>
        </div>
      </main>
    </div>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-bold mb-3 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        {title}
      </h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
