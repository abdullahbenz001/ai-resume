import { ApiError, Type } from "@google/genai";
import { ZodError } from "zod";

import {
  AnalyzeProviderError,
  isInsufficientQuotaError,
} from "@/lib/analyze-errors";
import { getGeminiClient, hasGeminiApiKey } from "@/lib/gemini";
import {
  getFallbackAnalysisResult,
  parseAnalysisResult,
  type AnalysisResult,
} from "@/lib/schema";
import { logError, maskApiKey } from "@/lib/server-logger";

const MODEL = "gemini-3.5-flash";
const MAX_INPUT_CHARS = 12_000;

export interface AnalyzeResumeInput {
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeResumeOutcome {
  result: AnalysisResult;
  source: "gemini" | "fallback";
}

const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["score", "strengths", "missingSkills", "suggestions"],
};

function truncate(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n\n[Truncated for length]`;
}

function buildSystemInstruction(): string {
  return [
    "You are an expert technical recruiter and career coach.",
    "Compare the candidate resume against the job description.",
    "Respond with JSON only — no markdown, no prose outside the JSON object.",
    "Be specific, practical, and honest.",
    "score must be a number from 0 to 100.",
    "strengths: skills/experience clearly evidenced in the resume that the job needs.",
    "missingSkills: important requirements weak or absent on the resume.",
    "suggestions: concrete resume edits the candidate can make.",
    "Do not invent employment history that is not in the resume.",
  ].join(" ");
}

function buildUserPrompt(input: AnalyzeResumeInput): string {
  const resumeText = truncate(input.resumeText, MAX_INPUT_CHARS);
  const jobDescription = truncate(input.jobDescription, MAX_INPUT_CHARS);

  return [
    "Analyze the resume against this job description.",
    "",
    "=== RESUME ===",
    resumeText,
    "",
    "=== JOB DESCRIPTION ===",
    jobDescription,
  ].join("\n");
}

/**
 * Safely extract a JSON value from model text that may include
 * markdown fences or surrounding prose.
 */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    // Continue with safer extraction strategies.
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as unknown;
    } catch {
      // Continue.
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
  }

  throw new SyntaxError("Could not extract JSON from model response.");
}

async function callGemini(input: AnalyzeResumeInput): Promise<AnalysisResult> {
  console.log("[analyze-resume] Initializing Gemini client…");
  const ai = getGeminiClient();

  console.log("[analyze-resume] Calling Gemini models.generateContent", {
    model: MODEL,
    temperature: 0.2,
    resumeChars: input.resumeText.length,
    jobDescriptionChars: input.jobDescription.length,
  });

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: buildUserPrompt(input),
      config: {
        temperature: 0.2,
        systemInstruction: buildSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      },
    });
  } catch (apiError) {
    console.error("[analyze-resume] Gemini API error:", apiError);
    throw apiError;
  }

  const rawContent = response.text?.trim() ?? "";

  console.log("[analyze-resume] Exact Gemini response BEFORE Zod parsing:", {
    model: MODEL,
    finishReason: response.candidates?.[0]?.finishReason ?? null,
    content: rawContent,
    usage: response.usageMetadata ?? null,
  });

  if (!rawContent) {
    throw new Error("Empty model response.");
  }

  let json: unknown;
  try {
    json = extractJson(rawContent);
  } catch (parseError) {
    console.error(
      "[analyze-resume] Invalid JSON from Gemini response:",
      rawContent
    );
    logError(
      "[analyze-resume] Failed to extract/parse Gemini JSON before Zod:",
      parseError
    );
    throw parseError;
  }

  console.log(
    "[analyze-resume] Parsed JSON object (still before Zod validation):",
    json
  );

  try {
    const validated = parseAnalysisResult(json);
    console.log("[analyze-resume] Zod validation succeeded:", validated);
    return validated;
  } catch (zodError) {
    console.error(
      "[analyze-resume] Schema validation failure for Gemini response:",
      json
    );
    logError(
      "[analyze-resume] Zod validation failed for Gemini response:",
      zodError
    );
    if (zodError instanceof ZodError) {
      console.error(
        "[analyze-resume] Zod issues:",
        JSON.stringify(zodError.issues, null, 2)
      );
    }
    throw zodError;
  }
}

function toFallback(reason: string, error?: unknown): AnalyzeResumeOutcome {
  if (error !== undefined) {
    logError("[analyze-resume] Error that triggered fallback:", error);
  }

  const fallback = getFallbackAnalysisResult();
  console.error("[analyze-resume] RETURNING FALLBACK RESPONSE:", {
    reason,
    fallback,
  });

  return {
    result: fallback,
    source: "fallback",
  };
}

/**
 * Calls Gemini for resume/job match analysis.
 * - Provider/config failures (quota, auth, missing key) throw AnalyzeProviderError
 * - Invalid AI output falls back to a safe validated object
 */
export async function analyzeResume(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutcome> {
  const keyInfo = maskApiKey(process.env.GEMINI_API_KEY);
  console.log("[analyze-resume] GEMINI_API_KEY status:", {
    exists: keyInfo.exists,
    length: keyInfo.length,
    preview: keyInfo.preview,
    hasGeminiApiKey: hasGeminiApiKey(),
  });

  if (!hasGeminiApiKey()) {
    throw new AnalyzeProviderError(
      "GEMINI_API_KEY is missing. Add it to .env.local and restart the dev server.",
      { status: 503, code: "missing_key" }
    );
  }

  try {
    const result = await callGemini(input);
    console.log("[analyze-resume] Returning Gemini-validated result", {
      source: "gemini",
      score: result.score,
    });
    return { result, source: "gemini" };
  } catch (error) {
    logError("[analyze-resume] Caught error during analysis:", error);

    if (error instanceof AnalyzeProviderError) {
      throw error;
    }

    if (isInsufficientQuotaError(error)) {
      console.error(
        "[analyze-resume] Gemini quota/billing error — not using fallback."
      );
      throw new AnalyzeProviderError(
        "Gemini quota exceeded. Check your plan and billing at https://ai.google.dev/gemini-api/docs/rate-limits and try again.",
        { status: 402, code: "quota" }
      );
    }

    if (error instanceof ApiError) {
      console.error("[analyze-resume] Gemini API error:", {
        status: error.status,
        message: error.message,
      });

      if (error.status === 401 || error.status === 403) {
        throw new AnalyzeProviderError(
          "Gemini authentication failed. Check that GEMINI_API_KEY in .env.local is valid.",
          { status: 401, code: "auth" }
        );
      }

      if (error.status === 429) {
        throw new AnalyzeProviderError(
          "Gemini rate limit hit. Wait a moment and try again.",
          { status: 429, code: "rate_limit" }
        );
      }

      if (error.status === 404) {
        throw new AnalyzeProviderError(
          `Gemini model "${MODEL}" was not found or is unavailable. Update the model ID in lib/analyze-resume.ts.`,
          { status: 502, code: "upstream" }
        );
      }

      throw new AnalyzeProviderError(
        `Gemini API error (${error.status}): ${error.message}`,
        {
          status: error.status >= 400 && error.status < 500 ? 502 : error.status,
          code: "upstream",
        }
      );
    }

    // Invalid/unusable model output → keep fallback so the UI still works.
    if (error instanceof SyntaxError) {
      return toFallback(
        "Model returned invalid JSON. Returning fallback analysis.",
        error
      );
    }

    if (error instanceof ZodError) {
      return toFallback(
        "Gemini response failed Zod validation. Returning fallback analysis.",
        error
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown analysis failure.";
    return toFallback(`${message} Returning fallback analysis.`, error);
  }
}
