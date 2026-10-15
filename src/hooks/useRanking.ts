import { useState } from 'react';
import { getHotRanking } from '../api/discovery';
import { useAsyncEffect } from './useAsync';
import { RankingResponse } from '../types/discovery';

export type RankingPeriod = 'day' | 'week' | 'month';

/**
 * 热门排行 hook
 *
 * 管理时间维度切换 + 加载热榜数据。
 *
 * 用法:
 *   const { loading, data, period, setPeriod } = useRanking();
 */
export function useRanking() {
  const [period, setPeriod] = useState<RankingPeriod>('day');

  const { loading, data } = useAsyncEffect(
    () => getHotRanking(period),
    [period],
    { onError: (err) => console.error('加载排行榜失败', err) },
  );

  return {
    loading,
    data: data as RankingResponse | undefined,
    period,
    setPeriod,
  };
}
