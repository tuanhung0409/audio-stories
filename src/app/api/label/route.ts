import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Import settings from the settings route (internal API)
// In production, use a shared module instead
let labelingProvider: "gemini" | "openrouter" = "openrouter";
let geminiApiKeyOverride: string | null = null;
let openrouterApiKeyOverride: string | null = null;

/**
 * Model order to try. If the first model hits a 429, fall through to the next.
 * gemini-1.5-flash has a higher free-tier RPM/RPD than gemini-2.0-flash.
 * You can override the first model via GEMINI_MODEL env var.
 */
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-1.5-pro-vision",
];

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Đọc prompt template từ file prompts/label-prompt.md.
 * Cache lại sau lần đọc đầu tiên để tránh I/O lặp lại.
 */
let _cachedPromptTemplate: string | null = null;

function getLabelPromptTemplate(): string {
  if (_cachedPromptTemplate) return _cachedPromptTemplate;
  const filePath = path.join(process.cwd(), "prompts", "label-prompt.md");
  _cachedPromptTemplate = fs.readFileSync(filePath, "utf-8");
  return _cachedPromptTemplate;
}

/** Sleep for `ms` milliseconds */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract the retry delay (seconds) from a Gemini 429 response body.
 * Falls back to `defaultSeconds` if not found.
 */
function parseRetryDelay(body: unknown, defaultSeconds = 30): number {
  try {
    const details = (
      body as { error?: { details?: { retryDelay?: string }[] } }
    )?.error?.details;
    if (!Array.isArray(details)) return defaultSeconds;
    for (const d of details) {
      if (d?.retryDelay) {
        const secs = parseInt(String(d.retryDelay).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(secs)) return secs;
      }
    }
  } catch {
    // ignore parse errors
  }
  return defaultSeconds;
}

class GeminiQuotaError extends Error {
  isQuotaError = true;
}

/**
 * Call OpenRouter API for emotion labeling
 */
async function callOpenRouter(
  apiKey: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://audio-stories.local",
      "X-Title": "Audio Stories - Emotion Labeling",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "openrouter/free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.warn(
      `OpenRouter API error ${response.status}:`,
      data
    );
    if (response.status === 429) {
      throw new GeminiQuotaError(
        "OpenRouter API đang bị giới hạn. Vui lòng thử lại sau vài phút."
      );
    }
    throw new Error(
      data?.error?.message ||
      `OpenRouter API lỗi ${response.status}`
    );
  }

  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) {
    throw new Error("OpenRouter trả về kết quả rỗng");
  }

  return text;
}

/**
 * Tries each model in GEMINI_MODELS order.
 * For each model, retries once after the suggested delay on the first 429.
 * Returns the labeled text content on success.
 */
async function callGeminiWithFallback(
  apiKey: string,
  prompt: string
): Promise<string> {
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  });

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
    let lastErrBody: unknown = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (res.ok) {
        const data = await res.json();
        const text: string =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) return text;
        throw new Error("Gemini trả về kết quả rỗng");
      }

      lastErrBody = await res.json().catch(() => null);
      console.warn(
        `Gemini [${model}] attempt ${attempt + 1} → ${res.status}`,
        lastErrBody
      );

      if (res.status === 429) {
        if (attempt === 0) {
          // Wait the suggested delay then retry once on the same model
          const delaySecs = parseRetryDelay(lastErrBody, 25);
          console.log(`Rate limited on ${model}. Retrying in ${delaySecs}s…`);
          await sleep(delaySecs * 1000);
          continue;
        }
        // Second 429 on this model → move to next model
        break;
      }

      // Non-429 error – don't try other models
      throw new Error(`Gemini API lỗi ${res.status} (model: ${model})`);
    }

    console.warn(`Model ${model} quota exhausted, trying next model…`);
  }

  // All models exhausted
  throw new GeminiQuotaError(
    "Tất cả model Gemini đều hết quota free-tier. " +
      "Vui lòng thử lại sau vài phút hoặc kích hoạt billing tại https://ai.dev/rate-limit"
  );
}

/**
 * POST /api/label
 * Calls AI API (Gemini or OpenRouter) to apply emotion labels to raw story text.
 * Body: { textContent: string, provider?: "gemini" | "openrouter", apiKey?: string }
 */
export async function POST(request: Request) {
  // Check admin authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { textContent, provider: requestProvider, apiKey: requestApiKey } = await request.json();

    if (!textContent || typeof textContent !== "string") {
      return NextResponse.json(
        { error: "Missing required field: textContent" },
        { status: 400 }
      );
    }

    // Determine provider and API key
    const provider = requestProvider || labelingProvider || "gemini";
    let apiKey = requestApiKey || geminiApiKeyOverride;

    if (provider === "gemini") {
      apiKey = requestApiKey || geminiApiKeyOverride || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your-gemini-api-key-here") {
        return NextResponse.json(
          { error: "GEMINI_API_KEY chưa được cấu hình trong .env" },
          { status: 500 }
        );
      }
    } else if (provider === "openrouter") {
      apiKey = requestApiKey || openrouterApiKeyOverride || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OpenRouter API key chưa được cấu hình. Vui lòng nhập token trong settings." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    const prompt = getLabelPromptTemplate().replace("{{STORY}}", textContent);

    let labeledContent: string;
    if (provider === "openrouter") {
      labeledContent = await callOpenRouter(apiKey, prompt);
    } else {
      labeledContent = await callGeminiWithFallback(apiKey, prompt);
    }

    return NextResponse.json({ labeledContent });
  } catch (error) {
    console.error("Label route error:", error);

    if (error instanceof GeminiQuotaError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Lỗi khi gán nhãn cảm xúc",
      },
      { status: 500 }
    );
  }
}

/**
 * Export functions for updating settings from dashboard
 */
export function setLabelingProvider(
  provider: "gemini" | "openrouter",
  apiKey: string
) {
  labelingProvider = provider;
  if (provider === "gemini") {
    geminiApiKeyOverride = apiKey;
  } else {
    openrouterApiKeyOverride = apiKey;
  }
}
