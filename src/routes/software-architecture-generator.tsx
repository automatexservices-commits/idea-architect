import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Database,
  Globe,
  LayoutTemplate,
  Lightbulb,
  MessageSquare,
  Monitor,
  Plus,
  Rocket,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/software-architecture-generator")({
  head: () => ({
    meta: [
      { title: "AI Software Architecture Generator | PLANNR" },
      {
        name: "description",
        content:
          "Generate complete software architecture documents in minutes with PLANNR's AI Software Architecture Generator for system design, database planning, API structure, and deployment planning.",
      },
      { property: "og:title", content: "AI Software Architecture Generator | PLANNR" },
      {
        property: "og:description",
        content:
          "Generate complete software architecture documents in minutes with PLANNR's AI Software Architecture Generator for system design, database planning, API structure, and deployment planning.",
      },
    ],
  }),
  component: SoftwareArchitectureGeneratorPage,
});

type FaqItem = {
  question: string;
  answer: string;
};

const architectureQuestions = [
  "Which frontend framework should be used?",
  "Which backend architecture fits this project?",
  "Which database should power the application?",
  "How should APIs communicate?",
  "How should authentication work?",
  "How should services scale?",
  "How should files and media be stored?",
  "How should third-party integrations connect?",
];

const architectureIncludes = [
  "System Overview",
  "Frontend Architecture",
  "Backend Architecture",
  "Database Design",
  "API Architecture",
  "Authentication Flow",
  "Authorization & Permissions",
  "Project Folder Structure",
  "Service Communication",
  "Technology Stack Recommendations",
  "Third-Party Integrations",
  "Caching Strategy",
  "Security Recommendations",
  "Scalability Planning",
  "Infrastructure Recommendations",
  "Deployment Strategy",
  "Monitoring & Logging",
  "Error Handling Strategy",
];

const componentCards = [
  {
    icon: Monitor,
    title: "Frontend",
    desc: "UI, routing, state management, authentication, and client-side logic",
  },
  {
    icon: Server,
    title: "Backend",
    desc: "Business logic, APIs, services, background jobs, and workflows",
  },
  {
    icon: Database,
    title: "Database",
    desc: "Relational or NoSQL selection, relationships, indexing, and data modeling",
  },
  {
    icon: Globe,
    title: "APIs",
    desc: "REST APIs, GraphQL, authentication, validation, and versioning",
  },
  {
    icon: Cloud,
    title: "Infrastructure",
    desc: "Hosting, CDN, storage, caching, queues, containers, and deployment",
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Authentication, authorization, encryption, rate limiting, and data protection",
  },
];

const patterns = [
  { name: "Monolithic", desc: "Single unified codebase", tag: "Small teams" },
  { name: "Layered", desc: "Organized into logical layers", tag: "Enterprise" },
  { name: "Microservices", desc: "Independent deployable services", tag: "High scale" },
  { name: "Event-Driven", desc: "Components communicate via events", tag: "Real-time" },
  { name: "Clean Architecture", desc: "Business logic fully isolated", tag: "Maintainability" },
  { name: "Hexagonal", desc: "Ports and adapters pattern", tag: "Testability" },
  { name: "Serverless", desc: "Function-based, no server management", tag: "Low ops" },
];

const useCases = {
  STARTUP: ["Startup MVPs", "AI Products", "Mobile Apps"],
  ENTERPRISE: ["ERP Platforms", "CRM Systems", "Enterprise Software", "Internal Business Tools"],
  INDUSTRY: [
    "SaaS Applications",
    "Marketplaces",
    "E-commerce Platforms",
    "Healthcare Software",
    "Fintech Products",
    "EdTech Platforms",
  ],
};

const splitWithout = [
  "APIs become inconsistent",
  "Database design breaks",
  "Authentication becomes confusing",
  "Features become difficult to maintain",
];

const splitWith = [
  "Consistent API structure",
  "Optimized database design",
  "Clear authentication flow",
  "Maintainable feature set",
];

const faqItems: FaqItem[] = [
  {
    question: "What is meant by software architecture?",
    answer:
      "Software architecture is the high-level design of a software system that defines its structure, components, technologies, and interactions before development begins.",
  },
  {
    question: "What are the three types of software architecture?",
    answer:
      "The three commonly used approaches are Monolithic Architecture, Microservices Architecture, and Event-Driven Architecture. Different projects require different architectural styles depending on complexity and scalability.",
  },
  {
    question: "What are the five common software architecture patterns?",
    answer:
      "Popular patterns include Layered Architecture, Microservices, Event-Driven, Clean Architecture, and Hexagonal Architecture.",
  },
  {
    question: "What is an example of software architecture?",
    answer:
      "A typical SaaS application might include a React frontend, Node.js backend, PostgreSQL database, Redis cache, object storage, REST APIs, and an authentication service. Together these components form the application's software architecture.",
  },
  {
    question: "Can AI generate software architecture?",
    answer:
      "Yes. AI can recommend complete software architectures based on your application's requirements. PLANNR generates structured architecture documents by understanding your product before recommending technologies and system design.",
  },
  {
    question: "What should a software architecture document include?",
    answer:
      "A professional architecture document typically includes System Overview, Technology Stack, Database Design, API Structure, Authentication, Infrastructure, Scalability, Security, Deployment Strategy, and Integration Planning.",
  },
  {
    question: "Why should startups create software architecture before coding?",
    answer:
      "Planning architecture early reduces technical debt, speeds up development, improves AI-generated code quality, and prevents expensive redesigns later.",
  },
];

function SoftwareArchitectureGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <style>{`
          @keyframes arch-scan-line {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 0.28; }
            50% { opacity: 0.28; }
            90% { opacity: 0.12; }
            100% { top: 100%; opacity: 0; }
          }

          .arch-scan-line {
            animation: arch-scan-line 3s linear infinite;
          }

          .blueprint-overlay {
            background-image:
              repeating-linear-gradient(
                45deg,
                rgba(34, 197, 94, 0.04) 0,
                rgba(34, 197, 94, 0.04) 1px,
                transparent 1px,
                transparent 14px
              );
          }

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <BuildWithFoundation />
          <WhatIsArchitecture />
          <WhyArchitectureMatters />
          <WhyUseGenerator />
          <WhatPlannrGenerates />
          <ComponentsSection />
          <PatternsSection />
          <HowItWorks />
          <UseCasesSection />
          <WhyAiNeedsArchitecture />
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
      <div className="absolute inset-0 blueprint-overlay opacity-[0.04]" />
      <div className="absolute left-1/2 top-16 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.27_145/0.16),transparent_68%)] blur-[100px]" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pb-24 sm:pt-28">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-white/85 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-[#14532d] shadow-[0_10px_30px_-18px_oklch(0.78_0.27_145/0.35)]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          <span aria-hidden="true">&#x2B22;</span> SYSTEM DESIGN
        </div>

        <div className="relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px]">
            <div className="arch-scan-line absolute left-0 h-[2px] w-full bg-[#22c55e] opacity-30" />
          </div>
          <h1
            className="relative z-10 mx-auto max-w-5xl font-bold tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.02 }}
          >
            AI Software Architecture Generator
          </h1>
        </div>

        <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
          Design scalable software architecture in minutes with AI. Generate complete system
          architecture, database design, API structure, technology recommendations, and deployment
          planning before writing a single line of code.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
            Generate Software Architecture
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p
          className="mt-4 text-sm text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          <span aria-hidden="true">&#x2B22;</span> blueprint-ready output
        </p>
      </div>
    </section>
  );
}

function BuildWithFoundation() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          ARCHITECTURE FIRST
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Build Software with a Strong Foundation
        </h2>
        <p className="mt-5 max-w-5xl text-base leading-8 text-muted-foreground sm:text-lg">
          The quality of your software depends on its architecture. A great architecture helps teams
          build applications that are scalable, secure, maintainable, and easy to extend. Whether
          you're creating a startup MVP, SaaS platform, mobile app, AI product, CRM, marketplace,
          ERP, or enterprise software, PLANNR generates a structured software architecture tailored
          to your project.
        </p>
      </div>
    </section>
  );
}

function WhatIsArchitecture() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-10 flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]/20 blur-3xl" />
            <div
              className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              01
            </div>
          </div>
          <div className="max-w-3xl">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What is Software Architecture?
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Software architecture is the high-level blueprint of a software system. It defines how
              different components interact, how data flows, how users access the application, and
              how the system scales over time.
            </p>
          </div>
        </div>

        <p className="text-base font-medium text-foreground">
          A well-designed architecture answers:
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {architectureQuestions.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)] transition-colors duration-150 hover:border-[#22c55e]/40 hover:bg-[#dcfce7]/35"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#22c55e]/20 bg-[#dcfce7]/70 text-[#16a34a]">
                <ChevronRight className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                {item}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-8 text-muted-foreground">
          Instead of figuring these decisions during development, software architecture establishes
          them before coding begins.
        </p>
      </div>
    </section>
  );
}

function WhyArchitectureMatters() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mb-8 flex items-start gap-6">
          <div className="order-2 shrink-0 sm:order-1">
            <div
              className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              02
            </div>
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-3xl" />
          </div>
          <div className="order-1 max-w-3xl sm:order-2">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Why Software Architecture Matters
            </h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
            <h3 className="text-lg font-semibold text-foreground">Architecture reduces:</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Technical debt",
                "Costly redesigns",
                "Development delays",
                "Security issues",
                "Performance bottlenecks",
                "Scalability problems",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                >
                  <span>✗</span> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
            <h3 className="text-lg font-semibold text-foreground">Architecture improves:</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Team collaboration",
                "AI code quality",
                "Development speed",
                "System reliability",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#dcfce7] px-4 py-2 text-sm font-medium text-[#14532d]"
                >
                  <span>✓</span> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUseGenerator() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Why Use an AI Software Architecture Generator?
        </h2>
        <div className="mt-6 max-w-4xl space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
          <p>
            Traditional architecture planning requires experienced software architects and days of
            planning.
          </p>
          <p>
            PLANNR accelerates this process using AI. Based on your product idea, business goals,
            users, and technical requirements, PLANNR recommends an architecture that follows modern
            software engineering best practices.
          </p>
          <p>
            Instead of a blank whiteboard, you receive a structured architecture that your team - or
            your AI coding assistant - can immediately build from.
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
            <div
              className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              03
            </div>
          </div>
          <div className="max-w-3xl">
            <h2
              className="font-bold tracking-tight text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              What PLANNR Generates
            </h2>
            <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
              Every architecture includes:
            </h3>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {architectureIncludes.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)] transition-colors duration-150 hover:border-[#22c55e]/40 hover:bg-[#dcfce7]/35"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
              <span className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComponentsSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          SYSTEM TOPOLOGY
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Software Architecture Components
        </h2>

        <div className="mt-8 grid gap-0 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)] sm:grid-cols-2 lg:grid-cols-3">
          {componentCards.map((item, index) => {
            const Icon = item.icon;
            const isLastCol = (index + 1) % 3 === 0;
            const isLastRow = index >= 3;

            return (
              <div
                key={item.title}
                className="min-h-[190px] p-6 transition-colors duration-150 hover:bg-[#dcfce7]/25"
                style={{
                  borderRight: isLastCol ? "none" : "1px dashed rgba(34, 197, 94, 0.3)",
                  borderBottom: isLastRow ? "none" : "1px dashed rgba(34, 197, 94, 0.3)",
                }}
              >
                <Icon className="h-8 w-8 text-[#16a34a]" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PatternsSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          DESIGN PATTERNS
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Architecture Patterns PLANNR Recommends
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
          PLANNR recommends patterns based on your project size, team, and scalability goals.
        </p>

        <div
          className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {patterns.map((pattern) => (
            <article
              key={pattern.name}
              className="w-[220px] shrink-0 snap-start rounded-[1.25rem] border border-[#22c55e]/25 bg-[#0f0f0f] p-5 text-white shadow-[0_14px_28px_-24px_rgba(0,0,0,0.5)]"
              style={{ borderTop: "3px solid #22c55e" }}
            >
              <p
                className="text-sm font-semibold uppercase tracking-[0.22em] text-[#86efac]"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {pattern.name}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/75">{pattern.desc}</p>
              <div
                className="mt-4 inline-flex rounded-full border border-[#22c55e]/30 bg-[#052e16] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#86efac]"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {pattern.tag}
              </div>
            </article>
          ))}
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
      title: "Describe Your Product",
      desc: "Explain your startup, SaaS, mobile app, AI tool, marketplace, CRM, ERP, or business idea.",
    },
    {
      icon: MessageSquare,
      title: "Answer Smart Questions",
      desc: "PLANNR collects information about users, expected traffic, integrations, authentication, payments, business rules, file uploads, notifications, and scalability.",
    },
    {
      icon: LayoutTemplate,
      title: "Generate Your Architecture",
      desc: "PLANNR creates a complete architecture document tailored to your application using software engineering best practices.",
    },
    {
      icon: Rocket,
      title: "Build Faster",
      desc: "Use the generated architecture with Cursor, Claude Code, Lovable, Bolt, Windsurf, Replit, GitHub Copilot, or your engineering team.",
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

function UseCasesSection() {
  const groups: Array<{ label: keyof typeof useCases; items: string[] }> = [
    { label: "STARTUP", items: useCases.STARTUP },
    { label: "ENTERPRISE", items: useCases.ENTERPRISE },
    { label: "INDUSTRY", items: useCases.INDUSTRY },
  ];

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
          Generate Architecture For
        </h2>

        <div className="mt-8 flex flex-wrap gap-8">
          {groups.map((group) => (
            <div key={group.label} className="min-w-[240px] flex-1">
              <p
                className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {group.label}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-full border border-[#22c55e]/35 bg-white px-4 py-2 text-sm font-medium text-[#14532d] transition-colors hover:bg-[#22c55e] hover:text-white"
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

function WhyAiNeedsArchitecture() {
  return (
    <section className="border-b border-[#14532d] bg-[#052e16] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Why AI Coding Needs Software Architecture
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
          Modern AI coding tools can generate code quickly. However, they still depend on clear
          architecture.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[#ef4444]/35 bg-[#0a0a0a] p-6">
            <h3 className="text-lg font-semibold text-white">Without Architecture</h3>
            <div className="mt-4 space-y-3">
              {splitWithout.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[#ef4444]/25 bg-[#2a0f0f] px-4 py-2 text-sm text-red-200"
                >
                  ✗ {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#22c55e]/35 bg-[#0a0a0a] p-6">
            <h3 className="text-lg font-semibold text-white">With Architecture</h3>
            <div className="mt-4 space-y-3">
              {splitWith.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[#22c55e]/25 bg-[#082f18] px-4 py-2 text-sm text-[#86efac]"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-center text-xl font-semibold text-white sm:text-2xl">
          A well-defined architecture gives AI coding assistants the context needed to generate
          production-ready software.
        </p>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const rows = [
    ["Hours or days of planning", "Minutes"],
    ["Blank diagrams", "Structured architecture"],
    ["Manual technology research", "AI recommendations"],
    ["Difficult collaboration", "Export-ready documentation"],
    ["Inconsistent planning", "Standardized architecture"],
    ["Easy to overlook scalability", "Built-in best practices"],
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          AI Architecture vs Manual Planning
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">
              Manual Planning
            </div>
            <div className="px-5 py-4 text-sm font-semibold text-[#166534]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#dcfce7] px-3 py-1">
                <img
                  src={plannrLogo}
                  alt="PLANNR"
                  className="h-4 w-4 rounded-full object-contain object-center"
                />
                <span className="font-display">PLANNR</span>
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
                      &gt;_
                    </span>
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
    <section className="relative overflow-hidden bg-[#052e16] py-20">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      <div className="absolute inset-0 blueprint-overlay opacity-[0.04]" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-[#86efac]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          &gt;_ initialize_project()
        </p>
        <h2
          className="mt-4 font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Design Before You Develop
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
          Great software isn't built by accident. It's designed with the right architecture from day
          one. Generate a complete AI-powered software architecture and give your developers - or
          your AI coding assistant - a blueprint they can confidently build from.
        </p>
        <div className="mt-8">
          <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
            Generate Your Free Software Architecture
          </Link>
        </div>
      </div>
    </section>
  );
}
