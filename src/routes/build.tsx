import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Download, FileText, Check, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileTree, type TreeNode } from "@/components/FileTree";
import { VibePlatforms } from "@/components/VibePlatforms";
import { useServerFn } from "@tanstack/react-start";
import {
  generateQuestions,
  recommendStack,
  generateDocument,
  generateFolderStructure,
} from "@/lib/specai-server.functions";
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
  const recStack = useServerFn(recommendStack);
  const genDoc = useServerFn(generateDocument);
  const genFolder = useServerFn(generateFolderStructure);

  const submitIdea = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await genQuestions({ data: { idea, specs } });
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
      const res = await recStack({ data: { idea, answers: answerMap } });
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
    setProgress([]);
    setError(null);

    const answerMap: Record<string, string> = {};
    questions.forEach((q) => {
      answerMap[q.question] = answers[q.id] || "(not specified)";
    });

    try {
      const tasks = [
        { key: "prd" as const, label: "Writing PRD" },
        { key: "srs" as const, label: "Drafting SRS" },
        { key: "architecture" as const, label: "Designing architecture" },
        { key: "designSystem" as const, label: "Crafting design system" },
        { key: "apiSpec" as const, label: "Specifying API" },
        { key: "readme" as const, label: "Writing README" },
      ];

      const newDocs: Partial<Docs> = {};
      for (const t of tasks) {
        setProgress((p) => [...p, t.label]);
        const r = await genDoc({ data: { docType: t.key, projectName, idea, answers: answerMap, stack } });
        (newDocs as any)[t.key] = r.content;
        setDocs({ ...newDocs });
      }

      setProgress((p) => [...p, "Building folder structure"]);
      const fs = await genFolder({ data: { projectName, stack } });
      newDocs.folderStructure = fs;
      setDocs({ ...newDocs });

      setProgress((p) => [...p, "Done"]);
      setTimeout(() => setStep("output"), 600);
    } catch (e: any) {
      setError(e.message);
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
          onClick={onNext}
          disabled={!idea.trim() || loading}
          className="w-full mt-4 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium glow-primary hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 animate-fade-up">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Project · {projectName}</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">A few clarifying questions</h1>
        <p className="mt-3 text-muted-foreground">Helps PLANNR tailor the stack and docs to your reality.</p>
      </div>

      <div className="space-y-5">
        {questions.map((q: Question, i: number) => (
          <div key={q.id} className="p-5 rounded-xl border border-border bg-surface/50">
            <div className="flex gap-3">
              <span className="font-mono text-sm text-primary shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <label className="block font-medium mb-3">{q.question}</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(q.options || []).map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                          selected
                            ? "border-primary bg-accent text-foreground glow-primary-sm"
                            : "border-border bg-background hover:border-primary/50 hover:bg-surface"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
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

                {/* Custom answer / preference */}
                <div className="mt-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    Or write your own answer / preference
                  </label>
                  <input
                    type="text"
                    value={answers[q.id] && !(q.options || []).includes(answers[q.id]) ? answers[q.id] : ""}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Type a custom answer..."
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-primary-sm hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Recommending stack...</> : <>Next: Pick stack <ArrowRight className="w-4 h-4" /></>}
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
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-primary hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
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
    </section>
  );
}
