import { useSearchParams } from 'react-router-dom';
import { useAsyncEffect } from './useAsync';
import { useToast } from '../components/toast';
import { getPostList } from '../api/post';
import { PostInfo, PostListParams, PostListResponse } from '../types/post';

/**
 * 动态列表 hook
 *
 * 封装动态列表的查询参数解析、数据加载、分页状态。
 * 查询参数(tab/page)与 URL searchParams 同步,支持浏览器前进后退。
 *
 * 用法:
 *   const { posts, loading, total, totalPages, tab, page, updateQuery } = usePostList();
 */
export type PostTab = 'all' | 'image' | 'video';

export function usePostList(defaultPageSize = 10) {
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

  const params: PostListParams = {
    page,
    pageSize: defaultPageSize,
    type: tab === 'all' ? undefined : tab,
  };

  const { loading, data } = useAsyncEffect(
    () => getPostList(params),
    [page, tab],
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
