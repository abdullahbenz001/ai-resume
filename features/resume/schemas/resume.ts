import { z } from "zod";
export const resumeIdSchema = z.string().cuid();
export const resumeTitleSchema = z
  .string()
  .trim()
  .min(1, "Enter a title.")
  .max(120, "Use at most 120 characters.");
export const resumeContentSchema = z
  .string()
  .trim()
  .min(50, "Add at least 50 characters of resume text.")
  .max(12000, "Use at most 12,000 characters.");
export const createResumeSchema = z.object({
  title: resumeTitleSchema,
  content: resumeContentSchema,
  fileName: z.string().trim().max(255).optional(),
});
export const renameResumeSchema = z.object({
  id: resumeIdSchema,
  title: resumeTitleSchema,
});
export const analysisInputSchema = z.object({
  resumeId: resumeIdSchema.optional(),
  resumeText: resumeContentSchema,
  jobDescription: z
    .string()
    .trim()
    .min(50, "Add at least 50 characters of job description.")
    .max(12000),
});
