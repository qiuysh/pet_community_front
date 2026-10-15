import { useState } from 'react';
import { LineChart } from '../../components/charts/lineChart';
import { MultiLineChart } from '../../components/charts/multiLineChart';
import { ComparisonChart } from '../../components/charts/comparisonChart';
import { DistributionChart } from '../../components/charts/distributionChart';
import { ExportButton } from '../../components/admin/exportButton';
import {
  getUserGrowthStats,
  getContentStats,
  getInteractionStats,
  getComparisonStats,
  getDistributionStats,
  exportStats
} from '../../api/admin';
import type {
  UserGrowthStats,
  ContentStats,
  InteractionStats,
  ExportStatsRequest
} from '../../types/stats';
import type {
  ComparisonData,
  DistributionData,
  CompareType
} from '../../types/chart';
import { useAsyncEffect } from '../../hooks/useAsync';
import { chartTheme } from '../../styles/chartTheme';
import { AdminSelect } from '../../components/admin/adminField';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminUi } from '../../styles/adminUi';

type Period = '7d' | '30d' | '90d';

const periodDays: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

interface AnalyticsData {
  userGrowth: UserGrowthStats;
  content: ContentStats;
  interaction: InteractionStats;
  comparison: ComparisonData;
  petType: DistributionData;
  postStatus: DistributionData;
}

// 分析报表页 - 深度数据分析（趋势/对比/分布/导出/周期选择）
export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [compareType, setCompareType] = useState<CompareType>('week');
  const [exportLoading, setExportLoading] = useState(false);

  const getDateRange = (p: Period) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - periodDays[p]);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const { loading, data } = useAsyncEffect<AnalyticsData>(
    async () => {
      const dates = getDateRange(period);
      const [userGrowth, content, interaction, comparison, petType, postStatus] = await Promise.all([
        getUserGrowthStats(dates.start, dates.end),
        getContentStats(dates.start, dates.end),
        getInteractionStats(dates.start, dates.end),
        getComparisonStats('user_growth', compareType),
        getDistributionStats('pet_type'),
        getDistributionStats('post_status')
      ]);
      return { userGrowth, content, interaction, comparison, petType, postStatus };
    },
    [period, compareType],
    { onError: (error) => console.error('获取分析数据失败:', error) },
  );

  const userGrowthStats = data?.userGrowth ?? null;
  const contentStats = data?.content ?? null;
  const interactionStats = data?.interaction ?? null;
  const userGrowthComparison = data?.comparison ?? null;
  const petTypeDistribution = data?.petType ?? null;
  const postStatusDistribution = data?.postStatus ?? null;

  const handleExport = async (type: 'overview' | 'user_growth' | 'content' | 'interaction') => {
    setExportLoading(true);
    try {
      const dates = getDateRange(period);
      const exportData: ExportStatsRequest = {
        type,
        startDate: dates.start,
        endDate: dates.end
      };
      const blob = await exportStats(exportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${type}_${dates.start}_${dates.end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出数据失败:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent motion-reduce:animate-none" />
        <span className="sr-only">加载中…</span>
      </div>
    );
  }

  const userGrowthData = userGrowthStats?.data.map(d => ({
    label: d.date,
    value: d.newUsers
  })) || [];

  const contentChartData = contentStats?.data.map(d => ({
    label: d.date,
    values: {
      帖子: d.posts,
      评论: d.comments,
      话题: d.topics
    }
  })) || [];

  const interactionChartData = interactionStats?.data.map(d => ({
    label: d.date,
    values: {
      点赞: d.likes,
      收藏: d.favorites,
      分享: d.shares,
      评论: d.comments
    }
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={adminUi.page}>
        <AdminPageHeader
          title="分析报表"
          description="深度数据分析，洞察用户增长与内容互动趋势"
          actions={<ExportButton onExport={handleExport} />}
        />
        <div className={adminUi.filterSection}>
          <AdminFilterBar>
            <AdminFilterField label="统计周期" htmlFor="analytics-period">
              <AdminSelect
                id="analytics-period"
                name="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
              >
                <option value="7d">{periodDays['7d']} 天</option>
                <option value="30d">{periodDays['30d']} 天</option>
                <option value="90d">{periodDays['90d']} 天</option>
              </AdminSelect>
            </AdminFilterField>
            <AdminFilterField label="对比方式" htmlFor="analytics-compare">
              <AdminSelect
                id="analytics-compare"
                name="compareType"
                value={compareType}
                onChange={(e) => setCompareType(e.target.value as CompareType)}
              >
                <option value="week">环比</option>
                <option value="month">同比</option>
              </AdminSelect>
            </AdminFilterField>
          </AdminFilterBar>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className={adminUi.sectionTitle}>趋势分析</h2>
        <div className="grid grid-cols-1 gap-4">
          <LineChart
            data={userGrowthData}
            title="用户增长趋势"
            color={chartTheme.secondary}
          />
          <MultiLineChart
            data={contentChartData}
            title="内容统计趋势"
            series={[
              { name: '帖子', color: chartTheme.primary },
              { name: '评论', color: chartTheme.warning },
              { name: '话题', color: chartTheme.secondary }
            ]}
          />
          <MultiLineChart
            data={interactionChartData}
            title="互动统计趋势"
            series={[
              { name: '点赞', color: chartTheme.primary },
              { name: '收藏', color: chartTheme.info },
              { name: '分享', color: chartTheme.secondary },
              { name: '评论', color: chartTheme.warning }
            ]}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={adminUi.sectionTitle}>对比分析</h2>
        <div className="min-w-0 w-full">
          {userGrowthComparison && <ComparisonChart data={userGrowthComparison} />}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={adminUi.sectionTitle}>分布分析</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {petTypeDistribution && (
            <div className="min-w-0">
              <DistributionChart data={petTypeDistribution} />
            </div>
          )}
          {postStatusDistribution && (
            <div className="min-w-0">
              <DistributionChart data={postStatusDistribution} />
            </div>
          )}
        </div>
      </section>

      {exportLoading && (
        <div
          className={`${adminUi.overlay} overscroll-contain`}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-3 rounded-md bg-white p-6 shadow-hover">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-secondary border-t-transparent motion-reduce:animate-none" />
            <span className="text-brown">正在导出数据…</span>
          </div>
        </div>
      )}
    </div>
  );
}
