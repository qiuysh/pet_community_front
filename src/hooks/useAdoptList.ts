import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdoptList } from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { AdoptInfo, AdoptListParams, PetType } from '../types/adopt';
import { AdoptionStatus } from '../types/adopt';

/** 合法的宠物类型筛选值，非法值一律回退「全部」 */
const PET_TYPES = Object.values(PetType) as string[];

/** 解析 page 参数：非正整数回退 1 */
function parsePage(raw: string | null): number {
  const parsed = Number(raw ?? '1');
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * 领养列表 hook
 *
 * 管理分页 + 宠物类型筛选 + 列表加载。
 * 查询参数(type/page)与 URL searchParams 同步，刷新与浏览器前进后退都不丢筛选。
 *
 * 用法:
 *   const { adopts, loading, total, page, setPage, filters, handleTypeChange } = useAdoptList();
 */
export function useAdoptList(pageSize = 10) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawType = searchParams.get('type');
  const petType = rawType && PET_TYPES.includes(rawType) ? (rawType as PetType) : undefined;
  const page = parsePage(searchParams.get('page'));

  const updateQuery = useCallback(
    (next: { type?: PetType; page?: number }) => {
      const params = new URLSearchParams(searchParams);
      if (next.type === undefined) {
        params.delete('type');
      } else {
        params.set('type', next.type);
      }
      if (next.page !== undefined) {
        params.set('page', String(next.page));
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const { loading, data } = useAsyncEffect(
    () => getAdoptList({ page, pageSize, petType, status: AdoptionStatus.PENDING }),
    [page, petType, pageSize],
    { onError: () => toast.error('加载领养信息失败') },
  );

  const adopts: AdoptInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;

  const filters: AdoptListParams = { petType, status: AdoptionStatus.PENDING };

  const handleTypeChange = (type: PetType | undefined) => updateQuery({ type, page: 1 });

  /** 兼容 useState 风格的函数式更新（setPage((p) => p + 1)） */
  const setPage = (next: number | ((prev: number) => number)) => {
    const target = typeof next === 'function' ? next(page) : next;
    updateQuery({ page: Math.max(1, target) });
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
