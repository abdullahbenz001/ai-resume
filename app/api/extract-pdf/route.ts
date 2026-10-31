import { readBoundedBody } from "@/lib/request-body";
import { consumeApiQuota } from "@/lib/rate-limit";
import { AppError } from "@/lib/app-error";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { extractTextFromPdf, PdfExtractionError } from "@/lib/pdf";
import { RESUME_PDF_MAX_BYTES } from "@/lib/resume-pdf";
import { logError } from "@/lib/server-logger";

export const runtime = "nodejs";

function isPdfFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".pdf")) return true;
  return file.type === "application/pdf";
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  try {
    const bytesBody = await readBoundedBody(
      request,
      RESUME_PDF_MAX_BYTES + 65536,
    );
    let formData: FormData;

    try {
      formData = await new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: bytesBody,
      }).formData();
    } catch (error) {
      logError("[api/extract-pdf] Failed to parse multipart body:", error);
      return NextResponse.json(
        { error: "Invalid upload payload." },
        { status: 400 },
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A PDF file is required." },
        { status: 400 },
      );
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "This PDF appears to be empty." },
        { status: 400 },
      );
    }

    if (file.size > RESUME_PDF_MAX_BYTES) {
      return NextResponse.json(
        { error: "PDF must be 5MB or smaller." },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
      return NextResponse.json({ error: "Invalid PDF file." }, { status: 422 });
    await consumeApiQuota(userId, "pdf");
    const text = await extractTextFromPdf(bytes);
    if (text.length > 12000)
      return NextResponse.json(
        {
          error:
            "Resume exceeds 12,000 characters. Paste a shorter version instead.",
        },
        { status: 422 },
      );

    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    if (error instanceof PdfExtractionError) {
      console.error("[api/extract-pdf] Extraction failed:", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    logError("[api/extract-pdf] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from this PDF." },
      { status: 500 },
    );
  }
}
