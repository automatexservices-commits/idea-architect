import { createClient } from "npm:@insforge/sdk";
import JSZip from "npm:jszip";

type DocKind = "prd" | "system_design" | "architecture";
type DownloadFormat = "md" | "pdf" | "zip";

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type ProjectRecord = {
  id: string;
  user_id: string;
  title: string;
  idea: string;
  description: string | null;
  stack_recommendation: Record<string, unknown>;
  generation_state: "idle" | "generating" | "ready" | "failed";
  current_stage: string;
  download_count: number;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentRecord = {
  id: string;
  project_id: string;
  user_id: string;
  document_type: DocKind;
  title: string;
  status: "pending" | "generating" | "ready" | "failed";
  current_version_id: string | null;
  latest_checksum: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentVersionRecord = {
  id: string;
  document_id: string;
  version_number: number;
  content_markdown: string;
  structured_data: Record<string, unknown>;
  file_format: "md" | "pdf" | "json";
  file_name: string;
  checksum: string;
  ai_model: string | null;
  prompt_version: string;
  token_usage: Record<string, unknown>;
  created_at: string;
};

type BackendContext = {
  client: ReturnType<typeof createClient>;
  user: AuthUser;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    role: "free" | "pro";
  };
};

type UsageState = {
  role: "free" | "pro";
  limit: number;
  used: number;
  remaining: number;
  blocked: boolean;
};

type RazorpayPlan = "pro" | "enterprise" | "custom";
type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
};

type BillingPaymentRecord = {
  id: string;
  user_id: string;
  plan: RazorpayPlan;
  amount_in_paise: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  order_id: string;
  payment_id: string;
  receipt: string;
  method: string | null;
  upi_id: string | null;
  signature: string;
  notes: Record<string, unknown>;
  paid_at: string;
  created_at: string;
  updated_at: string;
};

type MinimalProject = Pick<ProjectRecord, "title" | "idea" | "description" | "stack_recommendation">;
type MinimalDocSummary = {
  document_type: string;
  title: string;
  summary?: string;
};

function renderText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function renderList(items: unknown, prefix = "- ") {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items.map((item) => `${prefix}${renderText(item)}`).join("\n");
}

function renderKvList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items.map((item) => {
    if (!item || typeof item !== "object") return `- ${renderText(item)}`;
    const obj = item as Record<string, unknown>;
    const name = renderText(obj.name ?? obj.title ?? "Item");
    const details = obj.summary ?? obj.description ?? obj.value ?? obj.detail ?? obj.goals ?? obj.notes ?? "";
    if (Array.isArray(details)) {
      return `- ${name}\n  - ${details.map((v) => renderText(v)).join("\n  - ")}`;
    }
    return `- ${name}${details ? `: ${renderText(details)}` : ""}`;
  }).join("\n");
}

function projectStackLine(project: MinimalProject) {
  const stack = project.stack_recommendation ?? {};
  return [
    renderText(stack.frontend ?? "React"),
    renderText(stack.backend ?? "Node.js"),
    renderText(stack.database ?? "PostgreSQL"),
    renderText(stack.auth ?? "InsForge Auth"),
  ].join(" / ");
}

function summarizeDocsInline(docs: MinimalDocSummary[]) {
  if (!docs.length) return "PRD, SRS, and Architecture documents";
  return docs.map((doc) => `${doc.document_type} (${doc.title})`).join(", ");
}

function section(title: string, body: string[]) {
  return [`## ${title}`, ...body, ""].join("\n");
}

async function renderPrdMarkdownInline(payload: Record<string, unknown>, project: MinimalProject) {
  return [
    `# ${renderText(payload.title ?? `${project.title} PRD`)}`,
    "",
    section("Executive Summary", [renderText(payload.summary ?? project.idea)]),
    section("Product Vision", [renderText(payload.product_vision ?? payload.summary ?? project.idea)]),
    section("Problem Statement", [renderText(payload.problem_statement ?? project.idea)]),
    section("Goals", [renderList(payload.goals)]),
    section("Target Users", [renderList(payload.target_users)]),
    section("User Journeys", [renderKvList(payload.user_journeys ?? payload.core_flows)]),
    section("Feature Requirements", [renderKvList(payload.feature_requirements)]),
    section("Functional Requirements", [renderList(payload.functional_requirements)]),
    section("Non-Functional Requirements", [renderList(payload.non_functional_requirements)]),
    section("KPIs", [renderList(payload.success_metrics ?? payload.kpis)]),
    section("Risks", [renderList(payload.risks)]),
    section("Open Questions", [renderList(payload.open_questions)]),
    section("Project Context", [
      `- Title: ${project.title}`,
      `- Idea: ${project.idea}`,
      `- Stack: ${projectStackLine(project)}`,
    ]),
  ].join("\n");
}

async function renderSystemDesignMarkdownInline(payload: Record<string, unknown>, project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${renderText(payload.title ?? `${project.title} System Design`)}`,
    "",
    section("Summary", [renderText(payload.summary ?? project.idea)]),
    section("Architecture Overview", [renderText(payload.architecture_overview ?? "Template-driven generation backend")]),
    section("Components", [renderKvList(payload.components)]),
    section("Data Flow", [renderKvList(payload.data_flow ?? payload.request_flow)]),
    section("APIs", [renderKvList(payload.apis ?? payload.api_endpoints)]),
    section("Security", [renderList(payload.security)]),
    section("Scaling Considerations", [renderList(payload.scaling_considerations)]),
    section("Dependencies", [summarizeDocsInline(docs)]),
  ].join("\n");
}

async function renderArchitectureMarkdownInline(payload: Record<string, unknown>, project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${renderText(payload.title ?? `${project.title} Architecture`)}`,
    "",
    section("Summary", [renderText(payload.summary ?? project.idea)]),
    section("Stack", [renderText(payload.stack ?? projectStackLine(project))]),
    section("Layered View", [renderKvList(payload.layers ?? payload.components)]),
    section("Data Architecture", [renderKvList(payload.data_architecture ?? payload.data_design)]),
    section("API Design", [renderKvList(payload.api_design)]),
    section("Security", [renderList(payload.security)]),
    section("Deployment", [renderList(payload.deployment)]),
    section("Dependencies", [summarizeDocsInline(docs)]),
  ].join("\n");
}

async function renderDesignMarkdownInline(project: MinimalProject, payload: Record<string, unknown>) {
  return [
    `# ${project.title} Design System`,
    "",
    section("Summary", [renderText(payload.summary ?? project.idea)]),
    section("Brand", [renderText(payload.brand ?? "Clean, fast, and product-first")]),
    section("Colors", [renderKvList(payload.colors)]),
    section("Typography", [renderKvList(payload.typography)]),
    section("Components", [renderKvList(payload.components)]),
    section("Spacing", [renderList(payload.spacing)]),
    section("Motion", [renderList(payload.motion)]),
  ].join("\n");
}

async function renderApiSpecMarkdownInline(project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${project.title} API Specification`,
    "",
    "## Summary",
    `API contract for ${project.title}.`,
    "",
    "## Included Documents",
    summarizeDocsInline(docs),
    "",
    "## Core Routes",
    "- POST /project",
    "- POST /generate/prd",
    "- POST /generate/system-design",
    "- POST /generate/architecture",
    "- GET /download/:id",
  ].join("\n");
}

async function renderReadmeMarkdownInline(project: MinimalProject, docs: MinimalDocSummary[]) {
  return [
    `# ${project.title}`,
    "",
    "## Overview",
    `Spec bundle for ${project.title}.`,
    "",
    "## Included Documents",
    summarizeDocsInline(docs),
    "",
    "## Idea",
    project.idea,
  ].join("\n");
}

async function renderFolderStructureMarkdownInline(project: MinimalProject) {
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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const AI_MODEL = "anthropic/claude-sonnet-4.5";
const PROMPT_VERSION = "v1";
const ROUTE_PREFIX = "/backend";
const OPENAI_MODEL = "gpt-4o-mini";
const GEMINI_MODEL = "gemini-2.0-flash";
const OPENROUTER_MODEL = "openai/gpt-4o-mini";

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function textResponse(
  status: number,
  body: string,
  filename: string,
  contentType: string,
) {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function binaryResponse(
  status: number,
  bytes: Uint8Array,
  filename: string,
  contentType: string,
) {
  return new Response(bytes, {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function stripRoutePrefix(pathname: string) {
  if (pathname.startsWith(ROUTE_PREFIX)) {
    const trimmed = pathname.slice(ROUTE_PREFIX.length);
    return trimmed.length ? trimmed : "/";
  }
  return pathname || "/";
}

function normalizeRoute(pathname: string) {
  return stripRoutePrefix(pathname).replace(/\/+$/, "") || "/";
}

function isUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

function isRazorpayPlan(value: string): value is RazorpayPlan {
  return value === "pro" || value === "enterprise" || value === "custom";
}

function planConfig(plan: RazorpayPlan) {
  const base = {
    currency: "INR",
    name: "PLANNR",
    image: undefined as string | undefined,
  };

  if (plan === "pro") {
    return {
      ...base,
      amountInInr: Number(Deno.env.get("RAZORPAY_PRO_AMOUNT_INR") ?? "49"),
      description: "PLANNR Pro monthly plan",
    };
  }

  if (plan === "enterprise") {
    return {
      ...base,
      amountInInr: Number(Deno.env.get("RAZORPAY_ENTERPRISE_AMOUNT_INR") ?? "150"),
      description: "PLANNR Enterprise monthly plan",
    };
  }

  return {
    ...base,
    amountInInr: Number(Deno.env.get("RAZORPAY_CUSTOM_AMOUNT_INR") ?? "0"),
    description: "PLANNR Custom plan",
  };
}

function getBillingUpiId() {
  return Deno.env.get("VITE_BILLING_UPI_ID") || Deno.env.get("BILLING_UPI_ID") || "7984390066@ptyes";
}

function getBillingUpiName() {
  return Deno.env.get("VITE_BILLING_UPI_NAME") || Deno.env.get("BILLING_UPI_NAME") || "PLANNR";
}

async function hmacSha256Hex(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchRazorpayOrder(orderId: string, keyId: string, keySecret: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const payload = await response.json() as RazorpayOrder & { notes?: Record<string, unknown>; error?: { message?: string; description?: string } };
  if (!response.ok) {
    throw new Error(payload?.error?.description || payload?.error?.message || `Failed to fetch Razorpay order (${response.status})`);
  }

  return payload;
}

function toPlainRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

async function createRazorpayOrder(plan: RazorpayPlan) {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.");
  }

  const config = planConfig(plan);
  if (!config.amountInInr || config.amountInInr <= 0) {
    throw new Error(`Missing configured amount for ${plan} plan.`);
  }

  const amount = Math.round(config.amountInInr * 100);
  const receipt = `plannr-${plan}-${Date.now()}`;
  const auth = btoa(`${keyId}:${keySecret}`);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: config.currency,
      receipt,
      notes: {
        plan,
        product: "PLANNR",
      },
    }),
  });

  const payload = await response.json() as RazorpayOrder & { error?: { description?: string; reason?: string; message?: string } };
  if (!response.ok) {
    const message = payload?.error?.description || payload?.error?.message || `Razorpay order creation failed (${response.status})`;
    throw new Error(message);
  }

  return {
    orderId: payload.id,
    amount,
    currency: config.currency,
    name: config.name,
    description: config.description,
    image: config.image,
    keyId,
    receipt,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "document";
}

function titleForKind(kind: DocKind) {
  switch (kind) {
    case "prd":
      return "Product Requirements Document";
    case "system_design":
      return "System Design";
    case "architecture":
      return "Architecture";
  }
}

function filenameForKind(kind: DocKind, title: string, format: DownloadFormat) {
  const base = `${slugify(title)}-${kind}`;
  if (format === "pdf") return `${base}.pdf`;
  if (format === "zip") return `${base}.zip`;
  return `${base}.md`;
}

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function flattenContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part && typeof part === "object" && "text" in part ? String((part as { text?: unknown }).text ?? "") : ""))
      .join("");
  }
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "");
  }
  return "";
}

function extractAiText(result: unknown) {
  const candidate =
    (result as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content ??
    (result as { data?: Array<{ message?: { content?: unknown } }> })?.data?.[0]?.message?.content ??
    (result as { output_text?: unknown })?.output_text ??
    (result as { text?: unknown })?.text ??
    "";

  return flattenContent(candidate);
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenceMatch?.[1]?.trim() ?? trimmed;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  const slice = firstBrace >= 0 && lastBrace > firstBrace ? raw.slice(firstBrace, lastBrace + 1) : raw;

  try {
    return JSON.parse(slice) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function openRouterKeys() {
  return [
    Deno.env.get("OPENROUTER_API_KEY"),
    Deno.env.get("OPENROUTER_API_KEY_2"),
  ].filter(Boolean) as string[];
}

async function fetchJsonText(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed (${response.status})`);
  }
  return text;
}

async function fetchJsonTextWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  if (timeoutMs <= 0) {
    return await fetchJsonText(url, init);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchJsonText(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAIChat(system: string, prompt: string, maxTokens = 3200) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  console.log("[ai] OpenAI request start");
  const text = await fetchJsonTextWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  }, 15000);
  console.log("[ai] OpenAI response received");
  return extractAiText(JSON.parse(text));
}

async function callGeminiChat(system: string, prompt: string, maxTokens = 4096) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  console.log("[ai] Gemini request start");
  const text = await fetchJsonTextWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: maxTokens },
    }),
  }, 15000);
  console.log("[ai] Gemini response received");
  return extractAiText(JSON.parse(text));
}

async function callOpenRouterChat(system: string, prompt: string, key: string, maxTokens = 3200) {
  console.log("[ai] OpenRouter request start");
  const text = await fetchJsonTextWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "http://localhost",
      "X-Title": "PLANNR",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  }, 20000);
  console.log("[ai] OpenRouter response received");
  return extractAiText(JSON.parse(text));
}

function scoreStructuredPayload(kind: string, json: Record<string, unknown>) {
  const keys = Object.keys(json);
  const filledKeys = keys.filter((key) => {
    const value = json[key];
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
    return true;
  }).length;

  const typeBonus =
    kind === "questions" ? (Array.isArray(json.questions) ? 20 : 0) :
    kind === "stack" ? (typeof json.frontend === "string" && typeof json.backend === "string" ? 20 : 0) :
    Object.prototype.hasOwnProperty.call(json, "title") ? 20 : 0;

  return filledKeys + typeBonus + Math.min(keys.length, 12);
}

async function tryProvider(
  label: string,
  runner: () => Promise<string>,
  kind: string,
) {
  try {
    const text = await runner();
    const json = extractJson(text);
    if (!json) return null;
    return {
      label,
      text,
      json,
      score: scoreStructuredPayload(kind, json),
    };
  } catch (error) {
    console.warn(`[ai] ${label} failed for ${kind}`, error);
    return null;
  }
}

async function callStructuredAi<T extends Record<string, unknown>>(system: string, prompt: string, fallbackTitle: string) {
  const failures: string[] = [];
  const attempts: Array<Promise<{ label: string; text: string; json: Record<string, unknown>; score: number } | null>> = [
    tryProvider("OpenAI", async () => {
      try {
        return await callOpenAIChat(system, prompt, 4000);
      } catch (error) {
        failures.push(`OpenAI: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }, fallbackTitle),
    tryProvider("Gemini", async () => {
      try {
        return await callGeminiChat(system, prompt, 5000);
      } catch (error) {
        failures.push(`Gemini: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }, fallbackTitle),
  ];

  for (const [index, key] of openRouterKeys().entries()) {
    attempts.push(tryProvider(`OpenRouter-${index + 1}`, async () => {
      try {
        return await callOpenRouterChat(system, prompt, key, 4000);
      } catch (error) {
        failures.push(`OpenRouter-${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }, fallbackTitle));
  }

  const winner = await Promise.any(
    attempts.map(async (attempt) => {
      const result = await attempt;
      if (!result) throw new Error("Provider returned no usable JSON");
      return result;
    }),
  ).catch(() => null);

  if (!winner) {
    throw new Error(`Failed to generate ${fallbackTitle}. Provider errors: ${failures.slice(0, 4).join(" | ") || "No provider returned parseable JSON."}`);
  }

  console.log(`[ai] ${fallbackTitle} selected ${winner.label} (score=${winner.score})`);
  return { text: winner.text, json: winner.json as T };
}

function stringifyList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items.map((item) => `- ${String(item)}`).join("\n");
}

function stringifyKeyValueList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return "- None provided";
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return `- ${String(item)}`;
      const obj = item as Record<string, unknown>;
      const name = obj.name ?? obj.title ?? "Item";
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
        return `- ${String(name)}\n  - ${details.map((v) => String(v)).join("\n  - ")}`;
      }
      return `- ${String(name)}${details ? `: ${String(details)}` : ""}`;
    })
    .join("\n");
}

function renderMarkdown(kind: DocKind, payload: Record<string, unknown>, project: ProjectRecord) {
  const heading = String(payload.title ?? titleForKind(kind));
  const summary = String(payload.summary ?? "");

  if (kind === "prd") {
    return [
      `# ${heading}`,
      "",
      "## Executive Summary",
      summary || "No summary provided.",
      "",
      "## Product Vision",
      String(payload.product_vision ?? "Not provided."),
      "",
      "## Problem Statement",
      String(payload.problem_statement ?? "Not provided."),
      "",
      "## Target Users",
      stringifyList(payload.target_users),
      "",
      "## Personas",
      stringifyKeyValueList(payload.personas),
      "",
      "## Goals",
      stringifyList(payload.goals),
      "",
      "## Non-Goals",
      stringifyList(payload.non_goals),
      "",
      "## User Journeys",
      stringifyKeyValueList(payload.user_journeys ?? payload.core_flows),
      "",
      "## Feature Requirements",
      stringifyKeyValueList(payload.feature_requirements),
      "",
      "## Functional Requirements",
      stringifyList(payload.functional_requirements),
      "",
      "## Edge Cases",
      stringifyList(payload.edge_cases),
      "",
      "## Non-Functional Requirements",
      stringifyList(payload.non_functional_requirements),
      "",
      "## KPIs",
      stringifyList(payload.kpis ?? payload.success_metrics),
      "",
      "## Risks",
      stringifyList(payload.risks),
      "",
      "## Open Questions",
      stringifyList(payload.open_questions),
      "",
      "## Project Context",
      `- Title: ${project.title}`,
      `- Idea: ${project.idea}`,
    ].join("\n");
  }

  if (kind === "system_design") {
    return [
      `# ${heading}`,
      "",
      "## Summary",
      summary || "No summary provided.",
      "",
      "## Architecture Overview",
      String(payload.architecture_overview ?? "Not provided."),
      "",
      "## Components",
      stringifyKeyValueList(payload.components),
      "",
      "## Request Flow",
      stringifyList(payload.request_flow ?? payload.data_flow),
      "",
      "## Data Model",
      stringifyList(payload.data_model),
      "",
      "## API Contracts",
      stringifyList(payload.api_contracts),
      "",
      "## Async Jobs",
      stringifyList(payload.async_jobs),
      "",
      "## Security and Auth",
      stringifyList(payload.security_and_auth ?? payload.security),
      "",
      "## Scalability",
      stringifyList(payload.scalability),
      "",
      "## Observability",
      stringifyList(payload.observability),
      "",
      "## Failure Modes",
      stringifyList(payload.failure_modes),
      "",
      "## Cost Optimizations",
      stringifyList(payload.cost_optimizations),
      "",
      "## Project Context",
      `- Title: ${project.title}`,
      `- Idea: ${project.idea}`,
    ].join("\n");
  }

  return [
    `# ${heading}`,
    "",
    "## Summary",
    summary || "No summary provided.",
    "",
    "## Module Boundaries",
    stringifyList(payload.module_boundaries),
    "",
    "## Directory Structure",
    stringifyList(payload.directory_structure),
    "",
    "## Database Schema Notes",
    stringifyList(payload.database_schema_notes),
    "",
    "## Service Contracts",
    stringifyList(payload.service_contracts),
    "",
    "## Deployment Notes",
    stringifyList(payload.deployment_notes),
    "",
    "## Operational Workflows",
    stringifyList(payload.operational_workflows),
    "",
    "## Security Considerations",
    stringifyList(payload.security_considerations),
    "",
    "## Cost Controls",
    stringifyList(payload.cost_controls),
    "",
    "## Migration Notes",
    stringifyList(payload.migration_notes),
    "",
    "## Risks",
    stringifyList(payload.risks),
    "",
    "## Project Context",
    `- Title: ${project.title}`,
    `- Idea: ${project.idea}`,
  ].join("\n");
}

function buildPrompt(kind: DocKind, project: ProjectRecord, existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>) {
  const sharedContext = [
    `Project title: ${project.title}`,
    `Project idea: ${project.idea}`,
    project.description ? `Additional context: ${project.description}` : null,
    project.stack_recommendation && Object.keys(project.stack_recommendation).length
      ? `Existing stack recommendation: ${JSON.stringify(project.stack_recommendation)}`
      : null,
    existingDocs.length ? `Available documents: ${existingDocs.map((doc) => `${doc.document_type} (${doc.title})`).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (kind === "prd") {
    return `
You are generating a production-grade product requirements document (PRD) for an AI SaaS product that turns user ideas into spec bundles.
Use a strict template-driven document and write enough detail to feel like a real product spec.
Do not mention AI generation, templates, or internal process notes in the output.

Return valid JSON only. No markdown fences. No prose outside JSON.

Schema:
{
  "title": string,
  "summary": string,
  "background": string,
  "product_vision": string,
  "problem_statement": string,
  "goals": string[],
  "non_goals": string[],
  "target_users": string[],
  "personas": [{ "name": string, "goals": string[], "pain_points": string[] }],
  "user_journeys": [{ "name": string, "steps": string[] }],
  "feature_requirements": [{ "feature": string, "description": string, "acceptance_criteria": string[] }],
  "functional_requirements": string[],
  "edge_cases": string[],
  "non_functional_requirements": string[],
  "kpis": string[],
  "open_questions": string[],
  "risks": string[]
}

Rules:
- Fill every section with specific content.
- Prefer concrete and testable requirements over generic statements.
- Include product context, user stories, success metrics, and risk notes.
- Keep the PRD aligned with the project stack and scope.
- Keep the document detailed, but do not repeat the same idea across many sections.
- Avoid filler and repeated boilerplate.

Context:
${sharedContext}
`.trim();
  }

  if (kind === "system_design") {
    return `
You are generating a production-grade software requirements specification (SRS) for an AI SaaS product.
Use a strict template-driven document that reads like a real engineering requirements artifact.
Write concrete, testable, implementation-ready requirements.
Do not mention AI generation, templates, or internal process notes in the output.

Return valid JSON only. No markdown fences. No prose outside JSON.

Schema:
{
  "title": string,
  "version": string,
  "status": string,
  "created_date": string,
  "updated_date": string,
  "change_log": [{ "version": string, "date": string, "author": string, "changes": string }],
  "purpose": string,
  "scope": string,
  "definitions": [{ "term": string, "meaning": string }],
  "references": string[],
  "product_perspective": string,
  "product_functions": string[],
  "user_classes": [{ "role": string, "description": string, "permissions": string[] }],
  "environment": string,
  "constraints": string[],
  "assumptions": string[],
  "system_features_intro": string,
  "feature_name": string,
  "feature_description": string,
  "actors": string[],
  "preconditions": string[],
  "postconditions": string[],
  "main_flow": string[],
  "alt_flow": string[],
  "edge_case": string[],
  "functional_requirements": string[],
  "acceptance_criteria": string[],
  "priority": string,
  "ui_requirements": string[],
  "api_requirements": string[],
  "hardware": string[],
  "software_interfaces": string[],
  "performance": string[],
  "scalability": string[],
  "availability": string[],
  "reliability": string[],
  "security": string[],
  "usability": string[],
  "maintainability": string[],
  "observability": string[],
  "compliance": string[],
  "data_models": string[],
  "data_storage": string[],
  "data_retention": string[],
  "data_integrity": string[],
  "architecture_constraints": string[],
  "error_handling": string[],
  "logging": string[],
  "deployment": string[],
  "unit_testing": string[],
  "integration_testing": string[],
  "system_testing": string[],
  "performance_testing": string[],
  "traceability_matrix": string[],
  "risks": string[],
  "open_issues": string[],
  "future": string[],
  "appendix": string[]
}

Rules:
- Fill every section with specific content.
- Make requirements measurable and testable.
- Include product, interface, data, deployment, and testing details.
- Keep terminology consistent with the project stack and scope.
- Avoid generic filler text.

Context:
${sharedContext}
`.trim();
  }

  return `
You are generating a production-grade software architecture document for an AI SaaS product.
Use a high-detail implementation template with module boundaries, deployment, and operational concerns.

Return valid JSON only. No markdown fences. No prose outside JSON.

Schema:
{
  "title": string,
  "summary": string,
  "module_boundaries": string[],
  "directory_structure": string[],
  "database_schema_notes": string[],
  "service_contracts": string[],
  "deployment_notes": string[],
  "operational_workflows": string[],
  "security_considerations": string[],
  "cost_controls": string[],
  "migration_notes": string[],
  "risks": string[]
}

Rules:
- Make the architecture implementation-ready and detailed.
- Include deployment, data ownership, migrations, and cost control choices.
- Keep it practical for a small team building and scaling.
- Describe concrete modules, boundaries, and failure handling.
- Provide at least 5 components, 5 request-flow steps, 4 data architecture notes, and 4 tradeoffs.
- Include observability, capacity, reliability, and security considerations as first-class sections.
- Prefer specific nouns, route names, table names, and operational behaviors over generic labels.

Context:
${sharedContext}
`.trim();
}

function getProjectStack(project: ProjectRecord) {
  const stack = project.stack_recommendation ?? {};
  return {
    frontend: String(stack.frontend ?? "React"),
    backend: String(stack.backend ?? "Node.js"),
    database: String(stack.database ?? "PostgreSQL"),
    auth: String(stack.auth ?? "Email/password and Google OAuth"),
    hosting: String(stack.hosting ?? "InsForge"),
  };
}

function summarizeDocs(existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>) {
  if (!existingDocs.length) return "PRD, system design, and architecture documents";
  return existingDocs.map((doc) => `${doc.document_type} (${doc.title})`).join(", ");
}

function fallbackQuestionsForIdea(idea: string) {
  const title = idea
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return {
    projectName: `${title || "Untitled"} Project`,
    questions: [
      { id: "q1", question: "Who is the primary user?", options: ["End customers", "Internal team", "Both"] },
      { id: "q2", question: "What platform should we support first?", options: ["Web", "Mobile", "Web + mobile"] },
      { id: "q3", question: "What is the main launch goal?", options: ["MVP", "Pilot", "Full launch"] },
      { id: "q4", question: "How should the product make money?", options: ["Free", "Subscription", "One-time purchase"] },
      { id: "q5", question: "Do we need AI features?", options: ["No", "Light AI", "Core AI workflow"] },
    ],
  };
}

function fallbackStackForIdea(idea: string) {
  const lower = idea.toLowerCase();
  const mobile = /mobile|ios|android|app/.test(lower);
  return {
    frontend: mobile ? "React Native" : "React",
    backend: "Node.js",
    database: "PostgreSQL",
    auth: "Email/password and Google OAuth",
    hosting: "Cloudflare Pages and InsForge",
    rationale: mobile
      ? "A mobile-first product benefits from React Native for shared iOS and Android delivery."
      : "React + Node.js + PostgreSQL is the safest default for fast shipping and long-term maintainability.",
  };
}

function fallbackPrdPayload(project: ProjectRecord, existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>) {
  const stack = getProjectStack(project);
  return {
    title: `${project.title} PRD`,
    summary: `A product requirements document for ${project.title}.`,
    background: project.description ?? project.idea,
    product_vision: `Turn the idea for ${project.title} into a clear, build-ready product plan.`,
    problem_statement: "The concept needs a structured PRD so the team can agree on scope, flows, and success criteria before implementation.",
    goals: [
      "Define the product scope clearly.",
      "Align the team on the user experience.",
      "Create a handoff-ready spec for implementation.",
    ],
    non_goals: [
      "Pixel-perfect design work.",
      "Detailed implementation code.",
      "Team collaboration features in the spec tool itself.",
    ],
    target_users: ["Primary users", "Operators", "Internal reviewers"],
    personas: [
      {
        name: "Primary Builder",
        goals: ["Move from idea to a shippable plan", "Understand the stack quickly"],
        pain_points: ["Unclear requirements", "Too much back-and-forth"],
      },
    ],
    user_journeys: [
      {
        name: "Idea to spec",
        steps: ["Enter a short idea.", "Answer clarifying questions.", "Review the stack.", "Generate the full spec bundle."],
      },
    ],
    feature_requirements: [
      {
        feature: "Clarifying questions",
        description: "Collect enough context to shape the generated spec.",
        acceptance_criteria: ["Questions are short", "Answers are saved", "Flow can continue"],
      },
      {
        feature: "Spec generation",
        description: "Produce a PRD aligned with the project idea and stack.",
        acceptance_criteria: ["Markdown is generated", "Document content is persisted", "Download link is available"],
      },
    ],
    functional_requirements: [
      "The system shall create a project shell before document generation.",
      "The system shall generate a PRD with project-specific sections.",
      "The system shall store the generated document version for later download.",
    ],
    edge_cases: [
      "Provider failures should not block document creation.",
      "Empty answers should be handled gracefully.",
      "Repeated generation should create a new version instead of overwriting history.",
    ],
    non_functional_requirements: [
      "Generation should complete within a reasonable interactive flow.",
      "The output should be consistent and easy to review.",
      "Ownership checks should be enforced on every request.",
    ],
    kpis: ["Spec completion rate", "Time to first download", "Generation success rate"],
    open_questions: ["Should the PRD include more persona detail?", "Should the output be optimized for team review?"],
    risks: ["Model output may be incomplete without a fallback path.", "Scope can drift if the idea is too vague.", "Stack choices may need manual correction."],
    appendix: [`Related documents: ${summarizeDocs(existingDocs)}`, `Stack: ${stack.frontend} / ${stack.backend} / ${stack.database}`],
  };
}

function fallbackSrsPayload(project: ProjectRecord) {
  const stack = getProjectStack(project);
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: `${project.title} System Design`,
    version: "1.0",
    status: "Draft",
    created_date: today,
    updated_date: today,
    change_log: [{ version: "1.0", date: today, author: "PLANNR AI", changes: "Initial draft" }],
    purpose: `Define the engineering requirements for ${project.title}.`,
    scope: project.description ?? project.idea,
    definitions: [
      { term: "PRD", meaning: "Product Requirements Document" },
      { term: "SRS", meaning: "Software Requirements Specification" },
    ],
    references: ["PRD.md", "ARCHITECTURE.md", "README.md"],
    product_perspective: "A planning product that turns an idea into a structured specification bundle.",
    product_functions: ["Collect clarifying questions", "Recommend a stack", "Generate docs", "Export a ZIP bundle"],
    user_classes: [
      { role: "USER", description: "Builder using the tool", permissions: ["Create specs", "Download bundles"] },
      { role: "ADMIN", description: "Operational reviewer", permissions: ["Review usage", "Inspect billing"] },
    ],
    environment: `${stack.frontend} frontend, backend function runtime, PostgreSQL storage`,
    constraints: ["Authenticated access", "Free-tier generation limit", "Provider timeout handling"],
    assumptions: ["Users are signed in before generating documents."],
    system_features_intro: "The system produces a cohesive document bundle with consistent structure.",
    feature_name: "Spec generation",
    feature_description: "Convert an idea into versioned planning documents.",
    actors: ["Builder", "Backend service", "AI provider"],
    preconditions: ["User is authenticated.", "Project exists.", "Quota remains available."],
    postconditions: ["Documents are stored.", "Download links are available."],
    main_flow: ["User submits an idea.", "System gathers clarifying details.", "Backend generates documents.", "System stores document versions."],
    alt_flow: ["If a provider fails, the backend should continue with a fallback response."],
    edge_case: ["If quota is exceeded, the request should be rejected before generation starts."],
    functional_requirements: ["Generate PRD, system design, and architecture docs.", "Persist generated versions.", "Expose download endpoints for stored docs."],
    acceptance_criteria: ["Each section renders without placeholder markers.", "Each generated doc is downloadable.", "The project record remains ownership-safe."],
    priority: "High",
    ui_requirements: ["Responsive builder", "Document preview", "Download button"],
    api_requirements: ["POST /project", "POST /generate/prd", "POST /generate/system-design", "POST /generate/architecture"],
    hardware: ["Modern browser"],
    software_interfaces: ["Authentication", "PostgreSQL", "Model providers"],
    performance: ["Interactive generation flow with visible progress."],
    scalability: ["Stateless backend functions", "Indexed ownership lookups"],
    availability: ["Best-effort generation with fallback handling."],
    reliability: ["Versioned writes should not overwrite history."],
    security: ["Bearer auth", "Ownership checks", "RLS policies"],
    usability: ["One flow from idea to downloadable bundle."],
    maintainability: ["Template-driven documents with stable sections."],
    observability: ["Route logs and latency tracking."],
    compliance: ["User-owned data stays behind authenticated access."],
    data_models: ["users", "projects", "documents", "document_versions", "usage_limits"],
    data_storage: ["PostgreSQL tables"],
    data_retention: ["Generated specs remain until deleted."],
    data_integrity: ["Foreign keys and unique constraints prevent duplicate records."],
    architecture_constraints: [`Current stack recommendation: ${stack.frontend}, ${stack.backend}, ${stack.database}.`],
    error_handling: ["Validate inputs", "Fallback on provider errors", "Return structured API errors"],
    logging: ["Log route, status, and duration for generation requests."],
    deployment: ["Backend function plus frontend deployment."],
    unit_testing: ["Template rendering and fallback payloads should be covered."],
    integration_testing: ["Auth, generation, and download flows should be verified end-to-end."],
    system_testing: ["ZIP output should contain all expected files."],
    performance_testing: ["Measure end-to-end generation latency."],
    traceability_matrix: ["FR-001 -> doc generation", "FR-002 -> download flow"],
    risks: ["Provider outages", "Template drift", "Incomplete AI output"],
    open_issues: ["Decide whether to expose more preview detail."],
    future: ["GitHub sync", "Collaborative review", "More export formats"],
    appendix: [`Related documents: ${summarizeDocs([])}`, `Stack: ${stack.frontend} / ${stack.backend} / ${stack.database}`],
  };
}

function fallbackArchitecturePayload(project: ProjectRecord) {
  const stack = getProjectStack(project);
  return {
    title: `${project.title} Architecture`,
    summary: `Implementation architecture for ${project.title}.`,
    module_boundaries: [
      "Browser UI",
      "Backend generation function",
      "Database persistence layer",
      "Billing and history services",
      "Download packaging path",
    ],
    directory_structure: [
      "src/routes/build.tsx",
      "insforge/functions/backend/index.ts",
      "migrations/*.sql",
      "tools/spec-generator/templates/*.tpl",
    ],
    database_schema_notes: [
      "projects stores the idea and selected stack",
      "documents stores one row per document type",
      "document_versions preserves immutable version history",
      "api_logs captures runtime events",
    ],
    service_contracts: [
      "POST /project creates the project shell",
      "POST /generate/prd generates the PRD",
      "POST /generate/system-design generates the SRS",
      "POST /generate/architecture generates the architecture doc",
      "GET /download/:id serves the exported artifact",
    ],
    deployment_notes: [
      "Frontend and backend can deploy independently.",
      "The backend expects configured environment variables.",
      "Database migrations must be applied before generation.",
    ],
    operational_workflows: [
      "Create project",
      "Generate PRD",
      "Generate system design",
      "Generate architecture",
      "Export the bundle",
    ],
    security_considerations: [
      "Bearer authentication is required.",
      "Row-level security limits data access to the owner.",
      "Payment verification must be idempotent.",
    ],
    cost_controls: [
      "Limit free users to the configured generation cap.",
      "Use fallback generation only when model output fails.",
      "Keep ZIP creation in-memory and short-lived.",
    ],
    migration_notes: [
      "Run SQL migrations before deploying the backend.",
      "Preserve existing version history tables.",
    ],
    risks: [
      "AI provider failure can slow generation.",
      "Template drift can create inconsistent docs.",
      "Schema changes may require migration updates.",
    ],
    stack: `${stack.frontend} / ${stack.backend} / ${stack.database}`,
  };
}

function maxTokensForDocKind(kind: DocKind) {
  if (kind === "prd") return 7000;
  if (kind === "system_design") return 6000;
  return 5000;
}

function fallbackDesignPayload(project: ProjectRecord, existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>) {
  const stack = getProjectStack(project);
  return {
    title: `${project.title} Design System`,
    executive_summary: `A practical design and implementation summary for ${project.title}.`,
    problem_statement: {
      current_state: ["The product idea needs a consistent design and handoff structure."],
      desired_state: ["The output should read like a real implementation-ready design document."],
      constraints: ["Stay aligned with the project stack.", "Keep the document specific and actionable."],
    },
    goals: [
      "Define a cohesive design direction.",
      "Align the document with the PRD and architecture.",
      "Make the output usable for implementation handoff.",
    ],
    non_goals: ["Pixel-perfect visual branding.", "Interactive design token management."],
    success_metrics: [
      { metric: "Template coverage", current: "Partial", target: "Full", measurement_method: "Manual review" },
      { metric: "Handoff clarity", current: "Low", target: "High", measurement_method: "Reviewer feedback" },
    ],
    system_overview: {
      boundaries: ["Browser UI", "Backend generation flow", "Database persistence", "Download/export path"],
      high_level_flow: [
        "User submits an idea.",
        "Backend gathers context and generates structured content.",
        "The document is rendered from the template.",
        "The export is stored and made downloadable.",
      ],
      key_interfaces: ["React frontend", "Backend API routes", "PostgreSQL"],
    },
    architecture: {
      style: [
        `Template-first rendering with ${stack.frontend}, ${stack.backend}, and ${stack.database}.`,
        "Stateless backend routes with durable persistence.",
        "Provider fallback and timeout handling.",
      ],
      components: [
        { name: "Builder UI", responsibility: "Collect input and show generation progress.", scaling: "Client-side", failure_modes: "Fallback to stored versions." },
        { name: "Generation Orchestrator", responsibility: "Create and store document versions.", scaling: "Stateless backend", failure_modes: "Use fallback payloads." },
        { name: "Document Store", responsibility: "Persist versions and metadata.", scaling: "Indexed PostgreSQL", failure_modes: "Return a clear backend error." },
      ],
      deployment: ["Frontend deploys independently", "Backend function uses environment variables", "Database migrations must be applied first"],
      security: ["Bearer auth", "Ownership checks", "RLS policies"],
      observability: ["Route logs", "Latency tracking", "Error capture"],
      reliability: ["Fallback payloads", "Provider retries", "Versioned writes"],
      tradeoffs: ["More model cost for better first-pass output", "Fallback content is less rich than AI-generated output"],
    },
    data_design: {
      entity_name: "projects",
      entities: [
        { name: "projects", fields: ["title", "idea", "description", "stack recommendation"], indexes: ["user_id, created_at"], constraints: ["Ownership enforced"], retention: "Until deleted" },
        { name: "documents", fields: ["project_id", "document_type", "status"], indexes: ["project_id, document_type"], constraints: ["Unique per project/type"], retention: "Until deleted" },
        { name: "document_versions", fields: ["document_id", "version_number", "content_markdown"], indexes: ["document_id, version_number"], constraints: ["Immutable version rows"], retention: "Until deleted" },
      ],
      access_patterns: [
        { use_case: "Load latest project docs", query: "Documents by project and type", index: "project_id, document_type" },
        { use_case: "List user history", query: "Projects by owner and created_at", index: "user_id, created_at" },
      ],
      consistency_model: ["Strong consistency for ownership and writes", "Read-your-own-write for generated versions"],
    },
    api_design: {
      limit: "3 specs for free users",
      conventions: ["JSON request/response bodies", "Bearer auth for user routes", "Stable IDs and timestamps"],
      endpoints: [
        {
          method: "POST",
          path: "/project",
          auth: "Required",
          rate_limit: "3 specs for free users",
          request: `{"title":"${project.title}","idea":"${project.idea}"}`,
          response: `{"success":true,"project":{"id":"uuid"}}`,
          errors: ["400 invalid request", "429 quota exceeded"],
          notes: summarizeDocs(existingDocs) ? ["Creates the project shell and document shells."] : ["Creates the project shell and document shells."],
        },
      ],
    },
  };
}

function buildQuestionsPrompt(idea: string, specs: string) {
  return `
Return valid JSON only.

Schema:
{
  "projectName": string,
  "questions": [{ "id": string, "question": string, "options": string[] }]
}

Rules:
- Create 5 to 7 short clarifying questions.
- Keep options practical and distinct.
- Make the project name short, product-like, and based on the idea.

Idea:
${idea}

Specs:
${specs || "None"}
`.trim();
}

function buildStackPrompt(idea: string, answers: Record<string, string>) {
  return `
Return valid JSON only.

Schema:
{
  "frontend": string,
  "backend": string,
  "database": string,
  "auth": string,
  "hosting": string,
  "rationale": string
}

Rules:
- Be practical and modern.
- Optimize for speed and scalability.
- Mention why the stack fits the idea.

Idea:
${idea}

Answers:
${JSON.stringify(answers, null, 2)}
`.trim();
}

async function callQuestionsAi(idea: string, specs: string) {
  const system = "You generate concise clarifying questions for product planning.";
  let json: Record<string, unknown> | null = null;
  try {
    ({ json } = await callStructuredAi(system, buildQuestionsPrompt(idea, specs), "questions"));
  } catch (error) {
    console.warn("[ai] questions fallback used", error);
  }
  if (!json || typeof json.projectName !== "string" || !Array.isArray(json.questions) || !json.questions.length) {
    return fallbackQuestionsForIdea(idea);
  }
  return {
    projectName: String(json.projectName ?? "Untitled Project"),
    questions: Array.isArray(json.questions) ? json.questions : [],
  };
}

async function callStackAi(idea: string, answers: Record<string, string>) {
  const system = "You recommend a practical production stack.";
  let json: Record<string, unknown> | null = null;
  try {
    ({ json } = await callStructuredAi(system, buildStackPrompt(idea, answers), "stack"));
  } catch (error) {
    console.warn("[ai] stack fallback used", error);
  }
  if (!json || typeof json.frontend !== "string" || typeof json.backend !== "string" || typeof json.database !== "string") {
    return fallbackStackForIdea(idea);
  }
  return {
    frontend: String(json.frontend ?? "React"),
    backend: String(json.backend ?? "Node.js"),
    database: String(json.database ?? "PostgreSQL"),
    auth: String(json.auth ?? "Email/password and Google OAuth"),
    hosting: String(json.hosting ?? "Vercel"),
    rationale: String(json.rationale ?? "Recommended stack."),
  };
}

async function callDesignAi(project: ProjectRecord, existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>) {
  const system = "You are a senior product designer and solutions architect. Return only JSON that matches the requested schema exactly.";
  let json: Record<string, unknown> | null = null;
  try {
    ({ json } = await callStructuredAi(system, buildDesignPrompt(project, existingDocs), "design"));
  } catch (error) {
    console.warn("[ai] design fallback used", error);
  }
  if (!json || typeof json.title !== "string") {
    json = fallbackDesignPayload(project, existingDocs);
  }
  return {
    title: String(json.title ?? `${project.title} Design System`),
    executive_summary: String(json.executive_summary ?? project.description ?? project.idea),
    problem_statement: json.problem_statement ?? {},
    goals: Array.isArray(json.goals) ? json.goals : [],
    non_goals: Array.isArray(json.non_goals) ? json.non_goals : [],
    success_metrics: Array.isArray(json.success_metrics) ? json.success_metrics : [],
    system_overview: json.system_overview ?? {},
    architecture: json.architecture ?? {},
    data_design: json.data_design ?? {},
    api_design: json.api_design ?? {},
    limit: String(json.api_design && typeof json.api_design === "object" ? (json.api_design as Record<string, unknown>).limit ?? "3 specs for free users" : "3 specs for free users"),
  };
}

async function getInsForgeContext(req: Request): Promise<BackendContext | Response> {
  const baseUrl = Deno.env.get("INSFORGE_BASE_URL");
  const anonKey = Deno.env.get("ANON_KEY");
  if (!baseUrl || !anonKey) {
    return jsonResponse(500, {
      success: false,
      error: "Missing InsForge environment variables: INSFORGE_BASE_URL or ANON_KEY.",
    });
  }

  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse(401, { success: false, error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return jsonResponse(401, { success: false, error: "Unauthorized" });
  }

  const client = createClient({
    baseUrl,
    anonKey,
    edgeFunctionToken: token,
  });

  const { data: currentUser, error } = await client.auth.getCurrentUser();
  if (error || !currentUser?.user?.id) {
    return jsonResponse(401, { success: false, error: "Unauthorized" });
  }

  const user = currentUser.user as AuthUser;
  const profile = await ensureUserProfile(client, user);
  return { client, user, profile };
}

async function ensureUserProfile(context: BackendContext["client"], user: AuthUser) {
  const email = user.email ?? "";
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? null) as string | null;

  const { data: existing } = await context.database
    .from("users")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing as BackendContext["profile"];
  }

  const { data: inserted, error } = await context.database
    .from("users")
    .insert([{ id: user.id, email, full_name: fullName, role: "free" }])
    .select("id,email,full_name,role")
    .maybeSingle();

  if (error || !inserted) {
    throw new Error(error?.message ?? "Failed to create user profile");
  }

  return inserted as BackendContext["profile"];
}

async function getUsageState(context: BackendContext): Promise<UsageState> {
  const limit = context.profile.role === "pro" ? 100 : 3;
  const { count: historyCount, error: historyError } = await context.client.database
    .from("spec_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.user.id);

  if (historyError) {
    throw new Error(historyError.message);
  }
  const used = Number(historyCount ?? 0);
  return {
    role: context.profile.role,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    blocked: context.profile.role !== "pro" && used >= 3,
  };
}

function limitExceededResponse(state: UsageState) {
  return jsonResponse(429, {
    success: false,
    code: "LIMIT_EXCEEDED",
    message: "Free limit reached",
    usage: state,
  });
}

async function assertGenerationAllowed(context: BackendContext) {
  const state = await getUsageState(context);
  if (state.blocked) {
    return { allowed: false as const, state };
  }
  return { allowed: true as const, state };
}

async function recordSpecHistory(ctx: BackendContext, project: Pick<ProjectRecord, "title" | "idea">, fileUrl: string) {
  const { data: existing, error: lookupError } = await ctx.client.database
    .from("spec_history")
    .select("id")
    .eq("user_id", ctx.user.id)
    .eq("file_url", fileUrl)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return { created: false as const };
  }

  const { error } = await ctx.client.database.from("spec_history").insert([{
    user_id: ctx.user.id,
    project_name: project.title,
    idea_input: project.idea,
    file_url: fileUrl,
  }]);

  if (error) {
    throw error;
  }

  return { created: true as const };
}

async function logEvent(
  client: BackendContext["client"],
  payload: {
    userId?: string;
    projectId?: string;
    route: string;
    method: string;
    level?: "info" | "warn" | "error";
    message: string;
    statusCode?: number;
    durationMs?: number;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await client.database.from("api_logs").insert([{
      user_id: payload.userId ?? null,
      project_id: payload.projectId ?? null,
      route: payload.route,
      method: payload.method,
      level: payload.level ?? "info",
      message: payload.message,
      status_code: payload.statusCode ?? null,
      duration_ms: payload.durationMs ?? null,
      metadata: payload.metadata ?? {},
    }]);
  } catch {
    // Logging should never break the API path.
  }
}

async function readJsonBody(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {};
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function getProjectOwnedByUser(client: BackendContext["client"], projectId: string, userId: string) {
  const { data, error } = await client.database
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Project not found");
  return data as ProjectRecord;
}

async function getProjectDocuments(client: BackendContext["client"], projectId: string) {
  const { data, error } = await client.database
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as DocumentRecord[];
}

async function getDocumentVersions(client: BackendContext["client"], documentId: string) {
  const { data, error } = await client.database
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DocumentVersionRecord[];
}

async function createProjectShell(
  client: BackendContext["client"],
  userId: string,
  title: string,
  idea: string,
  description?: string,
  stackRecommendation: Record<string, unknown> = {},
) {
  const { data: project, error: projectError } = await client.database
    .from("projects")
    .insert([{
      user_id: userId,
      title,
      idea,
      description: description ?? null,
      current_stage: "created",
      generation_state: "idle",
      stack_recommendation: stackRecommendation,
    }])
    .select("*")
    .maybeSingle();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Failed to create project");
  }

  const docs = [
    { document_type: "prd" as const, title: `${title} PRD` },
    { document_type: "system_design" as const, title: `${title} System Design` },
    { document_type: "architecture" as const, title: `${title} Architecture` },
  ];

  const { error: docsError } = await client.database.from("documents").insert(
    docs.map((doc) => ({
      project_id: project.id,
      user_id: userId,
      document_type: doc.document_type,
      title: doc.title,
      status: "pending",
    })),
  );

  if (docsError) {
    throw new Error(docsError.message);
  }

  return project as ProjectRecord;
}

async function fetchExistingDocument(client: BackendContext["client"], projectId: string, kind: DocKind) {
  const { data, error } = await client.database
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .eq("document_type", kind)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DocumentRecord | null;
}

async function updateDocumentStatus(
  client: BackendContext["client"],
  documentId: string,
  patch: Partial<Pick<DocumentRecord, "status" | "latest_checksum" | "current_version_id">>,
) {
  const { data, error } = await client.database
    .from("documents")
    .update(patch)
    .eq("id", documentId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update document");
  }

  return data as DocumentRecord;
}

async function updateProject(
  client: BackendContext["client"],
  projectId: string,
  patch: Partial<ProjectRecord>,
) {
  const { data, error } = await client.database
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update project");
  }

  return data as ProjectRecord;
}

async function createDocumentVersion(
  client: BackendContext["client"],
  document: DocumentRecord,
  contentMarkdown: string,
  structuredData: Record<string, unknown>,
  aiModel: string,
) {
  const existingVersions = await getDocumentVersions(client, document.id);
  const versionNumber = existingVersions.length ? existingVersions[0].version_number + 1 : 1;
  const checksum = await sha256(`${document.id}:${versionNumber}:${contentMarkdown}`);
  const fileName = filenameForKind(document.document_type, document.title, "md");

  const { data: inserted, error } = await client.database
    .from("document_versions")
    .insert([{
      document_id: document.id,
      version_number: versionNumber,
      content_markdown: contentMarkdown,
      structured_data: structuredData,
      file_format: "md",
      file_name: fileName,
      checksum,
      ai_model: aiModel,
      prompt_version: PROMPT_VERSION,
      token_usage: {},
    }])
    .select("*")
    .maybeSingle();

  if (error || !inserted) {
    throw new Error(error?.message ?? "Failed to save document version");
  }

  await updateDocumentStatus(client, document.id, {
    status: "ready",
    latest_checksum: checksum,
    current_version_id: inserted.id,
  });

  return inserted as DocumentVersionRecord;
}

async function callAiForDocument(
  client: BackendContext["client"],
  kind: DocKind,
  project: ProjectRecord,
  existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>,
) {
  const prompt = buildPrompt(kind, project, existingDocs);
  const system = "You are a senior product strategist and solutions architect. Return only JSON that exactly matches the requested schema.";
  let structured: Record<string, unknown> | null = null;
  try {
    ({ json: structured } = await callStructuredAi(system, prompt, titleForKind(kind), maxTokensForDocKind(kind)));
  } catch (error) {
    console.warn(`[ai] ${kind} generation fallback used`, error);
  }
  if (!structured || !Object.keys(structured).length) {
    structured =
      kind === "prd"
        ? fallbackPrdPayload(project, existingDocs)
        : kind === "system_design"
          ? fallbackSrsPayload(project)
          : fallbackArchitecturePayload(project);
  }

  const markdown =
    kind === "prd"
      ? await renderPrdMarkdownInline(structured, project).catch(() => renderPrdMarkdownInline(fallbackPrdPayload(project, existingDocs), project))
      : kind === "system_design"
        ? await renderSystemDesignMarkdownInline(structured, project, existingDocs).catch(() => renderSystemDesignMarkdownInline(fallbackSrsPayload(project), project, existingDocs))
        : await renderArchitectureMarkdownInline(structured, project, existingDocs).catch(() => renderArchitectureMarkdownInline(fallbackArchitecturePayload(project), project, existingDocs));
  const usage = {};

  return { structured, markdown, usage };
}

function getDeterministicDocumentPayload(
  kind: DocKind,
  project: ProjectRecord,
  existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>,
) {
  if (kind === "prd") return fallbackPrdPayload(project, existingDocs);
  if (kind === "system_design") return fallbackSrsPayload(project);
  return fallbackArchitecturePayload(project);
}

function buildDeterministicDocumentMarkdown(
  kind: DocKind,
  project: ProjectRecord,
  existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>,
) {
  const payload = getDeterministicDocumentPayload(kind, project, existingDocs);
  try {
    return renderMarkdown(kind, payload, project);
  } catch {
    return [
      `# ${titleForKind(kind)}`,
      "",
      `Fallback ${titleForKind(kind)} generated for ${project.title}.`,
      "",
      project.idea,
    ].join("\n");
  }
}

async function generateDocumentVersionWithFallback(
  ctx: BackendContext,
  kind: DocKind,
  project: ProjectRecord,
  doc: DocumentRecord,
  existingDocs: Array<{ document_type: DocKind; title: string; summary?: string }>,
) {
  const payload = getDeterministicDocumentPayload(kind, project, existingDocs);
  const markdown = buildDeterministicDocumentMarkdown(kind, project, existingDocs);
  return await createDocumentVersion(ctx.client, doc, markdown, payload, AI_MODEL);
}

function simplePdfEncode(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars = 92) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function buildPdfBytes(title: string, markdown: string) {
  const lines = wrapText(`# ${title}\n\n${markdown}`, 92);
  const linesPerPage = 48;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (!pages.length) pages.push([""]);

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  let nextObjectId = 4;

  for (const pageLines of pages) {
    const pageId = nextObjectId++;
    const contentId = nextObjectId++;
    pageObjectIds.push(pageId);
    contentObjectIds.push(contentId);

    const content = [
      "BT",
      "/F1 10 Tf",
      "50 780 Td",
      ...pageLines.map((line, index) => {
        const escaped = simplePdfEncode(line);
        return index === 0 ? `(${escaped}) Tj` : `T* (${escaped}) Tj`;
      }),
      "ET",
    ].join("\n");
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;

    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  }

  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
  objects[fontId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 1; i <= objects.length; i++) {
    const object = objects[i];
    if (!object) continue;
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${object}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objects.length; i++) {
    const offset = offsets[i] ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

async function listLatestDocumentsForProject(client: BackendContext["client"], projectId: string) {
  const docs = await getProjectDocuments(client, projectId);
  const enriched = [];
  for (const doc of docs) {
    const versions = await getDocumentVersions(client, doc.id);
    enriched.push({
      ...doc,
      latest_version: versions[0] ?? null,
      versions,
    });
  }
  return enriched;
}

async function handleGenerateQuestions(ctx: BackendContext, req: Request) {
  const body = await readJsonBody(req);
  const idea = String(body.idea ?? "").trim();
  const specs = String(body.specs ?? "").trim();

  if (idea.length < 10) {
    return jsonResponse(400, { success: false, error: "Idea is required." });
  }

  const result = await callQuestionsAi(idea, specs);
  return jsonResponse(200, {
    success: true,
    ...result,
  });
}

async function handleCreatePaymentOrder(req: Request) {
  const body = await readJsonBody(req);
  const plan = String(body.plan ?? "").trim().toLowerCase();

  if (!isRazorpayPlan(plan)) {
    return jsonResponse(400, { success: false, error: "Plan must be pro, enterprise, or custom." });
  }

  try {
    const order = await createRazorpayOrder(plan);
    return jsonResponse(200, {
      success: true,
      plan,
      upiId: getBillingUpiId(),
      ...order,
    });
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create Razorpay order",
    });
  }
}

async function handleGenerateStack(ctx: BackendContext, req: Request) {
  const body = await readJsonBody(req);
  const idea = String(body.idea ?? "").trim();
  const answers = (body.answers && typeof body.answers === "object" ? body.answers : {}) as Record<string, string>;

  if (idea.length < 10) {
    return jsonResponse(400, { success: false, error: "Idea is required." });
  }

  const result = await callStackAi(idea, answers);
  return jsonResponse(200, {
    success: true,
    ...result,
  });
}

async function handleCreateProject(ctx: BackendContext, req: Request) {
  const body = await readJsonBody(req);
  const title = String(body.title ?? "").trim();
  const idea = String(body.idea ?? "").trim();
  const description = body.description ? String(body.description).trim() : undefined;
  const stackRecommendation = toPlainRecord(body.stackRecommendation ?? body.stack_recommendation);

  const usageCheck = await assertGenerationAllowed(ctx);
  if (!usageCheck.allowed) {
    await logEvent(ctx.client, {
      userId: ctx.user.id,
      route: "/project",
      method: "POST",
      level: "warn",
      message: "Free limit reached",
      statusCode: 429,
      metadata: { code: "LIMIT_EXCEEDED", usage: usageCheck.state },
    });
    return limitExceededResponse(usageCheck.state);
  }

  if (title.length < 2 || title.length > 120) {
    return jsonResponse(400, { success: false, error: "Title must be between 2 and 120 characters." });
  }
  if (idea.length < 20 || idea.length > 4000) {
    return jsonResponse(400, { success: false, error: "Idea must be between 20 and 4000 characters." });
  }

  const project = await createProjectShell(ctx.client, ctx.user.id, title, idea, description, stackRecommendation);
  const docs = await listLatestDocumentsForProject(ctx.client, project.id);
  const baseOrigin = new URL(req.url).origin;

  await logEvent(ctx.client, {
    userId: ctx.user.id,
    projectId: project.id,
    route: "/project",
    method: "POST",
    message: "Project created",
    metadata: { title },
  });

  return jsonResponse(201, {
    success: true,
    project,
    documents: docs,
    downloadUrl: `${baseOrigin}${ROUTE_PREFIX}/download/${project.id}?scope=project&format=zip`,
  });
}

async function handleGetUserHistory(ctx: BackendContext, req: Request) {
  try {
    const { data, error } = await ctx.client.database
      .from("spec_history")
      .select("id,project_name,idea_input,file_url,created_at")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return jsonResponse(200, { success: true, history: data });
  } catch (err) {
    return jsonResponse(500, { success: false, error: err instanceof Error ? err.message : String(err) });
  }
}

async function handleGetBillingHistory(ctx: BackendContext) {
  try {
    const { data, error } = await ctx.client.database
      .from("billing_payments")
      .select("id,user_id,plan,amount_in_paise,currency,status,order_id,payment_id,receipt,method,upi_id,signature,notes,paid_at,created_at,updated_at")
      .eq("user_id", ctx.user.id)
      .order("paid_at", { ascending: false });

    if (error) throw error;

    const payments = (data ?? []) as BillingPaymentRecord[];
    const completedPayments = payments.filter((payment) => payment.status === "completed");
    const totalSpentInPaise = completedPayments.reduce((sum, payment) => sum + payment.amount_in_paise, 0);
    const latestPayment = completedPayments[0] ?? null;

    return jsonResponse(200, {
      success: true,
      summary: {
        accountRole: ctx.profile.role,
        currentPlan: ctx.profile.role === "pro" ? "Pro" : "Hobby",
        totalSpentInPaise,
        totalSpentInInr: totalSpentInPaise / 100,
        paymentCount: completedPayments.length,
        memberSince: ctx.profile.email ? ctx.profile.email : null,
        upiId: getBillingUpiId(),
        upiName: getBillingUpiName(),
        latestPaymentAt: latestPayment?.paid_at ?? null,
      },
      payments: payments.map((payment) => ({
        ...payment,
        amount_in_inr: payment.amount_in_paise / 100,
      })),
    });
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load billing history",
    });
  }
}

async function handleConfirmPayment(ctx: BackendContext, req: Request) {
  const body = await readJsonBody(req);
  const plan = String(body.plan ?? "").trim().toLowerCase();
  const razorpayOrderId = String(body.razorpay_order_id ?? body.razorpayOrderId ?? "").trim();
  const razorpayPaymentId = String(body.razorpay_payment_id ?? body.razorpayPaymentId ?? "").trim();
  const razorpaySignature = String(body.razorpay_signature ?? body.razorpaySignature ?? "").trim();
  const method = body.method ? String(body.method).trim() : null;
  const upiId = body.upiId ? String(body.upiId).trim() : getBillingUpiId();

  if (!isRazorpayPlan(plan)) {
    return jsonResponse(400, { success: false, error: "Plan must be pro, enterprise, or custom." });
  }
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return jsonResponse(400, {
      success: false,
      error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
    });
  }

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    return jsonResponse(500, {
      success: false,
      error: "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.",
    });
  }

  const order = await fetchRazorpayOrder(razorpayOrderId, keyId, keySecret);
  const expected = Math.round(planConfig(plan).amountInInr * 100);
  const expectedPlan = String(order.notes?.plan ?? "").toLowerCase();
  if (expectedPlan && expectedPlan !== plan) {
    return jsonResponse(400, {
      success: false,
      error: "The payment order does not match the selected plan.",
    });
  }
  if (order.amount !== expected) {
    return jsonResponse(400, {
      success: false,
      error: "The payment amount does not match the selected plan.",
    });
  }

  const generatedSignature = await hmacSha256Hex(`${razorpayOrderId}|${razorpayPaymentId}`, keySecret);
  if (generatedSignature !== razorpaySignature) {
    return jsonResponse(400, {
      success: false,
      error: "Payment signature verification failed.",
    });
  }

  const existing = await ctx.client.database
    .from("billing_payments")
    .select("id, user_id, plan, amount_in_paise, currency, status, order_id, payment_id, receipt, method, upi_id, signature, notes, paid_at, created_at, updated_at")
    .eq("order_id", razorpayOrderId)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return jsonResponse(200, {
      success: true,
      recorded: false,
      payment: {
        ...existing.data,
        amount_in_inr: existing.data.amount_in_paise / 100,
      },
    });
  }

  const receipt = String(order.receipt ?? `plannr-${plan}-${Date.now()}`);
  const { data, error } = await ctx.client.database
    .from("billing_payments")
    .insert([{
      user_id: ctx.user.id,
      plan,
      amount_in_paise: order.amount,
      currency: order.currency,
      status: "completed",
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
      receipt,
      method,
      upi_id: upiId,
      signature: razorpaySignature,
      notes: toPlainRecord(order.notes),
      paid_at: new Date().toISOString(),
    }])
    .select("id, user_id, plan, amount_in_paise, currency, status, order_id, payment_id, receipt, method, upi_id, signature, notes, paid_at, created_at, updated_at")
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Failed to record payment.");
  }

  const { data: updatedUser, error: updateError } = await ctx.client.database
    .from("users")
    .update({ role: "pro" })
    .eq("id", ctx.user.id)
    .select("id,role")
    .maybeSingle();

  if (updateError) {
    await logEvent(ctx.client, {
      userId: ctx.user.id,
      route: "/payments/confirm",
      method: req.method,
      level: "warn",
      message: "Failed to update user role to pro after payment",
      statusCode: 200,
      metadata: { error: updateError.message },
    });
  }

  return jsonResponse(201, {
    success: true,
    recorded: true,
    payment: {
      ...data,
      amount_in_inr: data.amount_in_paise / 100,
    },
    roleUpdated: !updateError && updatedUser ? true : false,
    roleUpdateError: updateError ? String(updateError.message) : undefined,
  });
}

async function handleFetchProject(ctx: BackendContext, req: Request, projectId: string) {
  if (!isUuid(projectId)) {
    return jsonResponse(400, { success: false, error: "Invalid project id." });
  }

  const project = await getProjectOwnedByUser(ctx.client, projectId, ctx.user.id);
  const docs = await listLatestDocumentsForProject(ctx.client, project.id);
  const baseOrigin = new URL(req.url).origin;

  return jsonResponse(200, {
    success: true,
    project,
    documents: docs.map((doc) => ({
      id: doc.id,
      project_id: doc.project_id,
      document_type: doc.document_type,
      title: doc.title,
      status: doc.status,
      current_version_id: doc.current_version_id,
      latest_checksum: doc.latest_checksum,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      latest_version: doc.latest_version,
      versions: doc.versions,
      download_urls: {
        markdown: `${baseOrigin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=md`,
        pdf: `${baseOrigin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=pdf`,
      },
    })),
  });
}

async function handleGenerateDocument(ctx: BackendContext, req: Request, kind: DocKind) {
  const started = Date.now();
  const body = await readJsonBody(req);
  const projectId = String(body.projectId ?? body.project_id ?? "").trim();
  const force = Boolean(body.force ?? false);

  if (!isUuid(projectId)) {
    return jsonResponse(400, { success: false, error: "Valid projectId is required." });
  }

  const project = await getProjectOwnedByUser(ctx.client, projectId, ctx.user.id);
  const doc = await fetchExistingDocument(ctx.client, project.id, kind);
  if (!doc) {
    return jsonResponse(404, { success: false, error: "Document shell was not found for this project." });
  }

  const usageCheck = await assertGenerationAllowed(ctx);
  if (!usageCheck.allowed) {
    await logEvent(ctx.client, {
      userId: ctx.user.id,
      projectId: project.id,
      route: `/generate/${kind}`,
      method: "POST",
      level: "warn",
      message: "Free limit reached",
      statusCode: 429,
      durationMs: Date.now() - started,
      metadata: { document_id: doc.id, code: "LIMIT_EXCEEDED", usage: usageCheck.state },
    });
    return limitExceededResponse(usageCheck.state);
  }

  if (doc.status === "ready" && doc.current_version_id && !force) {
    const versions = await getDocumentVersions(ctx.client, doc.id);
    const latest = versions[0] ?? null;
    return jsonResponse(200, {
      success: true,
      skipped: true,
      reason: "Existing version already available.",
      project,
      document: doc,
      version: latest,
      downloadUrl: latest
        ? `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=md`
        : null,
    });
  }

  await updateProject(ctx.client, project.id, { generation_state: "generating", current_stage: `generating-${kind}` });
  await updateDocumentStatus(ctx.client, doc.id, { status: "generating" });

  try {
    const existingDocs = await listLatestDocumentsForProject(ctx.client, project.id);
    const summaryDocs = existingDocs.map((item) => ({
      document_type: item.document_type as DocKind,
      title: item.title,
      summary: item.latest_version?.structured_data?.summary ?? item.latest_version?.structured_data?.architecture_overview ?? "",
    }));

    const ai = await callAiForDocument(ctx.client, kind, project, summaryDocs);
    const version = await createDocumentVersion(ctx.client, doc, ai.markdown, ai.structured, AI_MODEL);
    const designPreview = kind === "architecture"
      ? await (async () => {
        const design = await callDesignAi(project, summaryDocs);
        const markdown = await renderDesignMarkdownInline(project, design as unknown as Record<string, unknown>);
        return {
          structured_data: design as unknown as Record<string, unknown>,
          content_markdown: markdown,
        };
      })().catch(() => null)
      : null;

    await updateProject(ctx.client, project.id, {
      generation_state: "ready",
      current_stage: `generated-${kind}`,
      last_generated_at: new Date().toISOString(),
    });

    const durationMs = Date.now() - started;
    await logEvent(ctx.client, {
      userId: ctx.user.id,
      projectId: project.id,
      route: `/generate/${kind}`,
      method: "POST",
      message: `${kind} generated successfully`,
      statusCode: 200,
      durationMs,
      metadata: {
        ai_model: AI_MODEL,
        document_id: doc.id,
        version_id: version.id,
      },
    });

    // Increment lifetime_generations after a successful full generation
    try {
      await ctx.client.database.rpc("increment_lifetime_generations", { p_user_id: ctx.user.id, p_units: 1 });
    } catch (incErr) {
      // Log increment failure but do not fail the generation response
      await logEvent(ctx.client, {
        userId: ctx.user.id,
        projectId: project.id,
        route: `/generate/${kind}`,
        method: "POST",
        level: "warn",
        message: "Failed to increment lifetime_generations",
        metadata: { error: incErr instanceof Error ? incErr.message : String(incErr) },
      }).catch(() => {});
    }

    return jsonResponse(200, {
      success: true,
      projectId: project.id,
      document: doc,
      version,
      designPreview,
      aiModel: AI_MODEL,
      downloadUrl: `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=md`,
    });
  } catch (error) {
    const fallbackDocs = await listLatestDocumentsForProject(ctx.client, project.id).catch(() => []);
    const fallbackSummaries = fallbackDocs.map((item) => ({
      document_type: item.document_type as DocKind,
      title: item.title,
      summary: item.latest_version?.structured_data?.summary ?? item.latest_version?.structured_data?.architecture_overview ?? "",
    }));

    try {
      const version = await generateDocumentVersionWithFallback(ctx, kind, project, doc, fallbackSummaries);

      await updateProject(ctx.client, project.id, {
        generation_state: "ready",
        current_stage: `generated-${kind}`,
        last_generated_at: new Date().toISOString(),
      }).catch(() => {});

      await logEvent(ctx.client, {
        userId: ctx.user.id,
        projectId: project.id,
        route: `/generate/${kind}`,
        method: "POST",
        level: "warn",
        message: `${kind} generated with fallback content`,
        statusCode: 200,
        durationMs: Date.now() - started,
        metadata: {
          ai_model: AI_MODEL,
          document_id: doc.id,
          version_id: version.id,
          fallback: true,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return jsonResponse(200, {
        success: true,
        projectId: project.id,
        document: doc,
        version,
        designPreview: null,
        aiModel: AI_MODEL,
        downloadUrl: `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=md`,
        fallback: true,
      });
    } catch (fallbackError) {
      const errorMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : typeof fallbackError === "string"
            ? fallbackError
            : "Generation failed";

      await updateProject(ctx.client, project.id, { generation_state: "failed" }).catch(() => {});
      await updateDocumentStatus(ctx.client, doc.id, { status: "failed" }).catch(() => {});

      const usage = await getUsageState(ctx).catch(() => null);
      const isLimitError =
        fallbackError instanceof Error &&
        /Daily generation limit exceeded|free limit reached|quota/i.test(fallbackError.message);

      await logEvent(ctx.client, {
        userId: ctx.user.id,
        projectId: project.id,
        route: `/generate/${kind}`,
        method: "POST",
        level: "error",
        message: errorMessage,
        statusCode: isLimitError ? 429 : 500,
        durationMs: Date.now() - started,
        metadata: {
          document_id: doc.id,
          code: isLimitError ? "LIMIT_EXCEEDED" : undefined,
          usage,
          original_error: error instanceof Error ? error.message : String(error),
          fallback_error: errorMessage,
        },
      });

      if (isLimitError && usage) {
        return limitExceededResponse(usage);
      }

      return jsonResponse(500, {
        success: false,
        error: errorMessage,
      });
    }
  }
}

async function handleDownload(ctx: BackendContext, req: Request, id: string) {
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "md") as DownloadFormat;
  const scope = (url.searchParams.get("scope") ?? "document") as "document" | "project";
  if (!isUuid(id)) {
    return jsonResponse(400, { success: false, error: "Invalid id." });
  }

  if (scope === "project") {
    const project = await getProjectOwnedByUser(ctx.client, id, ctx.user.id);
    const docs = await listLatestDocumentsForProject(ctx.client, project.id);
    const docSummaries = docs.map((doc) => ({
      document_type: doc.document_type,
      title: doc.title,
      summary: doc.latest_version?.structured_data?.summary ?? doc.latest_version?.structured_data?.architecture_overview ?? "",
    }));
    const zip = new JSZip();
    zip.file("manifest.json", JSON.stringify({
      project: {
        id: project.id,
        title: project.title,
        idea: project.idea,
        created_at: project.created_at,
      },
      documents: docs.map((doc) => ({
        id: doc.id,
        document_type: doc.document_type,
        title: doc.title,
        latest_version: doc.latest_version?.version_number ?? null,
      })),
    }, null, 2));

    for (const doc of docs) {
      const latest = doc.latest_version;
      if (!latest) continue;
      zip.file(`${doc.document_type}/${slugify(doc.title)}.md`, latest.content_markdown);
      zip.file(`${doc.document_type}/${slugify(doc.title)}.json`, JSON.stringify(latest.structured_data, null, 2));
    }

    const [designMarkdown, apiMarkdown, readmeMarkdown, folderStructure] = await Promise.all([
      (async () => {
        try {
          const design = await callDesignAi(project, docSummaries);
          return await renderDesignMarkdownInline(project, design as unknown as Record<string, unknown>);
        } catch {
          return await renderDesignMarkdownInline(project, {});
        }
      })(),
      renderApiSpecMarkdownInline(project, docSummaries),
      renderReadmeMarkdownInline(project, docSummaries),
      renderFolderStructureMarkdownInline(project),
    ]);

    zip.file("design/DESIGN_SYSTEM.md", designMarkdown);
    zip.file("api/API_SPEC.md", apiMarkdown);
    zip.file("README.md", readmeMarkdown);
    zip.file("structure/FOLDER_STRUCTURE.md", folderStructure.markdown);
    zip.file("structure/FOLDER_STRUCTURE.json", folderStructure.json);

    const bytes = await zip.generateAsync({ type: "uint8array" });
    await recordSpecHistory(ctx, project, `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${project.id}?scope=project&format=zip`);
    return binaryResponse(200, bytes, `${slugify(project.title)}-bundle.zip`, "application/zip");
  }

  const document = await ctx.client.database
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  if (document.error) {
    return jsonResponse(500, { success: false, error: document.error.message });
  }

  if (!document.data) {
    return jsonResponse(404, { success: false, error: "Document not found." });
  }

  const doc = document.data as DocumentRecord;
  const versions = await getDocumentVersions(ctx.client, doc.id);
  const latest = versions[0];
  if (!latest) {
    return jsonResponse(404, { success: false, error: "No generated version available." });
  }

  const fileBase = slugify(doc.title || titleForKind(doc.document_type));
  if (format === "pdf") {
    const bytes = buildPdfBytes(doc.title, latest.content_markdown);
    return binaryResponse(200, bytes, `${fileBase}.pdf`, "application/pdf");
  }

  return textResponse(200, latest.content_markdown, `${fileBase}.md`, "text/markdown; charset=utf-8");
}

async function handleUsage(ctx: BackendContext, req: Request) {
  const state = await getUsageState(ctx);
  return jsonResponse(200, {
    success: true,
    ...state,
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const route = normalizeRoute(new URL(req.url).pathname);

  if (route === "/health") {
    return jsonResponse(200, { success: true, status: "ok" });
  }

  if (req.method === "POST" && route === "/payments/order") {
    return await handleCreatePaymentOrder(req);
  }

  const context = await getInsForgeContext(req);
  if (context instanceof Response) return context;

  try {
    if (req.method === "GET" && route === "/usage") {
      return await handleUsage(context, req);
    }

    if (req.method === "GET" && route === "/payments/history") {
      return await handleGetBillingHistory(context);
    }

    if (req.method === "POST" && route === "/payments/confirm") {
      return await handleConfirmPayment(context, req);
    }

    if (req.method === "POST" && route === "/project") {
      return await handleCreateProject(context, req);
    }

    if (req.method === "POST" && route === "/generate/questions") {
      return await handleGenerateQuestions(context, req);
    }

    if (req.method === "POST" && route === "/generate/stack") {
      return await handleGenerateStack(context, req);
    }

    if (req.method === "GET" && route.startsWith("/project/")) {
      return await handleFetchProject(context, req, route.split("/")[2] ?? "");
    }

    if (req.method === "POST" && route === "/generate/prd") {
      return await handleGenerateDocument(context, req, "prd");
    }

    if (req.method === "GET" && route === "/history") {
      return await handleGetUserHistory(context, req);
    }

    if (req.method === "POST" && route === "/generate/system-design") {
      return await handleGenerateDocument(context, req, "system_design");
    }

    if (req.method === "POST" && route === "/generate/architecture") {
      return await handleGenerateDocument(context, req, "architecture");
    }

    if (req.method === "GET" && route.startsWith("/download/")) {
      return await handleDownload(context, req, route.split("/")[2] ?? "");
    }

    return jsonResponse(404, {
      success: false,
      error: "Route not found.",
      route,
      supported: [
        "POST /project",
      "POST /generate/questions",
      "POST /generate/stack",
      "POST /payments/order",
      "GET /payments/history",
      "POST /payments/confirm",
      "GET /project/:id",
      "POST /generate/prd",
      "POST /generate/system-design",
        "POST /generate/architecture",
        "GET /download/:id",
      ],
    });
  } catch (error) {
    await logEvent(context.client, {
      userId: context.user.id,
      route,
      method: req.method,
      level: "error",
      message: error instanceof Error ? error.message : "Unhandled backend error",
      statusCode: 500,
      metadata: {
        stack: error instanceof Error ? error.stack : null,
      },
    });
    return jsonResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : "Unhandled backend error",
    });
  }
}
