type QueryErrorContext = {
  query: string;
  error: {
    name: string;
    message: string;
    code?: string;
    cause?: unknown;
  };
};

/**
 * Structured logger for query failures.
 *
 * In local development this writes to `console.error`. In a future iteration
 * it can be swapped for a remote logger (Datadog, Sentry, etc.) without
 * changing call sites.
 */
export function logQueryError(name: string, error: unknown): void {
  const context: QueryErrorContext = {
    query: name,
    error: {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    },
  };

  if (error instanceof Error && "code" in error) {
    context.error.code = String((error as Error & { code: unknown }).code);
  }

  if (error instanceof Error && error.cause !== undefined) {
    context.error.cause = error.cause;
  }

  console.error("[query-error]", JSON.stringify(context));
}
