import { useState } from 'react';
import { useAsyncEffect } from './useAsync';
import { useToast } from '../components/toast';
import { getTopicList } from '../api/post';
import { TopicInfo } from '../types/post';

/**
 * 话题列表 hook
 *
 * 封装话题列表的关键词搜索 + 分页加载。
 * 注意:keyword 改变不会自动触发请求(需手动 search),避免每次输入都打 API。
 *
 * 用法:
 *   const { topics, loading, total, totalPages, keyword, setKeyword, page, setPage, search } = useTopicList();
 */
export function useTopicList(defaultPageSize = 20) {
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  // 用于在 search() 触发时强制更新依赖
  const [searchTick, setSearchTick] = useState(0);

  const { loading, data } = useAsyncEffect(
    () => getTopicList(keyword, page, defaultPageSize),
    [page, searchTick],
    { onError: () => toast.error('加载话题失败') },
  );

  const topics: TopicInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / defaultPageSize));

  const search = () => {
    setPage(1);
    setSearchTick((t) => t + 1);
  };

  return {
    topics,
    loading,
    total,
    totalPages,
    keyword,
    setKeyword,
    page,
    setPage,
    search,
  };
}
