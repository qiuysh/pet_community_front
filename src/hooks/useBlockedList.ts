import { useState } from 'react';
import { blockApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { showErrorToast, showSuccessToast } from '../utils/toastManager';

export interface BlockedUser {
  id: number;
  userId?: number;
  nickname: string;
  avatar?: string;
  signature?: string;
}

/**
 * 拉黑列表 hook
 */
export function useBlockedList(pageSize = 20) {
  const [page, setPage] = useState(1);

  const { loading, data, setData, refetch } = useAsyncEffect(
    () =>
      blockApi.getBlockedList({ page, pageSize }) as Promise<{
        list: BlockedUser[];
        total: number;
      }>,
    [page],
    { onError: () => showErrorToast('获取拉黑列表失败') },
  );

  const users = data?.list ?? [];
  const total = data?.total ?? 0;

  const handleUnblock = async (targetId: number) => {
    if (!window.confirm('确定取消拉黑该用户？')) return;
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
