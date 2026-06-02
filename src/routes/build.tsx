import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Download, FileText, Check, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileTree, type TreeNode } from "@/components/FileTree";
import { VibePlatforms } from "@/components/VibePlatforms";
import { useAuth, getSession, refreshSessionToken } from "@/features/auth";
import { useServerFn } from "@tanstack/react-start";
import { generateQuestions } from "@/lib/specai-server.functions";
import { requestInsforgeJson } from "@/lib/insforge-backend";
import JSZip from "jszip";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build your spec — PLANNR" },
      { name: "description", content: "Turn your idea into a complete project specification with AI-guided clarification, stack recommendations, and structured docs." },
    ],
  }),
  component: BuildPage,
});

type Step = "idea" | "questions" | "stack" | "generating" | "output";

type Question = { id: string; question: string; options?: string[]; hint?: string };

type Stack = {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  hosting: string;
  rationale: string;
};

type Docs = {
  prd: string;
  srs: string;
  architecture: string;
  designSystem: string;
  apiSpec: string;
  readme: string;
  folderStructure: { root: string; tree: TreeNode[] };
};

type BackendApiError = Error & {
  status: number;
  body: unknown;
};

type SessionLike = { accessToken: string; user?: { id?: string } | null } | null;

type BackendProjectResponse = {
  success: boolean;
  project: { id: string; title: string; idea: string };
  documents?: Array<{
    document_type: string;
    latest_version?: { content_markdown?: string; structured_data?: Record<string, unknown> } | null;
  }>;
  downloadUrl?: string;
};

type BackendGenerateResponse = {
  success: boolean;
  version?: { content_markdown?: string; structured_data?: Record<string, unknown> } | null;
  designPreview?: { content_markdown?: string; structured_data?: Record<string, unknown> } | null;
  downloadUrl?: string;
};

function formatFrontendErrorMessage(message: unknown) {
  const m = typeof message === "string" ? message : String(message ?? "");
  if (/daily generation limit exceeded|daily generation limit|free limit reached|LIMIT_EXCEEDED|limit exceeded/i.test(m)) {
    return "You hit the free limit (3 specs). Upgrade to generate more specs";
  }
  return m;
}

function deriveProjectTitle(idea: string) {
  const words = idea
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  const title = words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (title || "Untitled Project").slice(0, 80);
}

function buildFallbackDesignSystem(projectName: string, idea: string, stack: Stack | null, prd: string, systemDesign: string, architecture: string) {
  const stackLine = stack ? `${stack.frontend} / ${stack.backend} / ${stack.database}` : "Not specified";
  return [
    `# ${projectName} Design System`,
    "",
    "## 0. Metadata",
    `- Project: ${projectName}`,
    `- Idea: ${idea}`,
    `- Stack: ${stackLine}`,
    "",
    "## 1. Executive Summary",
    "This design system keeps the generated PRD, system design, and architecture aligned.",
    "",
    "## 2. Inputs",
    `- PRD length: ${prd.length} characters`,
    `- System design length: ${systemDesign.length} characters`,
    `- Architecture length: ${architecture.length} characters`,
    "",
    "## 3. Core Principles",
    "- Keep the interface legible and task-focused.",
    "- Align tokens and components with the selected stack.",
    "- Preserve the structure needed for implementation handoff.",
  ].join("\n");
}

function buildDerivedDocs(projectName: string, idea: string, stack: Stack | null, prd: string, systemDesign: string, architecture: string, designSystem?: string): Partial<Docs> {
  return {
    prd,
    srs: systemDesign,
    architecture,
    designSystem: designSystem || buildFallbackDesignSystem(projectName, idea, stack, prd, systemDesign, architecture),
    apiSpec: `# API Specification\n\n## Summary\n\nAPI contract for ${projectName}.\n\n## Included Routes\n- POST /project\n- POST /generate/prd\n- POST /generate/system-design\n- POST /generate/architecture\n- GET /download/:id\n`,
    readme: `# ${projectName}\n\n## Overview\n\nSpec bundle for ${projectName}.\n\n## Included\n- PRD\n- System Design\n- Architecture\n`,
    folderStructure: {
      root: `${slug(projectName)}/`,
      tree: [
        { name: "docs", type: "folder", children: [{ name: "PRD.md", type: "file" }, { name: "SRS.md", type: "file" }, { name: "ARCHITECTURE.md", type: "file" }] },
        { name: "design", type: "folder", children: [{ name: "DESIGN_SYSTEM.md", type: "file" }] },
        { name: "api", type: "folder", children: [{ name: "API_SPEC.md", type: "file" }] },
        { name: "structure", type: "folder", children: [{ name: "FOLDER_STRUCTURE.md", type: "file" }, { name: "FOLDER_STRUCTURE.json", type: "file" }] },
        { name: "README.md", type: "file" },
      ],
    },
  };
}

async function resolveBackendSession(override?: SessionLike) {
  if (override?.accessToken) {
    return override;
  }

  let session = await getSession();
  if (!session?.accessToken || !session.user) {
    const refreshed = await refreshSessionToken();
    session = refreshed ? { accessToken: refreshed.accessToken, user: refreshed.user } : null;
  }
  return session;
}

async function getAuthHeaders(sessionOverride?: SessionLike) {
  const session = await resolveBackendSession(sessionOverride);
  if (!session?.accessToken) {
    throw new Error("Sign in / login to generate your spec");
  }
  return {
    Authorization: `Bearer ${session.accessToken}`,
  };
}

async function backendJson<T>(path: string, init: RequestInit = {}, sessionOverride?: SessionLike) {
  let session = await resolveBackendSession(sessionOverride);

  if (!session?.accessToken) {
    throw new Error("Sign in / login to generate your spec");
  }

  let { response, body } = await requestInsforgeJson<T>(path, init, {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  });

  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed?.accessToken) {
      session = { accessToken: refreshed.accessToken, user: refreshed.user };
      ({ response, body } = await requestInsforgeJson<T>(path, init, {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      }));
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as any).error ?? `Request failed (${response.status})`)
        : `Request failed (${response.status})`;
    const err = new Error(message) as BackendApiError;
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body as T;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const DOC_FILES = [
  { key: "prd", name: "PRD.md", folder: "docs", label: "Product Requirements" },
  { key: "srs", name: "SRS.md", folder: "docs", label: "Software Requirements" },
  { key: "architecture", name: "ARCHITECTURE.md", folder: "docs", label: "System Architecture" },
  { key: "designSystem", name: "DESIGN_SYSTEM.md", folder: "design", label: "Design System" },
  { key: "apiSpec", name: "API_SPEC.md", folder: "api", label: "API Specification" },
  { key: "folderStructure", name: "FOLDER_STRUCTURE.json", folder: "structure", label: "Folder Structure" },
  { key: "readme", name: "README.md", folder: "", label: "README" },
] as const;

function BuildPage() {
  const { loading: authLoading, user, session } = useAuth();
  const backendSession = session?.accessToken ? { accessToken: session.accessToken, user } : null;
  const [step, setStep] = useState<Step>("idea");
  const [idea, setIdea] = useState("");
  const [specs, setSpecs] = useState("");
  const [projectName, setProjectName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stack, setStack] = useState<Stack | null>(null);
  const [docs, setDocs] = useState<Partial<Docs>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("README.md");

  const genQuestions = useServerFn(generateQuestions);

  const submitIdea = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await genQuestions({ data: { idea, specs } } as any);
      setProjectName(res.projectName);
      setQuestions(res.questions);
      setStep("questions");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      const answerMap: Record<string, string> = {};
      questions.forEach((q) => {
        answerMap[q.question] = answers[q.id] || "(not specified)";
      });
      const headers = await getAuthHeaders();

      const stackRequest = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea, answers: answerMap }),
      };

      let { response, body } = await requestInsforgeJson<Stack & { error?: string }>(
        "/generate/stack",
        stackRequest,
        headers,
      );

      if (response.status === 401) {
        const refreshed = await refreshSessionToken();
        if (refreshed?.accessToken) {
          ({ response, body } = await requestInsforgeJson<Stack & { error?: string }>(
            "/generate/stack",
            stackRequest,
            {
              Authorization: `Bearer ${refreshed.accessToken}`,
            },
          ));
        }
      }

      if (!response.ok) {
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : `Request failed (${response.status})`;
        throw new Error(message);
      }

      setStack(body as Stack);
      setStep("stack");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    if (!stack) return;
    setStep("generating");
    setDocs({});
    setSelectedFile("README.md");
    setProgress([]);
    setError(null);

    try {
      const title = projectName.trim() || deriveProjectTitle(idea);

      setProgress(["Creating project"]);
      const created = await backendJson<BackendProjectResponse>(
        "/project",
        {
          method: "POST",
          body: JSON.stringify({ title, idea, description: specs || undefined, stackRecommendation: stack }),
        },
        backendSession,
      );

      setProjectName(created.project.title);

      setProgress(["Creating project", "Writing PRD"]);
      const prd = await backendJson<BackendGenerateResponse>(
        "/generate/prd",
        {
          method: "POST",
          body: JSON.stringify({ projectId: created.project.id }),
        },
        backendSession,
      );

      setProgress(["Creating project", "Writing PRD", "Writing System Design"]);
      const systemDesign = await backendJson<BackendGenerateResponse>(
        "/generate/system-design",
        {
          method: "POST",
          body: JSON.stringify({ projectId: created.project.id }),
        },
        backendSession,
      );

      setProgress(["Creating project", "Writing PRD", "Writing System Design", "Writing Architecture"]);
      const architecture = await backendJson<BackendGenerateResponse>(
        "/generate/architecture",
        {
          method: "POST",
          body: JSON.stringify({ projectId: created.project.id }),
        },
        backendSession,
      );

      const nextDocs = buildDerivedDocs(
        created.project.title,
        created.project.idea,
        stack,
        prd.version?.content_markdown || "",
        systemDesign.version?.content_markdown || "",
        architecture.version?.content_markdown || "",
        architecture.designPreview?.content_markdown || "",
      );
      setDocs(nextDocs);

      setProgress((p) => [...p, "Done"]);
      setTimeout(() => setStep("output"), 600);
    } catch (e: any) {
      setError(formatFrontendErrorMessage(e instanceof Error ? e.message : String(e)));
      setStep("stack");
    }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(slug(projectName))!;

    DOC_FILES.forEach((f) => {
      const content = (docs as any)[f.key];
      if (!content) return;
      const data = f.key === "folderStructure" ? JSON.stringify(content, null, 2) : content;
      const path = f.folder ? `${f.folder}/${f.name}` : f.name;
      folder.file(path, data);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${slug(projectName)}.zip`);
  };

  const isUnauthorizedError = error?.toLowerCase().includes("unauthorized");
  const showError = !!error && (!isUnauthorizedError || (!authLoading && !user));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Stepper */}
        {step !== "output" && (
          <div className="mx-auto max-w-3xl px-6 pt-8">
            <Stepper current={step} />
          </div>
        )}

        {showError && (
          <div className="mx-auto max-w-3xl px-6 mt-6">
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-sm">
              {error}
            </div>
          </div>
        )}

        {step === "idea" && (
          <IdeaStep
            idea={idea}
            setIdea={setIdea}
            specs={specs}
            setSpecs={setSpecs}
            onNext={submitIdea}
            loading={loading}
          />
        )}

        {step === "questions" && (
          <QuestionsStep
            projectName={projectName}
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setStep("idea")}
            onNext={submitAnswers}
            loading={loading}
          />
        )}

        {step === "stack" && stack && (
          <StackStep stack={stack} setStack={setStack} onBack={() => setStep("questions")} onNext={startGeneration} />
        )}

        {step === "generating" && <GeneratingStep progress={progress} />}

        {step === "output" && docs.folderStructure && (
          <OutputStep
            projectName={projectName}
            docs={docs as Docs}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onDownload={downloadZip}
            onRestart={() => {
              setStep("idea");
              setIdea("");
              setSpecs("");
              setAnswers({});
              setDocs({});
              setStack(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

function Stepper({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "idea", label: "Idea" },
    { key: "questions", label: "Clarify" },
    { key: "stack", label: "Stack" },
    { key: "generating", label: "Generate" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3 flex-1">
          <div
            className={`flex items-center gap-2 ${i <= currentIdx ? "text-foreground" : "text-muted-foreground"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${
                i < currentIdx
                  ? "bg-primary text-primary-foreground border-primary"
                  : i === currentIdx
                    ? "border-primary text-primary glow-primary-sm"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < currentIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function IdeaStep({ idea, setIdea, specs, setSpecs, onNext, loading }: any) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 animate-fade-up">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">What are you building?</h1>
        <p className="mt-4 text-muted-foreground">Drop a sentence or a paragraph. The vaguer the better — we'll ask the rest.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">Your idea</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A mobile app that helps remote teams run async standups using AI summaries..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
            Add specs (optional)
          </summary>
          <textarea
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="Any constraints, target audience, or technical preferences..."
            rows={3}
            className="mt-3 w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </details>

        <button
          type="button"
          onClick={onNext}
          disabled={!idea.trim() || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your idea...
            </>
          ) : (
            <>
              Generate Project <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function QuestionsStep({ projectName, questions, answers, setAnswers, onBack, onNext, loading }: any) {
  const [idx, setIdx] = useState(0);
  const total = questions.length;
  const q: Question | undefined = questions[idx];
  const isLast = idx === total - 1;
  const currentAnswer = q ? answers[q.id] : "";
  const hasAnswer = !!(currentAnswer && String(currentAnswer).trim());

  const goNext = () => {
    if (!hasAnswer) return;
    if (isLast) {
      onNext();
    } else {
      setIdx((i) => Math.min(i + 1, total - 1));
    }
  };

  const goPrev = () => {
    if (idx === 0) {
      onBack();
    } else {
      setIdx((i) => Math.max(i - 1, 0));
    }
  };

  const pickOption = (opt: string) => {
    setAnswers({ ...answers, [q!.id]: opt });
    // Auto-advance — feels snappy and removes the need to hit "Next"
    if (isLast) {
      // On the last question, let the user confirm with the explicit button
      return;
    }
    setTimeout(() => setIdx((i) => Math.min(i + 1, total - 1)), 220);
  };

  if (!q) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 animate-fade-up">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Project · {projectName}</div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">A few clarifying questions</h1>
          <span className="font-mono text-sm text-muted-foreground shrink-0">
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${((idx + (hasAnswer ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Single question card — replaces on change with fade-up */}
      <div key={q.id} className="p-6 rounded-2xl border border-border bg-surface/60 animate-fade-up">
        <label className="block font-medium text-lg mb-5">{q.question}</label>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {(q.options || []).map((opt) => {
            const selected = currentAnswer === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pickOption(opt)}
                className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  selected
                    ? "border-primary bg-accent text-foreground glow-primary-sm"
                    : "border-border bg-background hover:border-primary/50 hover:bg-surface"
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selected ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom answer */}
        <div className="mt-5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Or write your own answer
          </label>
          <input
            type="text"
            value={currentAnswer && !(q.options || []).includes(currentAnswer) ? currentAnswer : ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && hasAnswer) {
                e.preventDefault();
                goNext();
              }
            }}
            placeholder="Type a custom answer and press Enter…"
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={goPrev} className="btn-3d btn-3d-outline">
          <ArrowLeft className="w-4 h-4" /> {idx === 0 ? "Back" : "Previous"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!hasAnswer || loading}
          className="btn-3d flex-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Recommending stack...</>
          ) : isLast ? (
            <>Next: Pick stack <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Next question <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </section>
  );
}

function StackStep({ stack, setStack, onBack, onNext }: any) {
  const fields: { key: keyof Stack; label: string }[] = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "auth", label: "Authentication" },
    { key: "hosting", label: "Hosting" },
  ];

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Recommended stack</h1>
        <p className="mt-3 text-muted-foreground">Override anything you want — these are just suggestions.</p>
      </div>

      <div className="p-5 rounded-xl border border-primary/30 bg-accent mb-6">
        <div className="flex gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/90 leading-relaxed">{stack.rationale}</p>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface/50">
            <div className="w-32 text-sm text-muted-foreground font-mono uppercase tracking-wider text-xs">{f.label}</div>
            <input
              value={stack[f.key]}
              onChange={(e) => setStack({ ...stack, [f.key]: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="btn-3d btn-3d-outline">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-3d flex-1"
        >
          Generate documentation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function GeneratingStep({ progress }: { progress: string[] }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 animate-fade-up">
      <div className="text-center mb-12">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-6 animate-pulse-glow">
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Generating your spec</h1>
        <p className="mt-3 text-muted-foreground">This usually takes 30–60 seconds.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/50 p-6 space-y-3 font-mono text-sm">
        {progress.map((p, i) => {
          const isLast = i === progress.length - 1 && p !== "Done";
          const isDone = p === "Done";
          return (
            <div key={i} className="flex items-center gap-3 animate-fade-up">
              {isDone ? (
                <Check className="w-4 h-4 text-primary" />
              ) : isLast ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Check className="w-4 h-4 text-primary" />
              )}
              <span className={isLast ? "text-foreground" : "text-muted-foreground"}>{p}{isLast && "..."}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OutputStep({ projectName, docs, selectedFile, setSelectedFile, onDownload, onRestart }: any) {
  // Build virtual tree
  const virtualTree: TreeNode[] = [
    {
      name: "docs",
      type: "folder",
      children: [
        { name: "PRD.md", type: "file" },
        { name: "SRS.md", type: "file" },
        { name: "ARCHITECTURE.md", type: "file" },
      ],
    },
    {
      name: "design",
      type: "folder",
      children: [{ name: "DESIGN_SYSTEM.md", type: "file" }],
    },
    {
      name: "api",
      type: "folder",
      children: [{ name: "API_SPEC.md", type: "file" }],
    },
    {
      name: "structure",
      type: "folder",
      children: [{ name: "FOLDER_STRUCTURE.json", type: "file" }],
    },
    { name: "README.md", type: "file" },
  ];

  const fileMap: Record<string, string> = {
    "PRD.md": docs.prd,
    "SRS.md": docs.srs,
    "ARCHITECTURE.md": docs.architecture,
    "DESIGN_SYSTEM.md": docs.designSystem,
    "API_SPEC.md": docs.apiSpec,
    "FOLDER_STRUCTURE.json": JSON.stringify(docs.folderStructure, null, 2),
    "README.md": docs.readme,
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-primary mb-1">Generated · 7 files</div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{projectName}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="btn-3d btn-3d-sm btn-3d-outline"
          >
            <RefreshCw className="w-4 h-4" /> New project
          </button>
          <button
            onClick={onDownload}
            className="btn-3d btn-3d-sm"
          >
            <Download className="w-4 h-4" /> Download ZIP
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Sidebar — file tree */}
        <aside className="rounded-2xl border border-border bg-surface/50 overflow-y-auto p-2">
          <FileTree
            tree={virtualTree}
            root={slug(projectName) + "/"}
            selected={selectedFile}
            onSelect={(n) => setSelectedFile(n.name)}
          />
        </aside>

        {/* File viewer */}
        <div className="rounded-2xl border border-border bg-surface/50 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">{selectedFile}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <pre className="font-mono text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {fileMap[selectedFile] || "(empty)"}
            </pre>
          </div>
        </div>
      </div>

      {/* Vibe-coding platforms — paste your ZIP into your favourite builder */}
      <div className="mt-8">
        <VibePlatforms />
      </div>
    </section>
  );
}
