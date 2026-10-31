import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/app-error";
import { readBoundedBody } from "@/lib/request-body";
import { optimizeResume } from "@/features/optimizer/services/optimizer";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const text = new TextDecoder().decode(await readBoundedBody(request, 80000));
    let input: unknown;
    try { input = JSON.parse(text); }
    catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    return NextResponse.json(await optimizeResume(input), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input." }, { status: 400 });
    if (error instanceof AppError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Optimization is unavailable. Please try again." }, { status: 500 });
  }
}
