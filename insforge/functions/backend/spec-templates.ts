const TEMPLATE_ROOT = new URL("../../../tools/spec-generator/templates/", import.meta.url);

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

const templateCache = new Map<string, string>();

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
      const details =
        obj.responsibility ??
        obj.summary ??
        obj.description ??
        obj.value ??
        obj.detail ??
        obj.steps ??
        obj.items ??
        obj.pain_points ??
        obj.goals ??
        obj.acceptance_criteria ??
        obj.notes ??
        "";

      if (Array.isArray(details)) {
        return `- ${name}\n  - ${details.map((v) => text(v)).join("\n  - ")}`;
      }

      return `- ${name}${details ? `: ${text(details)}` : ""}`;
    })
    .join("\n");
}

function jsonBlock(value: unknown) {
  return "```json\n" + JSON.stringify(value, null, 2) + "\n```";
}

function normalizeStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value) || !value.length) return fallback;
  return value.map((item) => text(item)).filter((item) => item.trim().length > 0);
}

function markdownTable(headers: string[], rows: string[][]) {
  if (!rows.length) return "- None provided";
  const safeHeaders = headers.map((header) => header || "Item");
  const separator = safeHeaders.map(() => "---");
  return [
    `| ${safeHeaders.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => text(cell).replace(/\|/g, "\\|")).join(" | ")} |`),
  ].join("\n");
}

function formatSectionList(title: string, items: unknown, fallback = "None provided") {
  const lines = normalizeStringArray(items);
  if (!lines.length) return `### ${title}\n- ${fallback}`;
  return `### ${title}\n${list(lines)}`;
}

function formatProblemStatement(problem: unknown, project: MinimalProject) {
  const obj = problem && typeof problem === "object" && !Array.isArray(problem)
    ? problem as Record<string, unknown>
    : {};
  const currentState = normalizeStringArray(obj.current_state, [
    "The current product experience is fragmented and the generated output is too shallow for handoff.",
  ]);
  const desiredState = normalizeStringArray(obj.desired_state, [
    "The design document should read like a real implementation artifact with enough detail to guide engineering.",
  ]);
  const constraints = normalizeStringArray(obj.constraints, [
    "Keep the document aligned with the approved template.",
    "Avoid self-referential notes about AI generation or internal references.",
  ]);

  return [
    `The design package for **${project.title}** must convert a rough product idea into a richer, implementation-ready design artifact.`,
    "",
    "### Current State",
    list(currentState),
    "",
    "### Desired State",
    list(desiredState),
    "",
    "### Constraints",
    list(constraints),
  ].join("\n");
}

function formatSuccessMetrics(metrics: unknown) {
  const rows = Array.isArray(metrics)
    ? metrics.map((metric) => {
      if (!metric || typeof metric !== "object") return ["Metric", "Baseline", "Target", "Manual review"];
      const obj = metric as Record<string, unknown>;
      return [
        text(obj.metric ?? "Metric"),
        text(obj.current ?? obj.baseline ?? "Not measured"),
        text(obj.target ?? "Target"),
        text(obj.measurement_method ?? obj.measurement ?? "Manual review"),
      ];
    })
    : [];

  const table = markdownTable(["Metric", "Current", "Target", "Measurement Method"], rows);
  return [
    table,
    "",
    "### Notes",
    list([
      "Track whether the rendered design doc covers all template sections before release.",
      "Review the output for specificity, structure, and alignment with the product stack.",
      "Verify the file feels complete enough for engineering handoff without extra prompting.",
    ]),
  ].join("\n");
}

function formatSystemOverview(overview: unknown, project: MinimalProject, stack: ReturnType<typeof normalizeProjectStack>) {
  const obj = overview && typeof overview === "object" && !Array.isArray(overview)
    ? overview as Record<string, unknown>
    : {};
  const boundaries = normalizeStringArray(obj.boundaries, [
    "Browser client",
    "InsForge backend functions",
    "External model providers and billing services",
  ]);
  const flow = normalizeStringArray(obj.high_level_flow ?? obj.flow, [
    "User enters an idea and context.",
    "The system gathers clarifying details and a recommended stack.",
    "The backend generates rich documents through template-backed rendering.",
    "The ZIP export packages the generated artifacts for handoff.",
  ]);
  const interfaces = normalizeStringArray(obj.key_interfaces, [
    "React/Vite UI",
    "InsForge API routes",
    "PostgreSQL persistence",
  ]);

  return [
    `The system is organized around **${project.title}** and the recommended stack of **${stack.frontend} / ${stack.backend} / ${stack.database}**.`,
    "",
    "### Context Boundaries",
    list(boundaries),
    "",
    "### High-Level Flow",
    list(flow),
    "",
    "### Key Interfaces",
    list(interfaces),
  ].join("\n");
}

function formatArchitectureSection(architecture: unknown, stack: ReturnType<typeof normalizeProjectStack>) {
  const obj = architecture && typeof architecture === "object" && !Array.isArray(architecture)
    ? architecture as Record<string, unknown>
    : {};
  const components = Array.isArray(obj.components)
    ? obj.components.map((component) => {
      if (!component || typeof component !== "object") return { name: "Component", responsibility: "Not provided", scaling: "Stateless", failure: "Fallback to safe defaults" };
      const item = component as Record<string, unknown>;
      return {
        name: text(item.name ?? "Component"),
        responsibility: text(item.responsibility ?? item.summary ?? "Not provided"),
        scaling: text(item.scaling ?? item.scalability ?? "Stateless horizontal scale"),
        failure: text(item.failure_modes ?? item.failure_mode ?? "Fallback to next viable provider or safe defaults"),
      };
    })
    : [];

  const componentRows = components.length
    ? markdownTable(
        ["Component", "Responsibility", "Scaling", "Failure Modes"],
        components.map((item) => [item.name, item.responsibility, item.scaling, item.failure]),
      )
    : "- None provided";

  return [
    `### Architectural Style`,
    list(normalizeStringArray(obj.style ?? obj.architectural_style, [
      `Template-first document rendering with ${stack.frontend}, ${stack.backend}, and ${stack.database}.`,
      "Stateless API routes with durable persistence.",
      "Parallel provider execution with fallback selection.",
    ])),
    "",
    "### Component Breakdown",
    componentRows,
    "",
    formatSectionList("Deployment", obj.deployment ?? obj.deployments, "Frontend and backend deploy independently."),
    "",
    formatSectionList("Security", obj.security, "Bearer auth, ownership checks, and row-level security."),
    "",
    formatSectionList("Observability", obj.observability, "Route logs, error capture, and generation timing."),
    "",
    formatSectionList("Reliability", obj.reliability, "Use provider fallback, timeouts, and durable storage."),
    "",
    formatSectionList("Tradeoffs", obj.tradeoffs, "Higher model spend in exchange for faster perceived latency."),
  ].join("\n");
}

function formatDataDesignSection(dataDesign: unknown, project: MinimalProject) {
  const obj = dataDesign && typeof dataDesign === "object" && !Array.isArray(dataDesign)
    ? dataDesign as Record<string, unknown>
    : {};
  const entities = Array.isArray(obj.entities)
    ? obj.entities.map((entity) => {
      if (!entity || typeof entity !== "object") return { name: "Entity", fields: [], indexes: [], constraints: [], retention: "Not provided" };
      const item = entity as Record<string, unknown>;
      return {
        name: text(item.name ?? item.entity_name ?? "Entity"),
        fields: normalizeStringArray(item.fields),
        indexes: normalizeStringArray(item.indexes),
        constraints: normalizeStringArray(item.constraints),
        retention: text(item.retention ?? item.ttl ?? "Persist for the lifetime of the project"),
      };
    })
    : [];

  const entityBlocks = entities.length
    ? entities.map((entity) => [
        `#### Entity: ${entity.name}`,
        `- Fields: ${entity.fields.length ? entity.fields.join(", ") : "Not provided"}`,
        `- Indexes: ${entity.indexes.length ? entity.indexes.join(", ") : "Not provided"}`,
        `- Constraints: ${entity.constraints.length ? entity.constraints.join(", ") : "Not provided"}`,
        `- Retention: ${entity.retention}`,
      ].join("\n")).join("\n\n")
    : [
        "#### Entity: projects",
        "- Fields: title, idea, description, stack recommendation, generation state, timestamps",
        "- Indexes: user ownership lookup, project lookup",
        "- Constraints: project title and idea validation, foreign key ownership",
        "- Retention: Persist for the project lifetime",
      ].join("\n");

  const accessPatterns = Array.isArray(obj.access_patterns)
    ? obj.access_patterns.map((pattern) => {
      if (!pattern || typeof pattern !== "object") return { use_case: "Lookup", query: "Not provided", index: "Not provided" };
      const item = pattern as Record<string, unknown>;
      return {
        use_case: text(item.use_case ?? "Lookup"),
        query: text(item.query ?? item.description ?? "Not provided"),
        index: text(item.index ?? item.indexes ?? "Not provided"),
      };
    })
    : [
      { use_case: "List user projects", query: "Projects by owner and latest status", index: "user_id, updated_at" },
      { use_case: "Load a generated doc", query: "Document by project and type", index: "project_id, document_type" },
    ];

  const accessRows = markdownTable(
    ["Use Case", "Query", "Index"],
    accessPatterns.map((pattern) => [pattern.use_case, pattern.query, pattern.index]),
  );

  return [
    `The persisted design data for **${project.title}** should stay small, queryable, and ownership-aware.`,
    "",
    "### Entities",
    entityBlocks,
    "",
    "### Data Access Patterns",
    accessRows,
    "",
    "### Consistency Model",
    list(normalizeStringArray(obj.consistency_model, [
      "Use strong consistency for ownership and billing records.",
      "Use durable writes for generated document versions.",
      "Keep read paths simple and deterministic for the preview and download flows.",
    ])),
  ].join("\n");
}

function formatApiDesignSection(apiDesign: unknown, project: MinimalProject) {
  const obj = apiDesign && typeof apiDesign === "object" && !Array.isArray(apiDesign)
    ? apiDesign as Record<string, unknown>
    : {};
  const endpoints = Array.isArray(obj.endpoints)
    ? obj.endpoints.map((endpoint) => {
      if (!endpoint || typeof endpoint !== "object") return null;
      const item = endpoint as Record<string, unknown>;
      return {
        method: text(item.method ?? "POST"),
        path: text(item.path ?? "/example"),
        auth: text(item.auth ?? "Required"),
        rateLimit: text(item.rate_limit ?? item.limit ?? "3 specs for free users"),
        request: text(item.request ?? "{}"),
        response: text(item.response ?? "{}"),
        errors: normalizeStringArray(item.errors, ["400 invalid request"]),
        notes: normalizeStringArray(item.notes),
      };
    }).filter(Boolean) as Array<{
      method: string;
      path: string;
      auth: string;
      rateLimit: string;
      request: string;
      response: string;
      errors: string[];
      notes: string[];
    }>
    : [];

  const endpointBlocks = endpoints.length
    ? endpoints.map((endpoint) => [
        `#### ${endpoint.method} ${endpoint.path}`,
        `- Auth: ${endpoint.auth}`,
        `- Rate Limit: ${endpoint.rateLimit}`,
        "",
        "**Request**",
        "```json",
        endpoint.request,
        "```",
        "",
        "**Response**",
        "```json",
        endpoint.response,
        "```",
        "",
        `- Errors: ${endpoint.errors.join("; ") || "Not provided"}`,
        `- Notes: ${endpoint.notes.join("; ") || "Not provided"}`,
      ].join("\n")).join("\n\n")
    : [
      "#### POST /project",
      "- Auth: Required",
      "- Rate Limit: 3 specs for free users",
      "",
      "**Request**",
      "```json",
      `{ "title": "${project.title}", "idea": "${project.idea}" }`,
      "```",
      "",
      "**Response**",
      "```json",
      `{ "success": true }`,
      "```",
    ].join("\n");

  const conventions = normalizeStringArray(obj.conventions, [
    "Use JSON request and response bodies.",
    "Require bearer authentication for user-owned routes.",
    "Return deterministic errors with clear status codes.",
  ]);

  return [
    `The API surface for **${project.title}** should remain small, explicit, and easy to consume from the builder UI.`,
    "",
    "### Conventions",
    list(conventions),
    "",
    "### Endpoint Definitions",
    endpointBlocks,
  ].join("\n");
}

async function loadTemplate(fileName: string) {
  const cached = templateCache.get(fileName);
  if (cached) return cached;

  const template = await Deno.readTextFile(new URL(fileName, TEMPLATE_ROOT));
  templateCache.set(fileName, template);
  return template;
}

function renderTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{([^}]*)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    if (!key) return "";
    return values[key] ?? "";
  });
}

function normalizeProjectStack(project: MinimalProject) {
  const stack = project.stack_recommendation ?? {};
  return {
    frontend: text(stack.frontend ?? "React"),
    backend: text(stack.backend ?? "Node.js"),
    database: text(stack.database ?? "PostgreSQL"),
    auth: text(stack.auth ?? "InsForge Auth"),
    hosting: text(stack.hosting ?? "InsForge"),
    rationale: text(stack.rationale ?? "Recommended for fast iteration and reliable delivery."),
  };
}

function projectDocsSummary(docs: MinimalDocSummary[]) {
  if (!docs.length) return "PRD, SRS, and Architecture documents";
  return docs.map((doc) => `${doc.document_type} (${doc.title})`).join(", ");
}

function currentDateLabel() {
  return new Date().toISOString().slice(0, 10);
}

export async function renderPrdMarkdown(payload: Record<string, unknown>, project: MinimalProject) {
  const template = await loadTemplate("prd.md.tpl");
  const goals = Array.isArray(payload.goals) && payload.goals.length
    ? payload.goals
    : [
      "Ship a complete spec bundle from a short idea.",
      "Keep the PRD aligned with the generated SRS and architecture docs.",
      "Make the handoff clear enough for engineering and QA.",
    ];
  const scopeItems = [
    ...(Array.isArray(payload.feature_requirements) ? payload.feature_requirements.map((item) => {
      if (!item || typeof item !== "object") return "Feature requirement";
      const obj = item as Record<string, unknown>;
      const feature = text(obj.feature ?? "Feature");
      const desc = text(obj.description ?? "");
      return `${feature}${desc ? `: ${desc}` : ""}`;
    }) : []),
    ...(Array.isArray(payload.functional_requirements) ? payload.functional_requirements.map((item) => text(item)) : []),
  ];
  const personaBlocks = Array.isArray(payload.personas)
    ? payload.personas.map((persona) => {
      if (!persona || typeof persona !== "object") return "- Persona";
      const obj = persona as Record<string, unknown>;
      const name = text(obj.name ?? "Persona");
      const goalsList = list(obj.goals);
      const pains = list(obj.pain_points);
      return `### ${name}\n${goalsList}\n${pains}`;
    }).join("\n\n")
    : "- No personas provided";
  const journeyBlocks = Array.isArray(payload.user_journeys)
    ? payload.user_journeys.map((journey) => {
      if (!journey || typeof journey !== "object") return "- Journey";
      const obj = journey as Record<string, unknown>;
      const name = text(obj.name ?? "Journey");
      const steps = list(obj.steps, "1. ");
      return `### ${name}\n${steps}`;
    }).join("\n\n")
    : "- No user journeys provided";
  const userStoryBlocks = [
    personaBlocks,
    journeyBlocks,
  ].join("\n\n");
  const successRows = Array.isArray(payload.success_metrics ?? payload.kpis)
    ? (payload.success_metrics ?? payload.kpis).map((metric) => {
      if (!metric || typeof metric !== "object") return ["Metric", "Current", "Target", "Manual review"];
      const obj = metric as Record<string, unknown>;
      return [
        text(obj.metric ?? obj.name ?? "Metric"),
        text(obj.current ?? obj.baseline ?? "Not measured"),
        text(obj.target ?? obj.goal ?? "Target"),
        text(obj.measurement_method ?? obj.measurement ?? "Manual review"),
      ];
    })
    : [];
  const successMetrics = successRows.length
    ? markdownTable(["Metric", "Current", "Target", "Measurement Method"], successRows)
    : list(["User activation rate", "Spec completion rate", "Time to download", "Approval rate"]);
  const riskBlocks = Array.isArray(payload.risks)
    ? payload.risks.map((risk) => {
      if (!risk || typeof risk !== "object") return `- ${text(risk)}`;
      const obj = risk as Record<string, unknown>;
      const name = text(obj.risk ?? obj.name ?? "Risk");
      const mitigation = text(obj.mitigation ?? obj.response ?? "");
      return `- ${name}${mitigation ? `: ${mitigation}` : ""}`;
    }).join("\n")
    : list([
      "Provider outages can delay generation.",
      "Invalid AI output can break templating.",
      "Quota logic can reject requests too early if misconfigured.",
    ]);
  const appendix = [
    `- Project: ${project.title}`,
    `- Idea: ${project.idea}`,
    `- Stack: ${normalizeProjectStack(project).frontend} / ${normalizeProjectStack(project).backend} / ${normalizeProjectStack(project).database}`,
  ].join("\n");
  return renderTemplate(template, {
    title: text(payload.title ?? `${project.title} PRD`),
    summary: text(payload.summary ?? project.idea),
    background: text(payload.background ?? project.description ?? project.idea),
    problem_statement: text(payload.problem_statement ?? payload.summary ?? project.idea),
    product_vision: text(payload.product_vision ?? payload.summary ?? "Create a clear, implementation-ready spec bundle from a short idea."),
    goals: list(goals),
    scope: [
      "### In Scope",
      list(scopeItems.length ? scopeItems : ["Spec creation workflow", "Template-driven document generation", "ZIP export"]),
      "",
      "### Target Users",
      list(Array.isArray(payload.target_users) && payload.target_users.length ? payload.target_users : ["Builders", "Founders", "Engineers"]),
    ].join("\n"),
    out_of_scope: list(Array.isArray(payload.non_goals) && payload.non_goals.length ? payload.non_goals : [
      "Pixel-perfect design editing",
      "Team collaboration features",
      "External integrations beyond the core export flow",
    ]),
    user_stories: userStoryBlocks,
    success_metrics: successMetrics,
    risks: riskBlocks,
    appendix,
  });
}

export async function renderSystemDesignMarkdown(
  payload: Record<string, unknown>,
  project: MinimalProject,
  docs: MinimalDocSummary[],
) {
  const template = await loadTemplate("srs.md.tpl");
  const stack = normalizeProjectStack(project);
  const changeLogRows = Array.isArray(payload.change_log)
    ? payload.change_log.map((entry) => {
      if (!entry || typeof entry !== "object") return ["1.0", currentDateLabel(), "PLANNR AI", "Initial draft"];
      const obj = entry as Record<string, unknown>;
      return [
        text(obj.version ?? "1.0"),
        text(obj.date ?? currentDateLabel()),
        text(obj.author ?? "PLANNR AI"),
        text(obj.changes ?? "Initial draft"),
      ];
    })
    : [["1.0", currentDateLabel(), "PLANNR AI", "Initial draft"]];
  const definitionsRows = Array.isArray(payload.definitions)
    ? payload.definitions.map((entry) => {
      if (!entry || typeof entry !== "object") return ["Term", "Meaning"];
      const obj = entry as Record<string, unknown>;
      return [text(obj.term ?? "Term"), text(obj.meaning ?? "Meaning")];
    })
    : [
      ["PRD", "Product Requirements Document"],
      ["SRS", "Software Requirements Specification"],
      ["AI", "Automated spec generation engine"],
    ];
  const userClassRows = Array.isArray(payload.user_classes)
    ? payload.user_classes.map((entry) => {
      if (!entry || typeof entry !== "object") return ["USER", "Primary user", "Create and export specs"];
      const obj = entry as Record<string, unknown>;
      return [
        text(obj.role ?? "USER"),
        text(obj.description ?? "Primary user"),
        normalizeStringArray(obj.permissions).join(", ") || "Create and export specs",
      ];
    })
    : [
      ["USER", "Primary user", "Create and export specs"],
      ["ADMIN", "Monitor usage and billing", "Review users and analytics"],
    ];
  const featureName = text(payload.feature_name ?? "Spec generation");
  const featureDescription = text(payload.feature_description ?? "Generate consistent documents from a single source of truth.");
  const actors = list(Array.isArray(payload.actors) ? payload.actors : ["Builder", "Automation service", "Billing system"]);
  const mainFlow = list(Array.isArray(payload.main_flow) ? payload.main_flow : [
    "User submits an idea and optional context.",
    "Backend validates auth, quota, and input.",
    "Model providers return structured JSON.",
    "Backend renders the template-driven markdown and stores it.",
  ], "1. ");
  const functionalRequirements = list(Array.isArray(payload.functional_requirements) ? payload.functional_requirements : [
    "Render every generated document from its matching template.",
    "Reject requests when quota is exceeded.",
    "Persist generated versions and make them downloadable.",
  ]);
  const traceability = markdownTable(
    ["Requirement ID", "Design", "Code", "Test"],
    [["FR-001", "PRD/SRS templates", "Backend generation flow", "Template rendering and download tests"]],
  );
  return renderTemplate(template, {
    product_name: project.title,
    version: text(payload.version ?? "1.0"),
    status: text(payload.status ?? "Draft"),
    author: text(payload.author ?? "PLANNR AI"),
    reviewers: text(payload.reviewers ?? "Product, Engineering, QA"),
    created_date: text(payload.created_date ?? currentDateLabel()),
    updated_date: text(payload.updated_date ?? currentDateLabel()),
    change_log: markdownTable(["Version", "Date", "Author", "Changes"], changeLogRows),
    purpose: text(payload.purpose ?? payload.summary ?? project.idea),
    scope: text(payload.scope ?? project.description ?? project.idea),
    definitions: markdownTable(["Term", "Meaning"], definitionsRows),
    references: list(Array.isArray(payload.references) && payload.references.length ? payload.references : ["PRD.md", "ARCHITECTURE.md", "DESIGN_SYSTEM.md", "API_SPEC.md"]),
    product_perspective: text(payload.product_perspective ?? payload.summary ?? project.idea),
    product_functions: list(Array.isArray(payload.product_functions) && payload.product_functions.length ? payload.product_functions : [
      "Generate clarifying questions",
      "Recommend a production stack",
      "Generate PRD, SRS, and Architecture docs",
      "Export a ZIP bundle for build handoff",
    ]),
    user_classes: markdownTable(["Role", "Description", "Permissions"], userClassRows),
    environment: text(payload.environment ?? `Vite + React frontend, browser sessions, and PostgreSQL storage.`),
    os: text(payload.os ?? "Cross-platform browser client"),
    runtime: text(payload.runtime ?? "Node.js / Deno / browser"),
    database: text(payload.database ?? "PostgreSQL"),
    constraints: list(Array.isArray(payload.constraints) && payload.constraints.length ? payload.constraints : ["Free-tier generation limits", "Authenticated downloads", "Provider timeouts"]),
    assumptions: list(Array.isArray(payload.assumptions) && payload.assumptions.length ? payload.assumptions : ["Users authenticate before saving or downloading generated spec bundles."]),
    system_features_intro: text(payload.system_features_intro ?? "The system produces a cohesive spec bundle with consistent document structure."),
    feature_name: featureName,
    feature_description: featureDescription,
    actors,
    preconditions: list(Array.isArray(payload.preconditions) && payload.preconditions.length ? payload.preconditions : ["User is authenticated and has quota remaining."]),
    postconditions: list(Array.isArray(payload.postconditions) && payload.postconditions.length ? payload.postconditions : ["The project, documents, and ZIP export are stored and available."]),
    main_flow: mainFlow,
    alt_flow: list(Array.isArray(payload.alt_flow) && payload.alt_flow.length ? payload.alt_flow : ["If one provider fails, the backend falls back to the next valid provider response."]),
    edge_case: list(Array.isArray(payload.edge_case) && payload.edge_case.length ? payload.edge_case : ["If quota is exceeded, the system returns a limit error before generation begins."]),
    functional_requirements: functionalRequirements,
    acceptance_criteria: list(Array.isArray(payload.acceptance_criteria) && payload.acceptance_criteria.length ? payload.acceptance_criteria : ["Templates render without raw placeholder markers in the final output."]),
    priority: text(payload.priority ?? "High"),
    ui_requirements: list(Array.isArray(payload.ui_requirements) && payload.ui_requirements.length ? payload.ui_requirements : ["Responsive builder", "History list", "Billing dashboard", "Export controls"]),
    api_requirements: list(Array.isArray(payload.api_requirements) && payload.api_requirements.length ? payload.api_requirements : ["POST /project", "POST /generate/*", "GET /download/:id", "GET /usage", "GET /history"]),
    hardware: list(Array.isArray(payload.hardware) && payload.hardware.length ? payload.hardware : ["None beyond a modern browser and a backend runtime."]),
    software_interfaces: list(Array.isArray(payload.software_interfaces) && payload.software_interfaces.length ? payload.software_interfaces : ["Authentication", "PostgreSQL", "Model services"]),
    performance: list(Array.isArray(payload.performance) && payload.performance.length ? payload.performance : ["Parallel provider calls and strict timeouts keep the generation flow responsive."]),
    scalability: list(Array.isArray(payload.scalability) && payload.scalability.length ? payload.scalability : ["Stateless backend functions", "Row-level security for ownership"]),
    availability: list(Array.isArray(payload.availability) && payload.availability.length ? payload.availability : ["Best-effort generation with retries and provider fallback."]),
    reliability: list(Array.isArray(payload.reliability) && payload.reliability.length ? payload.reliability : ["If one model fails, the next provider can still complete the request."]),
    security: list(Array.isArray(payload.security) && payload.security.length ? payload.security : ["Bearer token auth", "Ownership checks", "RLS on user-owned tables"]),
    usability: list(Array.isArray(payload.usability) && payload.usability.length ? payload.usability : ["Single flow from idea to ZIP, with preview and download affordances."]),
    maintainability: list(Array.isArray(payload.maintainability) && payload.maintainability.length ? payload.maintainability : ["Consistent structure keeps the output stable and easier to iterate."]),
    observability: list(Array.isArray(payload.observability) && payload.observability.length ? payload.observability : ["api_logs records route, status, and latency for generation and billing events."]),
    compliance: list(Array.isArray(payload.compliance) && payload.compliance.length ? payload.compliance : ["User-owned data stays behind RLS and authenticated endpoints."]),
    data_models: list(Array.isArray(payload.data_models) && payload.data_models.length ? payload.data_models : ["users", "projects", "documents", "document_versions", "usage_limits", "billing_payments", "api_logs"]),
    data_storage: list(Array.isArray(payload.data_storage) && payload.data_storage.length ? payload.data_storage : ["PostgreSQL tables."]),
    data_retention: list(Array.isArray(payload.data_retention) && payload.data_retention.length ? payload.data_retention : ["Generated specs remain until the user deletes them."]),
    data_integrity: list(Array.isArray(payload.data_integrity) && payload.data_integrity.length ? payload.data_integrity : ["Foreign keys and unique constraints prevent duplicate project-document pairs."]),
    architecture_constraints: list(Array.isArray(payload.architecture_constraints) && payload.architecture_constraints.length ? payload.architecture_constraints : [`Current stack recommendation: ${stack.frontend}, ${stack.backend}, ${stack.database}.`]),
    error_handling: list(Array.isArray(payload.error_handling) && payload.error_handling.length ? payload.error_handling : ["Validation, provider fallback, and structured API errors."]),
    logging: list(Array.isArray(payload.logging) && payload.logging.length ? payload.logging : ["Each backend route records success or failure in api_logs."]),
    deployment: list(Array.isArray(payload.deployment) && payload.deployment.length ? payload.deployment : ["Backend function with Vite frontend deployment."]),
    unit_testing: list(Array.isArray(payload.unit_testing) && payload.unit_testing.length ? payload.unit_testing : ["Template rendering and structured output parsing should be covered by unit tests."]),
    integration_testing: list(Array.isArray(payload.integration_testing) && payload.integration_testing.length ? payload.integration_testing : ["End-to-end auth, generation, billing, and download flows."]),
    system_testing: list(Array.isArray(payload.system_testing) && payload.system_testing.length ? payload.system_testing : ["Validate the full project ZIP contains every expected artifact."]),
    performance_testing: list(Array.isArray(payload.performance_testing) && payload.performance_testing.length ? payload.performance_testing : ["Measure total generation latency across the parallel provider race."]),
    traceability_matrix: traceability,
    risks: list(Array.isArray(payload.risks) && payload.risks.length ? payload.risks : ["Provider outages can delay generations.", "Template drift can create placeholder-heavy output."]),
    open_issues: list(Array.isArray(payload.open_issues) && payload.open_issues.length ? payload.open_issues : ["Decide whether to expose folder structure as MD, JSON, or both."]),
    future: list(Array.isArray(payload.future) && payload.future.length ? payload.future : ["Add GitHub sync, project collaboration, and richer export formats."]),
    appendix: list(Array.isArray(payload.appendix) && payload.appendix.length ? payload.appendix : [
      `Related documents: ${projectDocsSummary(docs)}`,
      `Stack: ${stack.frontend} / ${stack.backend} / ${stack.database}`,
    ]),
  });
}

export async function renderArchitectureMarkdown(
  payload: Record<string, unknown>,
  project: MinimalProject,
  docs: MinimalDocSummary[],
) {
  const template = await loadTemplate("architecture.md.tpl");
  const stack = normalizeProjectStack(project);
  const componentRows = Array.isArray(payload.components)
    ? payload.components.map((component) => {
      if (!component || typeof component !== "object") return null;
      const obj = component as Record<string, unknown>;
      return {
        name: text(obj.name ?? "Component"),
        responsibility: text(obj.responsibility ?? obj.summary ?? "Not provided"),
        scaling: text(obj.scaling ?? obj.scalability ?? "Horizontal stateless scaling"),
        dependencies: normalizeStringArray(obj.dependencies).join(", ") || "Core backend services",
        failure: text(obj.failure_modes ?? obj.failure_mode ?? "Fallback to safe defaults"),
        observability: normalizeStringArray(obj.observability).join(", ") || "Route logs and timing",
      };
    }).filter(Boolean) as Array<{
      name: string;
      responsibility: string;
      scaling: string;
      dependencies: string;
      failure: string;
      observability: string;
    }>
    : [];
  const defaultComponents = componentRows.length ? componentRows : [
    {
      name: "Builder UI",
      responsibility: "Collect ideas, guide clarifying questions, and show generated docs.",
      scaling: "Client-side scaling; light server dependence.",
      dependencies: "Auth, project APIs, download API",
      failure: "If unavailable, the backend still stores generation results for later retrieval.",
      observability: "UI error states, navigation timing, request status",
    },
    {
      name: "Generation Orchestrator",
      responsibility: "Coordinate provider racing, structured extraction, and template rendering.",
      scaling: "Stateless backend function with horizontal scale-out.",
      dependencies: "OpenAI, Gemini, OpenRouter, template renderer",
      failure: "Fallback to the next provider and return a clear error only if all providers fail.",
      observability: "Latency, provider selection, structured parse success",
    },
    {
      name: "Document Store",
      responsibility: "Persist projects, documents, versions, and history for regeneration.",
      scaling: "PostgreSQL with indexed ownership queries.",
      dependencies: "RLS, migrations, backup process",
      failure: "Reads should degrade gracefully; writes must fail clearly and atomically.",
      observability: "Write counts, version checks, query timing",
    },
    {
      name: "Billing Layer",
      responsibility: "Create orders, verify payments, and promote users to pro.",
      scaling: "Low volume but must be reliable and idempotent.",
      dependencies: "Razorpay APIs, payment signatures, user table",
      failure: "Duplicate confirmations are ignored; invalid signatures are rejected.",
      observability: "Payment order creation, confirmation latency, verification failures",
    },
    {
      name: "Download Service",
      responsibility: "Package documents into ZIP and serve MD/PDF artifacts.",
      scaling: "CPU-light but IO-sensitive for archive creation.",
      dependencies: "JSZip, document versions, file rendering",
      failure: "If archive build fails, fall back to per-document downloads.",
      observability: "ZIP generation timing, file count, download errors",
    },
  ];
  const componentTable = markdownTable(
    ["Component", "Responsibility", "Scaling", "Dependencies", "Failure Impact", "Observability"],
    defaultComponents.map((item) => [item.name, item.responsibility, item.scaling, item.dependencies, item.failure, item.observability]),
  );
  const dataStoreTable = markdownTable(
    ["Data Type", "DB", "Reason"],
    [
      ["Users / auth state", "PostgreSQL", "Ownership, access control, and billing status are relational"],
      ["Projects / documents / versions", "PostgreSQL", "Version history and joins need strong consistency"],
      ["Logs / audit events", "PostgreSQL", "Queryable operational history and debugging"],
      ["Generated ZIP artifacts", "Ephemeral in memory", "Built on demand from persisted versions"],
    ],
  );
  const costTable = markdownTable(
    ["Component", "Cost Driver"],
    [
      ["Model calls", "Token usage and provider concurrency"],
      ["Database", "Persistent storage and indexed reads"],
      ["Archive generation", "CPU and memory during ZIP export"],
      ["Observability", "Event logging and diagnostic retention"],
    ],
  );
  const latencyBudget = markdownTable(
    ["Stage", "Budget"],
    [
      ["Request validation", "50-100ms"],
      ["Provider race / JSON selection", "8-20s"],
      ["Template rendering", "100-300ms"],
      ["Persistence", "100-500ms"],
      ["ZIP packaging", "200-800ms"],
    ],
  );
  const risks = markdownTable(
    ["Risk", "Impact", "Mitigation"],
    [
      ["Provider outage", "Generation delay", "Parallel race and fallback selection"],
      ["Template drift", "Incomplete docs", "Strict template rendering with defaults"],
      ["Quota mismatch", "Unexpected blocking", "Preflight quota checks and usage logging"],
      ["Payment verification failure", "Upgrade stuck", "Signature verification and idempotent writes"],
    ],
  );
  return renderTemplate(template, {
    title: text(payload.title ?? `${project.title} Architecture`),
    author: "PLANNR AI",
    reviewers: "Product, Engineering, QA",
    status: "Draft",
    date: currentDateLabel(),
    prd_link: "PRD.md",
    design_doc_link: "SRS.md",
    executive_summary: [
      text(payload.summary ?? project.idea),
      `This architecture supports ${project.title} as a spec-generation product with template-driven outputs, authenticated project storage, billing, and ZIP export.`,
      `The preferred stack is ${stack.frontend} for the client, ${stack.backend} for backend services, and ${stack.database} for persistence.`,
      `The system intentionally favors stateless generation with durable storage so the same project can be regenerated, audited, and downloaded repeatedly.`,
    ].join("\n\n"),
    scope: text(project.description ?? project.idea),
    in_scope: list([
      "Idea intake and clarification",
      "Stack recommendation",
      "Template-driven document generation",
      "Authenticated downloads and billing",
      "Document history and ZIP export",
    ]),
    out_of_scope: list([
      "Collaborative editing",
      "Multi-tenant workspace sharing",
      "GitHub sync",
      "Live whiteboard-style editing",
    ]),
    scale_assumptions: [
      `Designed for a lightweight SaaS MVP with bursty generation traffic and short-lived active sessions.`,
      `Most requests are user-initiated, but generation requests are the dominant load driver.`,
      `Document content is small enough to keep versioning and archive creation in the application layer.`,
    ].join("\n"),
    dau: "100",
    mau: "3,000",
    peak_rps: "10",
    avg_rps: "2",
    data_growth: "Low, document-centric growth with modest history expansion",
    storage_estimate: "Under 5 GB in year one",
    architecture_overview: [
      `The architecture uses ${stack.frontend} on the client, ${stack.backend} for backend execution, and ${stack.database} for persistence.`,
      `Project generation is stateless and repeatable: the backend can reconstruct the output from stored documents and versioned content.`,
      `Provider racing is used to lower perceived latency while template rendering keeps the final documents deterministic.`,
      `A single user action may fan out into multiple provider requests, but the persistence layer remains a compact relational model.`,
    ].join("\n\n"),
    components: componentTable,
    service_name: "spec-generation-core",
    data_architecture: [
      dataStoreTable,
      "",
      "### Core Data Contracts",
      list([
        "projects store the source idea, description, chosen stack, and generation state",
        "documents define the document type, title, and latest version pointer",
        "document_versions store immutable markdown, structured JSON, file names, and checksums",
        "billing_payments store verified order, signature, and plan data",
        "api_logs store route-level timing, status, and diagnostic metadata",
      ]),
    ].join("\n"),
    where: [
      "Strong consistency is required for project ownership, billing confirmation, and document version writes.",
      "Eventual consistency is acceptable for non-critical logs and user-facing summary refreshes.",
      "The client reads only owned records; all writes are validated by authenticated backend routes.",
    ].join("\n"),
    caching: list([
      "Template files are cached in memory to avoid repeated disk reads.",
      "Generated provider responses are not cached long-term; they are persisted as versions instead.",
      "The browser can cache session and preview state locally, but the backend remains the source of truth.",
    ]),
    async: list([
      "Parallel provider calls race OpenAI, Gemini, and OpenRouter keys to reduce wall-clock wait time.",
      "Structured JSON extraction happens after provider completion and before markdown rendering.",
      "Billing confirmation and spec history writes happen after the primary generation path completes.",
      "Future queue-based offload could move long-running generation away from the request thread if traffic increases.",
    ]),
    request_flow: [
      "1. User submits an idea and optional constraints in the builder UI.",
      "2. Backend validates auth, quota, and project ownership.",
      "3. AI providers return structured JSON for the requested document.",
      "4. The backend renders the matching template and stores a new immutable version.",
      "5. The response includes version metadata and a download path.",
      "6. ZIP export collects every latest document, plus the folder structure artifacts.",
    ].join("\n"),
    reliability: list([
      "Fallback to the next provider when one model fails.",
      "Use request timeouts so one slow provider cannot block the entire flow.",
      "Never overwrite an existing version with a partially generated response.",
      "A failed generation attempt should leave the previous ready version intact.",
    ]),
    dr: [
      "Database-backed persistence removes the need for complex document recovery.",
      "Exports can be regenerated from stored versions at any time.",
      "Backup and restore procedures should preserve the version chain and payment records.",
    ].join("\n"),
    time: "15 minutes",
    security: list([
      "Bearer token auth for every user-owned route.",
      "Row-level security on all relevant tables.",
      "Ownership checks on project, document, and download routes.",
      "Secrets and provider keys remain server-side only.",
    ]),
    observability: list([
      "Route-level logs capture latency, status, and user identifiers.",
      "Generation failures are stored with the route and document type for debugging.",
      "Provider selection, quota failures, and payment confirmations are all observable events.",
    ]),
    capacity: list([
      "Stateless backend functions scale horizontally.",
      "Generation throughput is bounded mainly by provider latency and quota policy.",
      "Document data volume is low, so storage is not the main constraint in the MVP.",
    ]),
    cost: [
      costTable,
      "",
      "### Cost Guidance",
      list([
        "Parallel model racing increases API cost but lowers perceived latency.",
        "Template rendering keeps output deterministic and reduces rework.",
        "Caching template files and limiting writes to immutable versions keeps backend costs predictable.",
      ]),
    ].join("\n"),
    deployment: list([
      "Frontend ships from Vite.",
      "Backend runs as an InsForge function.",
      "Staging should mirror production auth and provider settings closely.",
      "Production deploys should keep secrets and environment values isolated.",
    ]),
    migration: list([
      "Keep document schemas stable so older generated docs continue to render.",
      "Version new schema fields rather than rewriting old document versions in place.",
      "Preserve backwards compatibility for existing ZIP exports and download links.",
    ]),
    tradeoffs: list([
      "Faster generation via parallel calls at the cost of more token usage.",
      "Template-first output improves consistency but reduces model freedom.",
      "Persisting every version increases storage slightly but makes recovery and history trivial.",
    ]),
    risks: risks,
    sla: [
      "Availability target: 99.9%",
      "Latency SLOs should prioritize request acceptance and predictable generation completion.",
      "Error budget is mostly consumed by provider failures, not by the deterministic parts of the system.",
    ].join("\n"),
    "%": "99.9%",
    testing: list([
      "Verify template output contains no raw placeholder markers.",
      "Confirm ZIP exports include every expected document.",
      "Load test the generation route with parallel provider latency.",
      "Validate payment confirmation idempotency and rollback behavior.",
      "Check that older document versions still render after a schema update.",
    ]),
    open_questions: list([
      "Should folder structure remain JSON, or become a markdown deliverable too?",
      "Should provider selection prefer lowest latency or highest-quality output in future revisions?",
    ]),
    future: list([
      "GitHub sync and team workspaces.",
      "More model providers and provider health routing.",
      "Background job queue for large or premium generation jobs.",
      "Public project sharing with expiration and access controls.",
    ]),
    appendix: [
      `Related documents: ${projectDocsSummary(docs)}`,
      `Stack: ${stack.frontend}, ${stack.backend}, ${stack.database}`,
      `Auth: ${stack.auth}`,
      `Hosting: ${stack.hosting}`,
    ].join("\n"),
  });
}

export async function renderDesignMarkdown(
  project: MinimalProject,
  payload: Record<string, unknown> = {},
) {
  const template = await loadTemplate("design.md.tpl");
  const stack = normalizeProjectStack(project);
  return renderTemplate(template, {
    title: `${project.title} Design System`,
    author: "PLANNR AI",
    reviewers: "Product, Engineering",
    status: "Draft",
    date: currentDateLabel(),
    prd_link: "PRD.md",
    executive_summary: text(payload.executive_summary ?? project.description ?? project.idea),
    problem_statement: formatProblemStatement(payload.problem_statement, project),
    goals: list([
      ...(normalizeStringArray(payload.goals).length ? normalizeStringArray(payload.goals) : [
        "Make the spec bundle feel intentional and complete.",
        "Keep the design document aligned with the template and the product stack.",
        "Reduce back-and-forth by including enough detail for engineering handoff.",
      ]),
    ]),
    latency_target: "60s",
    availability_target: "99.9%",
    cost_target: "Bounded parallel provider spend",
    non_goals: list(normalizeStringArray(payload.non_goals, [
      "Pixel-perfect theme editing.",
      "Runtime design token management.",
      "Team collaboration or shared editing in this release.",
    ])),
    success_metrics: formatSuccessMetrics(payload.success_metrics),
    system_overview: formatSystemOverview(payload.system_overview, project, stack),
    architecture: formatArchitectureSection(payload.architecture, stack),
    data_design: formatDataDesignSection(payload.data_design, project),
    entity_name: text(payload.data_design && typeof payload.data_design === "object" && !Array.isArray(payload.data_design) ? (payload.data_design as Record<string, unknown>).entity_name ?? "projects" : "projects"),
    api_design: formatApiDesignSection(payload.api_design, project),
    limit: text(payload.limit ?? "3 specs for free users"),
  });
}

export async function renderReadmeMarkdown(project: MinimalProject, docs: MinimalDocSummary[]) {
  const template = await loadTemplate("readme.md.tpl");
  const stack = normalizeProjectStack(project);
  return renderTemplate(template, {
    project_name: project.title,
    tagline: "Turn one-line ideas into production-ready spec bundles.",
    overview: text(project.description ?? project.idea),
    project_type: "spec generation product",
    core_purpose: "help builders move from idea to build-ready planning",
    feature_1: "Clarifying questions",
    feature_2: "Stack recommendation",
    feature_3: "Consistent docs",
    feature_4: "ZIP export and history",
    architecture_summary: text(`Frontend: ${stack.frontend}\nBackend: ${stack.backend}\nDatabase: ${stack.database}`),
    project_structure: text(projectDocsSummary(docs)),
  });
}

export async function renderApiSpecMarkdown(
  project: MinimalProject,
  docs: MinimalDocSummary[],
) {
  const template = await loadTemplate("apispecification.md.tpl");
  const stack = normalizeProjectStack(project);
  const baseUrl = "https://<your-insforge-host>/backend";
  const authMatrix = markdownTable(
    ["Role", "Access", "Notes"],
    [
      ["free", "idea intake, questions, stack, limited generation", "Quota enforced before generation starts"],
      ["pro", "expanded generation, downloads, history", "Higher cap and faster handoff"],
      ["admin", "billing and operational visibility", "Not exposed in the public UI"],
    ],
  );
  const routeCatalog = markdownTable(
    ["Module", "Primary Routes", "Purpose"],
    [
      ["Auth", "/auth/register, /auth/login, /auth/refresh, /auth/logout", "Session lifecycle and account access"],
      ["Projects", "/projects, /projects/:id, /projects/:id/generate, /projects/:id/status", "Project lifecycle and document generation"],
      ["AI", "/ai/extract, /ai/questions, /ai/recommend-stack", "Structured output and planning helpers"],
      ["Billing", "/payments/create-checkout, /payments/confirm, /payments/history", "Plan purchase and verification"],
      ["Sharing", "/share/:id, /share/:id/download", "Delivery and reuse paths"],
    ],
  );
  const requestLifecycle = [
    "Authenticate the request and resolve the current user.",
    "Validate payload shape, route ownership, and quota state.",
    "Invoke the relevant generation or billing routine.",
    "Persist documents, versions, or payment records atomically.",
    "Return a structured response with IDs, version info, and download links.",
    "Log route latency, outcome, and key metadata for later review.",
  ];
  const errorCodes = markdownTable(
    ["Code", "Meaning", "Client Action"],
    [
      ["400", "Invalid request body or missing fields", "Fix the request and retry"],
      ["401", "Unauthenticated or expired session", "Refresh the session and retry"],
      ["403", "Not allowed to access the resource", "Switch to the owning account"],
      ["404", "Route, project, or document not found", "Check the ID and scope"],
      ["429", "Quota or rate limit exceeded", "Wait, upgrade, or reduce frequency"],
      ["500", "Backend or provider failure", "Retry after a short delay"],
    ],
  );

  return renderTemplate(template, {
    api_name: project.title,
    overview: [
      `API contract for ${project.title}.`,
      `This specification covers auth, project generation, AI helpers, billing, sharing, and download behavior for the current product stack.`,
      `The API is designed for a browser client talking to a backend function that persists projects, document versions, and payment history.`,
      `Primary integration goal: keep every route predictable, template-aligned, and easy to automate from the builder flow.`,
      `Route families: auth, projects, ai, payments, share, and admin.`,
      `Related documents: ${projectDocsSummary(docs)}`,
    ].join("\n\n"),
    base_url: baseUrl,
    protocol: "HTTPS",
    request_content_type: "application/json",
    response_content_type: "application/json; charset=utf-8",
    client_timeout: "15s for browser calls, with automatic retry on auth refresh.",
    server_timeout: "20s for generation routes and 10s for simple reads.",
    versioning_strategy: [
      "Path-based routes under /backend with stable JSON contracts.",
      "Backward-compatible field additions are allowed; breaking changes require a new route family.",
      "Responses keep stable identifiers so the UI can safely rehydrate generated artifacts.",
    ].join("\n"),
    auth_method: "Bearer token sessions",
    auth_header_format: "Authorization: Bearer <access_token>",
    token_structure: "Opaque session token issued by the auth system",
    roles: "free, pro",
    permission_matrix: authMatrix,
    success_response_format: [
      "Standard envelope:",
      "```json",
      "{ \"success\": true, \"...\": \"data\" }",
      "```",
      "Use stable IDs, timestamps, and nested version objects so the client can render without extra lookups.",
    ].join("\n"),
    error_response_format: [
      "Standard envelope:",
      "```json",
      "{ \"success\": false, \"error\": \"message\" }",
      "```",
      "For limit failures include a `code` and `usage` object so the UI can show upgrade messaging.",
    ].join("\n"),
    query_parameters: list([
      "download format: `md`, `pdf`, or `zip`",
      "scope: `document` or `project`",
      "force: regenerate even when a version already exists",
      "page and limit: reserved for future pagination",
    ]),
    rate_limits: [
      "Free users are limited to 3 full spec generations.",
      "Pro users get a higher cap and can download complete project bundles.",
      "Auth, history, and status routes remain lightweight but are still rate aware.",
    ].join("\n"),
    rate_limit_behavior: list([
      "Check quota before generation starts.",
      "Return `429` with usage metadata when a limit is hit.",
      "Never write partial document versions on a blocked request.",
    ]),
    idempotency: list([
      "Project creation checks ownership before inserting a duplicate shell.",
      "Payment confirmation verifies the order and signature before recording the event.",
      "Download endpoints can be safely retried because they only read persisted state.",
    ]),
    auth_register_description: [
      "Register a new account and create the initial authenticated session.",
      "This route is designed for first-time sign-up only and must reject duplicate emails.",
    ].join("\n"),
    auth_register_request: jsonBlock({ email: "user@example.com", password: "••••••••", name: "Ada", agreeToTerms: true }),
    auth_register_validation: list([
      "Valid email format",
      "Password meets minimum security expectations",
      "Optional display name is trimmed",
      "Terms acceptance is recorded when present",
    ]),
    auth_register_response: jsonBlock({ success: true, user: { id: "uuid", email: "user@example.com" }, session: { accessToken: "<token>" } }),
    auth_register_errors: list(["400 invalid payload", "401 unauthorized", "409 duplicate account", "422 weak password"]),
    auth_register_flow: list([
      "Collect user input and normalize whitespace.",
      "Create the user record and persist the session token.",
      "Return a clean success envelope that the UI can use immediately.",
    ]),
    auth_login_description: [
      "Authenticate an existing user and restore their session.",
      "The endpoint should be safe to call after refresh or app reload.",
    ].join("\n"),
    auth_login_request: jsonBlock({ email: "user@example.com", password: "••••••••", rememberMe: true }),
    auth_login_response: jsonBlock({ success: true, user: { id: "uuid" }, session: { accessToken: "<token>", expiresIn: 3600 } }),
    auth_login_errors: list(["401 invalid credentials", "403 email not verified", "429 too many attempts"]),
    auth_login_edge_cases: list([
      "Expired session tokens should trigger refresh rather than hard failure.",
      "Unverified accounts should show a user-friendly message.",
      "Repeated failed attempts should slow down brute-force attempts.",
    ]),
    auth_login_flow: list(["Submit credentials", "Verify account status", "Issue session", "Persist token"]),
    auth_refresh_description: "Refresh the current session and rotate tokens when supported.",
    auth_refresh_request: jsonBlock({ refreshToken: "<refresh-token>" }),
    auth_refresh_response: jsonBlock({ success: true, accessToken: "<token>", expiresIn: 3600 }),
    auth_refresh_errors: list(["401 session expired", "403 refresh token revoked"]),
    auth_logout_description: "Clear the current browser session and invalidate local auth state.",
    auth_logout_response: jsonBlock({ success: true, loggedOut: true }),
    user_me_description: "Return the current authenticated user profile and account metadata.",
    user_me_response: jsonBlock({ id: "uuid", email: "user@example.com", full_name: "Ada Lovelace", role: "free" }),
    user_update_description: "Update profile fields for the authenticated user without changing ownership metadata.",
    user_update_request: jsonBlock({ full_name: "Ada Lovelace", company: "PLANNR" }),
    user_update_validation: list(["Authenticated user only", "Owned profile only", "Trim and normalize display fields"]),
    project_create_description: [
      "Create a project shell plus the document shells required for generation.",
      "This route also returns a download URL so the client can jump straight into export when generation completes.",
    ].join("\n"),
    project_create_request: jsonBlock({ title: project.title, idea: project.idea, description: project.description ?? "", stackRecommendation: stack }),
    project_create_response: jsonBlock({ success: true, project: { id: "uuid" }, documents: [], downloadUrl: "/download/uuid?scope=project&format=zip" }),
    project_create_flow: list([
      "Validate quota and project title.",
      "Store the project with the recommended stack.",
      "Create document shells for PRD, SRS, and architecture.",
      "Return the project ID plus a ready-to-use download link.",
    ]),
    project_list_description: "List projects owned by the user with current generation state and timestamps.",
    project_list_query: list(["No query params for the MVP.", "Pagination can be added later without changing the resource shape."]),
    project_list_response: jsonBlock({ success: true, projects: [{ id: "uuid", title: project.title, generation_state: "ready" }] }),
    project_get_description: "Fetch a project with its latest documents, versions, and download links.",
    project_get_response: jsonBlock({ success: true, project: { id: "uuid", title: project.title }, documents: [] }),
    project_generate_description: "Generate one document using structured output, template rendering, and durable version storage.",
    project_generate_behavior: list([
      "Check quota before any provider call is made.",
      "Call multiple providers in parallel and select the first valid structured result.",
      "Render markdown from the matching template file.",
      "Persist the version, checksum, and structured payload.",
      "Return the new version ID plus a download URL.",
    ]),
    project_generate_response: jsonBlock({ success: true, version: { id: "uuid", version_number: 2 }, downloadUrl: "/download/uuid?scope=document&format=md" }),
    project_status_description: "Return generation state, last generated stage, and the latest known version.",
    project_status_response: jsonBlock({ success: true, status: "ready", stage: "generated-prd" }),
    ai_extract_description: "Extract structured JSON from generated output and normalize it for downstream templating.",
    ai_extract_request: jsonBlock({ text: "..." }),
    ai_extract_response: jsonBlock({ title: "Example", summary: "..." }),
    ai_extract_failure: list([
      "If JSON parsing fails, retry with another provider.",
      "If all providers fail, return a clear backend error instead of partial data.",
    ]),
    ai_questions: list([
      "Ask 6 to 8 clarifying questions.",
      "Prefer concise multiple-choice answers.",
      "Cover audience, monetization, integrations, scale, and delivery constraints.",
    ]),
    ai_recommend_stack: list([
      "Recommend frontend, backend, database, auth, and hosting.",
      "Include an opinionated rationale for the stack choice.",
      "Keep the recommendation production-ready but realistic for an MVP.",
    ]),
    payment_checkout_description: [
      "Create and open a Razorpay checkout order for the selected plan.",
      "Return order details that the frontend can pass directly into the payment widget.",
    ].join("\n"),
    payment_checkout_request: jsonBlock({ plan: "pro" }),
    payment_checkout_response: jsonBlock({ success: true, orderId: "order_123", amount: 4900, currency: "INR" }),
    stripe_webhook_description: "Stripe webhooks are not used in this build; payment confirmation is handled through the backend verification route.",
    stripe_webhook_validation: "Not applicable in the current implementation.",
    stripe_webhook_events: "Not applicable in the current implementation.",
    share_get_description: "Return history records and download links for authenticated users.",
    share_get_response: jsonBlock({ success: true, history: [{ id: "uuid", project_name: project.title, file_url: "/download/uuid" }] }),
    share_download_description: "Download a generated project ZIP or a single generated document.",
    admin_users_description: "Admin operations are not exposed in this MVP, but the contract reserves the route family.",
    admin_users_response: jsonBlock({ success: false, error: "Not available in this release" }),
    admin_update_description: "Admin update routes are reserved for later operational tooling.",
    admin_analytics_description: "Admin analytics routes are reserved for later operational tooling.",
    admin_analytics_response: jsonBlock({ success: false, error: "Not available in this release" }),
    request_lifecycle: list(requestLifecycle, "1. "),
    error_codes: errorCodes,
    pagination: list([
      "Current list routes return full collections for the authenticated user.",
      "Future pagination should use cursor-based semantics for large histories.",
      "Response shapes should remain stable so the UI can add pagination without refactors.",
    ]),
    observability: list([
      "Record `route`, `method`, `status_code`, `duration_ms`, and `user_id` in `api_logs`.",
      "Track provider choice and generation timing for AI-backed routes.",
      "Capture payment confirmation status and download activity for troubleshooting.",
    ]),
    security: list([
      "Bearer auth on all user-owned routes.",
      "Ownership checks on every project and document lookup.",
      "RLS for persistent tables and direct user data access.",
      "Signature verification for payment confirmation.",
    ]),
    performance: [
      "Parallel provider calls lower perceived latency even when multiple models are queried.",
      "Template rendering is deterministic and keeps the final output stable.",
      "The most expensive operations are generation and ZIP creation; simple reads should remain fast.",
    ].join("\n"),
    testing: list([
      "Auth flow",
      "Quota flow",
      "Download flow",
      "Template rendering",
      "Payment confirmation",
      "Error handling and retry paths",
    ]),
    future: list([
      "GitHub sync",
      "Team workspaces",
      "More model providers",
      "Cursor-based pagination",
      "Public sharing with expiring links",
    ]),
    appendix: [
      `Related docs: ${projectDocsSummary(docs)}`,
      "",
      "### Route Catalog",
      routeCatalog,
      "",
      "### Example Error Handling Rules",
      list([
        "Return 429 before generation begins if quota is exhausted.",
        "Return 401 and prompt a refresh when the session is invalid.",
        "Return 500 only for genuine backend or provider failures.",
      ]),
      "",
      `### Stack Context
Frontend: ${stack.frontend}
Backend: ${stack.backend}
Database: ${stack.database}
Auth: ${stack.auth}
Hosting: ${stack.hosting}`,
    ].join("\n"),
  });
}

export async function renderFolderStructureMarkdown(project: MinimalProject) {
  const template = await loadTemplate("folder_structure.md.tpl");
  const stack = normalizeProjectStack(project);
  const rootTree = {
    root: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "project"}/`,
    description: `Spec bundle for ${project.title}`,
    tree: [
      {
        name: "docs",
        type: "folder",
        description: "Generated planning documents.",
        children: [
          { name: "PRD.md", type: "file", description: "Product requirements document." },
          { name: "SRS.md", type: "file", description: "Software requirements specification." },
          { name: "ARCHITECTURE.md", type: "file", description: "System architecture document." },
        ],
      },
      {
        name: "design",
        type: "folder",
        description: "Design-system and UX references.",
        children: [{ name: "DESIGN_SYSTEM.md", type: "file", description: "Design system document." }],
      },
      {
        name: "api",
        type: "folder",
        description: "API specification and route contracts.",
        children: [{ name: "API_SPEC.md", type: "file", description: "API spec document." }],
      },
      {
        name: "structure",
        type: "folder",
        description: "Folder structure artifacts.",
        children: [
          { name: "FOLDER_STRUCTURE.md", type: "file", description: "Folder structure document." },
          { name: "FOLDER_STRUCTURE.json", type: "file", description: "Machine-readable tree." },
        ],
      },
      { name: "README.md", type: "file", description: "Project overview and setup instructions." },
    ],
  };

  return {
    markdown: renderTemplate(template, {
      project_name: project.title,
      root_structure: list([
        `Root: ${rootTree.root}`,
        `Stack: ${stack.frontend} / ${stack.backend} / ${stack.database}`,
      ]),
      root_name: rootTree.root,
      root_description: rootTree.description,
    }),
    json: JSON.stringify(rootTree, null, 2),
  };
}
