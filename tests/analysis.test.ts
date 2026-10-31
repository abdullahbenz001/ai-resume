import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  user: vi.fn(),
  find: vi.fn(),
  ai: vi.fn(),
  save: vi.fn(),
}));
vi.mock("@/features/auth/services/user", () => ({ requireAppUser: mock.user }));
vi.mock("@/features/resume/repositories/resume", () => ({
  resumeRepository: { find: mock.find },
}));
vi.mock("@/lib/analyze-resume", () => ({ analyzeResume: mock.ai }));
vi.mock("@/features/analysis/repositories/analysis", () => ({
  saveAnalysis: mock.save,
  listAnalyses: vi.fn(),
}));
import { runAnalysis } from "@/features/analysis/services/analysis";
const input = {
  resumeId: "clxxxxxxxxxxxxxxxxxxxxxxx",
  resumeText: "x".repeat(100),
  jobDescription: "j".repeat(100),
};
const result = {
  score: 80,
  strengths: ["TypeScript"],
  missingSkills: [],
  suggestions: [],
};
beforeEach(() => {
  mock.user.mockResolvedValue({ id: "owner-a" });
  mock.find.mockResolvedValue(null);
  mock.ai.mockResolvedValue({ result, source: "gemini" });
});
it("checks ownership before incurring AI cost", async () => {
  await expect(runAnalysis(input)).rejects.toMatchObject({ status: 404 });
  expect(mock.ai).not.toHaveBeenCalled();
  expect(mock.save).not.toHaveBeenCalled();
});
it("analyzes server-owned content, not substituted browser content", async () => {
  mock.find.mockResolvedValue({ content: "Trusted saved resume" });
  await runAnalysis(input);
  expect(mock.ai).toHaveBeenCalledWith({
    ...input,
    resumeText: "Trusted saved resume",
  });
  expect(mock.save).toHaveBeenCalledWith(
    "owner-a",
    { ...input, resumeText: "Trusted saved resume" },
    result,
  );
});
it("does not save a failed AI call", async () => {
  mock.find.mockResolvedValue({ content: "Trusted resume" });
  mock.ai.mockRejectedValue(new Error("Invalid model output"));
  await expect(runAnalysis(input)).rejects.toThrow();
  expect(mock.save).not.toHaveBeenCalled();
});
it("does not report success when persistence fails", async () => {
  mock.find.mockResolvedValue({ content: "Trusted resume" });
  mock.save.mockRejectedValueOnce(new Error("Database unavailable"));
  await expect(runAnalysis(input)).rejects.toThrow("Database unavailable");
});
