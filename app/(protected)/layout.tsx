import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireAuth();

  return <AppShell>{children}</AppShell>;
}
