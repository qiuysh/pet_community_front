import { getLogStats } from '../../api/admin';
import type { LogStatsResponse } from '../../types/admin';
import { showErrorToast } from '../../utils/toastManager';
import { useAsyncEffect } from '../../hooks/useAsync';
import { AdminChip } from './adminChip';
import { adminUi } from '../../styles/adminUi';

interface LogStatsProps {
    userId: string;
    actionType: string;
    startTime: string;
    endTime: string;
}

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

export function LogStats({ userId, actionType, startTime, endTime }: LogStatsProps) {
    const { loading, data: stats } = useAsyncEffect<LogStatsResponse>(
        () => getLogStats({
            userId: userId ? parseInt(userId) : undefined,
            actionType: actionType || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            days: 7,
        }),
        [userId, actionType, startTime, endTime],
        {
            onError: (err) => showErrorToast((err as Error).message || '获取统计数据失败'),
        },
    );

    if (loading) {
        return (
            <div className={`${adminUi.panel} p-6`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-soft rounded-md p-4 animate-pulse">
                            <div className="h-5 bg-muted rounded-sm w-2/3 mb-2"></div>
                            <div className="h-7 bg-muted rounded-sm w-1/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const maxCount = Math.max(...Object.values(stats.actionStats || {}), 1);

    const statCards = [
        { label: '总日志数', value: stats.totalCount, color: 'secondary', bgClass: 'bg-secondary-soft', iconBgClass: 'bg-secondary-soft', textClass: 'text-secondary', icon: 'activity' },
        { label: '今日日志', value: stats.todayCount, color: 'success', bgClass: 'bg-success/5', iconBgClass: 'bg-success/10', textClass: 'text-success', icon: 'calendar' },
        { label: '操作类型', value: Object.keys(stats.actionStats).length, color: 'info', bgClass: 'bg-info/5', iconBgClass: 'bg-info/10', textClass: 'text-info', icon: 'layers' },
        { label: '统计天数', value: (stats.dailyStats || []).length, color: 'warning', bgClass: 'bg-warning/5', iconBgClass: 'bg-warning/10', textClass: 'text-warning', icon: 'clock' },
    ];

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'activity':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
            case 'calendar':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
            case 'layers':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />;
            case 'clock':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
            default:
                return null;
        }
    };

    return (
        <div className={`${adminUi.panel} p-6`}>
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-brown">日志统计</h3>
                <AdminChip tone="neutral">近7天</AdminChip>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`${card.bgClass} rounded-md p-4 hover:shadow-card transition-shadow group`}
                    >
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${card.iconBgClass} ${card.textClass} mb-3 transition-transform`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {getIcon(card.icon)}
                            </svg>
                        </div>
                        <div className={`text-xl font-bold ${card.textClass}`}>
                            {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                        </div>
                        <div className="text-xs text-brown-muted mt-0.5">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-soft/50 rounded-md p-4">
                    <h4 className="text-xs font-semibold text-brown-muted uppercase tracking-wider mb-3">操作类型分布</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.actionStats)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 6)
                            .map(([type, count]) => (
                                <div key={type} className="flex items-center gap-3">
                                    <span className="text-xs text-brown-secondary w-20 truncate">
                                        {ACTION_TYPE_LABELS[type] || type}
                                    </span>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-secondary/70 rounded-full transition-[width]"
                                            style={{ width: `${(count / maxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-brown w-8 text-right">
                                        {count}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-soft/50 rounded-md p-4">
                    <h4 className="text-xs font-semibold text-brown-muted uppercase tracking-wider mb-3">近7天日志趋势</h4>
                    <div className="flex items-end justify-between h-28 gap-1.5">
                        {stats.dailyStats?.map((item) => {
                            const maxDaily = Math.max(...(stats.dailyStats || []).map((d) => d.count), 1);
                            const height = (item.count / maxDaily) * 100;
                            return (
                                <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                                    <div className="relative">
                                        <div
                                            className="w-full bg-gradient-to-t from-secondary/60 to-secondary/30 rounded-t transition-[height,background-color] group-hover:from-secondary/80 group-hover:to-secondary/50"
                                            style={{ height: `${Math.max(height, 3)}%` }}
                                        ></div>
                                        {item.count > 0 && (
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-secondary-dark text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.count}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-brown-muted">{item.date.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}