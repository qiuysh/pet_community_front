import { useCallback, useEffect, useRef, useState } from 'react';
import { messageApi } from '../api/social';
import type { ChatMessage, MessageSearchStatus } from '../types/social';

/** 搜索结果每页条数 */
const SEARCH_PAGE_SIZE = 20;
/** 输入防抖 */
const DEBOUNCE_MS = 300;

export interface UseMessageSearchReturn {
  keyword: string;
  setKeyword: (value: string) => void;
  /** 输入法组合态变化（组合期间不发起请求） */
  setComposing: (composing: boolean) => void;

  status: MessageSearchStatus;
  results: ChatMessage[];
  total: number;
  error: string | null;

  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * 会话内消息搜索
 *
 * 防抖 300ms；用请求序号丢弃过期响应（不使用 AbortController：
 * axios 拦截器会把取消请求当成网络错误弹全局 toast）。
 */
export function useMessageSearch(conversationId: number): UseMessageSearchReturn {
  const [keyword, setKeywordState] = useState('');
  const [status, setStatus] = useState<MessageSearchStatus>('idle');
  const [results, setResults] = useState<ChatMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const keywordRef = useRef('');
  const seqRef = useRef(0);
  const pageRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const request = useCallback(
    async (kw: string, page: number, mode: 'reset' | 'more') => {
      if (!conversationId || !kw) return;
      const seq = seqRef.current + 1;
      seqRef.current = seq;

      if (mode === 'reset') {
        setStatus('loading');
        setError(null);
        // 换关键词时先清空旧结果，避免高亮与新关键词不匹配
        setResults([]);
        setTotal(0);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await messageApi.searchMessages(conversationId, kw, {
          page,
          pageSize: SEARCH_PAGE_SIZE,
        });
        if (seq !== seqRef.current) return;

        const list = res?.list ?? [];
        setTotal(res?.total ?? 0);

        if (mode === 'reset') {
          pageRef.current = 1;
          setResults(list);
          setStatus(list.length > 0 ? 'success' : 'empty');
        } else {
          pageRef.current = page;
          setResults((prev) => {
            const merged = new Map<number, ChatMessage>(prev.map((item) => [item.id, item]));
            list.forEach((item) => merged.set(item.id, item));
            return [...merged.values()];
          });
          setStatus('success');
        }
      } catch (err) {
        if (seq !== seqRef.current) return;
        console.error('搜索消息失败', err);
        setError('搜索失败，请稍后重试');
        setStatus('error');
      } finally {
        if (seq === seqRef.current) setLoadingMore(false);
      }
    },
    [conversationId],
  );

  /** 安排一次防抖搜索（组合态下不触发） */
  const schedule = useCallback(
    (value: string) => {
      clearTimer();
      const kw = value.trim();
      if (!kw) {
        seqRef.current += 1;
        setResults([]);
        setTotal(0);
        setError(null);
        setStatus('idle');
        return;
      }
      if (composingRef.current) return;
      setStatus('debouncing');
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (composingRef.current) return;
        void request(kw, 1, 'reset');
      }, DEBOUNCE_MS);
    },
    [clearTimer, request],
  );

  const setKeyword = useCallback(
    (value: string) => {
      keywordRef.current = value;
      setKeywordState(value);
      schedule(value);
    },
    [schedule],
  );

  const setComposing = useCallback(
    (composing: boolean) => {
      composingRef.current = composing;
      if (!composing) schedule(keywordRef.current);
    },
    [schedule],
  );

  const hasMore = results.length < total;

  const loadMore = useCallback(async () => {
    const kw = keywordRef.current.trim();
    if (!kw || loadingMore || !hasMore) return;
    await request(kw, pageRef.current + 1, 'more');
  }, [hasMore, loadingMore, request]);

  const retry = useCallback(async () => {
    const kw = keywordRef.current.trim();
    if (!kw) return;
    await request(kw, 1, 'reset');
  }, [request]);

  const reset = useCallback(() => {
    clearTimer();
    seqRef.current += 1;
    composingRef.current = false;
    keywordRef.current = '';
    pageRef.current = 1;
    setKeywordState('');
    setResults([]);
    setTotal(0);
    setError(null);
    setStatus('idle');
    setLoadingMore(false);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    keyword,
    setKeyword,
    setComposing,
    status,
    results,
    total,
    error,
    loadingMore,
    hasMore,
    loadMore,
    retry,
    reset,
  };
}
