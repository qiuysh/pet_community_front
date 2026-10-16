import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/admin/pagination';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { PawPrint } from 'lucide-react';
import { adminActionClass, adminUi } from '../../styles/adminUi';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminInput } from '../../components/admin/adminField';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

export function AdminUserListPage() {
  const navigate = useNavigate();
  const { users, total, currentPage, pageSize, isLoading, error, fetchUserList, deleteUser, updateUserStatus } = useAdminUsers();
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{ id: number; status: 0 | 1 } | null>(null);

  const listParams = (page = currentPage) => ({
    page,
    page_size: pageSize,
    keyword: keyword || undefined,
  });

  useEffect(() => {
    fetchUserList(listParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, keyword]);

  const handlePageChange = (page: number) => {
    fetchUserList(listParams(page));
  };

  const handleKeywordSearch = () => {
    setKeyword(keywordInput.trim());
    fetchUserList({
      page: 1,
      page_size: pageSize,
      keyword: keywordInput.trim() || undefined,
    });
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    const success = await deleteUser(id);
    setIsDeleting(false);
    if (success) {
      setConfirmDelete(null);
      fetchUserList(listParams());
    }
  };

  const handleStatusChange = async (id: number, status: 0 | 1) => {
    const success = await updateUserStatus(id, status);
    if (success) {
      setConfirmStatusChange(null);
      fetchUserList(listParams());
    }
  };

  const getRoleTone = (role: string): AdminChipTone =>
    role === 'super_admin' ? 'secondary' : 'neutral';

  const getRoleAvatarTone = (role: string) => {
    if (role === 'super_admin') return 'bg-secondary text-white';
    return 'bg-secondary-soft text-secondary';
  };

  const getStatusTone = (status: number): AdminChipTone =>
    status === 1 ? 'success' : 'danger';

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="后台账号"
        description="管理运营后台登录账号与角色权限"
        actions={
          <AdminButton type="button" variant="secondary" onClick={() => navigate('/admin/users/create')}>
            新建账号
          </AdminButton>
        }
      />

      {error && (
        <div
          className="mx-6 mt-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm"
          role="status"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="关键词" htmlFor="admin-user-keyword">
            <AdminInput
              id="admin-user-keyword"
              name="keyword"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              placeholder="搜索用户名、邮箱…"
              autoComplete="off"
              spellCheck={false}
            />
          </AdminFilterField>
        </AdminFilterBar>
      </div>

      <div className="px-0 sm:px-0">
        {isLoading ? (
          <AdminTable.Status>加载中…</AdminTable.Status>
        ) : users.length === 0 ? (
          <AdminTable.Status>
            <div className="mb-2 flex justify-center text-brown-light">
              <PawPrint size={40} aria-hidden="true" />
            </div>
            <p>暂无数据</p>
          </AdminTable.Status>
        ) : (
          <AdminTable aria-label="后台账号列表">
            <AdminTable.Header>
              <AdminTable.Column isRowHeader>用户名</AdminTable.Column>
              <AdminTable.Column>邮箱</AdminTable.Column>
              <AdminTable.Column>角色</AdminTable.Column>
              <AdminTable.Column>状态</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {users.map((user) => (
                <AdminTable.Row key={user.id} id={String(user.id)}>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-sm font-semibold ${getRoleAvatarTone(user.role)}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-brown">{user.username}</div>
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">
                    {user.email || '-'}
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getRoleTone(user.role)}>
                      {user.role === 'super_admin' ? '超级管理员' : '管理员'}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getStatusTone(user.status)}>
                      {user.status === 1 ? '已启用' : '已禁用'}
                    </AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className={adminUi.actions}>
                      <Link to={`/admin/users/edit/${user.id}`} className={adminActionClass('primary')}>
                        编辑
                      </Link>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmStatusChange({ id: user.id, status: user.status === 1 ? 0 : 1 })}
                        className={adminActionClass(user.status === 1 ? 'warning' : 'success')}
                      >
                        {user.status === 1 ? '禁用' : '启用'}
                      </AdminButton>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmDelete(user.id)}
                        className={adminActionClass('danger')}
                      >
                        删除
                      </AdminButton>
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

      {/* 删除确认对话框 */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-brown/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-md p-6 max-w-md w-full mx-4 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brown">确认删除</h3>
                <p className="text-sm text-brown-muted">此操作无法撤销</p>
              </div>
            </div>
            <p className="text-sm text-brown-secondary mb-6">确定要删除这个管理员账号吗？删除后该账号将无法登录系统。</p>
            <div className="flex justify-end space-x-3">
              <AdminButton type="button" variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>
                取消
              </AdminButton>
              <AdminButton type="button" variant="danger" onClick={() => handleDelete(confirmDelete)} disabled={isDeleting} loading={isDeleting}>
                {isDeleting ? '删除中…' : '确认删除'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* 状态变更确认对话框 */}
      {confirmStatusChange !== null && (
        <div className="fixed inset-0 bg-brown/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-md p-6 max-w-md w-full mx-4 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                confirmStatusChange.status === 1 ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <svg className={`w-6 h-6 ${confirmStatusChange.status === 1 ? 'text-success' : 'text-warning'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brown">
                  {confirmStatusChange.status === 1 ? '确认启用' : '确认禁用'}
                </h3>
                <p className="text-sm text-brown-muted">
                  {confirmStatusChange.status === 1 ? '账号将恢复正常使用' : '账号将无法登录系统'}
                </p>
              </div>
            </div>
            <p className="text-sm text-brown-secondary mb-6">
              确定要{confirmStatusChange.status === 1 ? '启用' : '禁用'}这个管理员账号吗？
            </p>
            <div className="flex justify-end space-x-3">
              <AdminButton type="button" variant="outline" onClick={() => setConfirmStatusChange(null)} disabled={isLoading}>
                取消
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => handleStatusChange(confirmStatusChange.id, confirmStatusChange.status)}
                disabled={isLoading}
                loading={isLoading}
                className={confirmStatusChange.status === 1 ? '!bg-success hover:!bg-success/90' : '!bg-warning hover:!bg-warning/90'}
              >
                {isLoading ? '处理中…' : '确认'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}