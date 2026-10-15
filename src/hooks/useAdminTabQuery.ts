import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * 后台分区 Tab 与 URL ?tab= 同步，支持前进/后退深链。
 */
export function useAdminTabQuery<T extends string>(
  defaultTab: T,
  validTabs: readonly T[],
  paramKey = 'tab',
): [T, (next: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    const raw = searchParams.get(paramKey);
    if (raw && (validTabs as readonly string[]).includes(raw)) {
      return raw as T;
    }
    return defaultTab;
  }, [searchParams, paramKey, validTabs, defaultTab]);

  const setTab = useCallback(
    (next: T) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === defaultTab) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, next);
          }
          params.delete('page');
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams, paramKey, defaultTab],
  );

  return [tab, setTab];
}
