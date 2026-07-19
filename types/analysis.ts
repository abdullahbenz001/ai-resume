import type { AnalysisResult } from "@/lib/schema";

export type { AnalysisResult };

export interface AnalyzeRequest {
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeErrorResponse {
  error: string;
}
