import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Skeleton } from '../components/ui/skeleton';

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

/** 接近终态的页壳骨架：顶栏占位 + 内容条，避免仅 Spinner 的空白感 */
export function PageSkeleton() {
  return (
    <div
      className="page-shell w-full min-h-[40vh] bg-cream px-4 py-4"
      role="status"
      aria-label="页面加载中"
    >
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-5 w-28" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton circle className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-3/4" />
            <Skeleton className="h-36 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}
