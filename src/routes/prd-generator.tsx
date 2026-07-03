import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Github,
  Globe,
  Lightbulb,
  MessageSquare,
  Plus,
  Rocket,
  Sparkles,
  FileText,
  WandSparkles,
  Wind,
  Bolt,
} from "lucide-react";
import { useEffect, useRef, type Dispatch, type SetStateAction, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { InteractiveGrid } from "@/components/InteractiveGrid";

export const Route = createFileRoute("/prd-generator")({
  head: () => ({
    meta: [
      { title: "AI PRD Generator | PLANNR" },
      {
        name: "description",
        content:
          "Generate professional Product Requirements Documents in minutes with PLANNR's AI PRD Generator for Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot workflows.",
      },
      { property: "og:title", content: "AI PRD Generator | PLANNR" },
      {
        property: "og:description",
        content:
          "Generate professional Product Requirements Documents in minutes with PLANNR's AI PRD Generator for Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot workflows.",
      },
    ],
  }),
  component: PRDGeneratorPage,
});

type FaqItem = {
  question: string;
  answer: string;
};

const marqueeTools = [
  { name: "Cursor", icon: Code2 },
  { name: "Claude Code", icon: Sparkles },
  { name: "Lovable", icon: WandSparkles },
  { name: "Bolt", icon: Bolt },
  { name: "Windsurf", icon: Wind },
  { name: "Replit", icon: Globe },
  { name: "GitHub Copilot", icon: Github },
];

const prdPills = [
  "Product Overview",
  "Problem Statement",
  "Goals",
  "User Personas",
  "Feature Requirements",
  "User Flows",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Edge Cases",
  "Success Metrics",
  "Technical Recommendations",
  "Architecture Direction",
  "API Planning",
  "Database Suggestions",
];

const includedItems = [
  "Executive Summary",
  "Product Vision",
  "Business Goals",
  "Target Audience",
  "User Personas",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Feature Breakdown",
  "User Stories",
  "Acceptance Criteria",
  "User Flows",
  "Technical Recommendations",
  "Security Considerations",
  "Scalability Notes",
  "API Suggestions",
  "Database Planning",
  "Success Metrics",
];

const faqItems: FaqItem[] = [
  {
    question: "What is a Product Requirements Document?",
    answer:
      "A Product Requirements Document (PRD) is a detailed document describing what a software product should do, who it's for, and how it should behave before development begins.",
  },
  {
    question: "How do I create a Product Requirements Document?",
    answer:
      "You can create one manually by documenting goals, users, features, user flows, requirements, and technical considerations or use PLANNR to generate a complete PRD automatically using AI.",
  },
  {
    question: "What should a PRD include?",
    answer:
      "A complete PRD typically includes: Product Vision, Objectives, User Personas, Features, Functional Requirements, Non-functional Requirements, User Stories, Acceptance Criteria, User Flows, and Success Metrics.",
  },
  {
    question: "Can AI write a Product Requirements Document?",
    answer:
      "Yes. Modern AI can generate high-quality PRDs when provided with enough product context. PLANNR improves this process by collecting structured information through intelligent follow-up questions before generating documentation.",
  },
  {
    question: "Is there a free PRD template?",
    answer:
      "Yes. PLANNR provides structured AI-generated PRDs that can be exported and used as professional templates for future projects.",
  },
  {
    question: "Which AI tools can use a PRD?",
    answer:
      "Generated PRDs work well with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot.",
  },
  {
    question: "Why should startups use a PRD?",
    answer:
      "A PRD aligns founders, developers, designers, and AI coding tools around a single source of truth, reducing misunderstandings and accelerating development.",
  },
];

function PRDGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen flex flex-col">
      <InteractiveGrid />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <TrustedBy />
          <WhatIsPrd />
          <WhyAiPrd />
          <HowItWorks />
          <WhatsIncluded />
          <WhyAiCodingStartsWithPrd />
          <ComparisonTable />
          <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      <div className="absolute left-1/2 top-16 h-[500px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.27_145/0.22),transparent_68%)] blur-[90px]" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pb-24 sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-white/85 px-4 py-2 text-xs font-medium tracking-[0.24em] text-[#166534] shadow-[0_10px_30px_-18px_oklch(0.78_0.27_145/0.35)]">
          <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
          AI-POWERED PLANNING
        </div>

        <h1
          className="mt-8 font-display font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.02 }}
        >
          AI PRD Generator
        </h1>

        <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
          Turn any idea into a complete Product Requirements Document (PRD) in minutes. PLANNR helps
          founders, developers, agencies, and product teams generate structured PRDs that are ready
          for Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit and modern AI development
          workflows.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
            Generate Free PRD
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustedBy() {
  const items = [...marqueeTools, ...marqueeTools];

  return (
    <section className="border-b border-border/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          Trusted by modern AI builders
        </p>
        <div className="marquee mt-6">
          <div className="marquee-track">
            {items.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div
                  key={`${tool.name}-${index}`}
                  className="mx-3 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_25px_-18px_oklch(0.78_0.27_145/0.35)]"
                >
                  <Icon className="h-4 w-4 text-[#16a34a]" />
                  {tool.name}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-4xl text-center text-sm leading-7 text-muted-foreground sm:text-base">
          Whether you're building an MVP, SaaS platform, mobile app, AI startup, marketplace,
          dashboard, CRM, or internal tool — every successful product starts with a clear PRD.
        </p>
      </div>
    </section>
  );
}

function WhatIsPrd() {
  const cards = [
    "What problem does this product solve?",
    "Who are the users?",
    "Which features should be built?",
    "What should developers prioritize?",
    "How should users move through the application?",
    "What technical requirements exist?",
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div className="absolute left-0 top-6 hidden h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl sm:block" />
          <div className="mb-10 flex items-start gap-6">
            <div className="relative shrink-0">
              <div className="absolute -left-2 -top-2 h-20 w-20 rounded-full bg-[#22c55e]/20 blur-2xl" />
              <div className="relative font-display text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
                01
              </div>
            </div>
            <div className="max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What is a Product Requirements Document (PRD)?
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                A Product Requirements Document (PRD) is the blueprint of your software product. It
                explains exactly what you're building before a single line of code is written.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((text) => (
              <div
                key={text}
                className="rounded-xl border border-border bg-white p-5 shadow-[0_14px_30px_-24px_oklch(0.18_0.01_150/0.28)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#22c55e]/25 bg-[#dcfce7]/70 text-[#16a34a]">
                    <span className="text-sm font-bold">?</span>
                  </div>
                  <p className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-muted-foreground">
            Without a PRD, software projects often suffer from unclear requirements, feature creep,
            wasted development time, and inconsistent AI-generated code. PLANNR generates
            professional PRDs automatically, allowing you to move from idea to implementation with
            confidence.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhyAiPrd() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div className="absolute right-0 top-8 hidden h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl sm:block" />
          <div className="mb-8 flex items-start gap-6">
            <div className="order-2 shrink-0 sm:order-1">
              <div className="relative font-display text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
                02
              </div>
              <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-[#22c55e]/20 blur-2xl" />
            </div>
            <div className="order-1 max-w-3xl sm:order-2">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Why Use an AI PRD Generator?
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Writing a PRD manually can take hours or even days. Modern AI development moves much
                faster. PLANNR transforms a simple product idea into a structured PRD within
                minutes.
              </p>
            </div>
          </div>

          <h3 className="text-base font-semibold text-foreground">
            Instead of starting with a blank document, you receive:
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            {prdPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-[#22c55e]/35 bg-white px-4 py-2 text-sm font-medium text-[#166534] shadow-[0_8px_20px_-16px_oklch(0.78_0.27_145/0.35)]"
              >
                {pill}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm font-medium text-muted-foreground">
            Everything organized in a developer-friendly format.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => [false, false, false, false]);

  const steps = [
    {
      icon: Lightbulb,
      title: "Describe Your Idea",
      desc: "Simply explain your startup, app, SaaS, AI tool, marketplace, CRM or business idea. No technical experience required.",
    },
    {
      icon: MessageSquare,
      title: "Answer Smart Questions",
      desc: "PLANNR asks intelligent follow-up questions to understand target users, business goals, important features, authentication, payments, integrations, permissions, and scalability.",
    },
    {
      icon: FileText,
      title: "Generate Your PRD",
      desc: "PLANNR automatically generates a complete Product Requirements Document containing every important section required by developers and AI coding tools.",
    },
    {
      icon: Rocket,
      title: "Build With Your Favorite AI IDE",
      desc: "Use the generated PRD directly inside Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, or GitHub Copilot. The better your documentation, the better your AI-generated application.",
    },
  ];

  useEffect(() => {
    const nodes = cardRefs.current;
    if (!sectionRef.current || !nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleCards((current) => {
          const next = [...current];
          let changed = false;

          entries.forEach((entry) => {
            const index = Number((entry.target as HTMLElement).dataset.cardIndex);
            if (Number.isNaN(index)) return;
            if (entry.isIntersecting && !next[index]) {
              next[index] = true;
              changed = true;
            }
          });

          return changed ? next : current;
        });
      },
      { threshold: 0.2 },
    );

    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-border/50 py-20">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#22c55e]/30 to-transparent" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            From Idea to PRD in 4 Steps
          </h2>
        </div>

        <div className="mt-14 space-y-8 sm:space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLeft = index % 2 === 0;
            const isVisible = visibleCards[index] ?? false;
            const slideX = isLeft ? "-30px" : "30px";
            return (
              <div key={step.title} className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
                <article
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  data-card-index={index}
                  className={`relative w-full max-w-2xl ${isLeft ? "sm:pr-16" : "sm:pl-16"}`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : `translateX(${slideX})`,
                    transition:
                      "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDelay: `${index * 100}ms`,
                    willChange: "transform, opacity",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[#22c55e]/20 blur-2xl ${
                      isLeft ? "right-[-10px]" : "left-[-10px]"
                    }`}
                  />
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#22c55e]/35 bg-[#22c55e] ${
                      isLeft ? "right-[-4px]" : "left-[-4px]"
                    }`}
                  />
                  <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_14px_32px_-26px_oklch(0.18_0.01_150/0.28)] transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="mb-3 flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/20 bg-[#dcfce7]/70 text-[#16a34a]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold tracking-tight">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhatsIncluded() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div className="absolute left-0 top-8 hidden h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl sm:block" />
          <div className="mb-10 flex items-start gap-6">
            <div className="relative shrink-0">
              <div className="absolute -left-2 -top-2 h-20 w-20 rounded-full bg-[#22c55e]/20 blur-2xl" />
              <div className="relative font-display text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
                03
              </div>
            </div>
            <div className="max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What's Included in Every PRD?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {includedItems.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-white p-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)]"
              >
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                  <span className="text-sm font-medium leading-6 text-foreground">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyAiCodingStartsWithPrd() {
  const flow = ["Poor Prompt", "Poor Architecture", "Poor User Flows", "Poor Code"];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] border border-[#14532d] bg-[#052e16] p-6 sm:p-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why AI Coding Starts with a Great PRD
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
            AI coding tools don't fail because of weak models. They fail because they receive
            incomplete requirements.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {flow.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex-1 rounded-2xl border border-red-500/25 bg-[#082f18] px-4 py-5 text-center text-sm font-semibold text-white shadow-[0_12px_24px_-20px_rgba(0,0,0,0.5)]">
                  {item}
                </div>
                {index < flow.length - 1 && (
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-[#dcfce7] sm:block" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#22c55e]/25 bg-[#dcfce7] p-5 text-[#14532d]">
            <p className="text-sm leading-7 sm:text-[0.95rem]">
              A detailed PRD gives AI coding platforms the context they need to generate better
              software. That's why experienced founders plan before building. PLANNR automates that
              planning process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const rows = [
    ["Hours of documentation", "Minutes"],
    ["Blank document", "Guided workflow"],
    ["Easy to miss requirements", "Comprehensive structure"],
    ["Inconsistent formatting", "Professional documentation"],
    ["Difficult collaboration", "Export-ready documents"],
    ["Generic ChatGPT prompts", "Structured AI planning"],
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Manual PRD vs AI PRD Generator
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">
              Manual Writing
            </div>
            <div className="px-5 py-4 text-sm font-semibold text-[#166534]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#dcfce7] px-3 py-1">
                <img src="/favicon-192.png" alt="" className="h-4 w-4 rounded-full object-cover" />
                PLANNR
              </span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {rows.map(([left, right]) => (
              <div key={left} className="grid grid-cols-2">
                <div className="px-5 py-4 text-sm text-muted-foreground sm:text-[0.95rem]">
                  {left}
                </div>
                <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-[#166534] sm:text-[0.95rem]">
                  <Check className="h-4 w-4 shrink-0 text-[#16a34a]" />
                  {right}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number | null;
  setOpenFaq: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 space-y-3">
          {faqItems.map((item, index) => {
            const open = openFaq === index;
            return (
              <div
                key={item.question}
                className="rounded-xl border border-border bg-white shadow-[0_10px_24px_-22px_oklch(0.18_0.01_150/0.28)]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="text-sm font-semibold leading-6 text-foreground sm:text-[0.95rem]">
                    {item.question}
                  </span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-[#16a34a] transition-transform duration-200 ${
                      open ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className="overflow-hidden px-5 transition-[max-height] duration-300 ease-out"
                  style={{ maxHeight: open ? "220px" : "0px" }}
                >
                  <p className="pb-5 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#dcfce7_0%,#86efac_45%,#22c55e_100%)] p-8 text-center shadow-[0_18px_40px_-24px_oklch(0.18_0.01_150/0.32)] sm:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#052e16] sm:text-4xl">
            Build Better Software Before You Write Code
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#14532d]">
            The quality of your software depends on the quality of your planning. Stop starting with
            a blank page. Start with clarity.
          </p>
          <div className="mt-8">
            <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
              Generate Your Free AI PRD Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
