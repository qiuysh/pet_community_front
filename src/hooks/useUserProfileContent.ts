import { useState } from 'react';
import { getPostList, getMyFavorites, getMyLikes } from '../api/post';
import { getPetList } from '../api/pet';
import { useAsyncEffect } from './useAsync';
import type { PostInfo } from '../types/post';
import type { PetInfo } from '../types/pet';

export type ProfileContentTab = 'posts' | 'pets' | 'favorites' | 'likes';

/**
 * 个人主页内容 Tab：帖子 / 宠物 / 收藏 / 点赞
 * 收藏与点赞仅本人可见（依赖登录态接口）
 */
export function useUserProfileContent(opts: {
  profileUserId?: number;
  isOwnProfile: boolean;
  pageSize?: number;
}) {
  const { profileUserId, isOwnProfile, pageSize = 12 } = opts;
  const [activeTab, setActiveTab] = useState<ProfileContentTab>('posts');
  const [page, setPage] = useState(1);

  const switchTab = (tab: ProfileContentTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const postsHook = useAsyncEffect(
    async () => {
      if (!profileUserId || activeTab !== 'posts') return undefined;
      return getPostList({ userId: profileUserId, page, pageSize });
    },
    [profileUserId, activeTab, page, pageSize],
    { onError: (err) => console.error('加载主页帖子失败', err) },
  );

  const petsHook = useAsyncEffect(
    async () => {
      if (!profileUserId || activeTab !== 'pets') return undefined;
      return getPetList({ userId: profileUserId, page, pageSize });
    },
    [profileUserId, activeTab, page, pageSize],
    { onError: (err) => console.error('加载主页宠物失败', err) },
  );

  const favoritesHook = useAsyncEffect(
    async () => {
      if (!isOwnProfile || activeTab !== 'favorites') return undefined;
      return getMyFavorites(page, pageSize);
    },
    [isOwnProfile, activeTab, page, pageSize],
    { onError: (err) => console.error('加载收藏失败', err) },
  );

  const likesHook = useAsyncEffect(
    async () => {
      if (!isOwnProfile || activeTab !== 'likes') return undefined;
      return getMyLikes(page, pageSize);
    },
    [isOwnProfile, activeTab, page, pageSize],
    { onError: (err) => console.error('加载点赞失败', err) },
  );

  const loading =
    (activeTab === 'posts' && postsHook.loading) ||
    (activeTab === 'pets' && petsHook.loading) ||
    (activeTab === 'favorites' && favoritesHook.loading) ||
    (activeTab === 'likes' && likesHook.loading);

  const posts: PostInfo[] =
    activeTab === 'posts'
      ? postsHook.data?.list ?? []
      : activeTab === 'favorites'
        ? favoritesHook.data?.list ?? []
        : activeTab === 'likes'
          ? likesHook.data?.list ?? []
          : [];

  const pets: PetInfo[] = activeTab === 'pets' ? petsHook.data?.list ?? [] : [];

  const total =
    activeTab === 'posts'
      ? postsHook.data?.total ?? 0
      : activeTab === 'pets'
        ? petsHook.data?.total ?? 0
        : activeTab === 'favorites'
          ? favoritesHook.data?.total ?? 0
          : likesHook.data?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    activeTab,
    setActiveTab: switchTab,
    page,
    setPage,
    loading,
    posts,
    pets,
    total,
    totalPages,
  };
}
