import "server-only";
import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/app-error";
// No client-supplied user IDs. Keep only the Clerk identity locally; profile stays in Clerk.
export const requireAppUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new AppError("Sign in to continue.", 401);
  return getDb().user.upsert({
    where: { clerkId: userId },
    create: { clerkId: userId },
    update: {},
    select: { id: true },
  });
});
