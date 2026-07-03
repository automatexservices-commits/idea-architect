import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Download,
  FileCode2,
  Lightbulb,
  MessageSquare,
  Monitor,
  Plus,
  Send,
  Server,
  Share2,
  Sparkles,
} from "lucide-react";
import plannrLogo from "@/assets/plannr-logo.png";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/api-documentation-generator")({
  head: () => ({
    meta: [
      { title: "AI API Documentation Generator | PLANNR" },
      {
        name: "description",
        content:
          "Generate professional API documentation in minutes with PLANNR's AI API Documentation Generator for endpoint references, authentication guides, request and response examples, error handling, and OpenAPI-ready docs.",
      },
      { property: "og:title", content: "AI API Documentation Generator | PLANNR" },
      {
        property: "og:description",
        content:
          "Generate professional API documentation in minutes with PLANNR's AI API Documentation Generator for endpoint references, authentication guides, request and response examples, error handling, and OpenAPI-ready docs.",
      },
    ],
  }),
  component: ApiDocumentationGeneratorPage,
});

type FaqItem = {
  question: string;
  answer: string;
};

type Method = "GET" | "POST" | "PUT";

const monoStyle: CSSProperties = {
  fontFamily: "'Courier New', monospace",
};

const faqItems: FaqItem[] = [
  {
    question: "What is API documentation?",
    answer:
      "API documentation explains how developers can interact with an API, including authentication, endpoints, parameters, request formats, response formats, and error handling.",
  },
  {
    question: "What is API documentation used for?",
    answer:
      "API documentation helps developers understand, integrate, test, and maintain APIs without needing direct support from the API creators.",
  },
  {
    question: "What should API documentation include?",
    answer:
      "A complete API documentation should include: API overview, Authentication, Endpoints, Parameters, Request examples, Response examples, Error codes, Rate limits, SDK references, and Integration guides.",
  },
  {
    question: "How do you write API documentation?",
    answer:
      "Good API documentation starts by identifying every endpoint, documenting request and response formats, explaining authentication, providing examples, and describing common errors. PLANNR automates this entire workflow using AI.",
  },
  {
    question: "Who writes API documentation?",
    answer:
      "API documentation is commonly written by backend developers, technical writers, software architects, or platform engineers. With PLANNR, AI generates the initial documentation, significantly reducing manual work.",
  },
  {
    question: "Can AI generate API documentation?",
    answer:
      "Yes. AI can generate structured API documentation based on your backend architecture and endpoint definitions. PLANNR creates organized, developer-friendly documentation that is easier to understand and maintain.",
  },
  {
    question: "What does good API documentation look like?",
    answer:
      "High-quality API documentation is easy to read, searchable, well organized, rich with examples, consistent across endpoints, and continuously updated.",
  },
  {
    question: "Where can I find API documentation templates?",
    answer:
      "PLANNR generates export-ready API documentation that can be reused as a template for future projects and APIs.",
  },
];

const apiDocumentationSections = [
  { method: "GET", name: "API Overview" },
  { method: "POST", name: "Authentication Guide" },
  { method: "GET", name: "Base URL" },
  { method: "GET", name: "Endpoint Reference" },
  { method: "GET", name: "HTTP Methods" },
  { method: "POST", name: "Request Parameters" },
  { method: "GET", name: "Path Parameters" },
  { method: "GET", name: "Query Parameters" },
  { method: "POST", name: "Request Body" },
  { method: "GET", name: "Response Examples" },
  { method: "GET", name: "Status Codes" },
  { method: "GET", name: "Error Messages" },
  { method: "POST", name: "Validation Rules" },
  { method: "GET", name: "Rate Limits" },
  { method: "GET", name: "Pagination" },
  { method: "POST", name: "Webhook Documentation" },
  { method: "GET", name: "SDK & Integration Notes" },
  { method: "GET", name: "Security Best Practices" },
  { method: "POST", name: "Example Requests" },
] as const;

const useCaseGroups = [
  {
    label: "INTERNAL",
    items: ["Internal APIs", "Mobile App Backends", "CRM APIs", "ERP APIs"],
  },
  {
    label: "PUBLIC",
    items: ["Public APIs", "REST APIs", "AI APIs"],
  },
  {
    label: "PLATFORM",
    items: ["SaaS Platforms", "Payment APIs", "Authentication APIs", "Enterprise Services"],
  },
  {
    label: "ARCHITECTURE",
    items: ["Microservices", "Webhook APIs"],
  },
];

function ApiDocumentationGeneratorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <div
        className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <HeroSection />
          <WhatIsApiSection />
          <WhatIsApiDocumentationSection />
          <WhyUseAiSection />
          <WhatPlannrGeneratesSection />
          <HowItWorksSection />
          <GreatDocsSection />
          <UseCasesSection />
          <ComparisonSection />
          <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
          <FinalCtaSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div
        className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-16 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.27_145/0.16),transparent_68%)] blur-[100px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-24 lg:grid-cols-2 lg:items-center lg:pb-24 lg:pt-28">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/40 bg-white/90 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-[#166534] shadow-[0_10px_30px_-18px_oklch(0.78_0.27_145/0.35)]"
            style={monoStyle}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
            {"{ API_DOCS }"}
          </div>

          <h1
            className="mt-8 font-bold tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.02 }}
          >
            AI API Documentation Generator
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Generate professional API documentation in minutes with AI. Create clear,
            developer-friendly REST API documentation, endpoint references, request/response
            examples, authentication guides, and OpenAPI-ready documentation before writing
            production code.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
              Generate API Documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground" style={monoStyle}>
            // free to generate
          </p>
        </div>

        <div className="lg:justify-self-end">
          <EndpointPreviewCard />
        </div>
      </div>
    </section>
  );
}

function EndpointPreviewCard() {
  return (
    <div className="rounded-[12px] border border-white/10 border-l-[3px] border-l-[#22c55e] bg-[#0f0f0f] p-6 text-[#e5e7eb] shadow-[0_16px_36px_-28px_rgba(0,0,0,0.65)]">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
      </div>

      <div className="space-y-3" style={monoStyle}>
        <div className="text-sm">
          <span className="text-[#6b7280]">GET</span>{" "}
          <span className="text-[#22c55e]">/api/v1/users</span>
        </div>
        <div className="text-sm text-[#d1d5db]">Authorization: Bearer {"{token}"}</div>
        <div className="h-px bg-white/10" />
        <div className="text-xs uppercase tracking-[0.28em] text-[#6b7280]">Response</div>
        <div className="inline-flex w-fit rounded-full border border-[#22c55e]/30 bg-[#052e16] px-3 py-1 text-xs font-semibold text-[#86efac]">
          200 OK
        </div>
        <div className="space-y-1 text-sm text-[#d1d5db]">
          <div>{'{ "users": [...]'}</div>
          <div>{'  "total": 142,'}</div>
          <div>{'  "page": 1 }'}</div>
        </div>
      </div>
    </div>
  );
}

function WhatIsApiSection() {
  const steps = [
    { icon: Monitor, title: "Client", tone: "light" },
    { icon: Send, title: "API Request", tone: "green" },
    { icon: Server, title: "Server", tone: "dark" },
    { icon: Download, title: "API Response", tone: "green" },
    { icon: Monitor, title: "Client", tone: "light" },
  ] as const;

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={monoStyle}
        >
          FUNDAMENTALS
        </p>
        <h2
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          What is an API?
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
          An API (Application Programming Interface) is a set of rules that allows different
          software applications to communicate with each other. APIs define how requests are made,
          what data is sent, and what responses to expect — acting as the contract between a client
          and a server.
        </p>

        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isGreen = step.tone === "green";
            const isDark = step.tone === "dark";

            return (
              <div
                key={step.title}
                className="flex flex-1 flex-col items-stretch lg:flex-row lg:items-center"
              >
                <div
                  className={[
                    "flex min-h-24 flex-1 items-center gap-3 rounded-2xl border px-4 py-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)]",
                    isGreen
                      ? "border-[#22c55e]/25 bg-[#dcfce7]/70 text-[#14532d]"
                      : isDark
                        ? "border-border bg-[#0f0f0f] text-white"
                        : "border-border bg-white text-foreground",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                      isGreen
                        ? "border-[#22c55e]/20 bg-white text-[#16a34a]"
                        : isDark
                          ? "border-[#22c55e]/20 bg-[#052e16] text-[#86efac]"
                          : "border-border bg-muted text-[#166534]",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={monoStyle}>
                      {step.title}
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center px-2 py-2 text-muted-foreground lg:h-full lg:flex-col lg:px-3 lg:py-0">
                    <span className="hidden text-xl leading-none lg:block">→</span>
                    <span className="text-xl leading-none lg:hidden">↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
          Every time you use an app that fetches data, makes a payment, or sends a notification — an
          API is working behind the scenes.
        </p>
      </div>
    </section>
  );
}

function WhatIsApiDocumentationSection() {
  const questions = [
    "What does this API do?",
    "How do I authenticate?",
    "Which endpoints are available?",
    "What parameters are required?",
    "What responses should I expect?",
    "Which errors can occur?",
    "How do I integrate this API?",
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div
            className="absolute -left-3 top-4 hidden h-28 w-28 rounded-full bg-[#22c55e]/20 blur-3xl lg:block"
            aria-hidden="true"
          />
          <div className="mb-10 flex items-start gap-6">
            <div className="relative hidden shrink-0 lg:block">
              <div
                className="absolute -left-5 -top-2 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
                style={monoStyle}
              >
                API_01
              </div>
            </div>
            <div className="max-w-3xl">
              <h2
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                What is API Documentation?
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                API documentation is a structured guide explaining how developers interact with an
                API. It documents every endpoint, request, response, authentication method,
                parameters, headers, error codes, and usage examples. Good API documentation
                answers:
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {questions.map((question) => (
              <div
                key={question}
                className="rounded-2xl border border-border bg-white p-5 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)]"
              >
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                  <h3 className="text-sm font-semibold leading-6 text-foreground sm:text-[0.95rem]">
                    {question}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
            Instead of developers guessing how an API works, they receive clear documentation from
            day one.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhyUseAiSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div
            className="absolute right-0 top-3 hidden h-28 w-28 rounded-full bg-[#22c55e]/20 blur-3xl lg:block"
            aria-hidden="true"
          />
          <div className="mb-10 flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h2
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Why Use an AI API Documentation Generator?
              </h2>
            </div>
            <div className="relative hidden shrink-0 lg:block">
              <div
                className="absolute -right-5 -top-2 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
                style={monoStyle}
              >
                API_02
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              Writing API documentation manually is repetitive and time-consuming.
            </p>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              PLANNR automatically generates structured API documentation based on your product
              requirements, backend architecture, and API design. Instead of maintaining dozens of
              documentation pages manually, you receive consistent, professional documentation ready
              for developers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatPlannrGeneratesSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative">
          <div
            className="absolute -left-3 top-4 hidden h-28 w-28 rounded-full bg-[#22c55e]/20 blur-3xl lg:block"
            aria-hidden="true"
          />
          <div className="mb-10 flex items-start gap-6">
            <div className="relative hidden shrink-0 lg:block">
              <div
                className="absolute -left-5 -top-2 h-24 w-24 rounded-full bg-[#22c55e]/20 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="relative text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a]/20"
                style={monoStyle}
              >
                API_03
              </div>
            </div>
            <div className="max-w-3xl">
              <h2
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                What PLANNR Generates
              </h2>
              <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">
                Every API documentation includes:
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {apiDocumentationSections.map((item) => (
              <EndpointRow key={item.name} method={item.method} label={item.name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EndpointRow({ method, label }: { method: Method; label: string }) {
  const methodStyles: Record<Method, string> = {
    GET: "bg-[#dcfce7] text-[#166534] border-[#22c55e]/20",
    POST: "bg-[#dbeafe] text-[#1d4ed8] border-[#60a5fa]/20",
    PUT: "bg-[#ffedd5] text-[#c2410c] border-[#fb923c]/20",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 shadow-[0_12px_28px_-24px_oklch(0.18_0.01_150/0.28)] transition-colors hover:border-[#22c55e]/30 hover:bg-[#f7fff9]">
      <span
        className={`inline-flex shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-[0.14em] ${methodStyles[method]}`}
        style={monoStyle}
      >
        {method}
      </span>
      <span className="text-sm font-medium text-foreground sm:text-[0.95rem]">{label}</span>
    </div>
  );
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => [false, false, false, false]);

  const steps = [
    {
      icon: Lightbulb,
      title: "Describe Your Product",
      desc: "Explain your SaaS, mobile app, AI product, backend service, payment platform, marketplace, or internal tool.",
    },
    {
      icon: MessageSquare,
      title: "Answer Smart Questions",
      desc: "PLANNR understands users, authentication, resources, endpoints, permissions, integrations, data models, and business logic.",
    },
    {
      icon: FileCode2,
      title: "Generate API Documentation",
      desc: "Receive complete API documentation automatically. Every endpoint documented consistently with requests, responses, examples, and implementation notes.",
    },
    {
      icon: Share2,
      title: "Share with Developers",
      desc: "Export and use with internal engineering teams, frontend developers, backend developers, third-party integrators, and AI coding tools like Cursor, Claude Code, Lovable, Bolt, Windsurf, and Replit.",
    },
  ] as const;

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
          style={monoStyle}
        >
          PROCESS
        </p>
        <h2
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
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
                      style={monoStyle}
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

function GreatDocsSection() {
  const items = [
    "Clear endpoint descriptions",
    "Authentication instructions",
    "Request examples",
    "Response examples",
    "Error handling",
    "Rate limits",
    "Pagination",
    "Versioning",
    "Webhooks",
    "Security guidance",
    "SDK examples",
    "Integration tutorials",
  ];

  const checks = [
    "easy to navigate",
    "consistent across endpoints",
    "developer-friendly",
    "example-driven",
    "secure",
    "version-aware",
    "ready for collaboration",
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          What Makes Great API Documentation?
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              Professional API documentation should include:
            </p>
            <ul className="mt-5 space-y-3">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-foreground sm:text-[0.95rem]"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#16a34a]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-[#14532d] bg-[#0f0f0f] p-6 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.6)]">
            <div className="text-sm text-[#86efac]" style={monoStyle}>
              $ plannr --check-docs
            </div>
            <div className="mt-5 space-y-3 text-sm" style={monoStyle}>
              {checks.map((item) => (
                <div key={item} className="text-[#22c55e]">
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p
          className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
          style={monoStyle}
        >
          USE CASES
        </p>
        <h2
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Generate Documentation For
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {useCaseGroups.map((group) => (
            <div key={group.label}>
              <p
                className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground"
                style={monoStyle}
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

function ComparisonSection() {
  const rows = [
    ["Hours of writing", "Minutes"],
    ["Easy to miss endpoints", "Complete structured documentation"],
    ["Inconsistent formatting", "Standardized output"],
    ["Difficult to maintain", "Organized and export-ready"],
    ["Limited examples", "Automatic request & response examples"],
    ["Repetitive updates", "AI-assisted documentation generation"],
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          Manual API Documentation vs AI API Documentation
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_16px_36px_-28px_oklch(0.18_0.01_150/0.28)]">
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">
              Manual Documentation
            </div>
            <div className="px-5 py-4 text-sm font-semibold text-[#166534]">
              <PlannerLogo />
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

function PlannerLogo() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#dcfce7] px-3 py-1">
      <img src={plannrLogo} alt="PLANNR" className="h-4 w-4 rounded-full object-cover" />
      <span style={monoStyle}>PLANNR</span>
    </span>
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
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
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
                    <span className="mr-2 text-[#16a34a]" style={monoStyle}>
                      ?
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

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-20">
      <div
        className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[12px] border border-white/10 border-l-[3px] border-l-[#22c55e] bg-[#111111] p-5 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.7)]">
            <pre
              className="overflow-x-auto text-xs leading-6 text-[#86efac] sm:text-sm"
              style={monoStyle}
            >
              {`curl -X POST https://api.plannr.ai/generate \\
  -H "Content-Type: application/json" \\
  -d '{"type": "api-docs", "project": "your-idea"}'`}
            </pre>
          </div>

          <h2
            className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Build Better APIs with Better Documentation
          </h2>
          <p className="mt-4 text-base leading-8 text-white/75 sm:text-lg">
            Well-documented APIs are easier to develop, easier to integrate, and easier to maintain.
            Generate professional API documentation before development starts and give your
            developers everything they need to build with confidence.
          </p>

          <div className="mt-8">
            <Link to="/build" className="btn-3d btn-3d-sm whitespace-nowrap">
              Generate Your Free AI API Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
