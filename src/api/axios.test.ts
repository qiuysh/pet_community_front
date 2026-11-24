import axios from 'axios';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, post } from './axios';

describe('axios response interceptor', () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('returns the raw Blob for binary responses instead of unwrapping a data field', async () => {
    const storage = { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
    vi.stubGlobal('sessionStorage', storage);
    vi.stubGlobal('localStorage', storage);
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { code: 0, data: { csrfToken: 'test-csrf' } },
    });
    const blob = new Blob(['xlsx-bytes'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    let seenResponseType: string | undefined;
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      seenResponseType = config.responseType;
      return {
        data: blob,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };
    api.defaults.adapter = adapter;

    const result = await post<Blob>(
      '/api/v1/admin/stats/export',
      { type: 'overview' },
      { responseType: 'blob' },
    );

    expect(seenResponseType).toBe('blob');
    expect(result).toBeInstanceOf(Blob);
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock');
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    expect(createObjectURL(result)).toBe('blob:mock');
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });
});
