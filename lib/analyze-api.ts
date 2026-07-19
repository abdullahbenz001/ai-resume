import type {
  AnalysisResult,
  AnalyzeErrorResponse,
  AnalyzeRequest,
} from "@/types/analysis";

export class AnalyzeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AnalyzeApiError";
  }
}

export async function analyzeMatch(
  payload: AnalyzeRequest
): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AnalysisResult | AnalyzeErrorResponse;

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : "Unable to analyze match. Please try again.";
    throw new AnalyzeApiError(message, response.status);
  }

  return data as AnalysisResult;
}
