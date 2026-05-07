type MinimalProject = {
  title: string;
  idea: string;
  description: string | null;
  stack_recommendation: Record<string, unknown>;
};

type MinimalDocSummary = {
  document_type: string;
  title: string;
  summary?: string;
};

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function list(items: unknown, prefix = "- ") {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items.map((item) => `${prefix}${text(item)}`).join("\n");
}

function kvList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return `- ${text(item)}`;
      const obj = item as Record<string, unknown>;
      const name = text(obj.name ?? obj.title ?? "Item");
      const details = obj.summary ?? obj.description ?? obj.value ?? obj.detail ?? obj.goals ?? obj.notes ?? "";
      if (Array.isArray(details)) {
        return `- ${name}\n  - ${details.map((v) => text(v)).join("\n  - ")}`;
      }
      return `- ${name}${details ? `: ${text(details)}` : ""}`;
    })
    .join("\n");
}

function stackLine(project: MinimalProject) {
  const stack = project.stack_recommendation ?? {};
  return [
    text(stack.frontend ?? "React"),
    text(stack.backend ?? "Node.js"),
    text(stack.database ?? "PostgreSQL"),
    text(stack.auth ?? "InsForge Auth"),
  ].join(" / ");
}

function docSummary(docs: MinimalDocSummary[]) {
  if (!docs.length) return "PRD, SRS, and Architecture documents";
  return docs.map((doc) => `${doc.document_type} (${doc.title})`).join(", ");
}

function renderSection(title: string, body: string[]) {
  return [`## ${title}`, ...body, ""].join("\n");
}

export async function renderPrdMarkdown(payload: Record<string, unknown>, project: MinimalProject) {
  return [
    `# ${text(payload.title ?? `${project.title} PRD`)}`,
    "",
    renderSection("Executive Summary", [text(payload.summary ?? project.idea)]),
    renderSection("Product Vision", [text(payload.product_vision ?? payload.summary ?? project.idea)]),
    renderSection("Problem Statement", [text(payload.problem_statement ?? project.idea)]),
    renderSection("Goals", [list(payload.goals)]),
    renderSection("Target Users", [list(payload.target_users)]),
    renderSection("User Journeys", [kvList(payload.user_journeys ?? payload.core_flows)]),
    renderSection("Feature Requirements", [kvList(payload.feature_requirements)]),
    renderSection("Functional Requirements", [list(payload.functional_requirements)]),
    renderSection("Non-Functional Requirements", [list(payload.non_functional_requirements)]),
    renderSection("KPIs", [list(payload.success_metrics ?? payload.kpis)]),
    renderSection("Risks", [list(payload.risks)]),
    renderSection("Open Questions", [list(payload.open_questions)]),
    renderSection("Project Context", [
      `- Title: ${project.title}`,
      `- Idea: ${project.idea}`,
      `- Stack: ${stackLine(project)}`,
    ]),
  ].join("\n");
}

export async function renderSystemDesignMarkdown(payload: Record<string, unknown>, project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${text(payload.title ?? `${project.title} System Design`)}`,
    "",
    renderSection("Summary", [text(payload.summary ?? project.idea)]),
    renderSection("Architecture Overview", [text(payload.architecture_overview ?? "Template-driven generation backend")]),
    renderSection("Components", [kvList(payload.components)]),
    renderSection("Data Flow", [kvList(payload.data_flow ?? payload.request_flow)]),
    renderSection("APIs", [kvList(payload.apis ?? payload.api_endpoints)]),
    renderSection("Security", [list(payload.security)]),
    renderSection("Scaling Considerations", [list(payload.scaling_considerations)]),
    renderSection("Dependencies", [docSummary(docs)]),
  ].join("\n");
}

export async function renderArchitectureMarkdown(payload: Record<string, unknown>, project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${text(payload.title ?? `${project.title} Architecture`)}`,
    "",
    renderSection("Summary", [text(payload.summary ?? project.idea)]),
    renderSection("Stack", [text(payload.stack ?? stackLine(project))]),
    renderSection("Layered View", [kvList(payload.layers ?? payload.components)]),
    renderSection("Data Architecture", [kvList(payload.data_architecture ?? payload.data_design)]),
    renderSection("API Design", [kvList(payload.api_design)]),
    renderSection("Security", [list(payload.security)]),
    renderSection("Deployment", [list(payload.deployment)]),
    renderSection("Dependencies", [docSummary(docs)]),
  ].join("\n");
}

export async function renderDesignMarkdown(project: MinimalProject, payload: Record<string, unknown>) {
  return [
    `# ${project.title} Design System`,
    "",
    renderSection("Summary", [text(payload.summary ?? project.idea)]),
    renderSection("Brand", [text(payload.brand ?? "Clean, fast, and product-first")]),
    renderSection("Colors", [kvList(payload.colors)]),
    renderSection("Typography", [kvList(payload.typography)]),
    renderSection("Components", [kvList(payload.components)]),
    renderSection("Spacing", [list(payload.spacing)]),
    renderSection("Motion", [list(payload.motion)]),
  ].join("\n");
}

export async function renderApiSpecMarkdown(project: MinimalProject, docs: MinimalDocSummary[]) {
  const included = docs.length ? docSummary(docs) : "PRD, SRS, and Architecture documents";
  return [
    `# ${project.title} API Specification`,
    "",
    "## Summary",
    `API contract for ${project.title}.`,
    "",
    "## Included Documents",
    included,
    "",
    "## Core Routes",
    "- POST /project",
    "- POST /generate/prd",
    "- POST /generate/system-design",
    "- POST /generate/architecture",
    "- GET /download/:id",
  ].join("\n");
}

export async function renderReadmeMarkdown(project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${project.title}`,
    "",
    "## Overview",
    `Spec bundle for ${project.title}.`,
    "",
    "## Included Documents",
    docSummary(docs),
    "",
    "## Idea",
    project.idea,
  ].join("\n");
}

export async function renderFolderStructureMarkdown(project: MinimalProject) {
  const json = {
    root: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`,
    tree: [
      { name: "docs", type: "folder", children: [{ name: "PRD.md", type: "file" }, { name: "SRS.md", type: "file" }, { name: "ARCHITECTURE.md", type: "file" }] },
      { name: "design", type: "folder", children: [{ name: "DESIGN_SYSTEM.md", type: "file" }] },
      { name: "api", type: "folder", children: [{ name: "API_SPEC.md", type: "file" }] },
      { name: "structure", type: "folder", children: [{ name: "FOLDER_STRUCTURE.md", type: "file" }, { name: "FOLDER_STRUCTURE.json", type: "file" }] },
      { name: "README.md", type: "file" },
    ],
  };

  return {
    markdown: [
      `# ${project.title} Folder Structure`,
      "",
      "```json",
      JSON.stringify(json, null, 2),
      "```",
    ].join("\n"),
    json: JSON.stringify(json, null, 2),
  };
}
