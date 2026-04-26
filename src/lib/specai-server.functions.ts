import { createServerFn } from "@tanstack/react-start";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(messages: Array<{ role: string; content: string }>, tools?: any[], toolChoice?: any) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const body: any = { model: MODEL, messages };
  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    const t = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

// 1. Generate clarifying questions
export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: { idea: string; specs?: string }) => d)
  .handler(async ({ data }) => {
    const result = await callAI(
      [
        {
          role: "system",
          content:
            "You are SpecAI, a senior product strategist. Given an app idea, ask 6-8 sharp multiple-choice clarifying questions that surface platform, language preference, backend, auth, scaling, and key differentiators. Each question MUST have 3-5 concrete, distinct answer options the user can pick from (no free text). Options should be short (1-6 words) and mutually exclusive. Always include a sensible 'Other / custom' style option only if truly needed.",
        },
        {
          role: "user",
          content: `Idea: ${data.idea}\n\nAdditional specs: ${data.specs || "(none)"}\n\nReturn structured multiple-choice questions.`,
        },
      ],
      [
        {
          type: "function",
          function: {
            name: "ask_questions",
            description: "Return 6-8 multiple-choice clarifying questions",
            parameters: {
              type: "object",
              properties: {
                projectName: { type: "string", description: "A short, catchy project name based on the idea" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      question: { type: "string" },
                      options: {
                        type: "array",
                        description: "3-5 short answer choices",
                        items: { type: "string" },
                        minItems: 3,
                        maxItems: 5,
                      },
                    },
                    required: ["id", "question", "options"],
                  },
                },
              },
              required: ["projectName", "questions"],
            },
          },
        },
      ],
      { type: "function", function: { name: "ask_questions" } },
    );

    const args = JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
    return args as { projectName: string; questions: Array<{ id: string; question: string; options: string[] }> };
  });

// 2. Recommend stack
export const recommendStack = createServerFn({ method: "POST" })
  .inputValidator((d: { idea: string; answers: Record<string, string> }) => d)
  .handler(async ({ data }) => {
    const result = await callAI(
      [
        {
          role: "system",
          content:
            "You are a pragmatic tech lead. Recommend a modern, production-ready stack tailored to the user's idea and answers. Prefer popular, well-supported choices.",
        },
        {
          role: "user",
          content: `Idea: ${data.idea}\n\nAnswers:\n${Object.entries(data.answers)
            .map(([q, a]) => `Q: ${q}\nA: ${a}`)
            .join("\n\n")}`,
        },
      ],
      [
        {
          type: "function",
          function: {
            name: "recommend",
            parameters: {
              type: "object",
              properties: {
                frontend: { type: "string" },
                backend: { type: "string" },
                database: { type: "string" },
                auth: { type: "string" },
                hosting: { type: "string" },
                rationale: { type: "string", description: "2-3 sentences explaining the stack choice" },
              },
              required: ["frontend", "backend", "database", "auth", "hosting", "rationale"],
            },
          },
        },
      ],
      { type: "function", function: { name: "recommend" } },
    );
    return JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
  });

// 3. Generate all docs — modeled on the Vivek Mishra "Stop Vibe Coding Without a Plan"
// PRD framework: every doc is exhaustive, numbered, table-driven, and production-grade.
const DOC_PROMPTS: Record<string, string> = {
  prd: `Write a COMPLETE, production-grade Product Requirements Document in Markdown, modeled exactly on the Vivek Mishra PRD framework.

Required structure (use these exact numbered sections and subsections):

# {Project Name}
## Product Requirements Document

A short metadata table at the top with rows: Version | Date | Tech Stack | Status | Author.

## 1. Executive Summary
2-3 paragraphs. State what the product is, who it serves, and the methodology used to plan it.

## 2. Product Overview
### 2.1 What This Platform Does
### 2.2 Core Responsibilities (bullet list of every backend/frontend responsibility)
### 2.3 Tech Stack Decisions — render as a Markdown table (Component | Choice | Reason)

## 3. System Architecture
### 3.1 Architecture Pattern
### 3.2 Request Flow (numbered 1..N)
### 3.3 Folder Structure (code block tree)

## 4. Data Models
For every collection/table, include a Markdown TABLE: Field | Type | Required | Unique | Description. Cover at minimum: Users, Projects, UsageRecords, Subscriptions, AuditLogs (adapt names to the project).

## 5. Features (MVP + Phase 2)
Numbered list with acceptance criteria for each feature.

## 6. User Stories
Format: "As a <role>, I want <action>, so that <outcome>."

## 7. Success Metrics
Table: Metric | Target | Measurement Method.

## 8. Constraints & Assumptions

## 9. Open Items for Phase 2

Rules:
- Use Markdown tables liberally — they are the visual signature of this PRD style.
- Be specific to the user's idea, answers, and stack. Do NOT generalize.
- No filler. Every section must contain real, decision-ready content.`,

  srs: `Write a Software Requirements Specification (SRS) in Markdown following the Vivek Mishra style.

Structure:
# {Project Name} — SRS
## 1. Introduction (Purpose, Scope, Definitions)
## 2. Functional Requirements
   Numbered FR-1, FR-2, … each with: ID | Description | Priority | Acceptance Criteria (use a table per group).
## 3. Non-Functional Requirements
   Sub-sections: Performance, Security, Scalability, Availability, Maintainability — each with measurable targets in tables.
## 4. External Interfaces (APIs, third-party services, hardware) — table form.
## 5. Data Requirements (entity list + retention policies) — table form.
## 6. Constraints & Assumptions
## 7. Acceptance & Sign-off Criteria

Use Markdown tables wherever you list more than 2 attributes per item.`,

  architecture: `Write a System ARCHITECTURE document in Markdown matching the Vivek Mishra reference style.

Structure:
# {Project Name} — System Architecture

## 1. Architecture Pattern
Explain hybrid/monolith/microservices choice and WHY it fits this idea.

## 2. High-Level Diagram
Use a \`\`\`mermaid graph LR\`\`\` block showing Client → Edge/API → Services → Data stores → External providers.

## 3. Components & Responsibilities
Markdown TABLE: Component | Responsibility | Tech | Scaling Notes.

## 4. Request Flow
Numbered list (1..N) describing a typical request from client → response.

## 5. Data Flow
Describe writes vs reads, async jobs, webhooks.

## 6. Folder Structure
A code block with the exact folder tree (group by feature, not file type).

## 7. Deployment Topology
Mermaid or table: where each service runs, regions, CDN, DB tier.

## 8. Middleware Stack (ordered)
6.1 Auth · 6.2 Rate limit · 6.3 Validation · 6.4 Logging · 6.5 Error handler — describe each.

## 9. Security Considerations
Bullet list grouped by: Auth, API, Data, Secrets.

## 10. Scaling Triggers
Table: Signal | Threshold | Action.

Be specific to the user's stack — name actual services (e.g., "Vercel Edge", "MongoDB Atlas M10", "Stripe Billing").`,

  designSystem: `Write a DESIGN_SYSTEM document in Markdown.

Sections:
# {Project Name} — Design System
## 1. Brand Principles (3-5 principles)
## 2. Color Palette — TABLE: Token | Hex | Usage. Cover background, surface, primary, primary-foreground, accent, muted, destructive, border, ring.
## 3. Typography — TABLE: Role | Font | Weight | Size | Line-height. Cover display, h1-h4, body, mono, caption.
## 4. Spacing & Radius scale (table)
## 5. Component Patterns (Button, Input, Card, Modal, Toast) — describe variants + states.
## 6. Motion (durations, easings) — table.
## 7. Accessibility — contrast targets, focus states, keyboard nav.`,

  apiSpec: `Write an exhaustive API_SPEC in Markdown matching the Vivek Mishra endpoint catalogue style.

Structure:
# {Project Name} — API Specification

## 1. Conventions (base URL, versioning, content-type, auth header)

## 2. Authentication
Describe JWT/refresh-token flow, cookie strategy, RBAC roles.

## 3. Error Format
Show a JSON error envelope and a TABLE of all error codes: Code | HTTP | Meaning | When.

## 4. Endpoints — Complete Specification
Group endpoints into logical sections (4.1 Auth, 4.2 Users, 4.3 Resources, 4.4 Payments, 4.5 Admin — adapt to the project).

For EVERY endpoint use this exact format:

### {METHOD} {/path}
A small TABLE with rows: Method | Path | Auth Required | Rate Limit | Description.

**Request Body** — bullet list of fields with types.

**Success Response — {status} {Name}** — bullet list of fields.

**Error Responses** — bullet list of (status → reason).

**Actions** — numbered list of server-side steps performed.

## 5. Webhooks (if applicable) — list each event with idempotency notes.

## 6. Rate Limits — TABLE: Tier | Endpoint group | Limit.

Cover at minimum: register, login, refresh, logout, password reset, profile CRUD, the project's core resources, and any payment/admin endpoints implied by the idea.`,

  readme: `Write a polished README.md.
Sections: Project name + tagline · Badges placeholder · Features · Tech Stack (table) · Quick Start (numbered) · Environment Variables (table) · Project Structure (tree) · Scripts · Deployment · Contributing · License.`,
};

export const generateDocument = createServerFn({ method: "POST" })
  .inputValidator((d: { docType: keyof typeof DOC_PROMPTS; projectName: string; idea: string; answers: Record<string, string>; stack: any }) => d)
  .handler(async ({ data }) => {
    const prompt = DOC_PROMPTS[data.docType];
    const result = await callAI([
      {
        role: "system",
        content: `You are a senior product engineer writing professional, decision-ready project documentation in the style of the "Stop Vibe Coding Without a Plan" PRD framework by Vivek Mishra. Output ONLY valid Markdown — no preamble, no "Sure, here's...". Start directly with the # heading. Use Markdown tables liberally for any structured data (fields, endpoints, components, metrics). Be exhaustive and specific to the user's idea — no placeholder text.`,
      },
      {
        role: "user",
        content: `Project: ${data.projectName}\nIdea: ${data.idea}\n\nUser answers:\n${Object.entries(data.answers).map(([q, a]) => `• ${q}: ${a}`).join("\n")}\n\nStack: ${JSON.stringify(data.stack)}\n\nTask: ${prompt}`,
      },
    ]);
    return { content: result.choices[0].message.content as string };
  });

// 4. Generate folder structure JSON
export const generateFolderStructure = createServerFn({ method: "POST" })
  .inputValidator((d: { projectName: string; stack: any }) => d)
  .handler(async ({ data }) => {
    const result = await callAI(
      [
        {
          role: "system",
          content: "You design clean, conventional project folder structures.",
        },
        {
          role: "user",
          content: `Project: ${data.projectName}\nStack: ${JSON.stringify(data.stack)}\n\nGenerate a recommended folder/file structure.`,
        },
      ],
      [
        {
          type: "function",
          function: {
            name: "structure",
            parameters: {
              type: "object",
              properties: {
                root: { type: "string" },
                tree: {
                  type: "array",
                  description: "Nested file tree",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["file", "folder"] },
                      description: { type: "string" },
                      children: { type: "array", items: { type: "object" } },
                    },
                    required: ["name", "type"],
                  },
                },
              },
              required: ["root", "tree"],
            },
          },
        },
      ],
      { type: "function", function: { name: "structure" } },
    );
    return JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
  });
