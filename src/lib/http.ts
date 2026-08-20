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
  source: string;
  message: string;
  status?: number;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly source: string;
  readonly status: number | undefined;

  constructor({ kind, source, message, status }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.source = source;
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

type RequestJsonInit<T> = {
  url: string;
  schema: ZodType<T>;
  /** Provider identifier used for error attribution in the UI. */
  source: string;
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
  source,
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
      source,
      message: 'Could not reach the service. Check your connection and try again.',
    });
  }

  if (!response.ok) {
    throw new ApiError({
      kind: response.status === 429 ? 'rate_limit' : 'http',
      source,
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
    throw new ApiError({ kind: 'parse', source, message: 'Response was not valid JSON.' });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    const path = issue?.path.join('.');
    throw new ApiError({
      kind: 'parse',
      source,
      message: path
        ? `Unexpected response shape at "${path}".`
        : 'Response did not match the expected shape.',
    });
  }

  return parsed.data;
}
