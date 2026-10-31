import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  quota: vi.fn(),
  run: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mock.auth }));
vi.mock("@/lib/rate-limit", () => ({ consumeApiQuota: mock.quota }));
vi.mock("@/features/analysis/services/analysis", () => ({
  runAnalysis: mock.run,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { POST } from "@/app/api/analyze/route";
import { AppError } from "@/lib/app-error";
beforeEach(() => {
  mock.auth.mockResolvedValue({ userId: "clerk-a" });
  mock.quota.mockResolvedValue(undefined);
  mock.run.mockResolvedValue({
    score: 75,
    strengths: [],
    missingSkills: [],
    suggestions: [],
  });
});
it("blocks unsigned API calls before reading the body or using AI", async () => {
  mock.auth.mockResolvedValue({ userId: null });
  const response = await POST(
    new Request("http://localhost/api/analyze", { method: "POST", body: "{}" }),
  );
  expect(response.status).toBe(401);
  expect(mock.quota).not.toHaveBeenCalled();
  expect(mock.run).not.toHaveBeenCalled();
});
it("returns 400 for broken JSON", async () => {
  expect(
    (
      await POST(
        new Request("http://localhost/api/analyze", {
          method: "POST",
          body: "{",
        }),
      )
    ).status,
  ).toBe(400);
  expect(mock.run).not.toHaveBeenCalled();
});
it("returns 413 before processing an oversized body", async () => {
  expect(
    (
      await POST(
        new Request("http://localhost/api/analyze", {
          method: "POST",
          body: "x".repeat(120001),
        }),
      )
    ).status,
  ).toBe(413);
  expect(mock.run).not.toHaveBeenCalled();
});
it("enforces quota before model access", async () => {
  mock.quota.mockRejectedValue(new AppError("Limit reached", 429));
  expect(
    (
      await POST(
        new Request("http://localhost/api/analyze", {
          method: "POST",
          body: "{}",
        }),
      )
    ).status,
  ).toBe(429);
  expect(mock.run).not.toHaveBeenCalled();
});
