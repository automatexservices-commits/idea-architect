import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Download,
  FileCheck,
  FileCode,
  ListChecks,
  ShieldCheck,
  Terminal,
  Users,
  LayoutGrid,
  BriefcaseBusiness,
  Smartphone,
  Sparkles,
  Database,
  Settings2,
  Layers3,
  BookOpenText,
  CircleDot,
  ShieldAlert,
  CircleCheckBig,
  MapPinned,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/srs-generator")({
  head: () => ({
    meta: [
      { title: "AI SRS Generator | PLANNR" },
      {
        name: "description",
        content:
          "Generate professional Software Requirements Specification documents in minutes with PLANNR's AI SRS Generator for Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot workflows.",
      },
      { property: "og:title", content: "AI SRS Generator | PLANNR" },
      {
        property: "og:description",
        content:
          "Generate professional Software Requirements Specification documents in minutes with PLANNR's AI SRS Generator for Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot workflows.",
      },
    ],
  }),
  component: SrsGeneratorPage,
});

type FaqItem = {
  question: string;
  answer: string;
};

const srsSpecItems = [
  "Functional Requirements",
  "Non-Functional Requirements",
  "User Roles",
  "Business Rules",
  "System Constraints",
  "User Flows",
  "Use Cases",
  "Acceptance Criteria",
  "Security Requirements",
  "Performance Requirements",
  "API Requirements",
  "Database Considerations",
  "Scalability Requirements",
  "Integration Requirements",
];

const generatedItems = [
  "Project Overview",
  "Business Objectives",
  "System Scope",
  "Functional Requirements",
  "Non-Functional Requirements",
  "User Roles & Permissions",
  "User Stories",
  "Use Cases",
  "Acceptance Criteria",
  "Data Flow",
  "Security Requirements",
  "Performance Requirements",
  "API Planning",
  "Integration Requirements",
  "Database Recommendations",
  "Technical Constraints",
  "Scalability Considerations",
  "Future Enhancements",
];

const useCases = [
  { label: "SaaS Applications", icon: LayoutGrid, width: "w-[170px]" },
  { label: "Mobile Apps", icon: Smartphone, width: "w-[140px]" },
  { label: "AI Products", icon: Sparkles, width: "w-[140px]" },
  { label: "CRM Systems", icon: BriefcaseBusiness, width: "w-[150px]" },
  { label: "ERP Platforms", icon: Database, width: "w-[155px]" },
  { label: "E-commerce Platforms", icon: Layers3, width: "w-[195px]" },
  { label: "Healthcare Software", icon: ShieldAlert, width: "w-[185px]" },
  { label: "Fintech Applications", icon: CircleCheckBig, width: "w-[190px]" },
  { label: "HR Systems", icon: Users, width: "w-[135px]" },
  { label: "Learning Management Systems", icon: BookOpenText, width: "w-[240px]" },
  { label: "Internal Business Tools", icon: Settings2, width: "w-[210px]" },
  { label: "Startup MVPs", icon: CircleDot, width: "w-[145px]" },
  { label: "Enterprise Software", icon: MapPinned, width: "w-[180px]" },
];

const teamBenefits = [
  {
    icon: Clock,
    title: "Save Hours",
    description: "Eliminate hours of manual documentation work",
  },
  {
    icon: Users,
    title: "Improve Team Communication",
    description: "Create a shared understanding between founders, developers, and designers",
  },
  {
    icon: FileCheck,
    title: "Consistent Documentation",
    description: "Every SRS follows the same professional structure",
  },
  {
    icon: ShieldCheck,
    title: "Reduce Mistakes",
    description: "Catch missing requirements before development begins",
  },
  {
    icon: Code2,
    title: "Plan Before You Code",
    description: "Structure your software before writing a single line",
  },
  {
    icon: Bot,
    title: "AI-Ready Specifications",
    description: "Generate specifications optimized for AI coding tools",
  },
  {
    icon: Download,
    title: "Export-Ready",
    description: "Download structured documents instantly",
  },
];

const faqItems: FaqItem[] = [
  {
    question: "What is a Software Requirements Specification (SRS)?",
    answer:
      "A Software Requirements Specification (SRS) is a document describing the functional and non-functional requirements of a software system before development begins.",
  },
  {
    question: "What should an SRS include?",
    answer:
      "A professional SRS includes: Project Scope, Functional Requirements, Non-Functional Requirements, User Roles, Business Rules, Use Cases, User Stories, Security Requirements, Performance Requirements, Integration Requirements, and Acceptance Criteria.",
  },
  {
    question: "Can AI generate an SRS document?",
    answer:
      "Yes. AI can generate detailed Software Requirements Specifications when it understands the project context. PLANNR improves accuracy by asking structured follow-up questions before generating the final document.",
  },
  {
    question: "Is there a free SRS template?",
    answer:
      "Yes. PLANNR generates export-ready Software Requirements Specification documents that can also be used as reusable templates.",
  },
  {
    question: "Which tools can use an SRS?",
    answer:
      "Generated SRS documents work well with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, and GitHub Copilot. They also help human development teams stay aligned throughout the project.",
  },
  {
    question: "What is the difference between a PRD and an SRS?",
    answer:
      "A PRD focuses on product goals, users, and business requirements. An SRS focuses on the detailed software requirements developers need to build the system. Many teams create both documents before development.",
  },
  {
    question: "Can startups benefit from an SRS?",
    answer:
      "Absolutely. Even small MVPs benefit from clear software requirements because they reduce confusion, improve communication, and help AI coding platforms generate better results.",
  },
];

function SrsGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <style>{`
          @keyframes srs-scan-line {
            0% {
              top: 0%;
              opacity: 0;
            }
            10% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.3;
            }
            90% {
              opacity: 0.15;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }

          .srs-scan-line {
            animation: srs-scan-line 3s linear infinite;
          }
        `}</style>
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <BuildWithRequirements />
          <WhatIsSrs />
          <WhyUseAiSrs />
          <WhatPlannrGenerates />
          <HowItWorks />
          <WhyModernAiNeedsSrs />
          <CommonUseCases />
          <WhyTeamsChoosePlannr />
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
      <div className="absolute left-1/2 top-16 h-[500px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.27_145/0.18),transparent_68%)] blur-[90px]" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pb-24 sm:pt-28">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-white/85 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-[#14532d] shadow-[0_10px_30px_-18px_oklch(0.78_0.27_145/0.35)]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {`{ SRS_GENERATOR }`}
        </div>

        <div className="relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px]">
            <div className="srs-scan-line absolute left-0 h-[2px] w-full bg-[#22c55e] opacity-30" />
          </div>
          <h1
            className="relative z-10 mx-auto max-w-5xl font-bold tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.02 }}
          >
            AI Software Requirements Specification (SRS) Generator
          </h1>
        </div>

        <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
          Generate professional Software Requirements Specification (SRS) documents in minutes using
          AI. Transform your software idea into a structured, developer-ready specification that
          works seamlessly with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, GitHub
          Copilot, and modern AI development tools.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
            Generate Free SRS
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BuildWithRequirements() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          REQUIREMENTS_FIRST
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Build Software with Clear Requirements
        </h2>
        <p className="mt-5 max-w-5xl text-base leading-8 text-muted-foreground sm:text-lg">
          Every successful software project starts with one thing: A clear Software Requirements
          Specification. Whether you&apos;re building a SaaS platform, mobile app, CRM, AI product,
          ERP, marketplace, healthcare system, fintech application, or internal business tool, an
          SRS helps everyone understand exactly what needs to be built.
        </p>
        <p className="mt-8 text-2xl font-semibold text-[#16a34a]">
          PLANNR automates this entire process.
        </p>
      </div>
    </section>
  );
}

function WhatIsSrs() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-10 flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]/20 blur-3xl" />
            <div className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              01
            </div>
          </div>
          <div className="max-w-3xl">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What is a Software Requirements Specification (SRS)?
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              A Software Requirements Specification (SRS) is a detailed document describing
              everything a software system must do before development begins. It acts as the single
              source of truth for founders, developers, designers, QA engineers, project managers,
              and AI coding assistants.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="divide-y divide-border">
            {srsSpecItems.map((item, index) => (
              <div
                key={item}
                className="grid grid-cols-[84px_1fr] items-center border-b border-border/60 px-4 py-4 transition-colors duration-150 last:border-b-0 hover:bg-[#dcfce7]/40"
              >
                <div
                  className="text-sm font-semibold text-[#16a34a]"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="text-sm font-medium text-foreground sm:text-[0.95rem]">{item}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          An SRS reduces misunderstandings, scope creep, development delays, and expensive rework.
        </p>
      </div>
    </section>
  );
}

function WhyUseAiSrs() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-8 flex items-start gap-6">
          <div className="order-2 shrink-0 sm:order-1">
            <div className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              02
            </div>
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl" />
          </div>
          <div className="order-1 max-w-3xl sm:order-2">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Why Use an AI SRS Generator?
            </h2>
          </div>
        </div>

        <div className="max-w-4xl space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
          <p>
            Writing an SRS manually is time-consuming. Most teams either skip it completely or
            produce incomplete documentation.
          </p>
          <p>
            PLANNR generates structured Software Requirements Specifications using AI by
            understanding your product through intelligent follow-up questions.
          </p>
          <p>
            Instead of staring at a blank document, you receive a professional specification within
            minutes.
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
            <div className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20">
              03
            </div>
          </div>
          <div className="max-w-3xl">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What Does PLANNR Generate?
            </h2>
            <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
              Every generated SRS includes:
            </h3>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {generatedItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)] transition-colors duration-150 hover:bg-[#dcfce7]/35 hover:border-[#22c55e]/40"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
              <span className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                {item}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          Everything is structured using software engineering best practices.
        </p>
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
      icon: Terminal,
      title: "Describe Your Software Idea",
      desc: "Simply explain your software project. No technical jargon required.",
    },
    {
      icon: ListChecks,
      title: "Answer Intelligent Questions",
      desc: "PLANNR asks structured follow-up questions about users, workflows, features, permissions, integrations, authentication, payments, and business rules.",
    },
    {
      icon: FileCode,
      title: "Generate Your SRS",
      desc: "PLANNR generates a complete Software Requirements Specification automatically, structured using software engineering best practices.",
    },
    {
      icon: Cpu,
      title: "Build With AI or Your Team",
      desc: "Use the generated SRS with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, or hand it directly to your development team.",
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
      <div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#22c55e]/30 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          PROCESS
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          How It Works
        </h2>

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
                    <div
                      className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
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

function WhyModernAiNeedsSrs() {
  const lines = [
    "Required modules",
    "User permissions",
    "Business rules",
    "Functional requirements",
    "Edge cases",
    "Security expectations",
    "Performance goals",
    "Acceptance criteria",
  ];

  return (
    <section className="border-b border-[#14532d] bg-[#052e16] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Why Modern AI Development Needs an SRS
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
          AI coding tools perform dramatically better when they receive structured software
          requirements instead of vague prompts.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[#14532d] bg-[#0a0a0a] p-5 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.6)] sm:p-6">
          <div
            className="text-sm text-[#86efac]"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            // without SRS
          </div>
          <div
            className="mt-4 text-sm text-red-300"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            &gt; "Build me a CRM."
          </div>
          <div className="my-5 h-px w-full bg-white/10" />
          <div
            className="text-sm text-[#22c55e]"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            // with SRS
          </div>
          <div
            className="mt-4 space-y-2 text-sm text-[#86efac]"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {lines.map((line) => (
              <div key={line}>- {line}</div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xl font-semibold text-white sm:text-2xl">
          Better requirements produce better software.
        </p>
      </div>
    </section>
  );
}

function CommonUseCases() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          USE CASES
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Generate SRS Documents For
        </h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`group inline-flex ${item.width} items-center gap-2 rounded-full border border-[#22c55e]/35 bg-white px-4 py-2.5 text-sm font-medium text-[#14532d] transition-all duration-200 hover:bg-[#22c55e] hover:text-white hover:shadow-[0_12px_24px_-18px_rgba(34,197,94,0.5)]`}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#16a34a] transition-colors group-hover:text-white" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyTeamsChoosePlannr() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Why Teams Choose PLANNR
        </h2>

        <div className="mt-8 space-y-3">
          {teamBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="flex flex-col gap-4 rounded-xl border border-border border-l-0 bg-white p-5 transition-[border-left-width,background-color,border-color] duration-200 hover:border-[#22c55e]/40 hover:border-l-[3px] hover:bg-[#dcfce7]/35 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/20 bg-[#dcfce7]/70 text-[#16a34a]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const rows = [
    ["Time-consuming", "Generated in minutes"],
    ["Blank document", "Guided workflow"],
    ["Easy to miss requirements", "Complete structured specification"],
    ["Inconsistent formatting", "Professional documentation"],
    ["Difficult collaboration", "Export-ready documents"],
    ["Generic AI prompts", "Context-aware AI generation"],
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Manual SRS vs AI SRS Generator
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">Manual SRS</div>
            <div className="px-5 py-4 text-sm font-semibold text-[#166534]">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#dcfce7] px-3 py-1"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
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
        <h2
          className="font-bold tracking-tight text-foreground sm:text-4xl"
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
                    <span
                      className="mr-2 text-[#16a34a]"
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      #
                    </span>
                    {item.question}
                  </span>
                  <span
                    className={`text-2xl leading-none text-[#16a34a] transition-transform duration-200 ${
                      open ? "rotate-45" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
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
    <section className="bg-[#052e16] py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-[#86efac]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          // ready to start?
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Ready to Generate Your Software Requirements Specification?
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
          Turn your software idea into a complete Software Requirements Specification in minutes. No
          blank documents. No confusing templates. Just structured, AI-generated documentation that
          developers can build from.
        </p>
        <div className="mt-8">
          <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
            Generate Your Free AI SRS
          </Link>
        </div>
      </div>
    </section>
  );
}
