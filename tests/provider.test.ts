import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ generate: vi.fn(), configured: vi.fn() }));
vi.mock("@/lib/gemini", () => ({
  hasGeminiApiKey: mock.configured,
  getGeminiClient: () => ({ models: { generateContent: mock.generate } }),
}));
import { analyzeResume } from "@/lib/analyze-resume";
beforeEach(() => {
  mock.configured.mockReturnValue(true);
});
it("fails explicitly for malformed model output", async () => {
  mock.generate.mockResolvedValue({ text: "not json" });
  await expect(
    analyzeResume({ resumeText: "resume", jobDescription: "role" }),
  ).rejects.toMatchObject({ status: 502 });
});
it("does not expose upstream errors or produce a fallback score", async () => {
  mock.generate.mockRejectedValue(new Error("private upstream response"));
  await expect(
    analyzeResume({ resumeText: "resume", jobDescription: "role" }),
  ).rejects.toMatchObject({
    message: "We could not produce a valid analysis. Please try again.",
  });
});
