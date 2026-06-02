import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { insforge } from "@/integrations/insforge/client";

type Question = {
  id: string;
  question: string;
  options: string[];
};

type GenerateQuestionsInput = {
  idea: string;
  specs?: string;
};

const QUESTION_RATE_LIMIT_WINDOW_MS = 60_000;
const questionRateLimitBuckets = new Map<string, number[]>();

function getRequestIp() {
  const request = getRequest();
  const headers = request?.headers;
  if (!headers) return "unknown";

  return (
    headers.get("cf-connecting-ip") ||
    headers.get("fly-client-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("true-client-ip") ||
    "unknown"
  );
}

function consumeQuestionRateLimit(limit: number) {
  const key = getRequestIp();
  const now = Date.now();
  const recent = (questionRateLimitBuckets.get(key) ?? []).filter((timestamp) => now - timestamp < QUESTION_RATE_LIMIT_WINDOW_MS);

  if (recent.length >= limit) {
    questionRateLimitBuckets.set(key, recent);
    return false;
  }

  recent.push(now);
  questionRateLimitBuckets.set(key, recent);
  return true;
}

function deriveProjectName(idea: string) {
  const words = idea
    .replace(/[^a-z0-9\s]+/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  if (!words.length) return "Untitled Project";

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const generateQuestions = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: GenerateQuestionsInput }) => {
    if (!consumeQuestionRateLimit(10)) {
      throw new Error("Too many requests for questions generation. Please try again in a minute.");
    }

    const system = `You are a product discovery expert helping founders clarify their app idea before building.
Generate EXACTLY 7 multiple-choice questions that are highly specific to the product idea provided.
Each question must help understand: who uses it, what problem it solves, how it makes money, what scale, key features, competition, and unique constraints.
Questions must be product-specific - never generic. A turf booking app gets questions about courts, slots, payments, cancellations. A face app gets questions about AI features, selfie analysis, skin coaching.
Return ONLY a valid JSON array, no preamble, no markdown fences.
Format: [{ "id": "q1", "question": "...", "options": ["option text only", "option text only", "option text only", "option text only"] }, ...]
IMPORTANT: options must contain ONLY the answer text. Do NOT add "A:", "B:", "C:", "D:" prefixes. Do NOT number the options.
Exactly 7 objects. Each must have exactly 4 options. IDs must be q1 through q7.`;

    const prompt = `Product idea: ${data.idea}${data.specs ? `\nAdditional context: ${data.specs}` : ""}\n\nGenerate exactly 7 specific clarifying questions for this product.`;

    const completion = await insforge.ai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 1200,
    });

    const text = String(completion?.choices?.[0]?.message?.content ?? "").trim();
    if (!text) {
      throw new Error("Failed to generate questions");
    }

    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let rawQuestions: unknown;
    try {
      rawQuestions = JSON.parse(clean);
    } catch {
      const arrayMatch = clean.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        throw new Error(`Failed to parse questions JSON: ${clean.slice(0, 200)}`);
      }

      rawQuestions = JSON.parse(arrayMatch[0]);
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

    for (const [index, q] of questions.entries()) {
      if (!q.question || q.question.length < 10) throw new Error(`Question ${index + 1} text invalid`);
      if (q.options.length !== 4 || q.options.some((o: string) => !o)) throw new Error(`Question ${index + 1} options invalid`);
    }

    return {
      projectName: deriveProjectName(data.idea),
      questions,
    };
  },
);
