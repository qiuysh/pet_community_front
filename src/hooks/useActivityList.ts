import { useState } from 'react';
import { getActivityList } from '../api/activity';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import {
  ActivityInfo,
  ActivityListParams,
  ActivityType,
  ActivityListStatusFilter,
} from '../types/activity';

/**
 * 活动列表 hook（前台）
 */
export function useActivityList(pageSize = 10) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityListParams>({
    type: undefined,
    status: 'active',
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

  const handleStatusChange = (status: ActivityListStatusFilter | undefined) => {
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
