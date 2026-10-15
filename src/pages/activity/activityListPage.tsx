import { useActivityList } from '../../hooks/useActivityList';
import { ActivityType, ActivityStatus } from '../../types/activity';
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
              active={filters.type === ActivityType.ONLINE_VOTE}
              onClick={() => handleTypeChange(ActivityType.ONLINE_VOTE)}
            >
              线上投票
            </FilterChip>
            <FilterChip
              active={filters.type === ActivityType.OFFLINE_EVENT}
              onClick={() => handleTypeChange(ActivityType.OFFLINE_EVENT)}
            >
              线下活动
            </FilterChip>
            <FilterChip
              active={filters.type === ActivityType.ADOPTION}
              onClick={() => handleTypeChange(ActivityType.ADOPTION)}
            >
              领养活动
            </FilterChip>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              tone="secondary"
              active={filters.status === ActivityStatus.ONGOING}
              onClick={() => handleStatusChange(ActivityStatus.ONGOING)}
            >
              进行中
            </FilterChip>
            <FilterChip
              tone="secondary"
              active={filters.status === ActivityStatus.PUBLISHED}
              onClick={() => handleStatusChange(ActivityStatus.PUBLISHED)}
            >
              即将开始
            </FilterChip>
            <FilterChip
              tone="secondary"
              active={filters.status === ActivityStatus.ENDED}
              onClick={() => handleStatusChange(ActivityStatus.ENDED)}
            >
              已结束
            </FilterChip>
          </div>
        </div>
      </div>

      <div className="px-4">
        {loading && activities.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} padding="none" className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="py-8 text-center text-brown-muted">暂无活动</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>

        {total > 10 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="ghost"
              className="bg-white"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="text-sm text-brown-muted">
              第 {page} 页 / 共 {totalPages} 页
            </span>
            <Button
              variant="ghost"
              className="bg-white"
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
