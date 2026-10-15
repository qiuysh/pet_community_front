export interface ChartDataPoint {
  label: string;
  value: number | string;
}

export interface TrendData {
  title: string;
  xKey: string;
  yKey: string;
  data: ChartDataPoint[];
}

export interface ComparisonData {
  title: string;
  current: ChartDataPoint[];
  previous: ChartDataPoint[];
  comparison: string;
}

export interface DistributionData {
  title: string;
  type: 'pie' | 'bar';
  data: ChartDataPoint[];
}

/** 驾驶舱实时指标（今日值 + 昨日值便于环比；含部分累计） */
export interface DashboardSummary {
  totalUsers: number;
  todayNewUsers: number;
  yesterdayNewUsers: number;
  todayActiveUsers: number;
  yesterdayActiveUsers: number;
  totalPosts: number;
  todayPosts: number;
  yesterdayPosts: number;
  todayLikes: number;
  yesterdayLikes: number;
  todayComments: number;
  yesterdayComments: number;
  todayFavorites: number;
  yesterdayFavorites: number;
  todayShares: number;
  yesterdayShares: number;
  todayRegistrations: number;
  yesterdayRegistrations: number;
  todayVotes: number;
  yesterdayVotes: number;
  pendingReviews: number;
  pendingRegistrations: number;
  pendingAdoptions: number;
  totalPets: number;
  totalLikes: number;
  ongoingActivities: number;
  ongoingLostPets: number;
  adTotalViews: number;
  adTotalClicks: number;
  reportHandleRate: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  todayTrend: TrendData;
  postTrend: TrendData;
}

export interface TodoItem {
  key: string;
  label: string;
  count: number;
  link: string;
}

export interface TodoAggregate {
  items: TodoItem[];
  total: number;
}

export type TrendType = 'user_growth' | 'post_publish' | 'activity_log';
export type CompareType = 'week' | 'month';
export type DistributionType = 'pet_type' | 'user_location' | 'post_status' | 'user_gender';
