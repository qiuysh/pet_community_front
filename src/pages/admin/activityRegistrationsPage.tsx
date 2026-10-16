import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { getActivityDetail, getRegistrationList, reviewRegistration } from '../../api/activity';
import {
  RegistrationInfo,
  RegistrationStatus,
  RegistrationStatusOptions,
} from '../../types/activity';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { useAsyncEffect } from '../../hooks/useAsync';
import { Pagination } from '../../components/admin/pagination';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminSelect } from '../../components/admin/adminField';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminActionClass, adminUi } from '../../styles/adminUi';

interface ListResult {
  list: RegistrationInfo[];
  total: number;
}

function statusTone(status: number): AdminChipTone {
  if (status === RegistrationStatus.APPROVED) return 'success';
  if (status === RegistrationStatus.REJECTED) return 'danger';
  return 'warning';
}

function statusLabel(status: number) {
  return RegistrationStatusOptions.find((o) => o.value === status)?.label || String(status);
}

export function ActivityRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = parseInt(id || '0', 10);
  const [statusFilter, setStatusFilter] = useState<number>(RegistrationStatus.PENDING);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const activityHook = useAsyncEffect(
    () => getActivityDetail(activityId),
    [activityId],
    {
      onError: (err) => {
        showErrorToast((err as Error).message || '加载活动失败');
        navigate('/admin/activities');
      },
    },
  );

  const listHook = useAsyncEffect<ListResult>(
    async () => {
      if (!activityId) return { list: [], total: 0 };
      const res = await getRegistrationList({
        activityId,
        status: statusFilter,
        page: currentPage,
        pageSize,
      });
      return { list: res.list || [], total: res.total || 0 };
    },
    [activityId, statusFilter, currentPage, pageSize],
    {
      initialData: { list: [], total: 0 },
      onError: (err) => showErrorToast((err as Error).message || '获取报名列表失败'),
    },
  );

  const list = listHook.data?.list ?? [];
  const total = listHook.data?.total ?? 0;

  const handleReview = async (registrationId: number, approve: boolean) => {
    try {
      await reviewRegistration(registrationId, approve);
      showSuccessToast(approve ? '已通过' : '已拒绝');
      listHook.refetch();
    } catch (err) {
      showErrorToast((err as Error).message || '审核失败');
    }
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="报名审核"
        description={activityHook.data ? `活动：${activityHook.data.title}` : '加载中…'}
        actions={
          <AdminButton type="button" variant="outline" onClick={() => navigate('/admin/activities')}>
            返回列表
          </AdminButton>
        }
      />

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="状态" htmlFor="reg-status">
            <AdminSelect
              id="reg-status"
              value={String(statusFilter)}
              onChange={(e) => {
                setStatusFilter(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={-1}>全部</option>
              {RegistrationStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>
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
            <p>暂无报名记录</p>
          </div>
        ) : (
          <AdminTable aria-label="报名列表">
            <AdminTable.Header>
              <AdminTable.Column>用户</AdminTable.Column>
              <AdminTable.Column>姓名</AdminTable.Column>
              <AdminTable.Column>手机</AdminTable.Column>
              <AdminTable.Column>留言</AdminTable.Column>
              <AdminTable.Column>状态</AdminTable.Column>
              <AdminTable.Column>报名时间</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {list.map((item) => (
                <AdminTable.Row key={item.id}>
                  <AdminTable.Cell>
                    <div className="flex items-center gap-2">
                      {item.userAvatar ? (
                        <img src={item.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : null}
                      <span>{item.userNickname || `用户#${item.userId}`}</span>
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell>{item.name}</AdminTable.Cell>
                  <AdminTable.Cell>{item.phone}</AdminTable.Cell>
                  <AdminTable.Cell>
                    <span className="line-clamp-2 text-sm text-brown-muted">{item.message || '—'}</span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <AdminChip tone={statusTone(Number(item.status))}>
                      {statusLabel(Number(item.status))}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <span className="text-xs text-brown-muted whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    {Number(item.status) === RegistrationStatus.PENDING ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={adminActionClass('success')}
                          onClick={() => handleReview(item.id, true)}
                        >
                          通过
                        </button>
                        <button
                          type="button"
                          className={adminActionClass('danger')}
                          onClick={() => handleReview(item.id, false)}
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-brown-muted">已处理</span>
                    )}
                  </AdminTable.Cell>
                </AdminTable.Row>
              ))}
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
