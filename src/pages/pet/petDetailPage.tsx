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
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto" />
          <p className="mt-4 text-brown-muted">加载中…</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center text-brown-light">
            <PetTypeFallbackIcon size={64} aria-hidden="true" />
          </div>
          <p className="text-brown-muted mb-4">宠物不存在或已被删除</p>
          <Link to="/pets" className="text-primary-text hover:text-primary-text font-medium">
            返回宠物广场
          </Link>
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
    <div className="min-h-screen bg-soft">
      <div className="page-hero-surface h-64">
        <div
          className="pointer-events-none absolute -bottom-10 right-[14%] h-36 w-36 rounded-full bg-secondary-soft blur-xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-8 left-[12%] h-20 w-20 rounded-full bg-primary/20 blur-md"
          aria-hidden="true"
        />
      </div>

      <div className="page-shell -mt-24">
        <Card className="rounded-xl shadow-sm" padding="none">
          <div className="p-6 flex items-end gap-6">
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg overflow-hidden">
              {pet.avatar ? (
                <img src={pet.avatar} alt={pet.name} className="w-full h-full rounded-full object-cover" decoding="async" />
              ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-cream to-secondary-soft flex items-center justify-center text-brown">
                  {(() => {
                    const PetIcon = getPetTypeIcon(pet.petType);
                    return <PetIcon size={48} aria-hidden="true" />;
                  })()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="page-content-title">{pet.name}</h1>
                {pet.gender === 1 && <span className="text-xl text-primary-text">♂</span>}
                {pet.gender === 2 && <span className="text-xl text-error-text">♀</span>}
              </div>
              <div className="flex items-center gap-4 mt-2 text-brown-muted">
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
                <p className="text-sm text-brown-secondary mt-2">{pet.personality}</p>
              )}
            </div>
            <div className="pb-2 flex gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={handleOpenShare}
              >
                <Share2 size={ICON_SIZE.inline} aria-hidden="true" />
                分享
              </Button>
              {isOwner && (
                <Link
                  to={`/pets/${pet.id}/edit`}
                  className={buttonClass({ variant: 'outline', size: 'sm', className: 'rounded-lg' })}
                >
                  编辑
                </Link>
              )}
            </div>
          </div>

          {isOwner && visibilityLabel && (
            <div className="px-6 pb-2">
              <span className="inline-flex text-xs text-brown-muted bg-bg-secondary px-2 py-1 rounded-md">
                {visibilityLabel}
              </span>
            </div>
          )}

          {pet.bio && (
            <div className="px-6 pb-4">
              <p className="text-brown-secondary text-sm">{pet.bio}</p>
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

        <div className="mt-6">
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
            <Card className="rounded-xl shadow-sm">
              {relatedPostsLoading ? (
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              ) : relatedPosts.length === 0 ? (
                <EmptyState compact icon={<FileText size={32} />} title="暂无相关帖子" />
              ) : (
                <ul className="divide-y divide-border-light">
                  {relatedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/posts/${post.id}`}
                        className="block px-4 py-3 hover:bg-cream transition-colors"
                      >
                        <p className="text-sm text-brown line-clamp-2">
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

        <div className="mt-6 pb-12">
          <Card className="rounded-xl shadow-sm">
            <h3 className="page-section-title mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">类型</span>
                <span className="text-brown">{petTypeInfo?.label || '未知'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">品种</span>
                <span className="text-brown">{pet.breedName || '未知'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">性别</span>
                <span className="text-brown">
                  {pet.gender === 1 ? '公' : pet.gender === 2 ? '母' : '保密'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">体重</span>
                <span className="text-brown tabular-nums">
                  {pet.weight > 0 ? `${pet.weight} kg` : '未知'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">是否绝育</span>
                <span className="text-brown">{pet.isSterilized === 1 ? '是' : '否'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">疫苗接种</span>
                <span className="text-brown">{pet.isVaccinated === 1 ? '已接种' : '未接种'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-light">
                <span className="text-brown-muted">浏览量</span>
                <span className="text-brown tabular-nums">{formatCount(pet.viewCount)}</span>
              </div>
            </div>
          </Card>
        </div>
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
