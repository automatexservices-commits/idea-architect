import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowRight,
  File,
  FileText,
  Folder,
  Layout,
  ListChecks,
  Rocket,
  Database,
  MonitorSmartphone,
  Code2,
  Workflow,
  GitBranch,
  Boxes,
  Layers3,
  Check,
  Plus,
} from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InteractiveGrid } from "@/components/InteractiveGrid";

export const Route = createFileRoute("/design-document-generator")({
  head: () => ({
    meta: [
      { title: "AI Software Design Document Generator | PLANNR" },
      {
        name: "description",
        content:
          "Generate professional Software Design Documents in minutes with PLANNR's AI Software Design Document Generator for technical implementation planning, architecture, APIs, database design, and deployment strategy.",
      },
      { property: "og:title", content: "AI Software Design Document Generator | PLANNR" },
      {
        property: "og:description",
        content:
          "Generate professional Software Design Documents in minutes with PLANNR's AI Software Design Document Generator for technical implementation planning, architecture, APIs, database design, and deployment strategy.",
      },
    ],
  }),
  component: SoftwareSpecificationGeneratorPage,
});

type FaqItem = {
  question: string;
  answer: string;
};

const outlineItemsLeft = [
  "System Design Overview",
  "Module Architecture",
  "Component Design",
  "Frontend Design",
  "Backend Design",
  "Database Design",
  "API Design",
  "Authentication Flow",
  "User Flow Design",
];

const outlineItemsRight = [
  "Data Flow",
  "Folder Structure",
  "Class & Component Relationships",
  "Design Patterns",
  "Error Handling",
  "Security Design",
  "Performance Considerations",
  "Scalability Strategy",
  "Deployment Recommendations",
];

const designDocItems = [
  "Overall system design",
  "Application architecture",
  "Module breakdown",
  "Database structure",
  "API interactions",
  "Component relationships",
  "Design patterns",
  "User flows",
  "Security approach",
  "Deployment strategy",
];

const useCaseGroups = [
  {
    label: "PLATFORMS",
    items: ["SaaS Platforms", "AI Applications", "Mobile Apps", "Marketplaces"],
  },
  {
    label: "ENTERPRISE",
    items: ["CRM Systems", "ERP Software", "Enterprise Applications", "Internal Business Tools"],
  },
  {
    label: "INDUSTRY",
    items: [
      "Healthcare Software",
      "FinTech Products",
      "Learning Platforms",
      "E-commerce Platforms",
    ],
  },
  {
    label: "STAGE",
    items: ["Startup MVPs", "Greenfield Projects"],
  },
];

const faqItems: FaqItem[] = [
  {
    question: "What is a Software Design Document?",
    answer:
      "A Software Design Document (SDD) describes how a software system should be implemented. It includes architecture, components, database design, APIs, security, workflows, and technical decisions.",
  },
  {
    question: "What should a Design Document include?",
    answer:
      "A complete Software Design Document includes: System Overview, Component Design, Module Design, Database Design, API Design, Authentication, User Flows, Data Flow, Design Patterns, Error Handling, Security, and Deployment Strategy.",
  },
  {
    question: "Why is a Design Document important?",
    answer:
      "A Design Document ensures developers follow the same implementation plan, reduces misunderstandings, improves maintainability, and speeds up development.",
  },
  {
    question: "Can AI generate a Software Design Document?",
    answer:
      "Yes. PLANNR generates complete Software Design Documents using your product requirements, software architecture, and project goals.",
  },
  {
    question: "What is the difference between an SRS and a Design Document?",
    answer:
      "An SRS defines what the software must do. A Design Document explains how those requirements will be implemented technically. Together they create a complete software planning workflow.",
  },
  {
    question: "Who uses Software Design Documents?",
    answer:
      "Software Design Documents are used by Software Architects, Backend Developers, Frontend Developers, Full-Stack Developers, Engineering Managers, QA Engineers, and AI Coding Assistants.",
  },
  {
    question: "Can I use this with Cursor, Claude Code, or Lovable?",
    answer:
      "Yes. PLANNR generates structured design documents that provide AI coding tools with clear implementation guidance, resulting in better architecture and more consistent code generation.",
  },
];

const processSteps = [
  {
    icon: FileText,
    title: "Describe Your Software Idea",
    desc: "Simply explain your software project - what it does, who uses it, and what problems it solves.",
  },
  {
    icon: ListChecks,
    title: "Answer Intelligent Questions",
    desc: "PLANNR asks about features, workflows, users, integrations, permissions, APIs, architecture, and technical constraints.",
  },
  {
    icon: Layout,
    title: "Generate Your Design Document",
    desc: "Receive a complete Software Design Document structured using modern software engineering best practices.",
  },
  {
    icon: Rocket,
    title: "Build with AI or Your Team",
    desc: "Use it with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, GitHub Copilot, or your engineering team to build faster with fewer implementation mistakes.",
  },
];

const comparisonRows = [
  ["Days of documentation", "Minutes"],
  ["Blank documents", "Guided AI workflow"],
  ["Inconsistent implementation", "Standardized design"],
  ["Easy to miss technical details", "Comprehensive documentation"],
  ["Difficult collaboration", "Export-ready documents"],
  ["Manual updates", "AI-assisted generation"],
];

function SoftwareSpecificationGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen flex flex-col">
      <style>{ddStyle}</style>
      <InteractiveGrid />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <ImplementationBridge />
          <WhatIsDesignDocument />
          <DesignVsArchitecture />
          <WhyUseAiGenerator />
          <WhatPlannrGenerates />
          <HowItWorks />
          <WhatMakesGreatDesignDoc />
          <UseCases />
          <WhyAiNeedsDesignDoc />
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
      <div className="absolute left-1/2 top-16 h-[500px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.27_145/0.2),transparent_68%)] blur-[90px]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-24 lg:grid-cols-2 lg:items-center sm:pb-24 sm:pt-28">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-white/85 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-[#14532d] shadow-[0_10px_30px_-18px_oklch(0.78_0.27_145/0.35)]"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            [ DD_GENERATOR ]
          </div>

          <h1
            className="mt-8 font-bold tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.02 }}
          >
            AI Software Design Document Generator
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Generate professional Software Design Documents (SDD) with AI. Transform your software
            requirements into a structured technical design that developers can immediately
            implement.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
              Generate Design Document
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-sm font-mono text-muted-foreground">
            // implementation-ready output
          </p>
        </div>

        <div className="relative lg:justify-self-end">
          <DocumentTreeCard />
        </div>
      </div>
    </section>
  );
}

function DocumentTreeCard() {
  const treeLines = [
    { type: "folder", label: "System Design", indent: 0 },
    { type: "file", label: "Overview", indent: 1 },
    { type: "file", label: "Architecture", indent: 1 },
    { type: "folder", label: "Frontend", indent: 0 },
    { type: "file", label: "Components", indent: 1 },
    { type: "file", label: "State Management", indent: 1 },
    { type: "folder", label: "Backend", indent: 0 },
    { type: "file", label: "API Design", indent: 1 },
    { type: "file", label: "Auth Flow", indent: 1 },
    { type: "folder", label: "Database", indent: 0 },
    { type: "file", label: "Schema", indent: 1 },
    { type: "file", label: "Relationships", indent: 1 },
    { type: "folder", label: "Deployment", indent: 0 },
    { type: "file", label: "Infrastructure", indent: 1 },
    { type: "file", label: "Strategy", indent: 1 },
  ] as const;

  return (
    <div className="rounded-[12px] border border-[#14532d]/40 border-l-[3px] border-l-[#22c55e] bg-[#0f0f0f] p-6 font-mono text-sm text-[#d1fae5] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]">
      <div className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#22c55e]">
        design-document.md
      </div>
      <div className="space-y-1">
        {treeLines.map((line, index) => {
          const Icon = line.type === "folder" ? Folder : File;
          return (
            <div
              key={`${line.label}-${index}`}
              className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 odd:hover:bg-white/5 even:hover:bg-white/10"
              style={{ paddingLeft: `${line.indent * 1.15}rem` }}
            >
              <Icon className="h-4 w-4 shrink-0 text-[#22c55e]/70" />
              <span className="truncate text-[#d1fae5]/90">{line.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImplementationBridge() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          IMPLEMENTATION BRIDGE
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Turn Requirements into Technical Design
        </h2>
        <p className="mt-5 max-w-5xl text-base leading-8 text-muted-foreground sm:text-lg">
          A Software Design Document bridges the gap between planning and development. After
          defining what your software should do in the PRD and SRS, the Design Document explains how
          the software should be implemented. PLANNR helps founders, developers, software
          architects, and engineering teams generate complete design documents in minutes instead of
          spending days documenting technical decisions.
        </p>
        <p className="mt-8 text-2xl font-semibold text-[#22c55e]">
          Whether you're building a SaaS platform, AI application, mobile app, CRM, ERP,
          marketplace, or enterprise software, PLANNR creates developer-ready design documentation
          automatically.
        </p>
      </div>
    </section>
  );
}

function WhatIsDesignDocument() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-10 flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]/20 blur-3xl" />
            <div className="relative font-mono text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              01
            </div>
          </div>
          <div className="max-w-4xl">
            <h2
              className="font-bold tracking-tight text-foreground"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What is a Software Design Document?
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              A Software Design Document (SDD) describes the technical design of a software system
              before development begins. It translates software requirements into implementation
              decisions that developers can follow throughout the project.
            </p>
          </div>
        </div>

        <p className="text-base font-medium text-foreground">
          A professional design document typically defines:
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {designDocItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)] transition-colors duration-150 hover:bg-[#dcfce7]/35 hover:border-[#22c55e]/40"
            >
              <File className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
              <span className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                {item}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          Instead of every developer making different implementation decisions, everyone follows one
          shared technical blueprint.
        </p>
      </div>
    </section>
  );
}

function DesignVsArchitecture() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          DOCUMENT HIERARCHY
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Design Document vs Architecture Document
        </h2>

        <div className="relative mt-8 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <ComparisonCard
            title="Software Architecture"
            subtitle="Answers: WHAT is built"
            body="The architecture document explains the overall structure of the system - which services exist, how they connect, which technologies are chosen."
            tag="HIGH LEVEL"
            muted
          />

          <div className="hidden lg:flex items-center justify-center text-3xl font-bold text-[#22c55e]">
            →
          </div>

          <ComparisonCard
            title="Software Design Document"
            subtitle="Answers: HOW it is built"
            body="The design document goes one level deeper - explaining how each module, component, and service should actually be implemented in code."
            tag="IMPLEMENTATION LEVEL"
          />
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          Most professional software teams create both documents before development begins.
        </p>
      </div>
    </section>
  );
}

function ComparisonCard({
  title,
  subtitle,
  body,
  tag,
  muted = false,
}: {
  title: string;
  subtitle: string;
  body: string;
  tag: string;
  muted?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border bg-white p-6 shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)] ${
        muted ? "border-border" : "border-[#22c55e]/40"
      }`}
    >
      <p
        className={`text-xs font-mono uppercase tracking-[0.28em] ${muted ? "text-muted-foreground" : "text-[#16a34a]"}`}
      >
        {subtitle}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{body}</p>
      <div className="mt-6">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-mono tracking-[0.18em] ${
            muted
              ? "border-border bg-muted/30 text-muted-foreground"
              : "border-[#22c55e]/30 bg-[#dcfce7] text-[#14532d]"
          }`}
        >
          {tag}
        </span>
      </div>
    </article>
  );
}

function WhyUseAiGenerator() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-8 flex items-start gap-6">
          <div className="order-2 shrink-0 sm:order-1">
            <div className="relative font-mono text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              02
            </div>
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl" />
          </div>
          <div className="order-1 max-w-4xl sm:order-2">
            <h2
              className="font-bold tracking-tight text-foreground"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Why Use an AI Design Document Generator?
            </h2>
          </div>
        </div>

        <div className="max-w-4xl space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
          <p>Writing software design documentation manually is slow and often inconsistent.</p>
          <p>
            PLANNR analyzes your product idea, requirements, architecture, and business goals to
            generate a structured Software Design Document automatically. Instead of creating dozens
            of diagrams and technical documents manually, you receive a complete implementation
            guide within minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatPlannrGenerates() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-10 flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]/20 blur-3xl" />
            <div className="relative font-mono text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              03
            </div>
          </div>
          <div className="max-w-4xl">
            <h2
              className="font-bold tracking-tight text-foreground"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What PLANNR Generates
            </h2>
            <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
              Every Design Document includes:
            </h3>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#14532d]/40 border-l-[3px] border-l-[#22c55e] bg-[#0f0f0f] p-8 font-mono text-sm text-[#d1fae5] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              {outlineItemsLeft.map((item) => (
                <OutlineRow key={item} label={item} />
              ))}
            </div>
            <div className="space-y-2">
              {outlineItemsRight.map((item) => (
                <OutlineRow key={item} label={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutlineRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 hover:bg-white/5">
      <File className="h-3.5 w-3.5 shrink-0 text-[#22c55e]/75" />
      <span className="truncate text-[#d1fae5]/90">{label}</span>
    </div>
  );
}

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => [false, false, false, false]);

  useEffect(() => {
    if (!sectionRef.current) return;

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

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-border/50 py-20">
      <div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#22c55e]/30 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          PROCESS
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          How It Works
        </h2>

        <div className="mt-14 space-y-8 sm:space-y-12">
          {processSteps.map((step, index) => {
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
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
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

function WhatMakesGreatDesignDoc() {
  const columns = [
    {
      label: "STRUCTURE",
      items: [
        "How is the application structured?",
        "How do components communicate?",
        "Which design patterns are used?",
      ],
    },
    {
      label: "IMPLEMENTATION",
      items: [
        "How does authentication work?",
        "How does data move through the system?",
        "How are APIs designed?",
      ],
    },
    {
      label: "DELIVERY",
      items: [
        "How will errors be handled?",
        "How will the application scale?",
        "How will the software be deployed?",
      ],
    },
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          What Makes a Great Software Design Document?
        </h2>
        <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
          A great design document should answer:
        </h3>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column.label} className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
                {column.label}
              </div>
              <div className="space-y-3">
                {column.items.map((question) => (
                  <div
                    key={question}
                    className="rounded-lg border-l-[3px] border-l-[#22c55e] border border-border bg-white p-4 text-sm leading-6 text-foreground shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)]"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          PLANNR generates these sections automatically using modern software engineering best
          practices.
        </p>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
          USE CASES
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Generate Design Documents For
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {useCaseGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-[1.5rem] border border-border bg-white p-5 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)]"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                {group.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#22c55e]/35 bg-white px-4 py-2 text-sm font-medium text-[#14532d] transition-all duration-200 hover:bg-[#22c55e] hover:text-white hover:shadow-[0_12px_24px_-18px_rgba(34,197,94,0.5)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyAiNeedsDesignDoc() {
  const dependencyBoxes = [
    {
      label: "Design Document",
      icon: FileText,
      level: "top",
    },
    {
      label: "Component Structure",
      icon: Boxes,
      level: "middle",
    },
    {
      label: "API Interactions",
      icon: Workflow,
      level: "middle",
    },
    {
      label: "Database Relationships",
      icon: Database,
      level: "middle",
    },
    {
      label: "Module Responsibilities",
      icon: Layers3,
      level: "bottom",
    },
    {
      label: "UI Architecture",
      icon: MonitorSmartphone,
      level: "bottom",
    },
    {
      label: "Design Patterns",
      icon: Code2,
      level: "bottom",
    },
    {
      label: "Technical Workflows",
      icon: GitBranch,
      level: "bottom",
    },
  ] as const;

  return (
    <section className="border-b border-[#14532d] bg-[#0a0a0a] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-white"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Why Modern AI Development Needs a Design Document
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-white/70 sm:text-lg">
          AI coding tools can write code quickly - but they still need implementation guidance.
        </p>

        <div className="mt-10 rounded-[1.5rem] border border-[#14532d] bg-[#0a0a0a] p-6 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center">
            <DependencyBox box={dependencyBoxes[0]} />
            <div className="my-4 h-8 border-l border-dashed border-[#22c55e]/40" />
            <div className="grid w-full gap-4 md:grid-cols-3">
              {dependencyBoxes.slice(1, 4).map((box) => (
                <div key={box.label} className="flex flex-col items-center">
                  <DependencyBox box={box} />
                </div>
              ))}
            </div>
            <div className="my-4 w-full border-t border-dashed border-[#22c55e]/40" />
            <div className="grid w-full gap-4 md:grid-cols-4">
              {dependencyBoxes.slice(4).map((box) => (
                <div key={box.label} className="flex flex-col items-center">
                  <DependencyBox box={box} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xl font-semibold text-white sm:text-2xl">
          The clearer the design, the higher the quality of AI-generated code.
        </p>
      </div>
    </section>
  );
}

function DependencyBox({
  box,
}: {
  box: {
    label: string;
    icon: typeof FileText;
    level: "top" | "middle" | "bottom";
  };
}) {
  const Icon = box.icon;
  return (
    <div className="inline-flex min-h-20 min-w-44 flex-col items-start justify-center gap-2 rounded-lg border border-[#22c55e]/35 bg-[#111] px-4 py-3 text-left text-sm text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2 text-[#86efac]">
        <Icon className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#86efac]/90">
          {box.level}
        </span>
      </div>
      <div className="font-mono text-sm text-white/90">{box.label}</div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Manual Design Documentation vs AI Design Document Generator
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">
              Manual Documentation
            </div>
            <div className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-[#166534]">
              <img src={plannrLogo} alt="PLANNR" className="h-5 w-5 rounded-full object-contain" />
              PLANNR
            </div>
          </div>

          <div className="divide-y divide-border">
            {comparisonRows.map(([left, right]) => (
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
        <h2
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
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
                    <span className="mr-2 font-mono text-[#16a34a]">//</span>
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
                  style={{ maxHeight: open ? "240px" : "0px" }}
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
    <section className="bg-[#0a0a0a] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-[#14532d] bg-[#111] p-6 font-mono text-sm text-[#d1fae5] shadow-[0_16px_36px_-28px_rgba(0,0,0,0.6)]">
          <div className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#22c55e]">
            design-document.md
          </div>
          <div className="space-y-2">
            <FadeLine delay="0.1s" text="✓ System Design" />
            <FadeLine delay="0.3s" text="✓ Component Design" />
            <FadeLine delay="0.5s" text="✓ API Design" />
            <FadeLine delay="0.7s" text="✓ Database Schema" />
            <FadeLine delay="0.9s" text="✓ Deployment Strategy" />
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2
            className="font-bold tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Design Before You Develop
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-base leading-8 text-white/70 sm:text-lg">
            The best software is built from thoughtful design - not assumptions. Generate a
            professional Software Design Document with AI and give your developers - or your AI
            coding assistant - a technical blueprint they can confidently implement.
          </p>
          <div className="mt-8">
            <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
              Generate Your Free AI Design Document
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FadeLine({ text, delay }: { text: string; delay: string }) {
  return (
    <div
      className="animate-[dd-fade-in_0.6s_ease-out_forwards] opacity-0"
      style={{ animationDelay: delay }}
    >
      {text}
    </div>
  );
}

const ddStyle = `
@keyframes dd-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
