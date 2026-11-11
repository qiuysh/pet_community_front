import { useEffect, useState } from 'react';

/**
 * 订阅一条媒体查询。SSR / 测试环境（无 matchMedia）下恒为 false。
 *
 * 用途：需要按断点改变「DOM 结构或组件 props」时用；
 * 仅改样式的场景请直接用 CSS media query，不要引入本 hook。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
