import { useSearchParams } from 'react-router-dom';
import { useAsyncEffect } from './useAsync';
import { useToast } from '../components/toast';
import { getRecommendPosts } from '../api/discovery';
import { PostInfo, PostListResponse } from '../types/post';
import { recommendToPostListResponse } from '../utils/homeFeed';

/**
 * 首页动态列表（HomeFeed）
 *
 * 规格 Phase-4 R1/R3：首页「推荐 / 图文 / 视频」统一走 Discovery `/recommend`，
 * 不再误用时间序 `/posts`。查询参数 (tab/page) 与 URL 同步。
 */
export type PostTab = 'all' | 'image' | 'video';

/** 规格默认每次 20 条 */
export const HOME_FEED_PAGE_SIZE = 20;

export function usePostList(defaultPageSize = HOME_FEED_PAGE_SIZE) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get('tab') as PostTab) || 'all';
  const page = Number(searchParams.get('page') || '1');

  const updateQuery = (next: { tab?: PostTab; page?: number }) => {
    const params = new URLSearchParams(searchParams);
    if (next.tab !== undefined) params.set('tab', next.tab);
    if (next.page !== undefined) params.set('page', String(next.page));
    setSearchParams(params, { replace: true });
  };

  const postType = tab === 'all' ? undefined : tab;

  const { loading, data } = useAsyncEffect(
    async () => {
      const raw = await getRecommendPosts(page, defaultPageSize, postType);
      return recommendToPostListResponse(raw);
    },
    [page, tab, defaultPageSize],
    { onError: () => toast.error('加载动态失败') },
  );

  const posts: PostInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / defaultPageSize));
  const response: PostListResponse | undefined = data;

  return {
    posts,
    loading,
    total,
    totalPages,
    response,
    tab,
    page,
    updateQuery,
  };
}
