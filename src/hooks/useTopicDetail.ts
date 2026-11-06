import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostList } from '../api/post';
import {
  getTopicDetail as getDiscoveryTopicDetail,
  participateTopic,
  shareTopic,
} from '../api/discovery';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { useShare } from './useShare';
import { useUserStore } from '../stores/userStore';
import { PostInfo, PostListResponse } from '../types/post';
import { TopicDetailInfo } from '../types/discovery';

/**
 * 话题详情 hook：详情（含参与状态）+ 动态列表 + 参与/分享
 */
export function useTopicDetail(id?: string | number, defaultPageSize = 10) {
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn } = useUserStore();
  const [topic, setTopic] = useState<TopicDetailInfo | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [page, setPage] = useState(1);

  const topicId = id !== undefined ? Number(id) : 0;

  const loadTopic = useCallback(async () => {
    if (!topicId) return;
    setLoadingTopic(true);
    try {
      const res = await getDiscoveryTopicDetail(topicId);
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

  const toggleParticipate = async () => {
    if (!topicId) return;
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/topics/${topicId}` } });
      return;
    }
    setParticipating(true);
    try {
      const was = !!topic?.isParticipated;
      await participateTopic(topicId);
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              isParticipated: !was,
              participantsCount: Math.max(0, prev.participantsCount + (was ? -1 : 1)),
            }
          : prev,
      );
      toast.success(was ? '已取消参与' : '已参与话题');
    } catch (err) {
      toast.error((err as Error).message || '操作失败');
    } finally {
      setParticipating(false);
    }
  };

  // 分享：打开面板不发请求，选定平台才上报（与帖子分享同一接缝）
  const share = useShare({
    record: (platform) => (topicId ? shareTopic(topicId, platform) : Promise.resolve({ shareUrl: '' })),
    onCountChange: (delta) =>
      setTopic((p) => (p ? { ...p, sharesCount: Math.max(0, p.sharesCount + delta) } : p)),
    resolveTarget: () => ({
      url: `${window.location.origin}/topics/${topicId}`,
      title: topic?.name ?? '',
    }),
  });

  return {
    topic,
    loadingTopic,
    posts,
    loadingPosts,
    total,
    totalPages,
    page,
    setPage,
    participating,
    toggleParticipate,
    ...share,
  };
}
