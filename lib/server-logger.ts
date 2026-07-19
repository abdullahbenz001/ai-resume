/**
 * Server-side debug helpers for the analyze API.
 * Never log the full GEMINI_API_KEY.
 */

export function maskApiKey(apiKey: string | undefined): {
  exists: boolean;
  length: number;
  preview: string | null;
} {
  const value = apiKey?.trim();
  if (!value) {
    return { exists: false, length: 0, preview: null };
  }

  const preview =
    value.length <= 12
      ? `${value.slice(0, 4)}…`
      : `${value.slice(0, 7)}…${value.slice(-4)}`;

  return {
    exists: true,
    length: value.length,
    preview,
  };
}

export function logError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(context, {
      name: error.name,
      message: error.message,
      stack: error.stack ?? "(no stack trace)",
      ...(error.cause ? { cause: error.cause } : {}),
    });
    return;
  }

  console.error(context, {
    message: "Non-Error thrown value",
    value: error,
  });
}
