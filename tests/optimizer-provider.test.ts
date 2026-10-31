import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ configured: vi.fn(), generate: vi.fn() }));
vi.mock("@/lib/gemini", () => ({
  hasGeminiApiKey: mock.configured,
  getGeminiClient: () => ({ models: { generateContent: mock.generate } }),
}));
import { generateOptimization } from "@/features/optimizer/services/provider";
const valid = { optimizedText: "Experienced developer creating TypeScript web applications for local businesses.", changes: ["Improved clarity"], cautions: [] };
beforeEach(() => { vi.resetAllMocks(); mock.configured.mockReturnValue(true); });
it("validates and returns structured drafts", async () => {
  mock.generate.mockResolvedValue({ text: JSON.stringify(valid) });
  await expect(generateOptimization("Original resume", "Target role")).resolves.toEqual(valid);
});
it.each(["not json", JSON.stringify({ ...valid, optimizedText: "x".repeat(12001) }), JSON.stringify({ ...valid, changes: [] })])("rejects malformed or excessive output", async text => {
  mock.generate.mockResolvedValue({ text });
  await expect(generateOptimization("resume", "role")).rejects.toMatchObject({ status: 502 });
});
it("hides upstream details and does not fabricate a draft", async () => {
  mock.generate.mockRejectedValue(new Error("private upstream response"));
  await expect(generateOptimization("resume", "role")).rejects.toMatchObject({
    status: 502, message: "We could not produce a valid optimization. Please try again.",
  });
});
it("fails without calling the model when configuration is missing", async () => {
  mock.configured.mockReturnValue(false);
  await expect(generateOptimization("resume", "role")).rejects.toMatchObject({ status: 503 });
  expect(mock.generate).not.toHaveBeenCalled();
});
