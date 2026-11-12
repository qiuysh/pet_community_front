import { useEffect, useState } from 'react';
import { useAsyncEffect } from './useAsync';
import { useSyncedSearchParams } from './useSyncedSearchParams';
import { useToast } from '../components/toast';
import { getTopicList } from '../api/post';
import { TopicInfo } from '../types/post';

const TOPIC_LIST_QUERY = {
  page: { kind: 'number', default: 1 },
  keyword: { kind: 'string', default: '' },
} as const;

/**
 * 话题列表 hook
 *
 * 封装话题列表的关键词搜索 + 分页加载。
 * keyword/page 与 URL 同步；输入框改动需点搜索才写入 URL 并请求。
 */
export function useTopicList(defaultPageSize = 20) {
  const toast = useToast();
  const [query, setQuery] = useSyncedSearchParams(TOPIC_LIST_QUERY, {
    resetPageOn: ['keyword'],
  });
  const keyword = query.keyword;
  const page = query.page;
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [searchTick, setSearchTick] = useState(0);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const { loading, data } = useAsyncEffect(
    () => getTopicList(keyword, page, defaultPageSize),
    [page, keyword, searchTick, defaultPageSize],
    { onError: () => toast.error('加载话题失败') },
  );

  const topics: TopicInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / defaultPageSize));

  const setKeyword = (value: string) => {
    setKeywordInput(value);
  };

  const setPage = (next: number | ((prev: number) => number)) => {
    const target = typeof next === 'function' ? next(page) : next;
    setQuery({ page: Math.max(1, target) });
  };

  const search = () => {
    setQuery({ keyword: keywordInput.trim(), page: 1 });
    setSearchTick((t) => t + 1);
  };

  return {
    topics,
    loading,
    total,
    totalPages,
    keyword: keywordInput,
    setKeyword,
    page,
    setPage,
    search,
  };
}
