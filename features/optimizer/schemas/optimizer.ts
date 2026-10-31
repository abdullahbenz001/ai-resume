import { z } from "zod";
import { resumeIdSchema, resumeContentSchema } from "@/features/resume/schemas/resume";
export const optimizationModeSchema = z.enum(["full", "summary", "experience"]);
export type OptimizationMode = z.infer<typeof optimizationModeSchema>;
export const optimizationModes: { value: OptimizationMode; label: string; description: string }[] = [
  { value: "full", label: "Full resume", description: "Improve the overall wording and structure for this role." },
  { value: "summary", label: "Professional summary", description: "Focus on a concise summary using experience already present in your resume." },
  { value: "experience", label: "Experience · STAR", description: "Focus on experience bullets: situation, task, action and result where the source provides them." },
];
export const optimizeInputSchema = z.object({
  resumeId: resumeIdSchema,
  mode: optimizationModeSchema.default("full"),
  jobDescription: z.string().trim().min(50, "Add at least 50 characters of job description.").max(12000),
});
export const optimizationSchema = z.object({
  optimizedText: resumeContentSchema,
  changes: z.array(z.string().trim().min(1).max(600)).min(1).max(12),
  cautions: z.array(z.string().trim().min(1).max(600)).max(12),
});
export type Optimization = z.infer<typeof optimizationSchema>;
