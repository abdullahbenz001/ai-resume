"use client";
import { Button } from "@/components/ui/button";
export default function WorkspaceError({
  unstable_retry,
}: {
  unstable_retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-2xl border bg-card p-8"
    >
      <h2 className="text-xl font-semibold">
        We could not load your workspace
      </h2>
      <p className="my-4 text-sm text-muted-foreground">
        Your data has not been changed. Please try again in a moment.
      </p>
      <Button onClick={unstable_retry}>Try again</Button>
    </div>
  );
}
