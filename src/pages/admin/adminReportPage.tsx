import { useState, useEffect } from 'react';
import { getAdminReports, getAdminReportStats } from '../../api/admin';
import type { AdminReportInfo, ReportStatsResponse } from '../../types/admin';
import { showErrorToast } from '../../utils/toastManager';
import { ReportHandleAction } from '../../components/admin/reportHandleAction';
import { BatchReportHandle } from '../../components/admin/batchReportHandle';
import { ReportStats } from '../../components/admin/reportStats';
import { Pagination } from '../../components/admin/pagination';
import { useAsyncEffect } from '../../hooks/useAsync';
import { Flag, ClipboardList } from 'lucide-react';
import { adminUi } from '../../styles/adminUi';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminSelect } from '../../components/admin/adminField';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

type StatusFilter = 'all' | '0' | '1' | '2';
type ReasonFilter = 'all' | 'spam' | 'adult' | 'attack' | 'other';
type TargetFilter = 'all' | 'post' | 'comment';

interface ListResult {
  list: AdminReportInfo[];
  total: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: '待处理',
  1: '已处理',
  2: '已忽略',
};

const REASON_LABELS: Record<string, string> = {
  spam: '垃圾信息',
  adult: '色情低俗',
  attack: '人身攻击',
  other: '其他',
};

export function AdminReportPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('0');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');
  const [targetFilter, setTargetFilter] = useState<TargetFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [stats, setStats] = useState<ReportStatsResponse | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [statusFilter, reasonFilter, targetFilter]);

  const listHook = useAsyncEffect<ListResult>(
    async () => {
      const res = await getAdminReports({
        status: statusFilter === 'all' ? undefined : Number(statusFilter),
        reasonType: reasonFilter === 'all' ? undefined : reasonFilter,
        targetType: targetFilter === 'all' ? undefined : targetFilter,
        page: currentPage,
        pageSize,
      });
      return { list: res.list || [], total: res.total || 0 };
    },
    [statusFilter, reasonFilter, targetFilter, currentPage, pageSize],
    {
      initialData: { list: [], total: 0 },
      onError: (err) => showErrorToast((err as Error).message || '获取举报列表失败'),
    },
  );

  const statsHook = useAsyncEffect(
    async () => {
      const res = await getAdminReportStats();
      setStats(res);
      return res;
    },
    [],
    { onError: () => undefined },
  );

  const list = listHook.data?.list ?? [];
  const total = listHook.data?.total ?? 0;
  const loading = listHook.loading;
  const pendingOnly = statusFilter === '0';

  const refresh = () => {
    listHook.refetch();
    statsHook.refetch();
  };

  const handleSelectAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((item) => item.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getStatusTone = (status: number): AdminChipTone => {
    if (status === 0) return 'warning';
    if (status === 1) return 'success';
    return 'neutral';
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader title="举报处理" description="受理用户举报，维护社区秩序" />

      <div className="px-6 py-4 border-b border-border-light">
        <ReportStats stats={stats} loading={statsHook.loading} />
      </div>

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="处理状态" htmlFor="report-status">
            <AdminSelect
              id="report-status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="0">待处理</option>
              <option value="1">已处理</option>
              <option value="2">已忽略</option>
              <option value="all">全部</option>
            </AdminSelect>
          </AdminFilterField>
          <AdminFilterField label="举报原因" htmlFor="report-reason">
            <AdminSelect
              id="report-reason"
              name="reasonType"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value as ReasonFilter)}
            >
              <option value="all">全部</option>
              <option value="spam">垃圾信息</option>
              <option value="adult">色情低俗</option>
              <option value="attack">人身攻击</option>
              <option value="other">其他</option>
            </AdminSelect>
          </AdminFilterField>
          <AdminFilterField label="举报目标" htmlFor="report-target">
            <AdminSelect
              id="report-target"
              name="targetType"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as TargetFilter)}
            >
              <option value="all">全部</option>
              <option value="post">动态</option>
              <option value="comment">评论</option>
            </AdminSelect>
          </AdminFilterField>
        </AdminFilterBar>

        {pendingOnly && selectedIds.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-brown-secondary">已选择 {selectedIds.length} 条记录</span>
            <AdminButton type="button" variant="secondary" onClick={() => setShowBatchModal(true)}>
              批量处理
            </AdminButton>
          </div>
        )}
      </div>

      <div className="px-6">
        {loading ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center animate-pulse text-brown-light">
              <Flag size={32} aria-hidden="true" />
            </div>
            <p>加载中…</p>
          </AdminTable.Status>
        ) : list.length === 0 ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center text-brown-light">
              <ClipboardList size={40} aria-hidden="true" />
            </div>
            <p>暂无举报数据</p>
          </AdminTable.Status>
        ) : (
          <AdminTable aria-label="举报列表">
            <AdminTable.Header>
              {pendingOnly ? (
                <AdminTable.Column>
                  <AdminCheckbox
                    aria-label="全选举报"
                    checked={list.length > 0 && selectedIds.length === list.length}
                    onChange={() => handleSelectAll()}
                  />
                </AdminTable.Column>
              ) : null}
              <AdminTable.Column isRowHeader>ID</AdminTable.Column>
              <AdminTable.Column>目标</AdminTable.Column>
              <AdminTable.Column>原因</AdminTable.Column>
              <AdminTable.Column>举报人</AdminTable.Column>
              <AdminTable.Column>状态</AdminTable.Column>
              <AdminTable.Column>时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {list.map((item) => (
                <AdminTable.Row key={item.id} id={String(item.id)}>
                  {pendingOnly ? (
                    <AdminTable.Cell>
                      <AdminCheckbox
                        aria-label={`选择举报 #${item.id}`}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </AdminTable.Cell>
                  ) : null}
                  <AdminTable.Cell className="whitespace-nowrap font-mono">#{item.id}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">
                    {item.targetType === 'post' ? '动态' : item.targetType === 'comment' ? '评论' : item.targetType}
                    <span className="ml-1 text-brown-muted">#{item.targetId}</span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <div className="flex flex-wrap items-start gap-2">
                      <AdminChip tone="neutral">{REASON_LABELS[item.reasonType] || item.reasonType}</AdminChip>
                      <span className="line-clamp-2 break-words text-brown-secondary" title={item.reason}>
                        {item.reason}
                      </span>
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">
                    {item.reporterName || `用户#${item.reporterId}`}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getStatusTone(item.status)}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    {item.status === 0 ? (
                      <ReportHandleAction report={item} onSuccess={refresh} />
                    ) : (
                      <div className="max-w-xs truncate text-brown-muted" title={item.handleResult}>
                        {item.handleResult || '-'}
                      </div>
                    )}
                  </AdminTable.Cell>
                </AdminTable.Row>
              ))}
            </AdminTable.Body>
          </AdminTable>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        total={total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {showBatchModal && (
        <BatchReportHandle
          selectedIds={selectedIds}
          onSuccess={() => {
            setShowBatchModal(false);
            setSelectedIds([]);
            refresh();
          }}
          onCancel={() => setShowBatchModal(false)}
        />
      )}
    </div>
  );
}
