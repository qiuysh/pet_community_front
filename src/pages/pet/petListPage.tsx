import { Link } from 'react-router-dom';
import { usePetList } from '../../hooks/usePetList';
import { PetTypeOptions, getPetTypeIcon, PetTypeFallbackIcon } from '../../types/pet';
import { useUserStore } from '../../stores/userStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FilterChip } from '../../components/ui/filterChip';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

export function PetListPage() {
  const { isLoggedIn } = useUserStore();
  const { pets, loading, petType, setPetType, keyword, setKeyword } = usePetList();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brown">宠物广场</h1>
            <p className="text-brown-secondary text-sm mt-1">发现可爱的毛孩子们</p>
          </div>
          {isLoggedIn && (
            <Link to="/pets/create">
              <Button>+ 发布宠物档案</Button>
            </Link>
          )}
        </div>

        <Card className="mb-6" padding="md">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 flex-wrap">
              <FilterChip active={petType === 0} onClick={() => setPetType(0)}>
                全部
              </FilterChip>
              {PetTypeOptions.map((type) => (
                <FilterChip
                  key={type.value}
                  active={petType === type.value}
                  onClick={() => setPetType(type.value)}
                >
                  {type.emoji} {type.label}
                </FilterChip>
              ))}
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索宠物名称或品种..."
                aria-label="搜索宠物"
              />
            </div>
          </div>
        </Card>

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                to={`/pets/${pet.id}`}
                className="bg-white rounded-md overflow-hidden shadow-card hover:shadow-hover transition-shadow group"
              >
                <div className="aspect-square bg-linear-to-br from-primary-soft to-primary-light/20 relative overflow-hidden">
                  {pet.avatar ? (
                    <img
                      src={pet.avatar}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <h3 className="font-semibold text-brown truncate">{pet.name}</h3>
                    {pet.gender === 1 && <span className="text-info">♂</span>}
                    {pet.gender === 2 && <span className="text-error">♀</span>}
                  </div>
                  <p className="text-sm text-brown-muted truncate">{pet.breedName || '未知品种'}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center text-brown-light">
              <PetTypeFallbackIcon size={64} aria-hidden="true" />
            </div>
            <p className="text-brown-secondary">暂无宠物档案</p>
            {isLoggedIn && (
              <Link
                to="/pets/create"
                className="inline-block mt-4 text-primary hover:text-primary-dark font-medium"
              >
                立即创建第一个宠物档案
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
