import { useActivityList } from '../../hooks/useActivityList';
import { ActivityType } from '../../types/activity';
import { ActivityCard } from '../../components/activity';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { FilterChip } from '../../components/ui/filterChip';
import { Skeleton } from '../../components/ui/skeleton';

export const ActivityListPage = () => {
  const {
    activities,
    loading,
    total,
    page,
    setPage,
    filters,
    handleTypeChange,
    handleStatusChange,
  } = useActivityList();

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="bg-cream min-h-screen pb-6">
      <div className="sticky top-[var(--user-header-offset,56px)] bg-white z-10 shadow-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-brown">活动中心</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <FilterChip active={!filters.type} onClick={() => handleTypeChange(undefined)}>
              全部
            </FilterChip>
            <FilterChip
              active={filters.type === ActivityType.VOTING}
              onClick={() => handleTypeChange(ActivityType.VOTING)}
            >
              投票评选
            </FilterChip>
            <FilterChip
              active={filters.type === ActivityType.CONTEST}
              onClick={() => handleTypeChange(ActivityType.CONTEST)}
            >
              作品征集
            </FilterChip>
            <FilterChip
              active={filters.type === ActivityType.COLLECTION}
              onClick={() => handleTypeChange(ActivityType.COLLECTION)}
            >
              话题征集
            </FilterChip>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              tone="secondary"
              active={filters.status === 'active'}
              onClick={() => handleStatusChange('active')}
            >
              进行中
            </FilterChip>
            <FilterChip
              tone="secondary"
              active={filters.status === 'upcoming'}
              onClick={() => handleStatusChange('upcoming')}
            >
              即将开始
            </FilterChip>
            <FilterChip
              tone="secondary"
              active={filters.status === 'ended'}
              onClick={() => handleStatusChange('ended')}
            >
              已结束
            </FilterChip>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="none">
                <Skeleton className="h-40 w-full rounded-t-md" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-brown-muted">暂无活动</div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="flex items-center text-sm text-brown-muted">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
