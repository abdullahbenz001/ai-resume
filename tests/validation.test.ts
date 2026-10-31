import { describe, expect, it } from "vitest";
import {
  createResumeSchema,
  analysisInputSchema,
} from "@/features/resume/schemas/resume";
import { parseAnalysisResult } from "@/lib/schema";
import { readBoundedBody } from "@/lib/request-body";
describe("untrusted input", () => {
  it("rejects blank titles, short resumes and oversized content", () => {
    expect(
      createResumeSchema.safeParse({ title: "   ", content: "x".repeat(100) })
        .success,
    ).toBe(false);
    expect(
      createResumeSchema.safeParse({ title: "CV", content: "short" }).success,
    ).toBe(false);
    expect(
      createResumeSchema.safeParse({ title: "CV", content: "x".repeat(12001) })
        .success,
    ).toBe(false);
  });
  it("strips forged ownership fields", () => {
    expect(
      createResumeSchema.parse({
        title: " CV ",
        content: "x".repeat(100),
        userId: "victim",
      }),
    ).not.toHaveProperty("userId");
  });
  it("rejects malformed IDs and null payloads", () => {
    expect(analysisInputSchema.safeParse(null).success).toBe(false);
    expect(
      analysisInputSchema.safeParse({
        resumeId: "../../other",
        resumeText: "x".repeat(100),
        jobDescription: "x".repeat(100),
      }).success,
    ).toBe(false);
  });
  it("rejects invalid model output instead of fabricating a score", () => {
    expect(() => parseAnalysisResult({ score: 200 })).toThrow();
    expect(() =>
      parseAnalysisResult({
        score: 50,
        strengths: [""],
        missingSkills: [],
        suggestions: [],
      }),
    ).toThrow();
  });
  it("bounds chunked payloads without Content-Length", async () => {
    let cancelled = false;
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array(10));
      },
      cancel() {
        cancelled = true;
      },
    });
    const req = new Request("http://localhost", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    await expect(readBoundedBody(req, 15)).rejects.toMatchObject({
      status: 413,
    });
    expect(cancelled).toBe(true);
  });
  it("accepts bodies at the exact limit", async () => {
    expect(
      (
        await readBoundedBody(
          new Request("http://localhost", { method: "POST", body: "12345" }),
          5,
        )
      ).length,
    ).toBe(5);
  });
});
