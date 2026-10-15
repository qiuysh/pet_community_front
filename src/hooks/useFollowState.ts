import { useCallback, useEffect, useState } from 'react';
import { followApi } from '../api/social';
import { useUserStore } from '../stores/userStore';
import type { FollowStatus } from '../types/user';
import { showErrorToast, showSuccessToast } from '../utils/toastManager';

/**
 * 关注状态 hook（个人主页关注按钮使用）
 *
 * 拉取当前登录用户对 targetId 的关注状态（isFollowing / isSecret / isMutual），
 * 并提供 关注 / 取消关注 / 切换悄悄关注 操作（乐观更新 + 失败回滚）。
 *
 * - 游客或查看自己主页：status 为 null，不渲染关注按钮。
 * - 悄悄关注（F6）：不通知对方、不计入对方粉丝数；仅可看对方公开动态（总览 §4.7）。
 */
export function useFollowState(targetId: number | undefined) {
  const { isLoggedIn } = useUserStore();
  const [status, setStatus] = useState<FollowStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!targetId || !isLoggedIn) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      const data = await followApi.getFollowStatus(targetId);
      setStatus(data);
    } catch (err) {
      console.error('获取关注状态失败', err);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [targetId, isLoggedIn]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  /** 关注（普通） */
  const follow = useCallback(async (secret = false) => {
    if (!targetId || !isLoggedIn || acting) return;
    setActing(true);
    const prev = status;
    // 乐观更新
    setStatus((s) => (s ? { ...s, isFollowing: true, isSecret: secret } : s));
    try {
      await followApi.followUser(targetId, { secret });
      showSuccessToast(secret ? '已悄悄关注' : '关注成功');
      await fetchStatus();
    } catch (err) {
      showErrorToast((err as Error).message || '操作失败');
      setStatus(prev); // 回滚
    } finally {
      setActing(false);
    }
  }, [targetId, isLoggedIn, acting, status, fetchStatus]);

  /** 取消关注 */
  const unfollow = useCallback(async () => {
    if (!targetId || !isLoggedIn || acting) return;
    setActing(true);
    const prev = status;
    setStatus((s) => (s ? { ...s, isFollowing: false, isSecret: false, isMutual: false } : s));
    try {
      await followApi.unfollowUser(targetId);
      showSuccessToast('已取消关注');
      await fetchStatus();
    } catch (err) {
      showErrorToast((err as Error).message || '操作失败');
      setStatus(prev);
    } finally {
      setActing(false);
    }
  }, [targetId, isLoggedIn, acting, status, fetchStatus]);

  /** 切换悄悄关注标记（需已关注） */
  const setSecret = useCallback(async (secret: boolean) => {
    if (!targetId || !isLoggedIn || acting) return;
    setActing(true);
    const prev = status;
    setStatus((s) => (s ? { ...s, isSecret: secret } : s));
    try {
      await followApi.setSecretFollow(targetId, secret);
      showSuccessToast(secret ? '已设为悄悄关注' : '已设为公开关注');
      await fetchStatus();
    } catch (err) {
      showErrorToast((err as Error).message || '操作失败');
      setStatus(prev);
    } finally {
      setActing(false);
    }
  }, [targetId, isLoggedIn, acting, status, fetchStatus]);

  return { status, loading, acting, follow, unfollow, setSecret, refresh: fetchStatus };
}
