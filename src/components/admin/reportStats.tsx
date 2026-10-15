import type { ReportStatsResponse } from '../../types/admin';

interface ReportStatsProps {
  stats: ReportStatsResponse | null;
  loading?: boolean;
}

const REASON_LABELS: Record<string, string> = {
  spam: '垃圾信息',
  adult: '色情低俗',
  attack: '人身攻击',
  other: '其他',
};

const TARGET_LABELS: Record<string, string> = {
  post: '动态',
  comment: '评论',
  user: '用户',
};

export function ReportStats({ stats, loading }: ReportStatsProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-soft rounded-md" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: '举报总数', value: stats.total, color: 'text-brown' },
    { label: '待处理', value: stats.pending, color: 'text-warning' },
    { label: '已处理', value: stats.handled, color: 'text-success' },
    { label: '处理率', value: `${stats.handleRate.toFixed(1)}%`, color: 'text-secondary' },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-soft rounded-md p-4">
            <div className="text-xs text-brown-muted mb-1">{card.label}</div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {(stats.byReasonType?.length > 0 || stats.byTargetType?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.byReasonType?.length > 0 && (
            <div className="border border-border-light rounded-md p-4">
              <h4 className="text-sm font-semibold text-brown mb-3">按原因类型</h4>
              <div className="space-y-2">
                {stats.byReasonType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <span className="text-brown-secondary">{REASON_LABELS[item.type] || item.type}</span>
                    <span className="font-medium text-brown">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.byTargetType?.length > 0 && (
            <div className="border border-border-light rounded-md p-4">
              <h4 className="text-sm font-semibold text-brown mb-3">按目标类型</h4>
              <div className="space-y-2">
                {stats.byTargetType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <span className="text-brown-secondary">{TARGET_LABELS[item.type] || item.type}</span>
                    <span className="font-medium text-brown">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
