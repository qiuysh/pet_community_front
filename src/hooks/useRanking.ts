import { useSearchParams } from 'react-router-dom';
import { getHotRanking } from '../api/discovery';
import { useAsyncEffect } from './useAsync';
import { RankingResponse } from '../types/discovery';

export type RankingPeriod = 'day' | 'week' | 'month';

/** 合法的时间维度，非法值回退 day */
const PERIODS: RankingPeriod[] = ['day', 'week', 'month'];

/**
 * 热门排行 hook
 *
 * 管理时间维度切换 + 加载热榜数据。
 * 时间维度与 URL searchParams(period) 同步，刷新或分享链接后仍停在原维度。
 *
 * 用法:
 *   const { loading, data, period, setPeriod } = useRanking();
 */
export function useRanking() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPeriod = searchParams.get('period');
  const period: RankingPeriod = PERIODS.includes(rawPeriod as RankingPeriod)
    ? (rawPeriod as RankingPeriod)
    : 'day';

  const { loading, data } = useAsyncEffect(
    () => getHotRanking(period),
    [period],
    { onError: (err) => console.error('加载排行榜失败', err) },
  );

  const setPeriod = (next: RankingPeriod) => {
    const params = new URLSearchParams(searchParams);
    // 默认维度不写进 URL，保持链接干净
    if (next === 'day') {
      params.delete('period');
    } else {
      params.set('period', next);
    }
    setSearchParams(params, { replace: true });
  };

  return {
    loading,
    data: data as RankingResponse | undefined,
    period,
    setPeriod,
  };
}
