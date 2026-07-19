import { z } from "zod";

export const analysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const FALLBACK_ANALYSIS_RESULT: AnalysisResult = {
  score: 50,
  strengths: ["Communication", "Problem solving", "Relevant domain experience"],
  missingSkills: [
    "Role-specific tools called out in the job description",
    "Quantified impact metrics",
  ],
  suggestions: [
    "Mirror exact keywords from the job description in your skills and experience sections",
    "Add measurable outcomes (metrics, scope, or impact) to recent roles",
    "Call out any missing required tools and note adjacent or transferable experience",
  ],
};

export function getFallbackAnalysisResult(): AnalysisResult {
  return analysisResultSchema.parse({
    score: FALLBACK_ANALYSIS_RESULT.score,
    strengths: [...FALLBACK_ANALYSIS_RESULT.strengths],
    missingSkills: [...FALLBACK_ANALYSIS_RESULT.missingSkills],
    suggestions: [...FALLBACK_ANALYSIS_RESULT.suggestions],
  });
}

/** Normalize and validate model output; throws if the shape is unusable. */
export function parseAnalysisResult(data: unknown): AnalysisResult {
  const parsed = analysisResultSchema.parse(data);

  return analysisResultSchema.parse({
    score: Math.round(Math.min(100, Math.max(0, parsed.score))),
    strengths: parsed.strengths.map((s) => s.trim()).filter(Boolean),
    missingSkills: parsed.missingSkills.map((s) => s.trim()).filter(Boolean),
    suggestions: parsed.suggestions.map((s) => s.trim()).filter(Boolean),
  });
}
