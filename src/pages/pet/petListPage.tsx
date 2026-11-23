import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { usePetList } from '../../hooks/usePetList';
import { PetTypeOptions, getPetTypeIcon, PetTypeFallbackIcon } from '../../types/pet';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useUserStore } from '../../stores/userStore';
import { PostImage } from '../../components/post/postImage';
import '../../components/post/postImage.scss';
import { buttonClass } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { FilterChip } from '../../components/ui/filterChip';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

export function PetListPage() {
  const { isLoggedIn } = useUserStore();
  const { pets, loading, petType, setPetType, keyword, setKeyword } = usePetList();

  return (
    <div className="min-h-screen bg-cream pb-6">
      <div className="sticky top-[var(--user-header-offset,56px)] bg-white z-10 shadow-card">
        <div className="page-shell px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h1 className="page-bar-title">宠物广场</h1>
              <p className="text-brown-secondary text-xs mt-0.5 truncate">发现可爱的毛孩子们</p>
            </div>
            {isLoggedIn ? (
              <Link to="/pets/create" className={buttonClass({ size: 'sm' })}>
                + 发布档案
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: '/pets/create' }}
                className={buttonClass({ size: 'sm', variant: 'outline' })}
              >
                <Lock
                  size={ICON_SIZE.inline}
                  strokeWidth={iconStroke(ICON_SIZE.inline)}
                  className="mr-1"
                  aria-hidden="true"
                />
                登录后发布
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <FilterChip active={petType === 0} onClick={() => setPetType(0)}>
              全部
            </FilterChip>
            {PetTypeOptions.map((type) => {
              const TypeIcon = type.Icon;
              return (
                <FilterChip
                  key={type.value}
                  active={petType === type.value}
                  onClick={() => setPetType(type.value)}
                >
                  <TypeIcon
                    size={ICON_SIZE.action}
                    strokeWidth={iconStroke(ICON_SIZE.action)}
                    aria-hidden="true"
                  />
                  {type.label}
                </FilterChip>
              );
            })}
            <div className="flex-1 min-w-[160px]">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索宠物名称或品种…"
                aria-label="搜索宠物"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell py-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} padding="none" className="overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 motion-list">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                to={`/pets/${pet.id}`}
                className="bg-white rounded-md overflow-hidden shadow-card hover:shadow-hover transition-shadow group"
              >
                <div className="aspect-square bg-linear-to-br from-cream to-secondary-soft relative overflow-hidden">
                  {pet.avatar ? (
                    <PostImage
                      src={pet.avatar}
                      alt={pet.name}
                      className="h-full w-full"
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brown-light">
                      {(() => {
                        const PetIcon = getPetTypeIcon(pet.petType);
                        return <PetIcon size={48} aria-hidden="true" />;
                      })()}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-base text-brown truncate">{pet.name}</h3>
                    {pet.gender === 1 && <span className="text-info-text">♂</span>}
                    {pet.gender === 2 && <span className="text-error-text">♀</span>}
                  </div>
                  <p className="text-sm text-brown-muted truncate">{pet.breedName || '未知品种'}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PetTypeFallbackIcon size={ICON_SIZE.empty} />}
            title="暂无宠物档案"
            description={isLoggedIn ? undefined : '登录后可以发布你家毛孩的档案'}
            action={
              isLoggedIn ? (
                <Link to="/pets/create" className="font-medium text-primary-text hover:text-primary-text">
                  立即创建第一个宠物档案
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: '/pets/create' }}
                  className="font-medium text-primary-text"
                >
                  登录后发布
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
