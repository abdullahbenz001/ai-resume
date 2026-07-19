import { NextResponse } from "next/server";

import {
  extractTextFromPdf,
  PdfExtractionError,
} from "@/lib/pdf";
import { RESUME_PDF_MAX_BYTES } from "@/lib/resume-pdf";
import { logError } from "@/lib/server-logger";

export const runtime = "nodejs";

function isPdfFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".pdf")) return true;
  return file.type === "application/pdf";
}

export async function POST(request: Request) {
  try {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error) {
      logError("[api/extract-pdf] Failed to parse multipart body:", error);
      return NextResponse.json(
        { error: "Invalid upload payload." },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A PDF file is required." },
        { status: 400 }
      );
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "This PDF appears to be empty." },
        { status: 400 }
      );
    }

    if (file.size > RESUME_PDF_MAX_BYTES) {
      return NextResponse.json(
        { error: "PDF must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = await extractTextFromPdf(bytes);

    return NextResponse.json({ text });
  } catch (error) {
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
      { status: 500 }
    );
  }
}
