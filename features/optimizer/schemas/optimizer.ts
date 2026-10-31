import { z } from "zod";
import { resumeIdSchema, resumeContentSchema } from "@/features/resume/schemas/resume";
export const optimizeInputSchema = z.object({
  resumeId: resumeIdSchema,
  jobDescription: z.string().trim().min(50, "Add at least 50 characters of job description.").max(12000),
});
export const optimizationSchema = z.object({
  optimizedText: resumeContentSchema,
  changes: z.array(z.string().trim().min(1).max(600)).min(1).max(12),
  cautions: z.array(z.string().trim().min(1).max(600)).max(12),
});
export type Optimization = z.infer<typeof optimizationSchema>;
