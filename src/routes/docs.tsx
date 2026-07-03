import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Code2, Plus } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InteractiveGrid } from "@/components/InteractiveGrid";

type PipelineStage = {
  title: string;
  description: string;
};

type DocumentCard = {
  title: string;
  items: string[];
};

type PracticeItem = {
  num: string;
  title: string;
  tip: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const PIPELINE_STAGES: PipelineStage[] = [
  {
    title: "Idea",
    description:
      "Every project starts with uncertainty. Most ideas are incomplete. PLANNR transforms rough concepts into structured product definitions.",
  },
  {
    title: "AI Discovery",
    description:
      "Instead of generating documents immediately, PLANNR asks intelligent follow-up questions exactly like an experienced Product Manager would. Because better inputs create better software.",
  },
  {
    title: "Product Requirements Document",
    description:
      "Defines why the product exists. Who it's for. Which problems it solves. Which features matter. How success will be measured.",
  },
  {
    title: "Software Requirements Specification",
    description:
      "Turns product ideas into engineering requirements. Functional requirements. Non-functional requirements. Business rules. Acceptance criteria. System behavior.",
  },
  {
    title: "Software Architecture",
    description:
      "Defines the technical foundation. Frontend. Backend. Database. Authentication. Infrastructure. Scalability. Security. Technology stack.",
  },
  {
    title: "Design Document",
    description:
      "Moves from architecture into implementation. Component responsibilities. Module interactions. Database relationships. UI structure. API contracts. Developer decisions.",
  },
  {
    title: "API Documentation",
    description:
      "Documents every endpoint. Authentication. Requests. Responses. Errors. Rate limits. Examples. Everything developers need.",
  },
  {
    title: "AI IDE",
    description:
      "Now every AI coding platform finally has context. Cursor. Claude Code. Lovable. Bolt. Windsurf. GitHub Copilot. Instead of guessing your application, they understand it.",
  },
  {
    title: "Production",
    description: "The result isn't just generated documents. It's software built with clarity.",
  },
];

const DOCUMENTS: DocumentCard[] = [
  {
    title: "Product Requirements Document",
    items: [
      "Business Vision",
      "Target Users",
      "Core Features",
      "Success Metrics",
      "Acceptance Criteria",
      "Product Goals",
    ],
  },
  {
    title: "Software Requirements Specification",
    items: [
      "Functional Requirements",
      "Non-functional Requirements",
      "Business Rules",
      "Validation",
      "Performance",
      "Constraints",
    ],
  },
  {
    title: "Architecture",
    items: ["Technology Stack", "System Design", "Infrastructure", "Authentication", "Database", "Security", "Scalability"],
  },
  {
    title: "Design Document",
    items: ["Components", "Modules", "UI Structure", "Data Flow", "Implementation", "Developer Notes"],
  },
  {
    title: "API Documentation",
    items: ["Endpoints", "Requests", "Responses", "Authentication", "Errors", "Examples", "Versioning"],
  },
];

const PLANNING_ITEMS = [
  "It analyzes your idea.",
  "Builds project context.",
  "Identifies missing information.",
  "Asks follow-up questions.",
  "Detects dependencies.",
  "Connects business goals with technical requirements.",
  "Maintains consistency across every generated document.",
];

const BUILT_FOR = [
  "Startup Founders",
  "Agencies",
  "Freelancers",
  "Software Engineers",
  "Product Managers",
  "Students",
  "AI Builders",
  "Enterprise Teams",
];

const AI_TOOLS = [
  "Cursor",
  "Claude Code",
  "Lovable",
  "Bolt",
  "Windsurf",
  "GitHub Copilot",
  "Replit",
  "VS Code",
  "OpenAI Codex",
  "Continue.dev",
];

const PRACTICES: PracticeItem[] = [
  {
    num: "01",
    title: "How to describe your idea",
    tip: 'Be specific. Mention the problem, the user, and the core action. Avoid vague terms like "platform" or "tool".',
  },
  {
    num: "02",
    title: "How to answer AI questions",
    tip: "Take your time. The more accurate your answers, the more accurate your documents. You can always regenerate.",
  },
  {
    num: "03",
    title: "How to choose a technology stack",
    tip: "Pick what your team knows, or what your AI coding tool works best with. PLANNR will tailor every document to your stack.",
  },
  {
    num: "04",
    title: "How to review generated documentation",
    tip: "Read the PRD first. If the product vision is right, the rest of the documents will follow.",
  },
  {
    num: "05",
    title: "How to use documentation with AI coding",
    tip: "Tell your AI tool to read all .md files first before writing any code. This dramatically improves output quality.",
  },
  {
    num: "06",
    title: "Common mistakes to avoid",
    tip: "Don't skip the SRS. Don't ignore the Architecture document. Don't start coding before you've reviewed the generated documents.",
  },
];

const FAQS: FaqItem[] = [
  {
    question: "Why generate documents before coding?",
    answer:
      "Because AI coding tools perform significantly better when they receive structured context. A PRD and SRS reduce hallucinations, improve architecture decisions, and produce more consistent code.",
  },
  {
    question: "Why not ask ChatGPT directly?",
    answer:
      "ChatGPT gives you a generic response to a generic prompt. PLANNR collects specific information about your project first, then generates structured professional documentation, not a one-size-fits-all answer.",
  },
  {
    question: "How is PLANNR different from AI code generators?",
    answer:
      "PLANNR doesn't write code. It creates the planning documentation that makes AI-generated code significantly better.",
  },
  {
    question: "Can I skip the PRD?",
    answer:
      "Technically yes, but we don't recommend it. The PRD is the foundation every other document builds on. Skipping it often produces inconsistent downstream documents.",
  },
  {
    question: "Why does PLANNR ask questions first?",
    answer:
      "Because the quality of documentation is directly tied to the quality of input. Asking structured questions is how PLANNR produces accurate, project-specific documents instead of generic templates.",
  },
  {
    question: "Can I use only one generated document?",
    answer:
      "Yes. Each document is useful independently. Most users start with the PRD and SRS, then add Architecture and API docs as their project grows.",
  },
  {
    question: "Which AI models power PLANNR?",
    answer: "PLANNR uses frontier AI models optimized for structured document generation and technical writing.",
  },
  {
    question: "Can I edit generated documents?",
    answer: "Yes. All generated documents are plain text and fully editable. You own everything you generate.",
  },
  {
    question: "Can I regenerate only the Architecture?",
    answer: "Yes. PLANNR allows selective regeneration of individual documents without affecting the rest of your project.",
  },
  {
    question: "Can I export everything?",
    answer: "Yes. Export your complete documentation as a ZIP file containing all generated documents, ready to use in any editor or AI coding tool.",
  },
  {
    question: "Can I use it commercially?",
    answer: "Yes. Documents generated with PLANNR are yours to use for any commercial project.",
  },
];

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs | PLANNR Guide" },
      {
        name: "description",
        content:
          "A premium editorial guide to the PLANNR planning system, documentation pipeline, and philosophy behind building software with clarity.",
      },
      { property: "og:title", content: "Docs | PLANNR Guide" },
      {
        property: "og:description",
        content:
          "A premium editorial guide to the PLANNR planning system, documentation pipeline, and philosophy behind building software with clarity.",
      },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [activePractice, setActivePractice] = useState<number | null>(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const documentCardRefs = useRef<(HTMLElement | null)[]>([]);

  const scrollToPipeline = () => {
    document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "transform 0.1s ease";
  };

  const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.transition = "transform 0.4s ease";
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <InteractiveGrid />
      <style>{`
        @keyframes docs-ticker-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        @keyframes docs-pulse {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.34);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .docs-ticker-track,
          .docs-pulse-dot {
            animation: none !important;
          }
        }
      `}</style>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />

        <main className="flex-1">
          <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-24">
            <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
            <div className="absolute inset-x-0 top-0 mx-auto h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[120px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-[800px] flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d1d5db] bg-transparent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6b7280]">
                ✦ Documentation
              </div>

              <h1 className="mt-8 max-w-[700px] text-balance font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.1] tracking-tight text-[#111827]">
                Everything between an idea and production.
              </h1>

              <div className="mt-8 space-y-4 text-[1rem] leading-[1.75] text-[#374151]">
                <p>
                  PLANNR isn't just an AI generator. It's a software planning system that transforms
                  raw ideas into production-ready documentation used by founders, developers,
                  agencies, and AI coding tools.
                </p>
                <p>Understand every document, every decision, and every step of the workflow.</p>
              </div>

              <div className="mt-16 space-y-2 text-[1rem] font-normal not-italic leading-[1.6] text-[#6b7280]">
                <p>Before code comes clarity.</p>
                <p>Before clarity comes planning.</p>
                <p>That's what PLANNR is built for.</p>
              </div>

              <div className="mt-14 flex flex-col gap-4 sm:flex-row">
                <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={scrollToPipeline}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d1d5db] bg-transparent px-6 py-3 text-sm font-medium text-[#374151] transition-colors hover:border-[#c7cdd6] hover:bg-[#f9fafb]"
                >
                  Browse Documentation
                </button>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#050505] px-6 py-24 text-white">
              <div className="mx-auto flex w-full max-w-[720px] flex-col">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  The PLANNR System
                </div>
                <h2 className="mt-5 max-w-[720px] font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-white">
                  Instead of generating code...
                </h2>
                <p className="mt-4 text-[1.1rem] font-normal leading-[1.6] text-[#6b7280]">
                  PLANNR introduces a philosophy.
                </p>

                <div className="mt-14 space-y-1 text-[1.25rem] leading-[2] text-[#9ca3af]">
                  <p className="mb-2">Every successful software product follows a hidden process.</p>
                  <p>
                    Not coding. <span className="font-semibold text-white">Planning.</span>
                    <br />
                    <span className="font-semibold text-white">Requirements.</span>{" "}
                    <span className="font-semibold text-white">Architecture.</span>
                    <br />
                    <span className="font-semibold text-white">Design.</span>{" "}
                    <span className="font-semibold text-white">Implementation.</span>
                    <br />
                    <span className="font-semibold text-white">Documentation.</span>{" "}
                    <span className="font-semibold text-white">Testing.</span>{" "}
                    <span className="font-semibold text-white">Deployment.</span>
                  </p>
                  <p className="mb-2">Most people skip these steps.</p>
                  <p>PLANNR doesn't.</p>
                </div>

                <div className="mt-12 border-t border-white/10 pt-12 text-center">
                  <p className="mb-6 text-[1.5rem] font-bold text-white">It asks questions.</p>
                  <p className="mb-6 text-[1.5rem] font-bold text-white">Challenges assumptions.</p>
                  <p className="mb-6 text-[1.5rem] font-bold text-white">Organizes your thinking.</p>
                  <p className="mt-10 text-[1.1rem] font-normal italic text-white">
                    Then generates every document needed before development begins.
                  </p>
                  <p className="mx-auto mt-8 max-w-[600px] text-[1rem] italic leading-[1.8] text-[#9ca3af]">
                    This is why PLANNR isn't a code generator. It's a thinking system.
                  </p>
                </div>
              </div>
          </section>

          <section id="pipeline" className="relative overflow-hidden px-6 py-24">
            <div className="absolute inset-0 bg-grid opacity-35 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="relative mx-auto flex w-full max-w-[800px] flex-col">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                The Complete Planning Pipeline
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-[#111827]">
                From idea to production.
              </h2>
              <p className="mt-4 text-[1.1rem] font-normal leading-[1.6] text-[#6b7280]">
                Every stage. Every decision. Every document.
              </p>

              <div className="relative mt-14">
                <div className="absolute left-[14px] top-0 h-full w-px bg-[#e5e7eb]" />
                <div className="space-y-3">
                  {PIPELINE_STAGES.map((stage, index) => {
                    const isActive = activeStage === index;
                    return (
                      <div key={stage.title} className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveStage(index)}
                          className={[
                            "group relative flex w-full items-center gap-4 rounded-lg px-5 py-4 text-left transition-colors",
                            isActive ? "bg-[#f9fafb]" : "bg-transparent",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold font-mono transition-all",
                              isActive
                                ? "border-0 bg-primary text-white"
                                : "border-[1.5px] border-[#d1d5db] bg-transparent text-[#9ca3af]",
                            ].join(" ")}
                          >
                            {index + 1}
                          </span>
                          <span
                            className={[
                              "block text-[1rem] font-medium transition-colors",
                              isActive ? "font-semibold text-[#111827]" : "text-[#6b7280]",
                            ].join(" ")}
                          >
                            {stage.title}
                          </span>
                        </button>

                        <div
                          className="overflow-hidden pl-12 transition-[max-height,opacity,transform] duration-[400ms] ease-out"
                          style={{
                            maxHeight: isActive ? "240px" : "0px",
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? "translateY(0)" : "translateY(-6px)",
                          }}
                        >
                          <div className="mt-2 rounded-lg border border-[#e5e7eb] bg-white p-4 text-[0.95rem] leading-[1.7] text-[#374151] shadow-sm">
                            {stage.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#050505] px-6 py-24 text-white">
              <div className="mx-auto flex w-full max-w-[800px] flex-col">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  Why PLANNR Exists
                </div>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-white">
                  The software industry has changed.
                </h2>

                <div className="mt-12 space-y-5 text-[1.15rem] leading-[1.6] text-[#d1d5db]">
                  <p>Writing code is no longer the bottleneck.</p>
                  <p>Knowing what to build is.</p>
                  <p>Every AI model can generate code.</p>
                  <p>Very few can understand products.</p>
                  <p>That's the gap PLANNR fills.</p>
                </div>

                <div className="mt-14 space-y-4 text-center text-[1.3rem] font-bold text-white">
                  <p>It thinks before it generates.</p>
                  <p>Plans before it builds.</p>
                  <p>Documents before it develops.</p>
                </div>
              </div>
          </section>

          <section className="relative overflow-hidden px-6 py-24">
            <div className="absolute inset-0 bg-grid opacity-35" />
            <div className="relative mx-auto flex w-full max-w-[1100px] flex-col">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                Understanding Every Document
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-[#111827]">
                Every document. Explained.
              </h2>

              <div className="mt-14 space-y-6">
                {DOCUMENTS.map((doc, index) => (
                  <article
                    key={doc.title}
                    ref={(node) => {
                      documentCardRefs.current[index] = node;
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="rounded-xl border border-[#e5e7eb] bg-white px-10 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    style={{
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                      cursor: "pointer",
                    }}
                  >
                    <h3 className="border-l-[3px] border-primary pl-4 font-display text-[1.25rem] font-bold tracking-tight text-[#111827]">
                      {doc.title}
                    </h3>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {doc.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex w-auto items-center rounded-[6px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-1 text-[0.8rem] font-medium text-[#374151]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#050505] px-6 py-24 text-white">
              <div className="mx-auto flex w-full max-w-[800px] flex-col">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  Inside the AI Planning Engine
                </div>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-white">
                  PLANNR doesn't generate documents using a single prompt.
                </h2>
                <p className="mt-4 text-[1.1rem] font-normal leading-[1.6] text-[#6b7280]">
                  Behind every project is a structured planning workflow.
                </p>

                <div className="mt-12 space-y-5">
                  {PLANNING_ITEMS.map((item) => (
                    <div key={item} className="flex items-start gap-[0.875rem]">
                      <span
                        className="docs-pulse-dot mt-[6px] h-2 w-2 shrink-0 rounded-full bg-primary"
                        style={{ animation: "docs-pulse 2s ease-in-out infinite" }}
                      />
                      <p className="text-[1.05rem] leading-[1.6] text-[#d1d5db]">{item}</p>
                    </div>
                  ))}
                </div>

                <p className="mx-auto mt-14 max-w-[700px] text-center text-[1rem] italic leading-[1.7] text-[#9ca3af]">
                  The result isn't five unrelated files. It's one connected planning system.
                </p>
              </div>
          </section>

          <section className="relative overflow-hidden px-6 py-24">
            <div className="absolute inset-0 bg-grid opacity-35" />
            <div className="relative mx-auto flex w-full max-w-[1100px] flex-col">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                Built For
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-[#111827]">
                Built for every kind of builder.
              </h2>

              <div className="mt-12 overflow-hidden">
                <div
                  className="docs-ticker-track flex w-max items-center gap-4"
                  style={{ animation: "docs-ticker-scroll 32s linear infinite" }}
                >
                  {[...BUILT_FOR, ...BUILT_FOR].map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-transparent px-5 py-2 text-[0.9rem] font-medium text-[#374151]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#050505] px-6 py-24 text-white">
              <div className="mx-auto flex w-full max-w-[900px] flex-col">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  Works With
                </div>
                <h2 className="mt-5 text-center font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-white">
                  Works with your favorite AI tools.
                </h2>

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                  {AI_TOOLS.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#1a1a1a] px-5 py-3 text-[0.95rem] font-medium text-[#d1d5db] transition-colors hover:border-primary hover:text-white"
                    >
                      <Code2 className="h-4 w-4 text-primary" />
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="mt-14 text-center text-[1rem] leading-[1.8] text-[#9ca3af]">
                  <p>PLANNR doesn't replace these tools.</p>
                  <p className="mt-2 text-primary">It gives them context. Context creates better code.</p>
                </div>
              </div>
          </section>

          <section className="relative overflow-hidden px-6 py-24">
            <div className="absolute inset-0 bg-grid opacity-35" />
            <div className="relative mx-auto flex w-full max-w-[1100px] flex-col">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                Best Practices
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-[#111827]">
                How to get the most from PLANNR.
              </h2>

              <div className="mt-12">
                {PRACTICES.map((practice, index) => {
                  const isOpen = activePractice === index;
                  return (
                    <button
                      key={practice.num}
                      type="button"
                      onClick={() => setActivePractice(isOpen ? null : index)}
                      onMouseEnter={() => setActivePractice(index)}
                      onMouseLeave={() => setActivePractice(null)}
                      className="group w-full border-b border-[#f3f4f6] py-5 text-left transition-colors hover:bg-[#f9fafb]"
                    >
                      <div className="flex items-start gap-6">
                        <div className="min-w-[28px] shrink-0 font-mono text-[0.85rem] font-bold text-primary">
                          {practice.num}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[1rem] font-semibold text-[#111827]">{practice.title}</h3>
                            <ChevronRight
                              className={[
                                "ml-auto h-5 w-5 shrink-0 text-[#9ca3af] transition-colors",
                                isOpen ? "rotate-90 text-primary" : "rotate-0",
                              ].join(" ")}
                            />
                          </div>
                          <div
                            className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                            style={{
                              maxHeight: isOpen ? "120px" : "0px",
                              opacity: isOpen ? 1 : 0,
                            }}
                          >
                            <p className="pt-3 pl-10 text-[0.9rem] leading-[1.6] text-[#6b7280]">
                              {practice.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-[#050505] px-6 py-24 text-white">
              <div className="mx-auto flex w-full max-w-[900px] flex-col">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  Frequently Asked Questions
                </div>
                <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.2] tracking-tight text-white">
                  Questions people actually have.
                </h2>

                <div className="mt-12 space-y-2">
                  {FAQS.map((faq, index) => {
                    const isOpen = activeFaq === index;
                    return (
                      <div key={faq.question} className="overflow-hidden rounded-[10px] border border-[#262626] bg-[#0b0b0b]">
                        <button
                          type="button"
                          onClick={() => setActiveFaq(isOpen ? -1 : index)}
                          className="flex w-full items-center justify-between gap-6 bg-[#111111] px-6 py-5 text-left transition-colors hover:bg-[#161616]"
                        >
                          <span className="text-[1rem] font-medium leading-[1.6] text-[#f9fafb]">
                            {faq.question}
                          </span>
                          <Plus
                            className={[
                              "mt-1 h-5 w-5 shrink-0 text-primary transition-transform duration-300",
                              isOpen ? "rotate-45" : "rotate-0",
                            ].join(" ")}
                          />
                        </button>
                        <div
                          className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                          style={{
                            maxHeight: isOpen ? "220px" : "0px",
                            opacity: isOpen ? 1 : 0,
                          }}
                        >
                          <div className="bg-[#0d0d0d] px-6 pb-5 pt-0">
                            <p className="max-w-[760px] text-[0.95rem] leading-[1.7] text-[#9ca3af]">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </section>

          <section className="relative flex min-h-[80vh] items-center overflow-hidden px-6 py-24">
              <div className="absolute inset-0 bg-[#050505]" />
              <div className="relative mx-auto flex w-full max-w-[800px] flex-col items-center text-center text-white">
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#6b7280]">
                  The PLANNR Philosophy
                </div>
                <div className="mt-8 space-y-3 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.2] tracking-tight">
                  <p>Great software doesn't begin with code.</p>
                  <p>It begins with understanding.</p>
                </div>
                <p className="mx-auto mt-10 max-w-[540px] text-center text-[1rem] leading-[1.75] text-[#9ca3af]">
                  Every successful application started with someone asking the right questions. PLANNR
                  exists to ask those questions before expensive mistakes happen.
                </p>
                <div className="mt-10 space-y-3 text-center text-[1.2rem] font-semibold text-white">
                  <p>Ideas become plans.</p>
                  <p>Plans become documentation.</p>
                  <p>Documentation becomes software.</p>
                </div>
                <p className="mt-10 text-center text-[1.1rem] italic leading-[1.7] text-[#9ca3af]">
                  Software becomes products people love.
                </p>
              </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
