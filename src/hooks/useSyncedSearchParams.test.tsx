import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { parsePositiveInt, useSyncedSearchParams } from './useSyncedSearchParams';

const SCHEMA = {
  page: { kind: 'number', default: 1 },
  status: { kind: 'string', default: '0', values: ['all', '0', '1', '2'] as const },
  keyword: { kind: 'string', default: '' },
} as const;

function wrapper(initial: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>;
  };
}

describe('parsePositiveInt', () => {
  it('解析合法页码并回退非法值', () => {
    expect(parsePositiveInt('3')).toBe(3);
    expect(parsePositiveInt(null)).toBe(1);
    expect(parsePositiveInt('0')).toBe(1);
    expect(parsePositiveInt('abc', 2)).toBe(2);
  });
});

describe('useSyncedSearchParams', () => {
  it('从 URL 读取并在改筛选时重置 page', () => {
    const { result } = renderHook(
      () => {
        const synced = useSyncedSearchParams(SCHEMA, { resetPageOn: ['status', 'keyword'] });
        const [params] = useSearchParams();
        return { synced, params };
      },
      { wrapper: wrapper('/?status=1&page=3') },
    );

    expect(result.current.synced[0]).toEqual({ page: 3, status: '1', keyword: '' });

    act(() => {
      result.current.synced[1]({ status: '2' });
    });

    expect(result.current.synced[0].status).toBe('2');
    expect(result.current.synced[0].page).toBe(1);
    expect(result.current.params.get('status')).toBe('2');
    expect(result.current.params.get('page')).toBeNull();
  });

  it('非法枚举回退 default', () => {
    const { result } = renderHook(() => useSyncedSearchParams(SCHEMA), {
      wrapper: wrapper('/?status=hack'),
    });
    expect(result.current[0].status).toBe('0');
  });
});
