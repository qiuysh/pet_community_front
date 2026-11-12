import { blockApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { useSyncedSearchParams } from './useSyncedSearchParams';
import { showErrorToast, showSuccessToast } from '../utils/toastManager';

export interface BlockedUser {
  id: number;
  userId?: number;
  nickname: string;
  avatar?: string;
  signature?: string;
}

const BLOCKED_QUERY = {
  page: { kind: 'number', default: 1 },
} as const;

/**
 * 拉黑列表 hook
 */
export function useBlockedList(pageSize = 20) {
  const [query, setQuery] = useSyncedSearchParams(BLOCKED_QUERY);
  const page = query.page;

  const { loading, data, setData, refetch } = useAsyncEffect(
    () =>
      blockApi.getBlockedList({ page, pageSize }) as Promise<{
        list: BlockedUser[];
        total: number;
      }>,
    [page, pageSize],
    { onError: () => showErrorToast('获取拉黑列表失败') },
  );

  const users = data?.list ?? [];
  const total = data?.total ?? 0;

  const setPage = (next: number | ((prev: number) => number)) => {
    const target = typeof next === 'function' ? next(page) : next;
    setQuery({ page: Math.max(1, target) });
  };

  const handleUnblock = async (targetId: number) => {
    try {
      await blockApi.unblockUser(targetId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              list: prev.list.filter((u) => u.id !== targetId && u.userId !== targetId),
              total: Math.max(0, prev.total - 1),
            }
          : prev,
      );
      showSuccessToast('已取消拉黑');
    } catch {
      showErrorToast('取消拉黑失败');
    }
  };

  return { users, loading, total, page, setPage, handleUnblock, refetch };
}
