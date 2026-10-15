import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { getPublicProfile } from '../../api/user';
import { blockApi } from '../../api/social';
import { useFollowState } from '../../hooks/useFollowState';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { MapPin, Clock, PawPrint, Heart, MessageCircle, Send, Ban, UserPlus, UserCheck, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs } from '../../components/ui/tabs';
import { Avatar } from '../../components/ui/avatar';
import { Dropdown } from '../../components/ui/dropdown';
import type { PublicUserProfile } from '../../types/user';

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, fetchProfile, isLoggedIn } = useUserStore();
  const isOwnProfile = !id || (user && id === user.id.toString());
  const [blocking, setBlocking] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // 关注状态（仅他人主页 + 已登录时拉取）
  const targetIdForFollow = id && !isOwnProfile ? Number(id) : undefined;
  const { status: followStatus, acting: followActing, follow, unfollow, setSecret } =
    useFollowState(targetIdForFollow);

  useEffect(() => {
    if (isOwnProfile && !user) {
      fetchProfile();
    }
  }, [isOwnProfile, user, fetchProfile]);

  useEffect(() => {
    const targetId = id ? Number(id) : user?.id;
    if (!targetId || Number.isNaN(targetId)) return;

    let cancelled = false;
    setLoadingProfile(true);
    getPublicProfile(targetId)
      .then((profile) => {
        if (!cancelled) setPublicProfile(profile);
      })
      .catch((err) => {
        if (!cancelled) {
          showErrorToast((err as Error).message || '加载主页失败');
          setPublicProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const displayUser = publicProfile ?? (isOwnProfile ? user : null);
  const postsCount = publicProfile?.postsCount ?? 0;
  const followingCount = publicProfile?.followingCount ?? 0;
  const followersCount = publicProfile?.followersCount ?? 0;

  const handleStartConversation = () => {
    if (!id) return;
    const nickname = displayUser?.nickname ?? '';
    navigate(
      `/messages/new?userId=${encodeURIComponent(id)}&nickname=${encodeURIComponent(nickname)}`,
    );
  };

  const handleBlock = async () => {
    if (!id || !isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!window.confirm('拉黑后双方将无法互看动态、评论与私信，并自动取消关注。确定拉黑？')) {
      return;
    }
    setBlocking(true);
    try {
      await blockApi.blockUser(Number(id));
      showSuccessToast('已拉黑该用户');
      navigate(-1);
    } catch (err) {
      showErrorToast((err as Error).message || '拉黑失败');
    } finally {
      setBlocking(false);
    }
  };

  const profileTabItems = [
    { key: 'posts', title: '帖子' },
    { key: 'pets', title: '宠物' },
    { key: 'favorites', title: '收藏' },
    { key: 'likes', title: '点赞' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-primary-soft h-48 relative overflow-hidden">
        <div className="absolute top-10 right-20 w-32 h-32 bg-primary-light/25 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-5 left-10 w-48 h-48 bg-white/60 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      </div>

      <div className="mx-auto max-w-5xl px-3 sm:px-4 -mt-16">
        <Card className="rounded-xl shadow-card animate-fadeIn" padding="none">
          <div className="flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-end sm:gap-5 sm:p-6">
            <div className="h-20 w-20 shrink-0 rounded-full bg-white p-1 shadow-soft sm:h-24 sm:w-24 md:h-28 md:w-28">
              <Avatar
                name={displayUser?.nickname || '宠友'}
                className="!size-full h-full w-full bg-primary text-2xl font-bold text-white sm:text-3xl"
              />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1
                className={[
                  'text-balance text-xl font-bold sm:text-2xl',
                  publicProfile?.isVipName || (displayUser as { isVipName?: boolean } | null)?.isVipName
                    ? 'text-secondary tracking-wide'
                    : 'text-brown',
                ].join(' ')}
              >
                {loadingProfile && !displayUser ? '加载中…' : displayUser?.nickname || '宠友'}
                {(publicProfile?.isVipName ||
                  (displayUser as { isVipName?: boolean } | null)?.isVipName) && (
                  <span className="ml-2 align-middle text-xs font-semibold text-secondary border border-secondary/40 rounded px-1.5 py-0.5">
                    Lv10
                  </span>
                )}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm text-brown-muted sm:text-base">
                {displayUser?.signature || '这个人很懒，什么都没留下...'}
              </p>
              {(displayUser?.location || displayUser?.petYears) && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-brown-secondary sm:justify-start">
                  {displayUser?.location && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{displayUser.location}</span>
                    </span>
                  )}
                  {displayUser?.petYears && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                      养宠 {displayUser.petYears}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 数据：帖子 / 关注 / 粉丝 —— 独立一行，数字上标签下 */}
          <div
            className="mx-4 mb-4 grid grid-cols-3 rounded-md border border-border-light bg-soft/30 sm:mx-6"
            role="group"
            aria-label="账号数据"
          >
            <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
              <span className="text-xl font-bold leading-none tabular-nums text-brown sm:text-2xl">
                {postsCount}
              </span>
              <span className="text-xs text-brown-muted">帖子</span>
            </div>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 border-x border-border-light px-2 py-3 transition-colors hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
              onClick={() => {
                const targetId = id || user?.id;
                if (targetId) navigate(`/follow/${targetId}/following`);
              }}
            >
              <span className="text-xl font-bold leading-none tabular-nums text-brown sm:text-2xl">
                {followingCount}
              </span>
              <span className="text-xs text-brown-muted">关注</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 transition-colors hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
              onClick={() => {
                const targetId = id || user?.id;
                if (targetId) navigate(`/follow/${targetId}/followers`);
              }}
            >
              <span className="text-xl font-bold leading-none tabular-nums text-brown sm:text-2xl">
                {followersCount}
              </span>
              <span className="text-xs text-brown-muted">粉丝</span>
            </button>
          </div>

          {/* 操作入口：与昵称分离，避免挤成一团 */}
          <div className="border-t border-border-light px-4 py-3 sm:px-6">
            {isOwnProfile ? (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <Link
                  to="/settings"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm text-brown-secondary transition-colors hover:bg-soft sm:rounded-full sm:px-4 sm:py-1.5"
                >
                  编辑资料
                </Link>
                <Link
                  to="/posts/drafts"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm text-brown-secondary transition-colors hover:bg-soft sm:rounded-full sm:px-4 sm:py-1.5"
                >
                  草稿箱
                </Link>
                <Link
                  to="/lost-pets"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm text-brown-secondary transition-colors hover:bg-soft sm:rounded-full sm:px-4 sm:py-1.5"
                >
                  寻宠
                </Link>
                <Link
                  to="/blocked"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm text-brown-secondary transition-colors hover:bg-soft sm:rounded-full sm:px-4 sm:py-1.5"
                >
                  黑名单
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                {/* 关注 / 已关注 + 悄悄关注 菜单（F1 / F6） */}
                {isLoggedIn && followStatus && (
                  followStatus.isFollowing ? (
                    <Dropdown
                      aria-label="关注操作"
                      trigger={
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={followActing}
                          className="min-h-10 rounded-md sm:rounded-full"
                          aria-label="已关注，点击管理"
                        >
                          <UserCheck size={14} aria-hidden="true" />
                          {followStatus.isSecret ? '悄悄关注' : '已关注'}
                          <MoreVertical size={14} aria-hidden="true" />
                        </Button>
                      }
                      items={[
                        followStatus.isSecret
                          ? { key: 'public', label: '设为公开关注' }
                          : { key: 'secret', label: '设为悄悄关注' },
                        { key: 'unfollow', label: '取消关注', danger: true },
                      ]}
                      onAction={(key) => {
                        if (key === 'public') void setSecret(false);
                        else if (key === 'secret') void setSecret(true);
                        else if (key === 'unfollow') {
                          if (window.confirm('确认取消关注？')) void unfollow();
                        }
                      }}
                    />
                  ) : (
                    <Dropdown
                      aria-label="关注选项"
                      trigger={
                        <Button
                          type="button"
                          size="sm"
                          disabled={followActing}
                          className="min-h-10 rounded-md sm:rounded-full"
                          aria-label="关注该用户"
                        >
                          <UserPlus size={14} aria-hidden="true" />
                          关注
                          <MoreVertical size={14} aria-hidden="true" />
                        </Button>
                      }
                      items={[
                        { key: 'normal', label: '关注' },
                        { key: 'secret', label: '悄悄关注' },
                      ]}
                      onAction={(key) => {
                        if (key === 'normal') void follow(false);
                        else if (key === 'secret') void follow(true);
                      }}
                    />
                  )
                )}
                {followStatus?.isMutual && (
                  <span className="inline-flex min-h-10 items-center gap-1 rounded-md border border-primary/40 px-3 text-xs text-primary sm:rounded-full" data-testid="mutual-follow">
                    互相关注
                  </span>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartConversation}
                  className="min-h-10 rounded-md sm:rounded-full"
                  aria-label={`私信 ${displayUser?.nickname || '该用户'}`}
                >
                  <Send size={14} aria-hidden="true" />
                  私信
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBlock}
                  disabled={blocking}
                  className="min-h-10 rounded-md sm:rounded-full"
                  aria-label={`拉黑 ${displayUser?.nickname || '该用户'}`}
                >
                  <Ban size={14} aria-hidden="true" />
                  {blocking ? '处理中…' : '拉黑'}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-border-light px-3 pb-3 pt-2 sm:px-6">
            <Tabs
              listOnly
              stretch
              items={profileTabItems}
              defaultSelectedKey="posts"
              aria-label="个人主页内容分类"
            />
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} hoverable className="rounded-xl shadow-card" padding="none">
              <div className="aspect-square bg-linear-to-br from-muted to-soft flex items-center justify-center">
                <PawPrint className="text-brown-light" size={48} aria-hidden="true" />
              </div>
              <div className="p-4">
                <p className="text-sm text-brown line-clamp-2">我家毛孩子今天又调皮了...</p>
                <div className="flex items-center justify-between mt-3 text-xs text-brown-muted">
                  <span className="flex items-center gap-1">
                    <Heart size={14} aria-hidden="true" />
                    <span>128</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} aria-hidden="true" />
                    <span>24</span>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 mb-12 text-center">
          <p className="text-brown-muted text-sm">暂无更多内容</p>
        </div>
      </div>
    </div>
  );
}
