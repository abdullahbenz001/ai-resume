import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ auth: vi.fn(), optimize: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mock.auth }));
vi.mock("@/features/optimizer/services/optimizer", () => ({ optimizeResume: mock.optimize }));
import { POST } from "@/app/api/optimize/route";
import { AppError } from "@/lib/app-error";
beforeEach(() => { vi.resetAllMocks(); mock.auth.mockResolvedValue({ userId: "clerk-a" }); });
function request(body: string) { return new Request("http://localhost/api/optimize", { method: "POST", body }); }
it("rejects unauthenticated requests before reading the body", async () => {
  mock.auth.mockResolvedValue({ userId: null });
  const req = request("secret");
  expect((await POST(req)).status).toBe(401);
  expect(req.bodyUsed).toBe(false);
  expect(mock.optimize).not.toHaveBeenCalled();
});
it("rejects malformed JSON and oversized bodies", async () => {
  expect((await POST(request("{"))).status).toBe(400);
  expect((await POST(request("x".repeat(80001)))).status).toBe(413);
  expect(mock.optimize).not.toHaveBeenCalled();
});
it("preserves safe domain errors", async () => {
  mock.optimize.mockRejectedValue(new AppError("Resume not found.", 404));
  expect((await POST(request("{}"))).status).toBe(404);
});
it("does not expose internal errors", async () => {
  mock.optimize.mockRejectedValue(new Error("private database connection"));
  const response = await POST(request("{}"));
  expect(response.status).toBe(500);
  expect(JSON.stringify(await response.json())).not.toContain("private");
});
