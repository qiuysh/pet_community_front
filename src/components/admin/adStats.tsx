import type { AdStatsResponse } from '../../types/advertisement';
import { getAdStats } from '../../api/admin';
import { showErrorToast } from '../../utils/toastManager';
import { useAsyncEffect } from '../../hooks/useAsync';
import { BarChart3, Eye, Pointer, TrendingUp } from 'lucide-react';

interface AdStatsProps {
    startDate?: string;
    endDate?: string;
}

export function AdStats({ startDate, endDate }: AdStatsProps) {
    const { loading, data: stats } = useAsyncEffect<AdStatsResponse>(
        () => {
            const params: { startDate?: string; endDate?: string } = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            return getAdStats(params);
        },
        [startDate, endDate],
        {
            onError: (err) => showErrorToast((err as Error).message || '获取广告统计失败'),
        },
    );

    if (loading) {
        return (
            <div className="bg-white rounded-md shadow-card p-6">
                <div className="text-center py-12">
                    <div className="mb-2 flex justify-center animate-pulse text-brown-light">
                        <BarChart3 size={32} aria-hidden="true" />
                    </div>
                    <p className="text-brown-muted">加载中…</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-white rounded-md shadow-card p-6">
                <div className="text-center py-12">
                    <div className="mb-2 flex justify-center text-brown-light">
                        <BarChart3 size={40} aria-hidden="true" />
                    </div>
                    <p className="text-brown-muted">暂无统计数据</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-md shadow-card p-6">
            <h2 className="text-xl font-bold text-brown mb-6">广告统计</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-secondary-soft rounded-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-brown-muted mb-1">总展示量</p>
                            <p className="text-2xl font-bold text-secondary">{stats.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-secondary-soft rounded-md flex items-center justify-center text-secondary">
                            <Eye size={20} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                <div className="bg-success-soft rounded-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-brown-muted mb-1">总点击量</p>
                            <p className="text-2xl font-bold text-success">{stats.totalClicks.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-success/10 rounded-md flex items-center justify-center text-success">
                            <Pointer size={20} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                <div className="bg-info/10 rounded-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-brown-muted mb-1">点击率 (CTR)</p>
                            <p className="text-2xl font-bold text-info">{stats.ctr.toFixed(2)}%</p>
                        </div>
                        <div className="w-12 h-12 bg-info/10 rounded-md flex items-center justify-center text-info">
                            <TrendingUp size={20} aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium text-brown-secondary mb-4">按日期统计</h3>
                {stats.statsByDay.length > 0 ? (
                    <div className="space-y-3">
                        {stats.statsByDay.map((item) => (
                            <div key={item.label} className="flex items-center gap-4">
                                <div className="w-24 text-sm text-brown-muted">{item.label}</div>
                                <div className="flex-1 bg-soft rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-secondary rounded-full transition-[width]"
                                        style={{ width: `${Math.min((item.value / 1000) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="w-20 text-right text-sm font-medium text-brown">
                                    {item.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-brown-muted text-center py-6">暂无日期统计数据</p>
                )}
            </div>

            <div>
                <h3 className="text-lg font-medium text-brown-secondary mb-4">按广告位统计</h3>
                {stats.statsByPosition.length > 0 ? (
                    <div className="space-y-3">
                        {stats.statsByPosition.map((item) => (
                            <div key={item.label} className="flex items-center gap-4">
                                <div className="w-32 text-sm text-brown-muted truncate">{item.label}</div>
                                <div className="flex-1 bg-soft rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-secondary/70 rounded-full transition-[width]"
                                        style={{ width: `${Math.min((item.value / 1000) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="w-20 text-right text-sm font-medium text-brown">
                                    {item.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-brown-muted text-center py-6">暂无广告位统计数据</p>
                )}
            </div>
        </div>
    );
}