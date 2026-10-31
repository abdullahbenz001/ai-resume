import { z } from "zod";
export const analysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string().trim().min(1).max(2000)).max(20),
  missingSkills: z.array(z.string().trim().min(1).max(2000)).max(20),
  suggestions: z.array(z.string().trim().min(1).max(2000)).max(20),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export function parseAnalysisResult(data: unknown): AnalysisResult {
  const parsed = analysisResultSchema.parse(data);
  return { ...parsed, score: Math.round(parsed.score) };
}
