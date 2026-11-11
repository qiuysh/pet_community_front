import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

/**
 * 整页刷新后恢复登录用户的资料。
 *
 * userStore 只持久化 token，user 对象刷新后恒为 null，
 * 依赖 user.id 的权限判断（如宠物详情页 isOwner）会误判为访客，
 * 主人视角的编辑/上传入口因此不渲染。应用挂载时补拉一次资料即可恢复。
 */
export function useUserBootstrap(): void {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const hasUser = useUserStore((state) => state.user !== null);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  useEffect(() => {
    if (!isLoggedIn || hasUser) {
      return;
    }
    void fetchProfile();
  }, [isLoggedIn, hasUser, fetchProfile]);
}
