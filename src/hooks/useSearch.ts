import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  search,
  getSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
  getHotKeywords,
} from '../api/discovery';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { SearchResult, SearchHistoryInfo, HotKeywordInfo } from '../types/discovery';

/**
 * 搜索 hook
 *
 * 管理:
 * - 搜索关键词(从 URL query 初始化)
 * - 搜索结果(search)
 * - 搜索历史(getSearchHistory/deleteSearchHistory/clearSearchHistory)
 * - 热门关键词(getHotKeywords)
 *
 * 用法:
 *   const { keyword, setKeyword, loading, result, history, hotKeywords, handleSearch, handleDeleteHistory, handleClearHistory, handleHotKeywordClick } = useSearch();
 */
export function useSearch() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [history, setHistory] = useState<SearchHistoryInfo[]>([]);
  const [hotKeywords, setHotKeywords] = useState<HotKeywordInfo[]>([]);

  const { loading, data: result, refetch } = useAsyncEffect<SearchResult | null>(
    async () => {
      if (!keyword.trim()) return null;
      return await search(keyword);
    },
    [keyword],
    { onError: () => toast.error('搜索失败'), initialData: null },
  );

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSearchHistory();
      setHistory(res);
    } catch (e) {
      console.error('加载搜索历史失败', e);
    }
  }, []);

  const loadHotKeywords = useCallback(async () => {
    try {
      const res = await getHotKeywords();
      setHotKeywords(res);
    } catch (e) {
      console.error('加载热门关键词失败', e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadHotKeywords();
  }, [loadHistory, loadHotKeywords]);

  const handleSearch = () => refetch();

  const handleDeleteHistory = async (id: number) => {
    try {
      await deleteSearchHistory(id);
      setHistory(history.filter((h) => h.id !== id));
      toast.success('删除成功');
    } catch (e) {
      toast.error('删除失败');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
      toast.success('清空成功');
    } catch (e) {
      toast.error('清空失败');
    }
  };

  const handleHotKeywordClick = (kw: string) => {
    setKeyword(kw);
  };

  return {
    keyword,
    setKeyword,
    loading,
    result: result as SearchResult | null,
    history,
    hotKeywords,
    handleSearch,
    handleDeleteHistory,
    handleClearHistory,
    handleHotKeywordClick,
  };
}
