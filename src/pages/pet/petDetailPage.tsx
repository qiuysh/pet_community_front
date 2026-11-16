import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import { usePetDetail } from '../../hooks/usePetDetail';
import { useShare } from '../../hooks/useShare';
import { PetTypeOptions, PetVisibilityOptions, getPetTypeIcon, PetTypeFallbackIcon } from '../../types/pet';
import { FileText, Share2 } from 'lucide-react';
import { PetAlbumSection } from '../../components/pet/petAlbumSection';
import { PetGrowthSection } from '../../components/pet/petGrowthSection';
import { ShareSheet } from '../../components/post/shareSheet';
import { Button, buttonClass } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { formatCount } from '../../utils/format';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { ICON_SIZE } from '../../styles/iconSize';

export function PetDetailPage() {
  const siteName = useSiteConfigStore((s) => s.siteName) || DEFAULT_SITE_NAME;
  const {
    pet,
    loading,
    album,
    growthRecords,
    relatedPosts,
    relatedPostsTotal,
    relatedPostsLoading,
    activeTab,
    setActiveTab,
    isOwner,
    uploading,
    mutating,
    uploadAlbumPhotos,
    uploadAlbumVideo,
    removeAlbumPhoto,
    setAlbumCover,
    reorderAlbum,
    saveGrowthRecord,
    removeGrowthRecord,
  } = usePetDetail();

  const {
    shareOpen,
    shareUrl,
    shareTitle,
    openShare,
    closeShare,
    onShare,
  } = useShare({
    record: async () => undefined,
    resolveTarget: () => ({
      url: `${window.location.origin}/pets/${pet?.id ?? ''}`,
      title: pet ? `【萌宠】${pet.name}${pet.breedName ? ` · ${pet.breedName}` : ''}` : '宠物档案',
    }),
  });

  const handleOpenShare = useCallback(() => {
    if (!pet) return;
    openShare();
  }, [pet, openShare]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner label="加载中…" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="bg-cream min-h-screen">
        <PageHeader title="宠物详情" fallbackTo="/pets" />
        <div className="page-shell">
          <EmptyState
            title="宠物不存在或已被删除"
            description="可能已下架或链接失效"
            icon={<PetTypeFallbackIcon size={64} aria-hidden="true" />}
            action={
              <Link to="/pets" className="font-medium text-primary-text">
                返回宠物广场
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const petTypeInfo = PetTypeOptions.find(t => t.value === pet.petType);
  const visibilityLabel = PetVisibilityOptions.find((o) => o.value === (pet.visibility ?? 0))?.label;

  const tabItems = [
    {
      key: 'album',
      title: (
        <>
          相册
          <span className="ml-1 text-brown-muted">({album.length})</span>
        </>
      ),
    },
    {
      key: 'growth',
      title: (
        <>
          成长记录
          <span className="ml-1 text-brown-muted">({growthRecords.length})</span>
        </>
      ),
    },
    {
      key: 'posts',
      title: (
        <>
          相关帖子
          <span className="ml-1 text-brown-muted">({relatedPostsTotal})</span>
        </>
      ),
    },
  ];

  return (
    <div className="bg-cream min-h-screen pb-6">
      <PageHeader title={pet.name || '宠物详情'} fallbackTo="/pets" />

      {/* 列宽与 PageHeader 内层 page-shell 同宽；水平边距由卡片内 padding 承担（§5.5） */}
      <div className="page-shell space-y-4 py-4">
        <div>
          <div className="page-hero-surface relative h-40 overflow-hidden rounded-md sm:h-48">
            <div
              className="pointer-events-none absolute -bottom-10 right-[14%] h-36 w-36 rounded-full bg-secondary-soft blur-xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-6 left-[10%] h-28 w-28 rounded-full bg-secondary-soft/80 blur-xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-10 left-[18%] h-8 w-8 rounded-full bg-primary/25 blur-sm"
              aria-hidden="true"
            />
          </div>

          <Card className="relative -mt-16" padding="none">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:gap-6 sm:p-6">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-card sm:h-32 sm:w-32">
                {pet.avatar ? (
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    width={128}
                    height={128}
                    className="h-full w-full rounded-full object-cover"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-cream to-secondary-soft text-brown">
                    {(() => {
                      const PetIcon = getPetTypeIcon(pet.petType);
                      return <PetIcon size={48} aria-hidden="true" />;
                    })()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="page-content-title">{pet.name}</h1>
                  {pet.gender === 1 && <span className="text-[length:var(--font-size-title)] text-primary-text">♂</span>}
                  {pet.gender === 2 && <span className="text-[length:var(--font-size-title)] text-error-text">♀</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-brown-muted">
                  <span>{petTypeInfo?.label || '未知'}</span>
                  <span>·</span>
                  <span>{pet.breedName || '未知品种'}</span>
                  {pet.weight > 0 && (
                    <>
                      <span>·</span>
                      <span>{pet.weight} kg</span>
                    </>
                  )}
                </div>
                {pet.personality && (
                  <p className="mt-2 text-sm text-brown-secondary">{pet.personality}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3 pb-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleOpenShare}
                >
                  <Share2 size={ICON_SIZE.inline} aria-hidden="true" />
                  分享
                </Button>
                {isOwner && (
                  <Link
                    to={`/pets/${pet.id}/edit`}
                    className={buttonClass({ variant: 'outline', size: 'sm' })}
                  >
                    编辑
                  </Link>
                )}
              </div>
            </div>

            {isOwner && visibilityLabel && (
              <div className="px-4 pb-2 sm:px-6">
                <span className="inline-flex rounded-md bg-soft px-2 py-1 text-xs text-brown-muted">
                  {visibilityLabel}
                </span>
              </div>
            )}

            {pet.bio && (
              <div className="px-4 pb-4 sm:px-6">
                <p className="text-sm text-brown-secondary">{pet.bio}</p>
              </div>
            )}

            <div className="border-t border-border-light px-4 pb-2">
              <Tabs
                listOnly
                items={tabItems}
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'album' | 'growth' | 'posts')}
              />
            </div>
          </Card>
        </div>

        <div>
          {activeTab === 'album' && (
            <PetAlbumSection
              album={album}
              petType={pet.petType}
              coverUrl={pet.avatar}
              isOwner={isOwner}
              uploading={uploading}
              onUploadPhotos={uploadAlbumPhotos}
              onUploadVideo={uploadAlbumVideo}
              onDelete={removeAlbumPhoto}
              onSetCover={setAlbumCover}
              onReorder={reorderAlbum}
            />
          )}

          {activeTab === 'growth' && (
            <PetGrowthSection
              records={growthRecords}
              isOwner={isOwner}
              saving={mutating}
              onSave={saveGrowthRecord}
              onDelete={removeGrowthRecord}
            />
          )}

          {activeTab === 'posts' && (
            <Card padding="none">
              {relatedPostsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : relatedPosts.length === 0 ? (
                <EmptyState compact icon={<FileText size={32} aria-hidden="true" />} title="暂无相关帖子" />
              ) : (
                <ul className="divide-y divide-border-light">
                  {relatedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/posts/${post.id}`}
                        className="block px-4 py-3 transition-colors hover:bg-cream"
                      >
                        <p className="line-clamp-2 text-sm text-brown">
                          {post.content || '分享了一条动态'}
                        </p>
                        <div className="mt-2 flex gap-3 text-xs text-brown-muted tabular-nums">
                          <span>{formatCount(post.likesCount)} 赞</span>
                          <span>{formatCount(post.commentsCount)} 评论</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        <Card>
          <h3 className="page-section-title mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">类型</span>
              <span className="text-brown">{petTypeInfo?.label || '未知'}</span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">品种</span>
              <span className="text-brown">{pet.breedName || '未知'}</span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">性别</span>
              <span className="text-brown">
                {pet.gender === 1 ? '公' : pet.gender === 2 ? '母' : '保密'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">体重</span>
              <span className="text-brown tabular-nums">
                {pet.weight > 0 ? `${pet.weight} kg` : '未知'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">是否绝育</span>
              <span className="text-brown">{pet.isSterilized === 1 ? '是' : '否'}</span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">疫苗接种</span>
              <span className="text-brown">{pet.isVaccinated === 1 ? '已接种' : '未接种'}</span>
            </div>
            <div className="flex justify-between border-b border-border-light py-2">
              <span className="text-brown-muted">浏览量</span>
              <span className="text-brown tabular-nums">{formatCount(pet.viewCount)}</span>
            </div>
          </div>
        </Card>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={closeShare}
        postUrl={shareUrl}
        postTitle={shareTitle}
        onShare={(platform) => void onShare(platform)}
        poster={{
          siteName,
          title: shareTitle,
          coverUrl: pet.avatar,
          authorName: pet.name,
          authorAvatar: pet.avatar,
        }}
      />
    </div>
  );
}
