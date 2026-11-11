import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getActivityList } from '../api/activity';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import {
  ActivityInfo,
  ActivityListParams,
  ActivityType,
  ActivityListStatusFilter,
} from '../types/activity';

/** 合法的活动类型筛选值，非法值回退「全部」 */
const ACTIVITY_TYPES = Object.values(ActivityType) as string[];
/** 合法的状态筛选值；缺省为 active（与列表默认视角一致） */
const STATUS_FILTERS: ActivityListStatusFilter[] = [
  'active',
  'upcoming',
  'ended',
  'draft',
  'published',
];

/** 解析 page 参数：非正整数回退 1 */
function parsePage(raw: string | null): number {
  const parsed = Number(raw ?? '1');
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * 活动列表 hook（前台）
 *
 * 查询参数(type/status/page)与 URL searchParams 同步，刷新与浏览器前进后退都不丢筛选。
 */
export function useActivityList(pageSize = 10) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawType = searchParams.get('type');
  const type = rawType && ACTIVITY_TYPES.includes(rawType) ? (rawType as ActivityType) : undefined;
  const rawStatus = searchParams.get('status');
  const status: ActivityListStatusFilter =
    rawStatus && STATUS_FILTERS.includes(rawStatus as ActivityListStatusFilter)
      ? (rawStatus as ActivityListStatusFilter)
      : 'active';
  const page = parsePage(searchParams.get('page'));

  const updateQuery = useCallback(
    (next: { type?: ActivityType; status?: ActivityListStatusFilter; page?: number }) => {
      const params = new URLSearchParams(searchParams);
      if (next.type === undefined) {
        params.delete('type');
      } else {
        params.set('type', next.type);
      }
      if (next.status !== undefined) {
        params.set('status', next.status);
      }
      if (next.page !== undefined) {
        params.set('page', String(next.page));
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const { loading, data } = useAsyncEffect(
    () => getActivityList({ page, pageSize, type, status }),
    [page, type, status, pageSize],
    { onError: () => toast.error('加载活动失败') },
  );

  const activities: ActivityInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;

  const filters: ActivityListParams = { type, status };

  const handleTypeChange = (next: ActivityType | undefined) => updateQuery({ type: next, page: 1 });

  const handleStatusChange = (next: ActivityListStatusFilter | undefined) =>
    updateQuery({ status: next, page: 1 });

  /** 兼容 useState 风格的函数式更新（setPage((p) => p + 1)） */
  const setPage = (next: number | ((prev: number) => number)) => {
    const target = typeof next === 'function' ? next(page) : next;
    updateQuery({ page: Math.max(1, target) });
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
