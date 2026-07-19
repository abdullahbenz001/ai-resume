export type AnalyzeProviderErrorCode =
  | "missing_key"
  | "auth"
  | "quota"
  | "rate_limit"
  | "upstream";

/**
 * Fatal provider/config errors that should be shown to the user
 * instead of being masked by a fallback analysis payload.
 */
export class AnalyzeProviderError extends Error {
  readonly status: number;
  readonly code: AnalyzeProviderErrorCode;

  constructor(
    message: string,
    options: { status: number; code: AnalyzeProviderErrorCode }
  ) {
    super(message);
    this.name = "AnalyzeProviderError";
    this.status = options.status;
    this.code = options.code;
  }
}

export function isInsufficientQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    status?: number;
    code?: string | null;
    message?: string;
  };

  const message = (candidate.message ?? "").toLowerCase();
  const code = (candidate.code ?? "").toLowerCase();

  return (
    code === "insufficient_quota" ||
    code === "resource_exhausted" ||
    message.includes("insufficient_quota") ||
    message.includes("resource_exhausted") ||
    message.includes("exceeded your current quota") ||
    message.includes("quota exceeded") ||
    message.includes("check your plan and billing")
  );
}
