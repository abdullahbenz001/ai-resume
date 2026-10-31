import { readBoundedBody } from "@/lib/request-body";
import { consumeApiQuota } from "@/lib/rate-limit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { runAnalysis } from "@/features/analysis/services/analysis";
import { AppError } from "@/lib/app-error";
import { AnalyzeProviderError } from "@/lib/analyze-errors";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  try {
    const text = new TextDecoder().decode(
      await readBoundedBody(request, 120000),
    );
    let input: unknown;
    try {
      input = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    await consumeApiQuota(userId, "analysis");
    const result = await runAnalysis(input);
    for (const path of ["/resumes", "/history", "/dashboard"])
      revalidatePath(path);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input." },
        { status: 400 },
      );
    if (error instanceof AppError || error instanceof AnalyzeProviderError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error("[analysis] Failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: "Analysis could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
