import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  ApiError,
  isRetryableApiError,
  rejectUnlessProviderOk,
  requestJson,
} from '@/lib/http';

describe('rejectUnlessProviderOk', () => {
  it('allows a matching status and a missing status', () => {
    expect(() => rejectUnlessProviderOk('ok', 'ok')).not.toThrow();
    expect(() => rejectUnlessProviderOk('OK', 'ok')).not.toThrow();
    expect(() => rejectUnlessProviderOk(undefined, 'ok')).not.toThrow();
  });

  it('throws a provider error when the payload status is a failure', () => {
    expect(() => rejectUnlessProviderOk('error', 'ok', 'Invalid key.')).toThrow(ApiError);
    expect(() => rejectUnlessProviderOk('error', 'ok', 'Invalid key.')).toThrow('Invalid key.');
  });
});

describe('requestJson HTTP status mapping', () => {
  const schema = z.object({ ok: z.literal(true) });
  const signal = new AbortController().signal;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps 429 to a retryable rate_limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );

    const error = await requestJson({ url: 'http://x', schema, signal }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toMatchObject({
      kind: 'rate_limit',
      status: 429,
      message: 'Rate limit reached for this provider.',
    });
    expect(isRetryableApiError(error)).toBe(true);
  });

  it('maps 426 to a non-retryable result_limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 426 }),
    );

    const error = await requestJson({ url: 'http://x', schema, signal }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toMatchObject({
      kind: 'result_limit',
      status: 426,
      message: 'This provider has no more results on the current plan.',
    });
    expect(isRetryableApiError(error)).toBe(false);
  });
});
