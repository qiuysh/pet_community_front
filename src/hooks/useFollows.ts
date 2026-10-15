import { useEffect } from 'react';
import { followApi } from '../api/social';
import { useAsyncEffect } from './useAsync';
import { useUserStore } from '../stores/userStore';

export interface FollowUser {
  id: number;
  nickname: string;
  avatar?: string;
  signature?: string;
}

/**
 * 当前用户关注列表 hook
 *
 * 供 newMessagePage 在选择收件人时加载关注列表使用。
 *
 * 用法:
 *   const { follows, loading } = useFollows();
 */
export function useFollows(pageSize = 50) {
  const { user, fetchProfile, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (isLoggedIn && !user) {
      void fetchProfile();
    }
  }, [isLoggedIn, user, fetchProfile]);

  const userId = user?.id ?? 0;

  const { loading, data } = useAsyncEffect(
    () => {
      if (!userId) {
        return Promise.resolve({ list: [] as FollowUser[], total: 0 });
      }
      return followApi.getFollowing(userId, { page: 1, pageSize }) as Promise<{ list: FollowUser[]; total: number }>;
    },
    [userId, pageSize],
    { onError: (e) => console.error('获取关注列表失败', e) },
  );

  const follows: FollowUser[] = data?.list ?? [];

  return { follows, loading: loading || (isLoggedIn && !user) };
}
