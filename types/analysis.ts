import type { AnalysisResult } from "@/lib/schema";

export type { AnalysisResult };

export interface AnalyzeRequest {
  resumeId?: string;
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeErrorResponse {
  error: string;
}
