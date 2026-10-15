import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopicDetail, getPostList } from '../api/post';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { TopicInfo, PostInfo, PostListResponse } from '../types/post';

/**
 * 话题详情 hook
 *
 * 封装话题详情加载 + 话题下动态列表的分页加载。
 * 话题详情加载失败时自动导航回话题列表。
 *
 * 用法:
 *   const { topic, posts, loadingTopic, loadingPosts, total, totalPages, page, setPage } = useTopicDetail(id);
 */
export function useTopicDetail(id?: string | number, defaultPageSize = 10) {
  const navigate = useNavigate();
  const toast = useToast();
  const [topic, setTopic] = useState<TopicInfo | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [page, setPage] = useState(1);

  const topicId = id !== undefined ? Number(id) : 0;

  const loadTopic = useCallback(async () => {
    if (!topicId) return;
    setLoadingTopic(true);
    try {
      const res = await getTopicDetail(topicId);
      setTopic(res);
    } catch (e) {
      const msg = (e as { message?: string })?.message || '话题不存在';
      toast.error(msg);
      navigate('/topics');
    } finally {
      setLoadingTopic(false);
    }
  }, [topicId, toast, navigate]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  const { loading: loadingPosts, data: postsData } = useAsyncEffect<PostListResponse>(
    async () => {
      if (!topicId) return { list: [], total: 0, page: 1, pageSize: defaultPageSize };
      return await getPostList({ topicId, page, pageSize: defaultPageSize });
    },
    [topicId, page],
    { onError: () => toast.error('加载动态失败') },
  );

  const posts: PostInfo[] = postsData?.list ?? [];
  const total: number = postsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / defaultPageSize));

  return {
    topic,
    loadingTopic,
    posts,
    loadingPosts,
    total,
    totalPages,
    page,
    setPage,
  };
}
