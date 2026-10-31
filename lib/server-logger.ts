/** Log error categories only; never request bodies, upstream output, keys or error causes. */
export function logError(context: string, error: unknown): void {
  console.error(context, {
    type: error instanceof Error ? error.name : "unknown",
  });
}
