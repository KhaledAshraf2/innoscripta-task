import type { ZodType } from 'zod';

export type ApiErrorKind =
  /** Request never produced a response (offline, DNS, CORS). */
  | 'network'
  /** Response arrived with a non-2xx status. */
  | 'http'
  /** Provider quota exceeded; worth retrying with backoff. */
  | 'rate_limit'
  /** Response body did not match the schema we validate at the boundary. */
  | 'parse'
  /** Transport succeeded but the provider reported a failure in the payload. */
  | 'provider';

type ApiErrorInit = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor({ kind, message, status }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Retrying only helps for transient failures, never for a bad key or query. */
export function isRetryableApiError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.kind === 'network' || error.kind === 'rate_limit') return true;
  return error.kind === 'http' && error.status !== undefined && error.status >= 500;
}

/**
 * Some providers return HTTP 200 with a failure status in the JSON body.
 * Those must not be treated as an empty successful page.
 */
export function rejectUnlessProviderOk(
  status: string | null | undefined,
  okValue: string,
  message?: string | null,
): void {
  if (status == null) return;
  if (status.toLowerCase() === okValue.toLowerCase()) return;

  const trimmed = message?.trim();
  throw new ApiError({
    kind: 'provider',
    message: trimmed && trimmed.length > 0 ? trimmed : 'The news provider reported a failure.',
  });
}

type RequestJsonInit<T> = {
  url: string;
  schema: ZodType<T>;
  signal: AbortSignal;
  headers?: Record<string, string>;
};

/**
 * The only place raw responses enter the app. Every payload is validated before
 * it is handed to a mapper, so provider data is never trusted by construction.
 */
export async function requestJson<T>({
  url,
  schema,
  signal,
  headers,
}: RequestJsonInit<T>): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      signal,
      headers: { accept: 'application/json', ...headers },
    });
  } catch (error) {
    // Cancellation is a normal part of the query lifecycle, not a failure.
    if (isAbortError(error)) throw error;
    throw new ApiError({
      kind: 'network',
      message: 'Could not reach the service. Check your connection and try again.',
    });
  }

  if (!response.ok) {
    throw new ApiError({
      kind: response.status === 429 ? 'rate_limit' : 'http',
      status: response.status,
      message:
        response.status === 429
          ? 'Rate limit reached for this provider.'
          : `Request failed with status ${response.status}.`,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError({ kind: 'parse', message: 'Response was not valid JSON.' });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    const path = issue?.path.join('.');
    throw new ApiError({
      kind: 'parse',
      message: path
        ? `Unexpected response shape at "${path}".`
        : 'Response did not match the expected shape.',
    });
  }

  return parsed.data;
}
