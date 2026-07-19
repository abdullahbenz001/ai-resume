import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

export async function getAuth() {
  return auth();
}

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return currentUser();
}

export async function requireAuth() {
  return auth.protect();
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}

export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return userId !== null;
}
