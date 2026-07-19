import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AnalyzeProviderError } from "@/lib/analyze-errors";
import { analyzeResume } from "@/lib/analyze-resume";
import { getFallbackAnalysisResult } from "@/lib/schema";
import { logError, maskApiKey } from "@/lib/server-logger";

interface AnalyzeRequestBody {
  resume?: unknown;
  resumeText?: unknown;
  jobDescription?: unknown;
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  console.log("[api/analyze] POST received");

  const keyInfo = maskApiKey(process.env.GEMINI_API_KEY);
  console.log("[api/analyze] GEMINI_API_KEY status:", {
    exists: keyInfo.exists,
    length: keyInfo.length,
    preview: keyInfo.preview,
  });

  try {
    let body: AnalyzeRequestBody;

    try {
      body = (await request.json()) as AnalyzeRequestBody;
    } catch (jsonError) {
      logError("[api/analyze] Failed to parse request JSON body:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    console.log("[api/analyze] Incoming request body:", {
      keys: Object.keys(body ?? {}),
      resumeTextLength:
        typeof body.resumeText === "string" ? body.resumeText.length : null,
      resumeLength: typeof body.resume === "string" ? body.resume.length : null,
      jobDescriptionLength:
        typeof body.jobDescription === "string"
          ? body.jobDescription.length
          : null,
      body,
    });

    const resumeText =
      readNonEmptyString(body.resumeText) ?? readNonEmptyString(body.resume);
    const jobDescription = readNonEmptyString(body.jobDescription);

    if (!resumeText) {
      console.error("[api/analyze] Validation failed: resume text missing");
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    if (!jobDescription) {
      console.error("[api/analyze] Validation failed: job description missing");
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    const outcome = await analyzeResume({ resumeText, jobDescription });

    if (outcome.source === "fallback") {
      console.error(
        "[api/analyze] Responding with FALLBACK analysis result:",
        outcome.result
      );
    } else {
      console.log(
        "[api/analyze] Responding with Gemini analysis result:",
        outcome.result
      );
    }

    return NextResponse.json(outcome.result);
  } catch (error) {
    if (error instanceof AnalyzeProviderError) {
      console.error("[api/analyze] Provider error (no fallback):", {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    logError("[api/analyze] Unexpected error:", error);

    if (error instanceof ZodError) {
      const fallback = getFallbackAnalysisResult();
      console.error(
        "[api/analyze] ZodError in route — RETURNING FALLBACK RESPONSE:",
        fallback
      );
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      { error: "Something went wrong while analyzing the match." },
      { status: 500 }
    );
  }
}
