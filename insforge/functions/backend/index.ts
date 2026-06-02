import { createClient } from "@insforge/sdk";
import JSZip from "jszip";

type DocKind = "prd" | "srs" | "system_design" | "architecture" | "design-system" | "api-spec" | "readme";
type SupplementalDocKind = "folder-structure";
type GeneratedDocKind = DocKind | SupplementalDocKind;
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

function projectStackLine(project: MinimalProject) {
  const stack = project.stack_recommendation ?? {};
  const frontend = String(stack.frontend ?? "React");
  const backend = String(stack.backend ?? "Node.js");
  const database = String(stack.database ?? "PostgreSQL");
  const auth = String(stack.auth ?? "InsForge Auth");
  return `${frontend} / ${backend} / ${database} / ${auth}`;
}

function documentKindLabel(kind: GeneratedDocKind) {
  switch (kind) {
    case "prd":
      return "PRD";
    case "srs":
      return "SRS";
    case "system_design":
      return "system design";
    case "architecture":
      return "architecture";
    case "design-system":
      return "design system";
    case "api-spec":
      return "API spec";
    case "readme":
      return "README";
    case "folder-structure":
      return "folder structure";
  }
}

function sanitizeMarkdownOutput(text: string) {
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/^\uFEFF/, "")
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return cleaned;
}

function logMarkdownDebug(label: string, text: string) {
  console.log(label, text.slice(0, 2000));
}

function validateGeneratedMarkdown(kind: GeneratedDocKind, text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error(`${documentKindLabel(kind)} generation returned empty output`);
  }

  if (trimmed.length < 100) {
    throw new Error(`${documentKindLabel(kind)} output is too short to be useful`);
  }

  if (/lorem ipsum|replace me|insert here|\[YOUR COMPANY\]|\[INSERT\]/i.test(trimmed)) {
    throw new Error(`${documentKindLabel(kind)} contains unfilled template placeholders`);
  }
}

function buildRawMarkdownPrompt(
  kind: GeneratedDocKind,
  project: MinimalProject,
  context?: string,
) {
  const purposeMap: Record<GeneratedDocKind, string> = {
    prd: "Capture what this product is, who it's for, what problem it solves, and what success looks like â€” in the voice of someone who deeply understands this specific idea.",
    srs: "Write out the concrete behaviors this system must have. Be specific to this product, not generic.",
    system_design: "Describe how this specific system is structured, what the moving parts are, and why those choices make sense for this product.",
    architecture: "Show the shape of this codebase and infrastructure â€” specific to the stack and scale of this product.",
    "design-system": "Document the visual and interaction language that fits this product's tone, audience, and use case.",
    "api-spec": "Define the API surface that this product actually needs, with the real endpoints, data shapes, and auth flows.",
    readme: "Write an orientation document for someone joining this project â€” cover what it is, how to run it, and how to contribute.",
    "folder-structure": "Show a practical, opinionated folder layout that fits this product's architecture.",
  };

  const contextLines = [
    `Product: ${project.title}`,
    `What it does: ${project.idea}`,
    project.description ? `More detail: ${project.description}` : null,
    `Stack: ${projectStackLine(project)}`,
    context ? `\nAdditional context: ${context}` : null,
  ];

  return [
    contextLines.filter(Boolean).join("\n"),
    "",
    purposeMap[kind],
    "",
    "Write in markdown. Use whatever structure makes sense for this specific product â€” don't default to standard PM doc sections unless they genuinely fit. Be concrete and specific; generic startup language is a failure mode.",
  ].join("\n");
}

async function callRawMarkdownDocumentAi(
  client: BackendContext["client"],
  kind: GeneratedDocKind,
  project: MinimalProject,
  context?: string,
) {
  const prompt = buildRawMarkdownPrompt(kind, project, context);
  const system = "You are a sharp technical writer helping a founder articulate their product clearly. Write like someone who deeply understands this specific product, not like someone filling out a template. Avoid generic sections and startup boilerplate.";
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      console.log(`[${kind}] InsForge google/gemini-2.5-flash-lite attempt=${attempt}`);
      const rawMarkdown = await callInsForgeAiChat(client, system, prompt, "google/gemini-2.5-flash-lite", 6000, 0.8);
      const markdown = sanitizeMarkdownOutput(rawMarkdown);
      validateGeneratedMarkdown(kind, markdown);
      return { markdown, provider: "InsForge", model: "google/gemini-2.5-flash-lite" };
    } catch (error) {
      lastError = error;
      console.log(`[${kind}] attempt ${attempt} failed`, error instanceof Error ? error.message : String(error));
      if (attempt === 2) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${documentKindLabel(kind)} generation failed`);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const PROMPT_VERSION = "v1";
const ROUTE_PREFIX = "/backend";
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitBuckets = new Map<string, number[]>();

function consumeRateLimit(key: string, limit: number) {
  const now = Date.now();
  const recent = (rateLimitBuckets.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000), 1);
    rateLimitBuckets.set(key, recent);
    return { allowed: false as const, retryAfterSeconds };
  }

  recent.push(now);
  rateLimitBuckets.set(key, recent);
  return { allowed: true as const, retryAfterSeconds: 0 };
}

function rateLimitResponse(route: string) {
  return jsonResponse(429, {
    success: false,
    error: `Too many requests for ${route}. Please try again in a minute.`,
  });
}

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

async function createRazorpayOrder(
  plan: RazorpayPlan,
  options?: {
    amountInInr?: number;
    description?: string;
    receiptPrefix?: string;
  },
) {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.");
  }

  const config = planConfig(plan);
  const amountInInr =
    plan === "custom" && options?.amountInInr && options.amountInInr > 0
      ? options.amountInInr
      : config.amountInInr;

  if (!amountInInr || amountInInr <= 0) {
    throw new Error(`Missing configured amount for ${plan} plan.`);
  }

  const amount = Math.round(amountInInr * 100);
  const receipt = `${options?.receiptPrefix ?? `plannr-${plan}`}-${Date.now()}`;
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
        amountInInr,
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
    description: options?.description ?? config.description,
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
    case "design-system":
      return "Design System";
    case "api-spec":
      return "API Specification";
    case "readme":
      return "README";
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

function extractOpenAIText(result: unknown) {
  const content = (result as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content ?? "";
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

function extractJsonArrayFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");
  const slice = firstBracket >= 0 && lastBracket > firstBracket ? raw.slice(firstBracket, lastBracket + 1) : raw;

  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
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

async function callOpenAIRaw(system: string, prompt: string, model: string, maxTokens = 3200) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  console.log(`[ai] OpenAI raw request start model=${model}`);
  const text = await fetchJsonTextWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
  }, 60000);
  console.log("[ai] OpenAI raw response received");
  const parsed = JSON.parse(text);
  console.log("[ai] OpenAI raw provider JSON", parsed);
  const extracted = extractOpenAIText(parsed);
  logMarkdownDebug("[ai] OpenAI extracted AI text", extracted);
  return extracted;
}

async function callInsForgeAiChat(
  client: BackendContext["client"],
  system: string,
  prompt: string,
  model: string,
  maxTokens = 4000,
  temperature = 0.8,
) {
  const completion = await client.ai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature,
    maxTokens,
  });
  const text = extractOpenAIText(completion);
  if (!text.trim()) throw new Error(`InsForge AI returned empty response`);
  return text;
}

function sanitizeMarkdown(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").trim();
}

type DocModelRoute = {
  provider: "OpenAI" | "InsForge";
  model: string;
  runner: (system: string, prompt: string) => Promise<string>;
};

function getDocModelRoute(kind: GeneratedDocKind): DocModelRoute {
  return {
    provider: "InsForge",
    model: "google/gemini-2.5-flash-lite",
    runner: (system, prompt) => callInsForgeAiChat(
      null as any,
      system,
      prompt,
      "google/gemini-2.5-flash-lite",
      6000,
      0.8,
    ),
  };
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
  // Count only completed spec bundles. `spec_history` is the canonical record
  // for a finished bundle, so partial or failed runs do not consume quota.
  const { data: completedSpecs, error: usageError } = await context.client.database
    .from("spec_history")
    .select("id")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });

  if (usageError) {
    throw new Error(usageError.message);
  }
  const used = completedSpecs?.length ?? 0;
  return {
    role: context.profile.role,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    blocked: context.profile.role !== "pro" && used >= limit,
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
    { document_type: "srs" as const, title: `${title} SRS` },
    { document_type: "system_design" as const, title: `${title} System Design` },
    { document_type: "architecture" as const, title: `${title} Architecture` },
    { document_type: "design-system" as const, title: `${title} Design System` },
    { document_type: "api-spec" as const, title: `${title} API Specification` },
    { document_type: "readme" as const, title: `${title} README` },
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

  logMarkdownDebug(`[${document.document_type}] final saved markdown`, contentMarkdown);
  return inserted as DocumentVersionRecord;
}

async function callAiForDocument(
  client: BackendContext["client"],
  kind: DocKind,
  project: ProjectRecord,
  generationContext?: {
    idea?: string;
    specs?: string;
    answers?: Record<string, unknown>;
    selectedOptions?: Record<string, unknown>;
    stackRecommendation?: Record<string, unknown>;
    questions?: Array<{ question: string; answer?: string }>;
  },
) {
  const contextParts: string[] = [];

  const idea = generationContext?.idea || project.idea;
  const specs = generationContext?.specs || project.description;

  if (idea) contextParts.push(`Idea: ${idea}`);
  if (specs) contextParts.push(`Context: ${specs}`);

  if (generationContext?.questions?.length) {
    const qaLines = generationContext.questions
      .filter((q) => q.question && q.answer)
      .map((q) => `- ${q.question}: ${q.answer}`);
    if (qaLines.length) {
      contextParts.push(`\nWhat the founder told us:\n${qaLines.join("\n")}`);
    }
  }

  const context = contextParts.join("\n") || undefined;

  const result = await callRawMarkdownDocumentAi(client, kind, project, context || undefined);
  return result;
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

function fallbackQuestionsForIdea(idea: string): Array<{ id: string; question: string; options: string[] }> {
  const normalized = idea.toLowerCase();
  const isMobile = /mobile|ios|android|app/.test(normalized);
  const isBooking = /book|booking|reserve|reservation|slot|schedule/.test(normalized);
  const isMarketplace = /marketplace|platform|multi[- ]vendor|vendor|seller|buyer/.test(normalized);
  const isSaaS = /dashboard|admin|team|workflow|analytics|crm|saas/.test(normalized);
  const isSocial = /social|community|chat|messaging|feed|forum/.test(normalized);
  const isAi = /\bai\b|artificial intelligence|chatbot|assistant|agent|recommend/i.test(normalized);

  const domainHints = [
    isBooking ? "availability windows, cancellations, and confirmations" : null,
    isMarketplace ? "buyers, sellers, commissions, and trust" : null,
    isSaaS ? "roles, permissions, and reporting" : null,
    isSocial ? "profiles, moderation, and engagement loops" : null,
    isAi ? "model quality, data sources, and safety" : null,
    isMobile ? "offline use, push notifications, and device-first UX" : null,
  ].filter(Boolean);

  const contextHint = domainHints.length
    ? ` with attention to ${domainHints.join(", ")}`
    : "";

  const featureHint = isBooking
    ? "court selection, time slots, payment flow, and booking rules"
    : isMarketplace
      ? "catalogs, search, seller onboarding, and order handling"
      : isSaaS
        ? "workspace setup, member access, and dashboard reporting"
        : isSocial
          ? "profiles, posting, discovery, and moderation"
          : isAi
            ? "prompt flow, model outputs, and human review"
            : "core user flow, key screens, and success path";

  return [
    {
      id: "q1",
      question: `Who is the primary user for this product${contextHint}?`,
      options: ["End customers", "Business admins", "Both audiences", "A niche specialist audience"],
    },
    {
      id: "q2",
      question: `What is the single most important outcome the product must deliver around ${featureHint}?`,
      options: ["Speed and convenience", "Trust and reliability", "Discovery and engagement", "Revenue and conversion"],
    },
    {
      id: "q3",
      question: `How should the product make money or justify its existence?`,
      options: ["Subscription", "One-time payment", "Commission or transaction fee", "Internal tool / no direct monetization"],
    },
    {
      id: "q4",
      question: `What level of scale should we design for first?`,
      options: ["Small pilot / MVP", "Hundreds of users", "Thousands of users", "Large multi-city or multi-region usage"],
    },
    {
      id: "q5",
      question: `Which capability is most critical in the first release?`,
      options: ["Simple core flow", "Rich dashboard or admin tools", "Notifications and reminders", "Payments and checkout"],
    },
    {
      id: "q6",
      question: `What is the biggest risk or constraint we need to account for?`,
      options: ["User trust and privacy", "Operational complexity", "Integration dependencies", "Performance and reliability"],
    },
    {
      id: "q7",
      question: `What should happen when something goes wrong in the product?`,
      options: ["Show clear recovery steps", "Retry automatically", "Escalate to support", "Block the action until verified"],
    },
  ];
}

async function generateQuestionsWithAi(
  client: BackendContext["client"],
  idea: string,
  specs?: string,
): Promise<Array<{ id: string; question: string; options: string[] }>> {
  const system = `You are a product discovery expert helping founders clarify their app idea before building.
Generate EXACTLY 7 multiple-choice questions that are highly specific to the product idea provided.
Each question must help understand: who uses it, what problem it solves, how it makes money, what scale, key features, competition, and unique constraints.
Questions must be product-specific — never generic. A turf booking app gets questions about courts, slots, payments, cancellations. A face app gets questions about AI features, selfie analysis, skin coaching.
Return ONLY a valid JSON array, no preamble, no markdown fences.
Format: [{ "id": "q1", "question": "...", "options": ["option text only", "option text only", "option text only", "option text only"] }, ...]
IMPORTANT: options must contain ONLY the answer text. Do NOT add "A:", "B:", "C:", "D:" prefixes. Do NOT number the options.
Exactly 7 objects. Each must have exactly 4 options. IDs must be q1 through q7.`;

  const prompt = `Product idea: ${idea}${specs ? `\nAdditional context: ${specs}` : ""}\n\nGenerate exactly 7 specific clarifying questions for this product.`;

  const text = await callInsForgeAiChat(client, system, prompt, "google/gemini-2.5-flash-lite", 1200, 0.8);

  console.error("[questions] raw AI response:", text);
  const clean = String(text).replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const parseJson = (input: string) => {
    const normalized = input.replace(/,\s*([}\]])/g, "$1").trim();
    return JSON.parse(normalized);
  };

  let rawQuestions: unknown;
  try {
    rawQuestions = parseJson(clean);
  } catch {
    const arrayMatch = clean.match(/\[[\s\S]*\]/);
    const objectMatch = clean.match(/\{[\s\S]*\}/);
    const candidate = arrayMatch?.[0] ?? objectMatch?.[0];
    if (!candidate) {
      console.error("[questions] No JSON array/object found in:", clean.slice(0, 300));
      throw new Error(`Failed to parse questions JSON: ${clean.slice(0, 200)}`);
    }
    try {
      rawQuestions = parseJson(candidate);
    } catch {
      console.error("[questions] Parse also failed:", candidate.slice(0, 300));
      throw new Error(`Failed to parse questions JSON: ${candidate.slice(0, 200)}`);
    }
  }

  const questionsArray = Array.isArray(rawQuestions)
    ? rawQuestions
    : Array.isArray((rawQuestions as any)?.questions)
      ? (rawQuestions as any).questions
      : null;

  if (!questionsArray || questionsArray.length !== 7) {
    throw new Error(`AI did not return exactly 7 questions, got: ${questionsArray?.length ?? 0}`);
  }
  const questions = questionsArray.map((q: any, index: number) => {
    if (!q || typeof q !== "object") throw new Error(`Question ${index + 1} is invalid`);

    const cleanOptions = Array.isArray(q.options)
      ? q.options.map((opt: string) =>
          String(opt)
            .replace(/^[A-D]\s*[:.)\-]\s*/i, "")
            .trim(),
        )
      : [];

    return {
      id: `q${index + 1}`,
      question: String(q.question ?? "").trim(),
      options: cleanOptions,
    };
  });

  // Validate cleaned questions
  for (const [index, q] of questions.entries()) {
    if (!q.question || q.question.length < 10) throw new Error(`Question ${index + 1} text invalid`);
    if (q.options.length !== 4 || q.options.some((o: string) => !o)) throw new Error(`Question ${index + 1} options invalid`);
  }

  return questions;
}

async function handleGenerateQuestions(ctx: BackendContext, req: Request) {
  const body = await readJsonBody(req);
  const idea = String(body.idea ?? "").trim();
  const specs = String(body.specs ?? "").trim();

  if (idea.length < 10) {
    return jsonResponse(400, { success: false, error: "Idea is required." });
  }

  try {
    const questions = await generateQuestionsWithAi(ctx.client, idea, specs || undefined);
    return jsonResponse(200, { success: true, questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[questions] failed:", message);
    return jsonResponse(500, {
      success: false,
      error: message,
    });
  }
}

async function handleCreatePaymentOrder(req: Request) {
  const body = await readJsonBody(req);
  const plan = String(body.plan ?? "").trim().toLowerCase();
  const amountInInr = Number(body.amountInInr ?? body.amount_in_inr ?? 0);
  const description = body.description ? String(body.description).trim() : undefined;
  const receiptPrefix = body.receiptPrefix ? String(body.receiptPrefix).trim() : undefined;

  if (!isRazorpayPlan(plan)) {
    return jsonResponse(400, { success: false, error: "Plan must be pro, enterprise, or custom." });
  }

  if (plan === "custom" && (!Number.isFinite(amountInInr) || amountInInr <= 0)) {
    return jsonResponse(400, { success: false, error: "Custom plans require a positive amountInInr." });
  }

  try {
    const order = await createRazorpayOrder(plan, {
      amountInInr: plan === "custom" ? amountInInr : undefined,
      description,
      receiptPrefix,
    });
    return jsonResponse(200, {
      success: true,
      plan,
      upiId: getBillingUpiId(),
      amountInInr: plan === "custom" ? amountInInr : order.amount / 100,
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
  const rateLimit = consumeRateLimit(`${ctx.user.id}:/generate/stack`, 20);
  if (!rateLimit.allowed) {
    return rateLimitResponse("/generate/stack");
  }

  const body = await readJsonBody(req);
  const idea = String(body.idea ?? "").trim();

  if (idea.length < 10) {
    return jsonResponse(400, { success: false, error: "Idea is required." });
  }

  const result = fallbackStackForIdea(idea);
  return jsonResponse(200, {
    success: true,
    ...result,
  });
}

async function handleCreateProject(ctx: BackendContext, req: Request) {
  const rateLimit = consumeRateLimit(`${ctx.user.id}:/project`, 5);
  if (!rateLimit.allowed) {
    return rateLimitResponse("/project");
  }

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
  const route = `/generate/${kind}`;
  const rateLimit = consumeRateLimit(`${ctx.user.id}:${route}`, 5);
  if (!rateLimit.allowed) {
    return rateLimitResponse(route);
  }

  const started = Date.now();
  const body = await readJsonBody(req);
  const projectId = String(body.projectId ?? body.project_id ?? "").trim();
  const force = Boolean(body.force ?? false);

  if (!isUuid(projectId)) {
    return jsonResponse(400, { success: false, error: "Valid projectId is required." });
  }

  const project = await getProjectOwnedByUser(ctx.client, projectId, ctx.user.id);
  const generationContext = kind === "prd" ? {
    idea: String(body.idea ?? project.idea ?? "").trim(),
    specs: String(body.specs ?? body.description ?? project.description ?? "").trim(),
    answers: toPlainRecord(body.answers ?? body.mcqAnswers ?? body.responses),
    selectedOptions: toPlainRecord(body.selectedOptions ?? body.selected_options),
    stackRecommendation: toPlainRecord(body.stackRecommendation ?? body.stack_recommendation ?? project.stack_recommendation),
    questions: Array.isArray(body.questions)
      ? body.questions
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const obj = item as Record<string, unknown>;
            return {
              question: String(obj.question ?? "").trim(),
              answer: String(obj.answer ?? obj.selected_option ?? obj.selectedOption ?? "").trim(),
            };
          })
          .filter((item): item is { question: string; answer?: string } => Boolean(item?.question))
      : [],
  } : undefined;
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
    const ai = await callAiForDocument(ctx.client, kind, project, generationContext);
    const version = await createDocumentVersion(ctx.client, doc, ai.markdown, ai.model);
    const designPreview =
      kind === "architecture"
        ? {
            content_markdown: version.content_markdown,
          }
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
        ai_model: ai.model,
        ai_provider: ai.provider,
        document_id: doc.id,
        version_id: version.id,
      },
    });

    if (kind === "readme") {
      await recordSpecHistory(
        ctx,
        project,
        `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${project.id}?scope=project&format=zip`,
      ).catch(() => {});
    }

    return jsonResponse(200, {
      success: true,
      projectId: project.id,
      document: doc,
      version,
      designPreview,
      aiModel: ai.model,
      downloadUrl: `${new URL(req.url).origin}${ROUTE_PREFIX}/download/${doc.id}?scope=document&format=md`,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Generation failed";

    await updateProject(ctx.client, project.id, { generation_state: "failed" }).catch(() => {});
    await updateDocumentStatus(ctx.client, doc.id, { status: "failed" }).catch(() => {});

    const usage = await getUsageState(ctx).catch(() => null);
    const isLimitError =
      error instanceof Error &&
      /Daily generation limit exceeded|free limit reached|quota/i.test(error.message);

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

async function handleDownload(ctx: BackendContext, req: Request, id: string) {
  const rateLimit = consumeRateLimit(`${ctx.user.id}:/download`, 20);
  if (!rateLimit.allowed) {
    return rateLimitResponse("/download");
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "md") as DownloadFormat;
  const scope = (url.searchParams.get("scope") ?? "document") as "document" | "project";
  if (!isUuid(id)) {
    return jsonResponse(400, { success: false, error: "Invalid id." });
  }

  if (scope === "project") {
    const project = await getProjectOwnedByUser(ctx.client, id, ctx.user.id);
    const docs = await listLatestDocumentsForProject(ctx.client, project.id);
    const zip = new JSZip();

    for (const doc of docs) {
      const latest = doc.latest_version;
      if (!latest) continue;
      zip.file(`${doc.document_type}/${slugify(doc.title)}.md`, latest.content_markdown);
    }

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
  if (Deno.env.get("PLANNR_DEBUG_LIMITS") === "1") {
    console.info("[usage]", {
      userId: ctx.user.id,
      role: state.role,
      used: state.used,
      limit: state.limit,
      remaining: state.remaining,
      blocked: state.blocked,
      source: "spec_history",
    });
  }
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

    if (req.method === "POST" && route === "/generate/srs") {
      return await handleGenerateDocument(context, req, "srs");
    }

    if (req.method === "POST" && route === "/generate/system-design") {
      return await handleGenerateDocument(context, req, "system_design");
    }

    if (req.method === "POST" && route === "/generate/architecture") {
      return await handleGenerateDocument(context, req, "architecture");
    }

    if (req.method === "POST" && route === "/generate/design-system") {
      return await handleGenerateDocument(context, req, "design-system");
    }

    if (req.method === "POST" && route === "/generate/api-spec") {
      return await handleGenerateDocument(context, req, "api-spec");
    }

    if (req.method === "POST" && route === "/generate/readme") {
      return await handleGenerateDocument(context, req, "readme");
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
      "POST /generate/srs",
      "POST /generate/system-design",
        "POST /generate/architecture",
      "POST /generate/design-system",
      "POST /generate/api-spec",
      "POST /generate/readme",
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



