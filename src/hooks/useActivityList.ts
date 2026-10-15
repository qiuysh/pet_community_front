import { useState } from 'react';
import { getActivityList } from '../api/activity';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { ActivityInfo, ActivityListParams, ActivityType, ActivityStatus } from '../types/activity';

/**
 * 活动列表 hook
 *
 * 管理分页 + 活动类型/状态筛选 + 列表加载。
 *
 * 用法:
 *   const { activities, loading, total, page, setPage, filters, handleTypeChange, handleStatusChange } = useActivityList();
 */
export function useActivityList(pageSize = 10) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityListParams>({
    type: undefined,
    status: ActivityStatus.ONGOING,
  });

  const { loading, data } = useAsyncEffect(
    () => getActivityList({ page, pageSize, ...filters }),
    [page, filters],
    { onError: () => toast.error('加载活动失败') },
  );

  const activities: ActivityInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;

  const handleTypeChange = (type: ActivityType | undefined) => {
    setFilters((prev) => ({ ...prev, type }));
    setPage(1);
  };

  const handleStatusChange = (status: ActivityStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  return {
    activities,
    loading,
    total,
    page,
    setPage,
    filters,
    handleTypeChange,
    handleStatusChange,
  };
}
