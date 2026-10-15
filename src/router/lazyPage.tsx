import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Spinner } from '../components/ui';

/** 具名导出页面懒加载 */
export function lazyNamed<M extends Record<string, unknown>>(
  loader: () => Promise<M>,
  name: keyof M & string,
) {
  return lazy(async () => {
    const mod = await loader();
    const Comp = mod[name];
    return { default: Comp as ComponentType };
  });
}

/** default 导出页面懒加载 */
export function lazyDefault(loader: () => Promise<{ default: ComponentType }>) {
  return lazy(loader);
}

export function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[40vh] w-full items-center justify-center"
          role="status"
          aria-label="页面加载中"
        >
          <Spinner label="页面加载中…" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
