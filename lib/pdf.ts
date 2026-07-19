import { pathToFileURL } from "node:url";

import { CanvasFactory, getData, getPath } from "pdf-parse/worker";
import {
  FormatError,
  InvalidPDFException,
  PasswordException,
  PDFParse,
} from "pdf-parse";

export type PdfExtractionErrorCode =
  | "empty"
  | "corrupted"
  | "password"
  | "failed";

export class PdfExtractionError extends Error {
  readonly code: PdfExtractionErrorCode;

  constructor(
    message: string,
    code: PdfExtractionErrorCode,
    options?: { cause?: unknown }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "PdfExtractionError";
    this.code = code;
  }
}

let workerConfigured = false;

/**
 * Configure pdf.js worker for Node/Next.js.
 * Prefer getData() on Windows — absolute paths break the ESM loader there.
 */
function ensurePdfWorker(): void {
  if (workerConfigured) return;

  try {
    PDFParse.setWorker(getData());
  } catch (dataError) {
    try {
      PDFParse.setWorker(pathToFileURL(getPath()).href);
    } catch (pathError) {
      console.error(
        "[pdf] Failed to configure pdf-parse worker via getData():",
        dataError
      );
      console.error(
        "[pdf] Failed to configure pdf-parse worker via getPath():",
        pathError
      );
      throw new PdfExtractionError(
        "Failed to initialize PDF extractor.",
        "failed",
        { cause: pathError }
      );
    }
  }

  workerConfigured = true;
}

function toUint8Array(data: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data.slice(0));
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    return Uint8Array.from(data);
  }

  // Copy so pdf.js cannot detach/transfer the caller's buffer.
  return Uint8Array.from(data);
}

function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .replace(/\n*--\s*\d+\s+of\s+\d+\s*--\n*/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isCorruptPdfError(error: unknown): boolean {
  if (
    error instanceof InvalidPDFException ||
    error instanceof FormatError
  ) {
    return true;
  }

  if (!error || typeof error !== "object") return false;

  const name = "name" in error ? String(error.name) : "";
  const message =
    "message" in error ? String(error.message).toLowerCase() : "";

  return (
    name === "InvalidPDFException" ||
    name === "FormatError" ||
    message.includes("invalid pdf") ||
    message.includes("invalid pdf structure")
  );
}

function isPasswordError(error: unknown): boolean {
  if (error instanceof PasswordException) return true;
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  return name === "PasswordException";
}

/**
 * Extracts plain text from a PDF document.
 * Throws PdfExtractionError for empty, corrupted, or unreadable files.
 */
export async function extractTextFromPdf(
  data: Buffer | Uint8Array | ArrayBuffer
): Promise<string> {
  ensurePdfWorker();

  const bytes = toUint8Array(data);
  const parser = new PDFParse({ data: bytes, CanvasFactory });

  try {
    const result = await parser.getText();
    const text = normalizeExtractedText(result.text ?? "");

    if (!text) {
      throw new PdfExtractionError(
        "This PDF appears to be empty or contains no extractable text.",
        "empty"
      );
    }

    return text;
  } catch (error) {
    if (error instanceof PdfExtractionError) {
      throw error;
    }

    console.error("[pdf] Extraction underlying error:", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      cause:
        error instanceof Error && error.cause
          ? error.cause
          : undefined,
    });

    if (isCorruptPdfError(error)) {
      throw new PdfExtractionError(
        "This PDF is corrupted or unreadable.",
        "corrupted",
        { cause: error }
      );
    }

    if (isPasswordError(error)) {
      throw new PdfExtractionError(
        "Password-protected PDFs are not supported.",
        "password",
        { cause: error }
      );
    }

    throw new PdfExtractionError(
      "Failed to extract text from this PDF.",
      "failed",
      { cause: error }
    );
  } finally {
    await parser.destroy();
  }
}
