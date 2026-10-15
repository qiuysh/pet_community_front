import { Link } from 'react-router-dom';
import { useAdoptList } from '../../hooks/useAdoptList';
import { PetType, AdoptionStatus } from '../../types/adopt';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FilterChip } from '../../components/ui/filterChip';
import { Skeleton } from '../../components/ui/skeleton';

export const AdoptListPage = () => {
  const {
    adopts,
    loading,
    total,
    page,
    setPage,
    filters,
    handleTypeChange,
  } = useAdoptList();

  const totalPages = Math.ceil(total / 10);

  const getStatusLabel = (status: AdoptionStatus) => {
    switch (status) {
      case AdoptionStatus.PENDING:
        return '待领养';
      case AdoptionStatus.ADOPTED:
        return '已领养';
      case AdoptionStatus.CANCELLED:
        return '已取消';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: AdoptionStatus) => {
    switch (status) {
      case AdoptionStatus.PENDING:
        return 'bg-secondary-soft text-secondary-dark';
      case AdoptionStatus.ADOPTED:
        return 'bg-primary-soft text-primary-dark';
      case AdoptionStatus.CANCELLED:
        return 'bg-error/10 text-error-dark';
      default:
        return 'bg-muted text-brown';
    }
  };

  const getPetTypeLabel = (petType: PetType) => {
    switch (petType) {
      case PetType.CAT:
        return '猫咪';
      case PetType.DOG:
        return '狗狗';
      case PetType.BIRD:
        return '鸟类';
      case PetType.FISH:
        return '鱼类';
      case PetType.OTHER:
        return '其他';
      default:
        return '未知';
    }
  };

  return (
    <div className="bg-cream min-h-screen pb-6">
      <div className="sticky top-[var(--user-header-offset,56px)] bg-white z-10 shadow-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-brown">领养中心</h1>
            <Link to="/adopts/create">
              <Button size="sm">发布领养</Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <FilterChip active={!filters.petType} onClick={() => handleTypeChange(undefined)}>
              全部
            </FilterChip>
            <FilterChip
              active={filters.petType === PetType.CAT}
              onClick={() => handleTypeChange(PetType.CAT)}
            >
              猫咪
            </FilterChip>
            <FilterChip
              active={filters.petType === PetType.DOG}
              onClick={() => handleTypeChange(PetType.DOG)}
            >
              狗狗
            </FilterChip>
            <FilterChip
              active={filters.petType === PetType.OTHER}
              onClick={() => handleTypeChange(PetType.OTHER)}
            >
              其他
            </FilterChip>
          </div>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="none" className="overflow-hidden">
                <div className="flex">
                  <Skeleton className="w-24 h-24 shrink-0" />
                  <div className="flex-1 p-3 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : adopts.length === 0 ? (
          <div className="text-center py-8 text-brown-muted">暂无领养信息</div>
        ) : (
          <div className="space-y-3 mt-4">
            {adopts.map((adopt) => (
              <Link key={adopt.id} to={`/adopts/${adopt.id}`} className="block">
                <Card hoverable padding="none" className="overflow-hidden">
                <div className="flex">
                  {adopt.photos && adopt.photos.length > 0 && (
                    <img
                      src={adopt.photos[0]}
                      alt={adopt.petName}
                      className="w-24 h-24 object-cover"
                    />
                  )}
                  <div className="flex-1 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-brown">{adopt.petName}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(adopt.status)}`}
                        >
                          {getStatusLabel(adopt.status)}
                        </span>
                      </div>
                      <span className="text-xs text-brown-muted">{adopt.applicationCount} 人申请</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-brown-muted">
                      <span>{getPetTypeLabel(adopt.petType)}</span>
                      {adopt.petAge && <span>· {adopt.petAge}</span>}
                      {adopt.petGender === 1 && <span>· 公</span>}
                      {adopt.petGender === 2 && <span>· 母</span>}
                    </div>
                    <div className="text-sm text-brown-muted truncate">{adopt.description}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-brown-light">
                      <span className="icon-location" />
                      <span>{adopt.location}</span>
                    </div>
                  </div>
                </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {total > 10 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <span className="px-3 py-1.5 text-sm text-brown-muted">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
