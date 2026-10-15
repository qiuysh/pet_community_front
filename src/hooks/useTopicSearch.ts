import { useEffect, useRef, useState } from 'react';
import { searchTopics } from '../api/post';

/**
 * 话题搜索 hook(防抖)
 *
 * 输入关键词后,延迟 delay ms 调用 searchTopics,返回匹配的话题列表。
 * 关键词为空时立即清空 suggestions。
 *
 * 用法:
 *   const { keyword, setKeyword, suggestions } = useTopicSearch();
 */
export function useTopicSearch(delay = 300) {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<import('../types/post').TopicInfo[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const trimmed = keyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchTopics(trimmed, 10);
        setSuggestions(res);
      } catch (e) {
        console.error('搜索话题失败', e);
        setSuggestions([]);
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [keyword, delay]);

  const clear = () => {
    setKeyword('');
    setSuggestions([]);
  };

  return { keyword, setKeyword, suggestions, clear };
}
