import { useState, useEffect, useCallback, useRef, type DependencyList } from 'react';

// ============================================================
// useAsync: 手动触发异步操作(表单提交、投票、操作按钮)
// 消除组件中重复的 setLoading + try/catch/finally 三件套
//
// 用法:
//   const { loading, run } = useAsync();
//   const handleVote = () => run(
//     () => voteForSubmission({ id }),
//     (result) => { toast.success('成功'); setData(result); },
//     (err) => toast.error('失败'),
//   );
// ============================================================

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (err: unknown) => void,
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mountedRef.current) {
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onError?.(err);
      }
      return undefined;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, run, reset };
}

// ============================================================
// useAsyncEffect: 自动加载(列表页、详情页)
// 依赖变化时自动 fetch,返回 { loading, data, error, refetch, setData }
//
// 用法:
//   const { loading, data, refetch } = useAsyncEffect(
//     () => getActivityList({ page, pageSize: 10 }),
//     [page],
//     { onError: () => toast.error('加载失败') },
//   );
//   const list = data?.list ?? [];
//   const total = data?.total ?? 0;
// ============================================================

interface UseAsyncEffectOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
  initialData?: T;
}

export function useAsyncEffect<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList,
  options?: UseAsyncEffectOptions<T>,
) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>(options?.initialData);
  const [error, setError] = useState<unknown>(null);

  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;
  const optsRef = useRef(options);
  optsRef.current = options;
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mountedRef.current) {
        setData(result);
        optsRef.current?.onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        optsRef.current?.onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { loading, data, error, refetch: execute, setData };
}
