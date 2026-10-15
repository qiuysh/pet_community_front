import { useState } from 'react';
import { ClipboardList, PawPrint } from 'lucide-react';
import { getUserBehaviorLogs, getSecurityAuditLogs, getOperationLogs } from '../../api/admin';
import type { UserBehaviorLog, AdminOperationLog } from '../../types/admin';
import { showErrorToast } from '../../utils/toastManager';
import { LogFilter } from '../../components/admin/logFilter';
import { LogExport } from '../../components/admin/logExport';
import { LogStats } from '../../components/admin/logStats';
import { Pagination } from '../../components/admin/pagination';
import { useAsyncEffect } from '../../hooks/useAsync';
import { useAdminTabQuery } from '../../hooks/useAdminTabQuery';
import { AdminChip, type AdminChipTone } from '../../components/admin/adminChip';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminTabs } from '../../components/admin/adminTabs';
import { AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminUi } from '../../styles/adminUi';

type LogType = 'behavior' | 'security' | 'operation';
const LOG_TABS = ['behavior', 'security', 'operation'] as const;

const ACTION_TYPE_LABELS: Record<string, string> = {
    login: '登录',
    logout: '登出',
    register: '注册',
    post_create: '发布帖子',
    post_update: '更新帖子',
    post_delete: '删除帖子',
    comment_create: '发布评论',
    comment_delete: '删除评论',
    like: '点赞',
    favorite: '收藏',
    follow: '关注',
    unfollow: '取消关注',
    pet_create: '创建宠物',
    profile_update: '更新资料',
    password_change: '修改密码',
    api_request: 'API请求',
};

const TARGET_TYPE_LABELS: Record<string, string> = {
    user: '用户',
    post: '帖子',
    comment: '评论',
    pet: '宠物',
    like: '点赞',
    favorite: '收藏',
    follow: '关注',
    activity: '活动',
    adopt: '领养',
    message: '消息',
};

export function AdminLogsPage() {
    const [logType, setLogType] = useAdminTabQuery<LogType>('behavior', LOG_TABS);
    const [userId, setUserId] = useState('');
    const [actionType, setActionType] = useState('');
    const [targetType, setTargetType] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [behaviorLogs, setBehaviorLogs] = useState<UserBehaviorLog[]>([]);
    const [operationLogs, setOperationLogs] = useState<AdminOperationLog[]>([]);
    const [total, setTotal] = useState(0);

    const { loading } = useAsyncEffect(
        async () => {
            if (logType === 'behavior') {
                const res = await getUserBehaviorLogs({
                    userId: userId ? parseInt(userId) : undefined,
                    actionType: actionType || undefined,
                    targetType: targetType || undefined,
                    startTime: startTime || undefined,
                    endTime: endTime || undefined,
                    page: currentPage,
                    limit: pageSize,
                });
                setBehaviorLogs(res.list || []);
                setTotal(res.total || 0);
            } else if (logType === 'security') {
                const res = await getSecurityAuditLogs({
                    userId: userId ? parseInt(userId) : undefined,
                    startTime: startTime || undefined,
                    endTime: endTime || undefined,
                    page: currentPage,
                    limit: pageSize,
                });
                setBehaviorLogs(res.list || []);
                setTotal(res.total || 0);
            } else {
                const res = await getOperationLogs({
                    action: actionType || undefined,
                    startTime: startTime || undefined,
                    endTime: endTime || undefined,
                    page: currentPage,
                    limit: pageSize,
                });
                setOperationLogs(res.list || []);
                setTotal(res.total || 0);
            }
        },
        [logType, currentPage, userId, actionType, targetType, startTime, endTime, pageSize],
        { onError: (err) => showErrorToast((err as Error).message || '获取日志失败') },
    );

    const resetToFirstPage = () => {
        setCurrentPage(1);
    };

    const handleUserIdChange = (value: string) => {
        setUserId(value);
        resetToFirstPage();
    };

    const handleActionTypeChange = (value: string) => {
        setActionType(value);
        resetToFirstPage();
    };

    const handleTargetTypeChange = (value: string) => {
        setTargetType(value);
        resetToFirstPage();
    };

    const handleStartTimeChange = (value: string) => {
        setStartTime(value);
        resetToFirstPage();
    };

    const handleEndTimeChange = (value: string) => {
        setEndTime(value);
        resetToFirstPage();
    };

    const totalPages = Math.ceil(total / pageSize);

    const getActionTone = (action: string): AdminChipTone => {
        if (action.includes('create') || action.includes('add')) return 'success';
        if (action.includes('update') || action.includes('edit')) return 'secondary';
        if (action.includes('delete') || action.includes('remove')) return 'danger';
        if (action.includes('login') || action.includes('follow')) return 'secondary';
        if (action.includes('like') || action.includes('favorite')) return 'warning';
        if (action.includes('security') || action.includes('audit')) return 'danger';
        return 'neutral';
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getCurrentLogs = () => {
        if (logType === 'behavior' || logType === 'security') {
            return behaviorLogs.map((log) => ({
                id: log.id,
                actorId: log.userId,
                actionKey: log.actionType,
                targetType: log.targetType,
                detailText: log.detail || (log.targetId ? `ID: ${log.targetId}` : '-'),
                ip: log.ip,
                device: log.device || '-',
                createdAt: log.createdAt,
            }));
        }
        return operationLogs.map((log) => ({
            id: log.id,
            actorId: log.adminId,
            actionKey: log.action,
            targetType: log.targetType,
            detailText: log.detail || (log.targetId ? `ID: ${log.targetId}` : '-'),
            ip: log.ip,
            device: '-',
            createdAt: log.createdAt,
        }));
    };

    const getActionLabel = (action: string) => {
        return ACTION_TYPE_LABELS[action] || action;
    };

    const getTargetLabel = (target: string) => {
        return TARGET_TYPE_LABELS[target] || target;
    };

    return (
        <div className="space-y-6">
            <div className={adminUi.page}>
                <AdminPageHeader
                    title="日志管理"
                    description="查看用户行为日志和系统操作日志"
                    tabs={
                        <AdminTabs
                            aria-label="日志类型"
                            items={[
                                { key: 'behavior', label: '行为日志' },
                                { key: 'security', label: '安全审计' },
                                { key: 'operation', label: '操作日志' },
                            ]}
                            selectedKey={logType}
                            onSelectionChange={(key) => {
                                setLogType(key as LogType);
                                setCurrentPage(1);
                            }}
                        />
                    }
                    actions={
                        <LogExport
                            userId={userId}
                            actionType={actionType}
                            targetType={targetType}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    }
                />

                <div className={adminUi.filterSection}>
                    <LogFilter
                        logType={logType}
                        userId={userId}
                        actionType={actionType}
                        targetType={targetType}
                        startTime={startTime}
                        endTime={endTime}
                        onUserIdChange={handleUserIdChange}
                        onActionTypeChange={handleActionTypeChange}
                        onTargetTypeChange={handleTargetTypeChange}
                        onStartTimeChange={handleStartTimeChange}
                        onEndTimeChange={handleEndTimeChange}
                    />
                </div>

                <div className="px-6 pt-2">
                    {loading ? (
                        <AdminTable.Status>
                            <div className="mb-2 flex justify-center animate-pulse text-brown-light">
                                <PawPrint size={32} aria-hidden="true" />
                            </div>
                            <p>加载中…</p>
                        </AdminTable.Status>
                    ) : getCurrentLogs().length === 0 ? (
                        <AdminTable.Status>
                            <div className="mb-2 flex justify-center text-brown-light">
                                <ClipboardList size={40} aria-hidden="true" />
                            </div>
                            <p>暂无日志数据</p>
                        </AdminTable.Status>
                    ) : (
                        <AdminTable aria-label="日志列表">
                            <AdminTable.Header>
                                <AdminTable.Column isRowHeader>ID</AdminTable.Column>
                                <AdminTable.Column>用户ID</AdminTable.Column>
                                <AdminTable.Column>操作类型</AdminTable.Column>
                                <AdminTable.Column>目标类型</AdminTable.Column>
                                <AdminTable.Column>操作详情</AdminTable.Column>
                                <AdminTable.Column>IP地址</AdminTable.Column>
                                <AdminTable.Column>设备</AdminTable.Column>
                                <AdminTable.Column>操作时间</AdminTable.Column>
                            </AdminTable.Header>
                            <AdminTable.Body>
                                {getCurrentLogs().map((log) => (
                                    <AdminTable.Row key={log.id} id={String(log.id)}>
                                        <AdminTable.Cell className="whitespace-nowrap font-mono">#{log.id}</AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap">
                                            <AdminChip tone="neutral">{log.actorId || '-'}</AdminChip>
                                        </AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap">
                                            <AdminChip tone={getActionTone(log.actionKey)}>
                                                {getActionLabel(log.actionKey)}
                                            </AdminChip>
                                        </AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap">
                                            <AdminChip tone="neutral">
                                                {getTargetLabel(log.targetType || '-')}
                                            </AdminChip>
                                        </AdminTable.Cell>
                                        <AdminTable.Cell>
                                            <div className="max-w-xs truncate text-brown-secondary" title={log.detailText}>
                                                {log.detailText}
                                            </div>
                                        </AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap font-mono text-brown-muted">
                                            {log.ip || '-'}
                                        </AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                                            {log.device}
                                        </AdminTable.Cell>
                                        <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                                            {log.createdAt}
                                        </AdminTable.Cell>
                                    </AdminTable.Row>
                                ))}
                            </AdminTable.Body>
                        </AdminTable>
                    )}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <LogStats
                userId={userId}
                actionType={actionType}
                startTime={startTime}
                endTime={endTime}
            />
        </div>
    );
}
