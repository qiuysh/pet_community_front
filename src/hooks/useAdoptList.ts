import { useState } from 'react';
import { getAdoptList } from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { AdoptInfo, AdoptListParams, PetType } from '../types/adopt';
import { AdoptionStatus } from '../types/adopt';

/**
 * 领养列表 hook
 *
 * 管理分页 + 宠物类型筛选 + 列表加载。
 *
 * 用法:
 *   const { adopts, loading, total, page, setPage, filters, handleTypeChange } = useAdoptList();
 */
export function useAdoptList(pageSize = 10) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdoptListParams>({
    petType: undefined,
    status: AdoptionStatus.PENDING,
  });

  const { loading, data } = useAsyncEffect(
    () => getAdoptList({ page, pageSize, ...filters }),
    [page, filters],
    { onError: () => toast.error('加载领养信息失败') },
  );

  const adopts: AdoptInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;

  const handleTypeChange = (petType: PetType | undefined) => {
    setFilters((prev) => ({ ...prev, petType }));
    setPage(1);
  };

  return {
    adopts,
    loading,
    total,
    page,
    setPage,
    filters,
    handleTypeChange,
  };
}
