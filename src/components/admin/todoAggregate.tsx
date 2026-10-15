import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { TodoAggregate as TodoAggregateData } from '@/types/chart';
import { adminUi } from '@/styles/adminUi';

interface TodoAggregateProps {
  data: TodoAggregateData | null;
  loading?: boolean;
}

/** 待办聚合（驾驶舱）：Link 导航，支持 Cmd/Ctrl+click */
export function TodoAggregate({ data, loading }: TodoAggregateProps) {
  if (loading) {
    return (
      <div className={adminUi.chartCard}>
        <div className="animate-pulse">
          <div className="mb-3 h-4 w-1/4 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className={`${adminUi.chartCard} h-full`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className={adminUi.blockTitle}>待办事项</h3>
        {data && data.total > 0 && (
          <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium tabular-nums text-warning">
            共 {data.total} 项
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="py-8 text-center text-brown-muted text-sm">
          暂无待办事项
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.link}
              className="w-full flex items-center justify-between p-3 hover:bg-soft rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.count > 0 ? 'bg-warning' : 'bg-border'}`} />
                <span className="text-sm text-brown">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${item.count > 0 ? 'text-warning' : 'text-brown-muted'}`}>
                  {item.count}
                </span>
                <ChevronRight className="w-4 h-4 text-brown-muted" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
