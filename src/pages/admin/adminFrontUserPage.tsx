import { useState, useEffect } from 'react';
import { FrontUser } from '../../types/admin';
import { getFrontUserList, batchBanFrontUsers } from '../../api/admin';
import { Pagination } from '../../components/admin/pagination';
import { UserBanAction } from '../../components/admin/userBanAction';
import { AdminInput, AdminLabel, AdminSelect, AdminTextarea } from '../../components/admin/adminField';
import { PawPrint } from 'lucide-react';
import { adminUi } from '../../styles/adminUi';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminCheckbox } from '../../components/admin/adminCheckbox';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';

export function AdminFrontUserPage() {
  const [users, setUsers] = useState<FrontUser[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(-1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBatchBanModal, setShowBatchBanModal] = useState(false);
  const [batchBanReason, setBatchBanReason] = useState('');
  const [isBatchBanning, setIsBatchBanning] = useState(false);
  const [batchError, setBatchError] = useState('');

  useEffect(() => {
    fetchUserList();
  }, [currentPage, pageSize, keyword, statusFilter]);

  const fetchUserList = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getFrontUserList({
        keyword: keyword || undefined,
        status: statusFilter >= 0 ? statusFilter : undefined,
        page: currentPage,
        page_size: pageSize,
      });
      setUsers(response.list);
      setTotal(response.total);
    } catch (err: unknown) {
      let errorMessage = '获取用户列表失败';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleKeywordSearch = () => {
    setKeyword(keywordInput);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: number) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleBatchBan = async () => {
    if (!batchBanReason.trim()) {
      setBatchError('请填写封禁原因');
      return;
    }

    setIsBatchBanning(true);
    setBatchError('');

    try {
      await batchBanFrontUsers({
        userIds: selectedUsers,
        reason: batchBanReason.trim(),
      });
      setShowBatchBanModal(false);
      setBatchBanReason('');
      setSelectedUsers([]);
      fetchUserList();
    } catch (err: unknown) {
      let errorMessage = '批量封禁失败';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setBatchError(errorMessage);
    } finally {
      setIsBatchBanning(false);
    }
  };

  const getStatusTone = (status: number): AdminChipTone => {
    switch (status) {
      case 1:
        return 'success';
      case 2:
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '待激活';
      case 1:
        return '正常';
      case 2:
        return '已封禁';
      default:
        return '未知';
    }
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return '男';
      case 2:
        return '女';
      default:
        return '-';
    }
  };

  return (
    <div className={adminUi.page}>
      <AdminPageHeader
        title="社区用户"
        description="查看与治理前台注册用户，支持封禁与解封"
        actions={
          selectedUsers.length > 0 ? (
            <AdminButton
              type="button"
              variant="outline"
              className="border-error text-error hover:bg-error/5"
              onClick={() => setShowBatchBanModal(true)}
            >
              批量封禁 ({selectedUsers.length})
            </AdminButton>
          ) : undefined
        }
      />

      <div className={adminUi.filterSection}>
        <AdminFilterBar>
          <AdminFilterField label="关键词" htmlFor="front-user-keyword">
            <AdminInput
              id="front-user-keyword"
              name="keyword"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              placeholder="搜索用户昵称、手机号…"
              autoComplete="off"
              spellCheck={false}
            />
          </AdminFilterField>
          <AdminFilterField label="用户状态" htmlFor="front-user-status">
            <AdminSelect
              id="front-user-status"
              name="status"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(Number(e.target.value))}
            >
              <option value={-1}>全部</option>
              <option value={1}>正常</option>
              <option value={2}>已封禁</option>
            </AdminSelect>
          </AdminFilterField>
        </AdminFilterBar>
      </div>

      {error && (
        <div className="mb-6 mx-6 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm">
          {error}
        </div>
      )}

      <div>
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
          <AdminTable aria-label="前台用户列表">
            <AdminTable.Header>
              <AdminTable.Column>
                <AdminCheckbox
                  aria-label="全选用户"
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={() => selectAllUsers()}
                />
              </AdminTable.Column>
              <AdminTable.Column isRowHeader>用户昵称</AdminTable.Column>
              <AdminTable.Column>手机号</AdminTable.Column>
              <AdminTable.Column>邮箱</AdminTable.Column>
              <AdminTable.Column>性别</AdminTable.Column>
              <AdminTable.Column>所在地</AdminTable.Column>
              <AdminTable.Column>状态</AdminTable.Column>
              <AdminTable.Column>操作</AdminTable.Column>
            </AdminTable.Header>
            <AdminTable.Body>
              {users.map((user) => (
                <AdminTable.Row key={user.id} id={String(user.id)}>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminCheckbox
                      aria-label={`选择用户 ${user.nickname || user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                    />
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary-soft font-semibold text-secondary">
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-brown">{user.nickname}</div>
                    </div>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">{user.phone || '-'}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">{user.email || '-'}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">{getGenderText(user.gender)}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap text-brown-secondary">{user.location || '-'}</AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <AdminChip tone={getStatusTone(user.status)}>{getStatusText(user.status)}</AdminChip>
                  </AdminTable.Cell>
                  <AdminTable.Cell className="whitespace-nowrap">
                    <UserBanAction
                      userId={user.id}
                      userName={user.nickname}
                      isBanned={user.status === 2}
                      onSuccess={fetchUserList}
                    />
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

      {showBatchBanModal && (
        <div className={adminUi.overlay}>
          <div className={adminUi.modalDialog}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brown">批量封禁用户</h3>
                  <p className="text-sm text-brown-muted">共选择 {selectedUsers.length} 个用户</p>
                </div>
              </div>

              <p className="text-sm text-brown-secondary mb-4">
                确定要批量封禁选中的用户吗？封禁后这些账号将无法登录系统。
              </p>

              <div className="mb-4">
                <AdminLabel required>封禁原因</AdminLabel>
                <AdminTextarea
                  value={batchBanReason}
                  onChange={(e) => setBatchBanReason(e.target.value)}
                  placeholder="请输入封禁原因，该原因将记录到操作日志中"
                  rows={3}
                />
              </div>

              {batchError && (
                <div className="mb-4 px-4 py-3 bg-error/5 border border-error/20 rounded-md text-error text-sm">
                  {batchError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowBatchBanModal(false)}
                  disabled={isBatchBanning}
                >
                  取消
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={handleBatchBan}
                  disabled={isBatchBanning}
                >
                  {isBatchBanning ? '封禁中…' : '确认封禁'}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}