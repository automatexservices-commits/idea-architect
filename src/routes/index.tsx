import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, FileCode, Layers, Download, Brain, Zap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLANNR — From idea to production-ready spec in minutes" },
      { name: "description", content: "PLANNR turns vague app ideas into PRDs, architecture, API specs, and design systems. Built for indie devs, vibe coders, and founders." },
      { property: "og:title", content: "PLANNR — From idea to production-ready spec in minutes" },
      { property: "og:description", content: "Skip the tool switching. Generate PRD, SRS, architecture, design system, and API spec in one structured workflow." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 text-xs text-muted-foreground mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Product Thinking System
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-up" style={{ animationDelay: "0.1s" }}>
            From <span className="gradient-text">vibe</span> to
            <br />
            <span className="text-glow">production spec.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            PLANNR turns a one-line idea into a complete project package — PRD, architecture, API spec, design system, and folder structure. Ready to build.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link
              to="/build"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium glow-primary hover:scale-[1.02] transition-transform"
            >
              Start Building Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              See how it works →
            </a>
          </div>

          {/* Mock terminal preview */}
          <div className="mt-20 mx-auto max-w-4xl animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl shadow-elevated overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                </div>
                <div className="flex-1 text-center text-xs font-mono text-muted-foreground">~/specai/my-saas</div>
              </div>
              <div className="p-6 font-mono text-sm text-left grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-muted-foreground">📁 my-saas/</div>
                  <div className="text-muted-foreground pl-4">📁 docs/</div>
                  <div className="pl-8 text-foreground">📄 PRD.md</div>
                  <div className="pl-8 text-foreground">📄 SRS.md</div>
                  <div className="pl-8 text-foreground">📄 ARCHITECTURE.md</div>
                  <div className="text-muted-foreground pl-4">📁 design/</div>
                  <div className="pl-8 text-foreground">📄 DESIGN_SYSTEM.md</div>
                  <div className="text-muted-foreground pl-4">📁 api/</div>
                  <div className="pl-8 text-foreground">📄 API_SPEC.md</div>
                  <div className="pl-4 text-primary">📄 README.md</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    Generating PRD...
                  </div>
                  <div className="flex items-center gap-2 text-primary/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Architecture defined
                  </div>
                  <div className="flex items-center gap-2 text-primary/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Stack: React + Node + Postgres
                  </div>
                  <div className="text-muted-foreground pt-2">→ Ready to download</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Not a code generator.
              <br />
              <span className="text-muted-foreground">A thinking system.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Smart clarification",
                desc: "AI asks 6–8 sharp questions to understand your idea before generating anything.",
              },
              {
                icon: Layers,
                title: "Stack recommender",
                desc: "Get a tailored stack — frontend, backend, DB, auth — with rationale you can override.",
              },
              {
                icon: FileCode,
                title: "7 structured docs",
                desc: "PRD, SRS, Architecture, Design System, API Spec, Folder Structure, README.",
              },
              {
                icon: Zap,
                title: "Minutes, not days",
                desc: "Skip days of doc-writing. Get a complete project package in under 5 minutes.",
              },
              {
                icon: Sparkles,
                title: "Production-ready",
                desc: "Outputs are detailed enough to feed directly into your AI coding assistant.",
              },
              {
                icon: Download,
                title: "Export as ZIP",
                desc: "Download the entire project folder. GitHub push coming soon.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-surface/40 hover:bg-surface/80 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:glow-primary-sm transition-all">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-center mb-16">
            Five steps. <span className="gradient-text">One spec.</span>
          </h2>

          <div className="space-y-4">
            {[
              ["01", "Drop your idea", "Type a sentence or paste a brief. The vaguer the better — we'll dig in."],
              ["02", "Answer the AI", "Chat-style flow. 6–8 questions about platform, scale, and intent."],
              ["03", "Pick your stack", "AI recommends. You approve or override every choice."],
              ["04", "Watch it generate", "PRD → Architecture → API → Design — streamed in real time."],
              ["05", "Download & build", "Grab the ZIP. Hand it to Cursor, Claude, or your team."],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex gap-6 p-6 rounded-2xl border border-border bg-surface/40 hover:border-primary/30 transition-colors">
                <div className="font-mono text-3xl font-bold text-primary shrink-0">{num}</div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-1">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/build"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium glow-primary hover:scale-[1.02] transition-transform"
            >
              Build your spec now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="font-mono">© PLANNR · Built for vibe coders</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
