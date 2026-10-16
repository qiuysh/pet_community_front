import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Users,
  Activity,
  FileText,
  Heart,
  Bookmark,
  Share2,
  Vote,
  ClipboardList,
} from 'lucide-react';
import { DashboardCard } from '@/components/admin/dashboardCard';
import {
  DashboardInteractionPanel,
  DashboardStockPanel,
} from '@/components/admin/dashboardMetricPanels';
import { TodayTrendChart } from '@/components/admin/todayTrendChart';
import { TodoAggregate } from '@/components/admin/todoAggregate';
import { AdminButton } from '@/components/admin/adminButton';
import { getDashboardOverview, getTodoAggregate } from '@/api/admin';
import { useAsyncEffect } from '@/hooks/useAsync';
import { adminUi } from '@/styles/adminUi';
import { dayOverDayChange, formatCount } from '@/utils/dashboardMetrics';

// 运营驾驶舱 - 实时概览（今日指标、业务存量、趋势、待办）
export function AdminDashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { loading, data, refetch } = useAsyncEffect(
    async () => {
      const [overview, todo] = await Promise.all([
        getDashboardOverview(),
        getTodoAggregate(),
      ]);
      setLastUpdated(new Date());
      return { overview, todo };
    },
    [],
    { onError: (error) => console.error('获取驾驶舱数据失败:', error) },
  );

  useEffect(() => {
    const interval = setInterval(() => refetch(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = () => refetch();

  const isInitialLoading = loading && !data;
  const refreshing = loading && !!data;

  if (isInitialLoading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent motion-reduce:animate-none" />
        <span className="sr-only">加载中…</span>
      </div>
    );
  }

  const overview = data?.overview;
  const todoData = data?.todo;
  const summary = overview?.summary;

  const newUsersChange = dayOverDayChange(summary?.todayNewUsers ?? 0, summary?.yesterdayNewUsers ?? 0);
  const activeChange = dayOverDayChange(summary?.todayActiveUsers ?? 0, summary?.yesterdayActiveUsers ?? 0);
  const postsChange = dayOverDayChange(summary?.todayPosts ?? 0, summary?.yesterdayPosts ?? 0);
  const likesChange = dayOverDayChange(summary?.todayLikes ?? 0, summary?.yesterdayLikes ?? 0);
  const favoritesChange = dayOverDayChange(summary?.todayFavorites ?? 0, summary?.yesterdayFavorites ?? 0);
  const sharesChange = dayOverDayChange(summary?.todayShares ?? 0, summary?.yesterdayShares ?? 0);
  const registrationsChange = dayOverDayChange(summary?.todayRegistrations ?? 0, summary?.yesterdayRegistrations ?? 0);
  const votesChange = dayOverDayChange(summary?.todayVotes ?? 0, summary?.yesterdayVotes ?? 0);

  const adCtr =
    summary && summary.adTotalViews > 0
      ? `${Math.round((summary.adTotalClicks / summary.adTotalViews) * 1000) / 10}%`
      : '0%';

  return (
    <div className="space-y-5 animate-fadeIn sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className={adminUi.pageTitle}>运营驾驶舱</h1>
          <p className={adminUi.pageDesc}>
            今日核心指标与待办
            {lastUpdated && (
              <span className="ml-2 text-xs text-brown-muted">
                最后更新：{lastUpdated.toLocaleTimeString('zh-CN')}
              </span>
            )}
          </p>
        </div>
        <AdminButton type="button" variant="secondary" onClick={handleRefresh} disabled={refreshing} loading={refreshing}>
          <RefreshCw className={`mr-2 inline h-4 w-4 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
          {refreshing ? '刷新中…' : '刷新'}
        </AdminButton>
      </div>

      <section aria-label="今日用户与内容">
        <h2 className={`${adminUi.sectionTitle} mb-3`}>今日概况</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <DashboardCard
            label="今日新增用户"
            value={formatCount(summary?.todayNewUsers)}
            hint={`累计用户 ${formatCount(summary?.totalUsers)}`}
            change={newUsersChange.change}
            changeType={newUsersChange.changeType}
            iconTone="bg-secondary-soft text-secondary"
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            label="今日活跃"
            value={formatCount(summary?.todayActiveUsers)}
            change={activeChange.change}
            changeType={activeChange.changeType}
            iconTone="bg-success-soft text-success"
            icon={<Activity className="h-5 w-5" />}
          />
          <DashboardCard
            label="今日发帖"
            value={formatCount(summary?.todayPosts)}
            hint={`累计帖子 ${formatCount(summary?.totalPosts)}`}
            change={postsChange.change}
            changeType={postsChange.changeType}
            iconTone="bg-secondary-soft text-secondary"
            icon={<FileText className="h-5 w-5" />}
          />
          <DashboardCard
            label="今日点赞"
            value={formatCount(summary?.todayLikes)}
            hint={`今日评论 ${formatCount(summary?.todayComments)}`}
            change={likesChange.change}
            changeType={likesChange.changeType}
            iconTone="bg-warning/10 text-warning"
            icon={<Heart className="h-5 w-5" />}
          />
        </div>
      </section>

      <section
        aria-label="互动与存量"
        className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6"
      >
        <div className="min-w-0">
          <h2 className={`${adminUi.sectionTitle} mb-3`}>今日互动与活动</h2>
          <DashboardInteractionPanel
            interaction={[
              {
                key: 'favorites',
                label: '收藏',
                value: formatCount(summary?.todayFavorites),
                change: favoritesChange.change,
                changeType: favoritesChange.changeType,
                icon: <Bookmark className="h-3.5 w-3.5" />,
              },
              {
                key: 'shares',
                label: '分享',
                value: formatCount(summary?.todayShares),
                change: sharesChange.change,
                changeType: sharesChange.changeType,
                icon: <Share2 className="h-3.5 w-3.5" />,
              },
            ]}
            activity={[
              {
                key: 'registrations',
                label: '报名',
                value: formatCount(summary?.todayRegistrations),
                change: registrationsChange.change,
                changeType: registrationsChange.changeType,
                hint: `待审 ${formatCount(summary?.pendingRegistrations)}`,
                icon: <ClipboardList className="h-3.5 w-3.5" />,
              },
              {
                key: 'votes',
                label: '投票',
                value: formatCount(summary?.todayVotes),
                change: votesChange.change,
                changeType: votesChange.changeType,
                icon: <Vote className="h-3.5 w-3.5" />,
              },
            ]}
          />
        </div>
        <div className="min-w-0">
          <h2 className={`${adminUi.sectionTitle} mb-3`}>业务存量</h2>
          <DashboardStockPanel
            groups={[
              {
                title: '内容与社区',
                items: [
                  { key: 'pets', label: '宠物档案', value: formatCount(summary?.totalPets) },
                  { key: 'activities', label: '进行中活动', value: formatCount(summary?.ongoingActivities) },
                  { key: 'lost', label: '寻宠进行中', value: formatCount(summary?.ongoingLostPets) },
                ],
              },
              {
                title: '广告投放',
                items: [
                  { key: 'views', label: '累计曝光', value: formatCount(summary?.adTotalViews) },
                  { key: 'clicks', label: '累计点击', value: formatCount(summary?.adTotalClicks) },
                  { key: 'ctr', label: '点击率', value: adCtr },
                ],
              },
              {
                title: '治理效率',
                items: [
                  {
                    key: 'reportRate',
                    label: '举报处理率',
                    value: `${summary?.reportHandleRate ?? 0}%`,
                  },
                  {
                    key: 'todos',
                    label: '待处理事项',
                    value: formatCount(todoData?.total),
                    hint: `待审帖子 ${formatCount(summary?.pendingReviews)}`,
                  },
                ],
              },
            ]}
          />
        </div>
      </section>

      <section
        aria-label="趋势与待办"
        className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-6"
      >
        <div className="min-w-0 lg:col-span-2">
          {overview?.todayTrend && (
            <TodayTrendChart
              userTrend={overview.todayTrend}
              postTrend={overview.postTrend}
              height={280}
            />
          )}
        </div>
        <div className="min-w-0">
          <TodoAggregate data={todoData ?? null} loading={refreshing} />
        </div>
      </section>
    </div>
  );
}
