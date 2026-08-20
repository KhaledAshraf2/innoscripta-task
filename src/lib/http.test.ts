import { describe, expect, it } from 'vitest';
import { ApiError, rejectUnlessProviderOk } from '@/lib/http';

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
