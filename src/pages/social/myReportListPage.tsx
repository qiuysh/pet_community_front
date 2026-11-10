import { useState } from 'react';
import { getReportList, getReportDetail } from '../../api/post';
import { ReportReasonOptions } from '../../types/post';
import type { ReportInfo } from '../../types/post';
import { useAsync, useAsyncEffect } from '../../hooks/useAsync';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';

const PAGE_SIZE = 10;

function statusLabel(status: number) {
  if (status === 0) return '待处理';
  if (status === 1) return '已处理';
  return '已驳回';
}

function targetLabel(type: string) {
  const labels: Record<string, string> = {
    post: '动态',
    comment: '评论',
    topic: '话题',
    user: '用户',
  };
  return labels[type] ?? type;
}

function reasonLabel(type: string) {
  return ReportReasonOptions.find((option) => option.value === type)?.label ?? type;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/** 我的举报：查看自己提交的举报与处理结果（R11）。 */
export function MyReportListPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ReportInfo | null>(null);
  const { loading, data } = useAsyncEffect(() => getReportList(page, PAGE_SIZE), [page]);
  const { loading: detailLoading, run: runDetail } = useAsync();

  const toggleDetail = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    runDetail(
      () => getReportDetail(id),
      (res) => setDetail(res as ReportInfo),
      () => setExpandedId(null),
    );
  };
  const list: ReportInfo[] = data?.list ?? [];
  const total = data?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page-shell min-h-screen px-4 py-4">
      <PageHeader title="我的举报" fallbackTo="/profile" />

      <div className="mt-4 space-y-3 motion-list">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))
        ) : list.length === 0 ? (
          <EmptyState compact title="暂无举报记录" description="你提交的举报会显示在这里" />
        ) : (
          list.map((report) => (
            <Card key={report.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-brown">
                  {targetLabel(report.targetType)} #{report.targetId}
                </span>
                <span className="text-xs text-brown-muted">{statusLabel(report.status)}</span>
              </div>
              <p className="text-sm text-brown-secondary">
                举报原因：{reasonLabel(report.reasonType)} · {report.reason}
              </p>
              {report.handleResult && (
                <p className="text-sm text-brown-secondary">处理结果：{report.handleResult}</p>
              )}
              <p className="text-xs text-brown-muted">{formatTime(report.createdAt)}</p>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDetail(report.id)}
                >
                  {expandedId === report.id ? '收起详情' : '查看详情'}
                </Button>
              </div>
              {expandedId === report.id && (
                <div className="rounded-md bg-cream p-3 text-sm text-brown-secondary">
                  {detailLoading ? (
                    '加载中…'
                  ) : (
                    <>
                      <p>处理结果：{detail?.handleResult || '处理中'}</p>
                      {detail?.handledAt && (
                        <p className="mt-1 text-xs text-brown-muted">
                          处理时间：{formatTime(detail.handledAt)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {maxPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-brown-muted">
            {page} / {maxPage}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= maxPage || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
