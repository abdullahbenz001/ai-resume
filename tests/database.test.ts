import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: () => ({ $queryRaw: mock.query }) }));
import { consumeApiQuota } from "@/lib/rate-limit";
const pg = new PGlite();
beforeAll(async () => {
  await pg.exec(
    await readFile(
      "prisma/migrations/202610310001_initial/migration.sql",
      "utf8",
    ),
  );
  await pg.exec(
    await readFile(
      "prisma/migrations/202610310002_request_limits/migration.sql",
      "utf8",
    ),
  );
  mock.query.mockImplementation(
    async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = strings.reduce(
        (s, part, i) => s + part + (i < values.length ? `$${i + 1}` : ""),
        "",
      );
      return (await pg.query(sql, values)).rows;
    },
  );
}, 30000);
afterAll(() => pg.close());
it("applies migrations and cascades only the selected resume's analyses", async () => {
  await pg.exec(`INSERT INTO users(id,clerk_id,updated_at) VALUES ('a','clerk-a',NOW()),('b','clerk-b',NOW());
    INSERT INTO resumes(id,user_id,content,updated_at) VALUES ('ra','a','content',NOW()),('rb','b','content',NOW());
    INSERT INTO analyses(id,resume_id,job_description,score,updated_at) VALUES ('aa','ra','role',80,NOW()),('ab','rb','role',70,NOW());`);
  // Mimics the actual repository's combined identity-and-owner predicate.
  await pg.query("DELETE FROM resumes WHERE id = $1 AND user_id = $2", [
    "rb",
    "a",
  ]);
  expect((await pg.query("SELECT * FROM analyses")).rows).toHaveLength(2);
  await pg.query("DELETE FROM resumes WHERE id = $1 AND user_id = $2", [
    "ra",
    "a",
  ]);
  expect((await pg.query("SELECT id FROM analyses")).rows).toEqual([
    { id: "ab" },
  ]);
});
it("atomically limits concurrent requests and resets expired windows", async () => {
  const results = await Promise.allSettled(
    Array.from({ length: 14 }, () => consumeApiQuota("test-clerk", "analysis")),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(10);
  expect(results.filter((r) => r.status === "rejected")).toHaveLength(4);
  await expect(
    consumeApiQuota("other-clerk", "analysis"),
  ).resolves.toBeUndefined();
  await expect(consumeApiQuota("test-clerk", "pdf")).resolves.toBeUndefined();
  await pg.query(
    "UPDATE rate_limits SET window_start = NOW() - INTERVAL '2 hours' WHERE key = $1",
    ["test-clerk:analysis"],
  );
  await expect(
    consumeApiQuota("test-clerk", "analysis"),
  ).resolves.toBeUndefined();
  expect(
    (
      await pg.query("SELECT count FROM rate_limits WHERE key = $1", [
        "test-clerk:analysis",
      ])
    ).rows,
  ).toEqual([{ count: 1 }]);
});
