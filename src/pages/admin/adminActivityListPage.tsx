import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import {
  getAdminActivityList,
  deleteActivity,
  publishActivity,
} from '../../api/activity';
import {
  ActivityInfo,
  ActivityType,
  ActivityTypeOptions,
  ActivityListStatusFilter,
  ActivityStatus,
  getActivityDisplayStatus,
} from '../../types/activity';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsyncEffect } from '../../hooks/useAsync';
import { Pagination } from '../../components/admin/pagination';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminInput, AdminSelect } from '../../components/admin/adminField';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminActionClass, adminUi } from '../../styles/adminUi';

interface ListResult {
  list: ActivityInfo[];
  total: number;
}

const STATUS_FILTERS: { value: '' | ActivityListStatusFilter; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'active', label: '进行中' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'ended', label: '已结束' },
];

function statusTone(activity: ActivityInfo): { label: string; tone: AdminChipTone } {
  const display = getActivityDisplayStatus(activity);
  switch (display) {
    case 'draft':
      return { label: '草稿', tone: 'neutral' };
    case 'upcoming':
      return { label: '即将开始', tone: 'secondary' };
    case 'active':
      return { label: '进行中', tone: 'success' };
    case 'ended':
      return { label: '已结束', tone: 'neutral' };
    default:
      return { label: '未知', tone: 'neutral' };
  }
}

function typeLabel(type: string) {
  return ActivityTypeOptions.find((o) => o.value === type)?.label || type;
}

export function AdminActivityListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusRegistrations = searchParams.get('focus') === 'registrations';

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'' | ActivityListStatusFilter>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const listHook = useAsyncEffect<ListResult>(
    async () => {
      const res = await getAdminActivityList({
        keyword: keyword || undefined,
        type: (typeFilter as ActivityType) || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        pageSize,
      });
      return { list: res.list || [], total: res.total || 0 };
    },
    [keyword, typeFilter, statusFilter, currentPage, pageSize],
    {
      initialData: { list: [], total: 0 },
      onError: (err) => showErrorToast((err as Error).message || '获取活动列表失败'),
    },
  );

  const list = listHook.data?.list ?? [];
  const total = listHook.data?.total ?? 0;

  const handleSearch = () => {
    setKeyword(keywordInput.trim());
    setCurrentPage(1);
  };

  const handlePublish = async (id: number) => {
    try {
      await publishActivity(id);
      showSuccessToast('发布成功');
      listHook.refetch();
    } catch (err) {
      showErrorToast((err as Error).message || '发布失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除该活动？此操作不可恢复。')) return;
    try {
      await deleteActivity(id);
      showSuccessToast('已删除');
      listHook.refetch();
    } catch (err) {
      showErrorToast((err as Error).message || '删除失败');
    }
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="活动运营"
        description={
          focusRegistrations
            ? '请选择活动进入「报名审核」处理待审报名'
            : '创建、发布与管理线上及线下活动'
        }
        actions={
          <AdminButton type="button" variant="secondary" onClick={() => navigate('/admin/activities/create')}>
            创建活动
          </AdminButton>
        }
      />

      {focusRegistrations && (
        <div className="mx-6 mt-4 rounded-md border border-secondary/20 bg-secondary-soft px-4 py-3 text-sm text-secondary">
          待办入口：从下方活动进入「报名」处理待审核报名。
        </div>
      )}

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="关键词" htmlFor="activity-keyword">
            <AdminInput
              id="activity-keyword"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="搜索标题、描述…"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </AdminFilterField>
          <AdminFilterField label="类型" htmlFor="activity-type">
            <AdminSelect
              id="activity-type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">全部类型</option>
              {ActivityTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AdminSelect>
          </AdminFilterField>
          <AdminFilterField label="状态" htmlFor="activity-status">
            <AdminSelect
              id="activity-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as '' | ActivityListStatusFilter);
                setCurrentPage(1);
              }}
            >
              {STATUS_FILTERS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AdminSelect>
          </AdminFilterField>
        </AdminFilterBar>
      </div>

      <div className="px-6 py-4">
        {listHook.loading ? (
          <div className="flex h-40 items-center justify-center text-brown-muted">加载中…</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-brown-muted">
            <PawPrint className="h-10 w-10 opacity-40" aria-hidden />
            <p>暂无活动</p>
          </div>
        ) : (
          <AdminTable aria-label="活动列表">
            <AdminTable.Header>
              <AdminTable.Column>标题</AdminTable.Column>
              <AdminTable.Column>类型</AdminTable.Column>
              <AdminTable.Column>状态</AdminTable.Column>
              <AdminTable.Column>参与/作品</AdminTable.Column>
              <AdminTable.Column>时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {list.map((item) => {
                const st = statusTone(item);
                return (
                  <AdminTable.Row key={item.id}>
                    <AdminTable.Cell>
                      <div className="font-medium text-brown">{item.title}</div>
                      <div className="text-xs text-brown-muted line-clamp-1">{item.description}</div>
                    </AdminTable.Cell>
                    <AdminTable.Cell>{typeLabel(String(item.type))}</AdminTable.Cell>
                    <AdminTable.Cell>
                      <AdminChip tone={st.tone}>{st.label}</AdminChip>
                    </AdminTable.Cell>
                    <AdminTable.Cell>
                      {item.participantsCount}/{item.maxParticipants || '∞'} · {item.submissionsCount} 作品
                    </AdminTable.Cell>
                    <AdminTable.Cell>
                      <div className="text-xs text-brown-muted whitespace-nowrap">
                        {new Date(item.startTime).toLocaleString('zh-CN')}
                        <br />
                        {new Date(item.endTime).toLocaleString('zh-CN')}
                      </div>
                    </AdminTable.Cell>
                    <AdminTable.Cell>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={adminActionClass()}
                          onClick={() => navigate(`/admin/activities/${item.id}/edit`)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className={adminActionClass()}
                          onClick={() => navigate(`/admin/activities/${item.id}/registrations`)}
                        >
                          报名
                        </button>
                        <button
                          type="button"
                          className={adminActionClass()}
                          onClick={() => navigate(`/admin/activities/${item.id}/vote`)}
                        >
                          评选
                        </button>
                        {item.status === ActivityStatus.DRAFT && (
                          <button
                            type="button"
                            className={adminActionClass('primary')}
                            onClick={() => handlePublish(item.id)}
                          >
                            发布
                          </button>
                        )}
                        <button
                          type="button"
                          className={adminActionClass('danger')}
                          onClick={() => handleDelete(item.id)}
                        >
                          删除
                        </button>
                      </div>
                    </AdminTable.Cell>
                  </AdminTable.Row>
                );
              })}
            </AdminTable.Body>
          </AdminTable>
        )}

        {total > pageSize && (
          <div className="mt-4 flex justify-end px-2">
            <Pagination
              currentPage={currentPage}
              total={total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
