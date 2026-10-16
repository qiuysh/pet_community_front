import { Link } from 'react-router-dom';
import { usePetDetail } from '../../hooks/usePetDetail';
import { PetTypeOptions, getPetTypeIcon, PetTypeFallbackIcon } from '../../types/pet';
import { FileText } from 'lucide-react';
import { PetAlbumSection } from '../../components/pet/petAlbumSection';
import { PetGrowthSection } from '../../components/pet/petGrowthSection';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';

export function PetDetailPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto" />
          <p className="mt-4 text-brown-muted">加载中...</p>
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
          <Link to="/pets" className="text-primary hover:text-primary-dark font-medium">
            返回宠物广场
          </Link>
        </div>
      </div>
    );
  }

  const petTypeInfo = PetTypeOptions.find(t => t.value === pet.petType);

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
      <div className="bg-primary-soft h-64" />

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        <Card className="rounded-xl shadow-sm" padding="none">
          <div className="p-6 flex items-end gap-6">
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg overflow-hidden">
              {pet.avatar ? (
                <img src={pet.avatar} alt={pet.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center text-brown">
                  {(() => {
                    const PetIcon = getPetTypeIcon(pet.petType);
                    return <PetIcon size={48} aria-hidden="true" />;
                  })()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-brown">{pet.name}</h1>
                {pet.gender === 1 && <span className="text-xl text-primary">♂</span>}
                {pet.gender === 2 && <span className="text-xl text-pink-500">♀</span>}
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
              {isOwner && (
                <Link to={`/pets/${pet.id}/edit`}>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg">
                    编辑
                  </Button>
                </Link>
              )}
            </div>
          </div>

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
                <div className="text-center py-12">
                  <div className="mb-3 flex justify-center text-brown-light">
                    <FileText size={32} aria-hidden="true" />
                  </div>
                  <p className="text-brown-muted">暂无相关帖子</p>
                </div>
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
                        <div className="mt-2 flex gap-3 text-xs text-brown-muted">
                          <span>{post.likesCount} 赞</span>
                          <span>{post.commentsCount} 评论</span>
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
            <h3 className="font-medium text-brown mb-4">基本信息</h3>
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
                <span className="text-brown">{pet.weight || '未知'} kg</span>
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
                <span className="text-brown">{pet.viewCount}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
