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

// 3. Generate all docs
const DOC_PROMPTS: Record<string, string> = {
  prd: "Write a comprehensive Product Requirements Document (PRD) in Markdown. Include: Overview, Goals, Target Users, User Stories, Features (MVP + Future), Success Metrics, Constraints. Be specific and detailed.",
  srs: "Write a Software Requirements Specification (SRS) in Markdown. Include: Functional Requirements (numbered), Non-Functional Requirements (performance, security, scalability), External Interfaces, Data Requirements.",
  architecture: "Write a system ARCHITECTURE document in Markdown. Include: High-level diagram (use ASCII or mermaid), Components & responsibilities, Data flow, Deployment topology, Key design decisions.",
  designSystem: "Write a DESIGN_SYSTEM document in Markdown. Include: Brand principles, Color palette (with hex), Typography, Spacing scale, Component patterns, Accessibility notes.",
  apiSpec: "Write an API_SPEC document in Markdown. Include: Authentication, REST endpoints (method, path, request, response), Error codes, Rate limits. Use code blocks for examples.",
  readme: "Write a polished README.md. Include: Project name & tagline, Features, Tech stack, Getting started, Project structure, Contributing, License.",
};

export const generateDocument = createServerFn({ method: "POST" })
  .inputValidator((d: { docType: keyof typeof DOC_PROMPTS; projectName: string; idea: string; answers: Record<string, string>; stack: any }) => d)
  .handler(async ({ data }) => {
    const prompt = DOC_PROMPTS[data.docType];
    const result = await callAI([
      {
        role: "system",
        content: `You are a senior product engineer writing professional project documentation. Output ONLY valid Markdown — no preamble, no "Sure, here's...". Start directly with the # heading.`,
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
