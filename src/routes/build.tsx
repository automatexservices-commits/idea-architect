import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Download, FileText, Check, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileTree, type TreeNode } from "@/components/FileTree";
import { VibePlatforms } from "@/components/VibePlatforms";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSession, refreshSessionToken } from "@/features/auth";
import { useAuth } from "@/features/auth";
import { getInsforgeBackendUrls, requestInsforgeJson } from "@/lib/insforge-backend";
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

type Question = { id: string; question: string; options: string[] };

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

type GenerationProgressItem = {
  label: string;
  status: "loading" | "done";
};

type UsageState = {
  role: "free" | "pro";
  limit: number;
  used: number;
  remaining: number;
  blocked: boolean;
};

class BackendApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.body = body;
  }
}

type SessionLike = { accessToken: string; user?: { id?: string } | null } | null;

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

async function backendJson<T>(path: string, init: RequestInit = {}, sessionOverride?: SessionLike) {
  let session = await resolveBackendSession(sessionOverride);

  if (!session?.accessToken) {
    throw new Error("Sign in / login to generate your spec");
  }

  console.log("[build] backend request", path, { userId: session.user?.id, hasToken: Boolean(session.accessToken) });

  let { response, body } = await requestInsforgeJson<T>(path, init, {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  });

  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed?.accessToken) {
      session = { accessToken: refreshed.accessToken, user: refreshed.user };
      console.log("[build] backend request refreshed token", path, { userId: session.user?.id });
      ({ response, body } = await requestInsforgeJson<T>(path, init, {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      }));
    }
  }

  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body
      ? String((body as any).error ?? `Request failed (${response.status})`)
      : `Request failed (${response.status})`;
    throw new BackendApiError(message, response.status, body);
  }

  return body as T;
}

async function requestQuestions(idea: string, specs: string, session?: SessionLike) {
  return backendJson<{ projectName: string; questions: Question[] }>("/generate/questions", {
    method: "POST",
    body: JSON.stringify({ idea, specs }),
  }, session);
}

async function requestStack(idea: string, answers: Record<string, string>, session?: SessionLike) {
  return backendJson<Stack>("/generate/stack", {
    method: "POST",
    body: JSON.stringify({ idea, answers }),
  }, session);
}

async function requestUsageState(session?: SessionLike) {
  return backendJson<UsageState>("/usage", {}, session);
}

async function downloadBlobFromUrl(url: string, filename: string, session?: SessionLike) {
  const resolvedSession = await resolveBackendSession(session);
  if (!resolvedSession?.accessToken) {
    throw new Error("Please sign in to download files.");
  }
  console.log("[build] download", url);

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${resolvedSession.accessToken}` },
  });

  if (response.status === 401) {
    const refreshed = await refreshSessionToken();
    if (refreshed?.accessToken) {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${refreshed.accessToken}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  requestAnimationFrame(() => {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  });
}

async function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  requestAnimationFrame(() => {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  });
}

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
  const planningInputs = [prd, systemDesign, architecture].filter(Boolean).length;
  return [
    `# ${projectName} Design System`,
    "",
    "## 0. Metadata",
    `- Project: ${projectName}`,
    `- Idea: ${idea}`,
    `- Stack: ${stackLine}`,
    "",
    "---",
    "",
    "## 1. Executive Summary",
    "A complete design document should define the product's core experience, the system boundaries, the implementation constraints, and the API contract that keeps every screen and backend path aligned.",
    "",
    "## 2. Problem Statement",
    "- The current output is too thin and does not provide enough guidance for a real handoff.",
    "- The design document should be comprehensive enough to support engineering, QA, and future iteration.",
    "- The document must stay aligned with the generated PRD, system design, and architecture outputs.",
    "",
    "## 3. Goals & Non-Goals",
    "### Goals",
    "- Produce a richer, structured design system document.",
    "- Keep the template sections complete and easy to scan.",
    "- Ground the design in the project idea and stack recommendation.",
    "",
    "### Non-Goals",
    "- Pixel-perfect brand systems.",
    "- Interactive design token management.",
    "",
    "## 4. Success Metrics",
    "| Metric | Current | Target | Measurement Method |",
    "|------|--------|--------|--------------------|",
    "| Template coverage | Partial | Full | Manual review |",
    "| Section completeness | Thin | Rich | Checklist review |",
    "| Handoff clarity | Low | High | Reviewer feedback |",
    "| Spec consistency | Inconsistent | Aligned | Compare with PRD and architecture |",
    "",
    "## 5. System Overview",
    `The design output should stay aligned to the generated PRD, system design, and architecture documents for ${projectName}.`,
    "",
    "## 6. Detailed Architecture",
    `The doc should explain how the project moves from idea to structured output across the browser UI, backend generation flow, and ZIP export. It should stay aligned with the PRD, System Design, and Architecture outputs.`,
    "",
    `Planning inputs available: ${planningInputs}/3.`,
    "",
    "## 7. Data Design",
    "- projects: source idea, title, and stack recommendation",
    "- documents: generated markdown and structured data",
    "- document_versions: immutable history for each document",
    "",
    "## 8. API Design (Strict Contract)",
    "- POST /project",
    "- POST /generate/questions",
    "- POST /generate/stack",
    "- POST /generate/prd",
    "- POST /generate/system-design",
    "- POST /generate/architecture",
    "- GET /download/:id",
    "",
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

const DOC_FILES = [
  { key: "prd", name: "PRD.md", folder: "docs", label: "Product Requirements" },
  { key: "srs", name: "SRS.md", folder: "docs", label: "Software Requirements" },
  { key: "architecture", name: "ARCHITECTURE.md", folder: "docs", label: "System Architecture" },
  { key: "designSystem", name: "DESIGN_SYSTEM.md", folder: "design", label: "Design System" },
  { key: "apiSpec", name: "API_SPEC.md", folder: "api", label: "API Specification" },
  { key: "folderStructure", name: "FOLDER_STRUCTURE.md", folder: "structure", label: "Folder Structure" },
  { key: "readme", name: "README.md", folder: "", label: "README" },
] as const;

function BuildPage() {
  const { session: authSession, loading: authLoading } = useAuth();
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
  const [progress, setProgress] = useState<GenerationProgressItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("README.md");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [limitPopupOpen, setLimitPopupOpen] = useState(false);
  const backendSession = authSession?.accessToken ? { accessToken: authSession.accessToken, user: authSession.user } : null;

  const refreshUsage = async () => {
    try {
      const next = await requestUsageState(backendSession);
      return next;
    } catch (error) {
      if (error instanceof BackendApiError && error.status === 401) {
        return null;
      }
      console.error("[build] usage fetch failed", error);
      return null;
    } finally {
    }
  };

  useEffect(() => {
    if (authLoading || !authSession?.accessToken) return;
    void refreshUsage();
  }, [authLoading, authSession?.accessToken]);

  const submitIdea = async () => {
    if (!idea.trim()) return;

    // Check usage and show limit popup immediately (step 1) if blocked.
    try {
      const nextUsage = await refreshUsage();
      if (nextUsage?.blocked) {
        setLimitPopupOpen(true);
        return;
      }
    } catch (err) {
      // If usage check failed (likely not signed in), allow the flow to continue.
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestQuestions(idea, specs, backendSession);
      setProjectName(res.projectName);
      setQuestions(res.questions);
      setStep("questions");
    } catch (e: any) {
      setError(formatFrontendErrorMessage(e?.message ?? e));
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
      const res = await requestStack(idea, answerMap, backendSession);
      setStack(res);
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
    setDownloadUrl("");
    setSelectedFile("README.md");
    setProgress([]);
    setError(null);
    console.log("[build] generate clicked", { projectName, idea });

    try {
      const title = projectName.trim() || deriveProjectTitle(idea);

      setProgress([{ label: "Creating project", status: "loading" }]);
      const created = await backendJson<BackendProjectResponse>("/project", {
        method: "POST",
        body: JSON.stringify({ title, idea, description: specs || undefined, stackRecommendation: stack }),
      }, backendSession);

      setProjectName(created.project.title);

      setProgress([
        { label: "Creating project", status: "done" },
        { label: "Writing PRD", status: "loading" },
      ]);
      const prd = await backendJson<BackendGenerateResponse>("/generate/prd", {
        method: "POST",
        body: JSON.stringify({ projectId: created.project.id }),
      }, backendSession);

      setProgress([
        { label: "Creating project", status: "done" },
        { label: "Writing PRD", status: "done" },
        { label: "Writing System Design", status: "loading" },
      ]);
      const systemDesign = await backendJson<BackendGenerateResponse>("/generate/system-design", {
        method: "POST",
        body: JSON.stringify({ projectId: created.project.id }),
      }, backendSession);

      setProgress([
        { label: "Creating project", status: "done" },
        { label: "Writing PRD", status: "done" },
        { label: "Writing System Design", status: "done" },
        { label: "Writing Architecture", status: "loading" },
      ]);
      const architecture = await backendJson<BackendGenerateResponse>("/generate/architecture", {
        method: "POST",
        body: JSON.stringify({ projectId: created.project.id }),
      }, backendSession);

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
      setDownloadUrl(created.downloadUrl || getInsforgeBackendUrls(`/download/${created.project.id}?scope=project&format=zip`)[0]);

      await refreshUsage();

      setProgress((p) => [...p.map((item) => ({ ...item, status: "done" as const })), { label: "Done", status: "done" }]);
      setTimeout(() => setStep("output"), 600);
    } catch (e: any) {
      console.error("[build] generation failed", e);
      // Do not show limit popup here - checks are performed at step 1
      setError(formatFrontendErrorMessage(e instanceof Error ? e.message : String(e)));
      setStep("stack");
    }
  };

  const downloadZip = async () => {
    console.log("[build] zip download start", { projectName, hasDocs: Boolean(docs.folderStructure), hasBackendDownload: Boolean(downloadUrl) });

    if (downloadUrl) {
      await downloadBlobFromUrl(downloadUrl, `${slug(projectName)}.zip`, backendSession);
      return;
    }

    const zip = new JSZip();
    const root = zip.folder(slug(projectName)) ?? zip;
    const fileMap: Record<string, string> = {
      "docs/PRD.md": docs.prd || "",
      "docs/SRS.md": docs.srs || "",
      "docs/ARCHITECTURE.md": docs.architecture || "",
      "design/DESIGN_SYSTEM.md": docs.designSystem || "",
      "api/API_SPEC.md": docs.apiSpec || "",
      "structure/FOLDER_STRUCTURE.md": docs.folderStructure ? `# Folder Structure\n\n\`\`\`json\n${JSON.stringify(docs.folderStructure, null, 2)}\n\`\`\`` : "",
      "structure/FOLDER_STRUCTURE.json": JSON.stringify(docs.folderStructure || {}, null, 2),
      "README.md": docs.readme || "",
    };

    Object.entries(fileMap).forEach(([path, content]) => {
      root.file(path, content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    await downloadBlob(blob, `${slug(projectName)}.zip`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AlertDialog open={limitPopupOpen} onOpenChange={setLimitPopupOpen}>
        <AlertDialogContent className="rounded-3xl border-border bg-background p-6 shadow-elevated">
          <AlertDialogHeader>
            <AlertDialogTitle>You hit the free limit (3 specs)</AlertDialogTitle>
              <AlertDialogDescription>Upgrade to generate more specs</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/pricing">Upgrade</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteHeader />

      <main className="flex-1">
        {/* Stepper */}
        {step !== "output" && (
          <div className="mx-auto max-w-3xl px-6 pt-8">
            <Stepper current={step} />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-3xl px-6 mt-6">
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-sm">
              {error}
            </div>
          </div>
        )}

        {step === "idea" && <IdeaStep idea={idea} setIdea={setIdea} specs={specs} setSpecs={setSpecs} onNext={submitIdea} loading={loading} />}

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
          <StackStep
            stack={stack}
            setStack={setStack}
            onBack={() => setStep("questions")}
            onNext={startGeneration}
            locked={loading}
          />
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
              setDownloadUrl("");
              setSelectedFile("README.md");
            }}
            downloadLocked={false}
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
          onClick={onNext}
          disabled={!idea.trim() || loading}
          className="btn-3d w-full mt-4"
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

function StackStep({ stack, setStack, onBack, onNext, locked }: any) {
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
          onClick={onNext}
          disabled={locked}
          className="btn-3d flex-1"
        >
          <>Generate Project <ArrowRight className="w-4 h-4" /></>
        </button>
      </div>
    </section>
  );
}

function GeneratingStep({ progress }: { progress: GenerationProgressItem[] }) {
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
          return (
            <div key={i} className="flex items-center gap-3 animate-fade-up">
              {p.status === "done" ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <span className={p.status === "loading" ? "text-foreground" : "text-muted-foreground"}>{p.label}{p.status === "loading" && "..."}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OutputStep({ projectName, docs, selectedFile, setSelectedFile, onDownload, onRestart, downloadLocked }: any) {
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
      children: [{ name: "FOLDER_STRUCTURE.md", type: "file" }, { name: "FOLDER_STRUCTURE.json", type: "file" }],
    },
    { name: "README.md", type: "file" },
  ];

  const fileMap: Record<string, string> = {
    "PRD.md": docs.prd,
    "SRS.md": docs.srs,
    "ARCHITECTURE.md": docs.architecture,
    "DESIGN_SYSTEM.md": docs.designSystem,
    "API_SPEC.md": docs.apiSpec,
    "FOLDER_STRUCTURE.md": docs.folderStructure ? `# Folder Structure\n\n\`\`\`json\n${JSON.stringify(docs.folderStructure, null, 2)}\n\`\`\`` : "",
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
            type="button"
            disabled={downloadLocked}
            className="btn-3d btn-3d-sm"
          >
            {downloadLocked ? "Limit reached" : <><Download className="w-4 h-4" /> Download ZIP</>}
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
