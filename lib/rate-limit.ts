import "server-only";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/app-error";
// Atomic PostgreSQL counter: shared by all instances, bounded to two rows per Clerk user.
export async function consumeApiQuota(
  userId: string,
  scope: "analysis" | "pdf",
) {
  const key = `${userId}:${scope}`;
  const limit = scope === "analysis" ? 10 : 20;
  const rows = await getDb().$queryRaw<Array<{ count: number }>>`
    INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < NOW() - INTERVAL '1 hour' THEN 1 ELSE LEAST(rate_limits.count + 1, 1000000) END,
      window_start = CASE WHEN rate_limits.window_start < NOW() - INTERVAL '1 hour' THEN NOW() ELSE rate_limits.window_start END
    RETURNING count
  `;
  if (!rows[0] || rows[0].count > limit)
    throw new AppError(
      "Hourly request limit reached. Please try again later.",
      429,
    );
}
