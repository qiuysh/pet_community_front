import { useState, useEffect } from 'react';
import { getPendingReviews, getReviewHistory } from '../../api/admin';
import type { ReviewContent, ReviewHistory } from '../../types/admin';
import { showErrorToast } from '../../utils/toastManager';
import { ReviewPreview } from '../../components/admin/reviewPreview';
import { ReviewAction } from '../../components/admin/reviewAction';
import { BatchReview } from '../../components/admin/batchReview';
import { Pagination } from '../../components/admin/pagination';
import { useAsyncEffect } from '../../hooks/useAsync';
import { useAdminTabQuery } from '../../hooks/useAdminTabQuery';
import { PawPrint, ClipboardList } from 'lucide-react';
import { adminUi } from '../../styles/adminUi';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminSelect } from '../../components/admin/adminField';
import { AdminTabs } from '../../components/admin/adminTabs';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

type TabType = 'pending' | 'history';
type FilterType = 'all' | 'post' | 'comment' | 'topic';

const REVIEW_TABS = ['pending', 'history'] as const;

interface ListResult<T> {
  list: T[];
  total: number;
}

export function AdminReviewPage() {
  const [activeTab, setActiveTab] = useAdminTabQuery<TabType>('pending', REVIEW_TABS);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItems, setSelectedItems] = useState<ReviewContent[]>([]);
  const [previewContent, setPreviewContent] = useState<ReviewContent | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // tab/filter 切换时重置分页与选中
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
  }, [activeTab, filterType]);

  // 待审核列表 - 仅在 pending tab 时实际请求
  const pendingHook = useAsyncEffect<ListResult<ReviewContent>>(
    async () => {
      if (activeTab !== 'pending') return { list: [], total: 0 };
      const res = await getPendingReviews({
        type: filterType === 'all' ? undefined : filterType,
        page: currentPage,
        pageSize,
      });
      return { list: res.list || [], total: res.total || 0 };
    },
    [activeTab, currentPage, filterType, pageSize],
    {
      initialData: { list: [], total: 0 },
      onError: (err) => showErrorToast((err as Error).message || '获取待审核列表失败'),
    },
  );

  // 审核历史 - 仅在 history tab 时实际请求
  const historyHook = useAsyncEffect<ListResult<ReviewHistory>>(
    async () => {
      if (activeTab !== 'history') return { list: [], total: 0 };
      const res = await getReviewHistory({
        type: filterType === 'all' ? undefined : filterType,
        page: currentPage,
        pageSize,
      });
      return { list: res.list || [], total: res.total || 0 };
    },
    [activeTab, currentPage, filterType, pageSize],
    {
      initialData: { list: [], total: 0 },
      onError: (err) => showErrorToast((err as Error).message || '获取审核历史失败'),
    },
  );

  const pendingList = pendingHook.data?.list ?? [];
  const historyList = historyHook.data?.list ?? [];
  const total = activeTab === 'pending' ? (pendingHook.data?.total ?? 0) : (historyHook.data?.total ?? 0);
  const loading = activeTab === 'pending' ? pendingHook.loading : historyHook.loading;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === pendingList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...pendingList]);
    }
  };

  const handleSelectItem = (item: ReviewContent) => {
    const exists = selectedItems.find(i => i.id === item.id && i.type === item.type);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleBatchReview = () => {
    if (selectedItems.length > 0) {
      setShowBatchModal(true);
    }
  };

  const handleBatchSuccess = () => {
    setShowBatchModal(false);
    setSelectedItems([]);
    pendingHook.refetch();
  };

  const handleReviewSuccess = () => {
    pendingHook.refetch();
  };

  const getTypeLabel = (type: string) => {
    if (type === 'post') return '动态';
    if (type === 'topic') return '话题';
    return '评论';
  };

  const getTypeTone = (type: string): AdminChipTone => {
    if (type === 'post') return 'secondary';
    if (type === 'topic') return 'warning';
    return 'neutral';
  };

  const getTypeChipClass = (type: string) => {
    if (type === 'comment') return 'bg-info/10 text-info';
    if (type === 'topic') return 'bg-warning/10 text-warning';
    return '';
  };

  const getActionLabel = (action: string) => {
    return action === 'approve_review' ? '通过' : '拒绝';
  };

  const getActionTone = (action: string): AdminChipTone =>
    action === 'approve_review' ? 'success' : 'danger';

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="内容审核"
        description="审核用户发布的动态、评论与话题"
        tabs={
          <AdminTabs
            aria-label="审核视图"
            items={[
              { key: 'pending', label: '待审核列表' },
              { key: 'history', label: '审核历史' },
            ]}
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabType)}
          />
        }
      />

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="内容类型" htmlFor="review-content-type">
            <AdminSelect
              id="review-content-type"
              name="contentType"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value as FilterType)}
            >
              <option value="all">全部</option>
              <option value="post">动态</option>
              <option value="comment">评论</option>
              <option value="topic">话题</option>
            </AdminSelect>
          </AdminFilterField>
        </AdminFilterBar>

        {activeTab === 'pending' && selectedItems.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-brown-secondary">已选择 {selectedItems.length} 条记录</span>
            <AdminButton type="button" variant="secondary" onClick={handleBatchReview}>
              批量审核
            </AdminButton>
          </div>
        )}
      </div>

      <div className="px-6">
        {loading ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center animate-pulse text-brown-light">
              <PawPrint size={32} aria-hidden="true" />
            </div>
            <p>加载中…</p>
          </AdminTable.Status>
        ) : (activeTab === 'pending' ? pendingList : historyList).length === 0 ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center text-brown-light">
              <ClipboardList size={40} aria-hidden="true" />
            </div>
            <p>暂无数据</p>
          </AdminTable.Status>
        ) : activeTab === 'pending' ? (
          <AdminTable aria-label="待审内容列表">
            <AdminTable.Header>
              <AdminTable.Column>
                <AdminCheckbox
                  aria-label="全选待审内容"
                  checked={pendingList.length > 0 && selectedItems.length === pendingList.length}
                  onChange={() => handleSelectAll()}
                />
              </AdminTable.Column>
              <AdminTable.Column isRowHeader>ID</AdminTable.Column>
              <AdminTable.Column>类型</AdminTable.Column>
              <AdminTable.Column>内容</AdminTable.Column>
              <AdminTable.Column>发布者</AdminTable.Column>
              <AdminTable.Column>时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {pendingList.map((item) => (
                <AdminTable.Row key={`${item.type}-${item.id}`} id={`${item.type}-${item.id}`}>
                  <AdminTable.Cell>
                    <AdminCheckbox
                      aria-label={`选择${item.type === 'post' ? '帖子' : '评论'} #${item.id}`}
                      checked={selectedItems.some((i) => i.id === item.id && i.type === item.type)}
                      onChange={() => handleSelectItem(item)}
                    />
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap font-mono">#{item.id}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getTypeTone(item.type)} className={getTypeChipClass(item.type)}>
                      {getTypeLabel(item.type)}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <AdminButton
                      type="button"
                      variant="ghost"
                      className="!h-auto !max-w-xs !justify-start !whitespace-normal !px-0 text-left text-brown-secondary hover:!text-secondary"
                      onClick={() => setPreviewContent(item)}
                    >
                      <span className="line-clamp-2 break-words" title={item.content}>
                        {item.content}
                      </span>
                    </AdminButton>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`}
                        alt={item.username}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full bg-soft object-cover"
                      />
                      <span className="text-brown-secondary">{item.username}</span>
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() => setPreviewContent(item)}
                        className={adminUi.actionNeutral}
                      >
                        预览
                      </AdminButton>
                      <ReviewAction content={item} onSuccess={handleReviewSuccess} />
                    </div>
                  </AdminTable.Cell>
                </AdminTable.Row>
              ))}
            </AdminTable.Body>
          </AdminTable>
        ) : (
          <AdminTable aria-label="审核历史列表">
            <AdminTable.Header>
              <AdminTable.Column isRowHeader>ID</AdminTable.Column>
              <AdminTable.Column>类型</AdminTable.Column>
              <AdminTable.Column>内容</AdminTable.Column>
              <AdminTable.Column>发布者</AdminTable.Column>
              <AdminTable.Column>审核人</AdminTable.Column>
              <AdminTable.Column>审核结果</AdminTable.Column>
              <AdminTable.Column>时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {historyList.map((item) => (
                <AdminTable.Row key={`history-${item.id}`} id={`history-${item.id}`}>
                  <AdminTable.Cell className="whitespace-nowrap font-mono">#{item.id}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getTypeTone(item.targetType)} className={getTypeChipClass(item.targetType)}>
                      {getTypeLabel(item.targetType)}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <div className="max-w-xs truncate text-brown-secondary" title={`目标 #${item.targetId}`}>
                      目标 #{item.targetId}
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">—</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">{item.adminName}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getActionTone(item.action)}>{getActionLabel(item.action)}</AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className="max-w-xs truncate text-brown-muted" title={item.reason}>
                      {item.reason || '-'}
                    </div>
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
        onPageChange={handlePageChange}
      />

      {previewContent && (
        <ReviewPreview
          content={previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}

      {showBatchModal && (
        <BatchReview
          selectedItems={selectedItems}
          onSuccess={handleBatchSuccess}
          onCancel={() => setShowBatchModal(false)}
        />
      )}
    </div>
  );
}