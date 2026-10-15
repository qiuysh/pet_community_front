import { useState, useEffect } from 'react';
import { followApi, userFollowApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { useUserStore } from '../stores/userStore';
import { UserInfo } from '../types/user';
import { showErrorToast, showSuccessToast } from '../utils/toastManager';

export interface FollowInfo extends UserInfo {
  isFollowed?: boolean;
  /** 悄悄关注标识（仅自己关注列表可见，F6-04） */
  isSecret?: boolean;
}

type FollowTab = 'following' | 'followers' | 'secret-following';

/**
 * 关注/粉丝/悄悄关注列表 hook
 *
 * 按 userId + tab(following/followers/secret-following) 拉取列表,
 * 支持关注/取关/切换悄悄关注操作(乐观更新 + 失败回滚)。
 *
 * 用法:
 *   const { users, loading, total, activeTab, setActiveTab, handleFollow } = useFollowList(userId, initialType);
 */
export function useFollowList(userId: number, initialType?: string, pageSize = 20) {
  const [page, setPage] = useState(1);
  const { user: currentUser } = useUserStore();
  const resolveTab = (t?: string): FollowTab => {
    if (t === 'followers') return 'followers';
    if (t === 'secret-following') return 'secret-following';
    return 'following';
  };
  const [activeTab, setActiveTab] = useState<FollowTab>(resolveTab(initialType));

  useEffect(() => {
    setActiveTab(resolveTab(initialType));
  }, [initialType]);

  const { loading, data, setData } = useAsyncEffect(
    async () => {
      if (activeTab === 'secret-following') {
        // 悄悄关注列表：仅自己可访问（F6-02）
        return followApi.getSecretFollowing({ page, pageSize }) as Promise<{ list: FollowInfo[]; total: number }>;
      }
      return userFollowApi.getFollowListByUser(userId, { type: activeTab, page, pageSize }) as Promise<{ list: FollowInfo[]; total: number }>;
    },
    [page, activeTab, userId, pageSize],
    { onError: (error) => console.error('获取列表失败', error) },
  );

  const users: FollowInfo[] = data?.list ?? [];
  const total: number = data?.total ?? 0;

  const handleFollow = async (targetId: number, isFollowed: boolean) => {
    // 乐观更新
    setData(prev => prev ? { ...prev, list: prev.list.map(u => u.id === targetId ? { ...u, isFollowed: !isFollowed } : u) } : prev);

    try {
      if (isFollowed) {
        await userFollowApi.unfollowUser(targetId);
        showSuccessToast('已取消关注');
      } else {
        await userFollowApi.followUser(targetId);
        showSuccessToast('关注成功');
      }
    } catch (error) {
      console.error('操作失败', error);
      showErrorToast('操作失败');
      // 回滚
      setData(prev => prev ? { ...prev, list: prev.list.map(u => u.id === targetId ? { ...u, isFollowed: isFollowed } : u) } : prev);
    }
  };

  /** 切换悄悄关注标记（仅自己关注列表可用，F6） */
  const handleToggleSecret = async (targetId: number, isSecret: boolean) => {
    setData(prev => prev ? { ...prev, list: prev.list.map(u => u.id === targetId ? { ...u, isSecret: !isSecret } : u) } : prev);
    try {
      await userFollowApi.setSecretFollow(targetId, !isSecret);
      showSuccessToast(!isSecret ? '已设为悄悄关注' : '已设为公开关注');
    } catch (error) {
      console.error('操作失败', error);
      showErrorToast('操作失败');
      setData(prev => prev ? { ...prev, list: prev.list.map(u => u.id === targetId ? { ...u, isSecret } : u) } : prev);
    }
  };

  const handleTabChange = (tab: FollowTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return {
    users,
    loading,
    total,
    activeTab,
    page,
    setPage,
    handleFollow,
    handleToggleSecret,
    handleTabChange,
    isOwnList: !!currentUser && currentUser.id === userId,
  };
}
