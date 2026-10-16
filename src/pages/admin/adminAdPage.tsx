import { useState } from 'react';
import type { AdPosition, Advertisement } from '../../types/advertisement';
import { AdLocationMap, AdStatusMap, AdStatusColorMap } from '../../types/advertisement';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { AdForm } from '../../components/admin/adForm';
import { AdStats } from '../../components/admin/adStats';
import { Pagination } from '../../components/admin/pagination';
import {
    createAdPosition,
    getAdPositionList,
    updateAdPosition,
    deleteAdPosition,
    getAdList,
    deleteAd,
    reviewAd,
} from '../../api/admin';
import { useAsyncEffect } from '../../hooks/useAsync';
import { PawPrint, ClipboardList, Eye, Pointer } from 'lucide-react';
import { AdminButton } from '../../components/admin/adminButton';
import { AdminTable } from '../../components/admin/adminTable';
import { AdminInput, AdminLabel, AdminSelect } from '../../components/admin/adminField';
import { AdminTabs } from '../../components/admin/adminTabs';
import { AdminFilterBar, AdminFilterField, AdminPageHeader } from '../../components/admin/adminFilterToolbar';
import { adminActionClass, adminUi } from '../../styles/adminUi';
import { useAdminTabQuery } from '../../hooks/useAdminTabQuery';

type TabType = 'positions' | 'ads' | 'stats';
const AD_TABS = ['positions', 'ads', 'stats'] as const;

interface PositionsResult {
    list: AdPosition[];
}

interface AdsResult {
    list: Advertisement[];
    total: number;
}

export function AdminAdPage() {
    const [activeTab, setActiveTab] = useAdminTabQuery<TabType>('ads', AD_TABS);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [adStatusFilter, setAdStatusFilter] = useState(-1);
    const [positionFilter, setPositionFilter] = useState<number>(0);
    const [showAdForm, setShowAdForm] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState<AdPosition | null>(null);
    const [positionName, setPositionName] = useState('');
    const [positionLocation, setPositionLocation] = useState('home_banner');
    const [positionSize, setPositionSize] = useState('');

    // 广告位列表：广告位 Tab 展示；广告投放 Tab 用于筛选下拉
    const positionsHook = useAsyncEffect<PositionsResult>(
        async () => {
            if (activeTab !== 'positions' && activeTab !== 'ads') return { list: [] };
            const res = await getAdPositionList({ page: 1, page_size: 100 });
            return { list: res.list };
        },
        [activeTab],
        {
            initialData: { list: [] },
            onError: (err) => showErrorToast((err as Error).message || '获取广告位列表失败'),
        },
    );

    // 广告列表 - 仅在 ads tab 时请求
    const adsHook = useAsyncEffect<AdsResult>(
        async () => {
            if (activeTab !== 'ads') return { list: [], total: 0 };
            const params: { positionId?: number; status?: number; page?: number; page_size?: number } = {
                page: currentPage,
                page_size: pageSize,
            };
            if (positionFilter > 0) params.positionId = positionFilter;
            if (adStatusFilter >= 0) params.status = adStatusFilter;

            const res = await getAdList(params);
            return { list: res.list, total: res.total };
        },
        [activeTab, currentPage, pageSize, positionFilter, adStatusFilter],
        {
            initialData: { list: [], total: 0 },
            onError: (err) => showErrorToast((err as Error).message || '获取广告列表失败'),
        },
    );

    const positions = positionsHook.data?.list ?? [];
    const ads = adsHook.data?.list ?? [];
    const total = adsHook.data?.total ?? 0;
    const loading = activeTab === 'positions' ? positionsHook.loading : (activeTab === 'ads' ? adsHook.loading : false);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreateAd = () => {
        setEditingAd(null);
        setShowAdForm(true);
    };

    const handleEditAd = (ad: Advertisement) => {
        setEditingAd(ad);
        setShowAdForm(true);
    };

    const handleDeleteAd = async (id: number) => {
        if (!confirm('确定要删除这条广告吗？')) return;
        try {
            await deleteAd(id);
            showSuccessToast('删除成功');
            adsHook.refetch();
        } catch (err) {
            showErrorToast((err as Error).message || '删除失败');
        }
    };

    const handleReviewAd = async (id: number, status: number) => {
        try {
            await reviewAd({ id, status });
            showSuccessToast(status === 1 ? '上架成功' : '下架成功');
            adsHook.refetch();
        } catch (err) {
            showErrorToast((err as Error).message || '操作失败');
        }
    };

    const handleAdFormSubmit = () => {
        setShowAdForm(false);
        adsHook.refetch();
    };

    const handleCreatePosition = async () => {
        if (!positionName.trim()) {
            showErrorToast('请输入广告位名称');
            return;
        }
        if (!positionSize.trim()) {
            showErrorToast('请输入广告位尺寸');
            return;
        }
        try {
            await createAdPosition({ name: positionName, location: positionLocation, size: positionSize, status: 1 });
            showSuccessToast('广告位创建成功');
            setShowPositionModal(false);
            setPositionName('');
            setPositionLocation('home_banner');
            setPositionSize('');
            positionsHook.refetch();
        } catch (err) {
            showErrorToast((err as Error).message || '创建失败');
        }
    };

    const handleEditPosition = async () => {
        if (!editingPosition) return;
        if (!positionName.trim()) {
            showErrorToast('请输入广告位名称');
            return;
        }
        if (!positionSize.trim()) {
            showErrorToast('请输入广告位尺寸');
            return;
        }
        try {
            await updateAdPosition(editingPosition.id, { name: positionName, location: positionLocation, size: positionSize });
            showSuccessToast('广告位更新成功');
            setShowPositionModal(false);
            setEditingPosition(null);
            setPositionName('');
            setPositionLocation('home_banner');
            setPositionSize('');
            positionsHook.refetch();
        } catch (err) {
            showErrorToast((err as Error).message || '更新失败');
        }
    };

    const handleDeletePosition = async (id: number) => {
        if (!confirm('确定要删除这个广告位吗？')) return;
        try {
            await deleteAdPosition(id);
            showSuccessToast('删除成功');
            positionsHook.refetch();
        } catch (err) {
            showErrorToast((err as Error).message || '删除失败');
        }
    };

    const handleOpenPositionModal = (position?: AdPosition) => {
        if (position) {
            setEditingPosition(position);
            setPositionName(position.name);
            setPositionLocation(position.location);
            setPositionSize(position.size);
        } else {
            setEditingPosition(null);
            setPositionName('');
            setPositionLocation('home_banner');
            setPositionSize('');
        }
        setShowPositionModal(true);
    };

    const getStatusLabel = (status: number) => {
        return AdStatusMap[status] || '未知';
    };

    const getStatusColor = (status: number) => {
        return AdStatusColorMap[status] || 'bg-gray/10 text-gray';
    };

    const getLocationLabel = (location: string) => {
        return AdLocationMap[location as keyof typeof AdLocationMap] || location;
    };

    return (
        <div className={adminUi.page}>
            <AdminPageHeader
                title="广告投放"
                description="配置广告位、投放素材与效果统计"
                tabs={
                    <AdminTabs
                        aria-label="广告投放分区"
                        items={[
                            { key: 'positions', label: '广告位' },
                            { key: 'ads', label: '投放' },
                            { key: 'stats', label: '统计' },
                        ]}
                        selectedKey={activeTab}
                        onSelectionChange={(key) => {
                            setActiveTab(key as TabType);
                            if (key !== 'stats') setCurrentPage(1);
                        }}
                    />
                }
                actions={
                    activeTab === 'ads' && !showAdForm ? (
                        <AdminButton type="button" variant="secondary" onClick={handleCreateAd}>
                            创建广告
                        </AdminButton>
                    ) : activeTab === 'positions' && !showPositionModal ? (
                        <AdminButton type="button" variant="secondary" onClick={() => handleOpenPositionModal()}>
                            创建广告位
                        </AdminButton>
                    ) : undefined
                }
            />

            {activeTab === 'ads' && !showAdForm ? (
                <div className={adminUi.filterSection}>
                    <AdminFilterBar>
                        <AdminFilterField label="广告位" htmlFor="ad-position-filter">
                            <AdminSelect
                                id="ad-position-filter"
                                name="positionId"
                                value={positionFilter}
                                onChange={(e) => {
                                    setPositionFilter(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={0}>全部广告位</option>
                                {positions.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </AdminSelect>
                        </AdminFilterField>
                        <AdminFilterField label="广告状态" htmlFor="ad-status-filter">
                            <AdminSelect
                                id="ad-status-filter"
                                name="adStatus"
                                value={adStatusFilter}
                                onChange={(e) => {
                                    setAdStatusFilter(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={-1}>全部状态</option>
                                {Object.entries(AdStatusMap).map(([key, label]) => (
                                    <option key={key} value={Number(key)}>{label}</option>
                                ))}
                            </AdminSelect>
                        </AdminFilterField>
                    </AdminFilterBar>
                </div>
            ) : null}

            {activeTab === 'positions' && (
                <div className="px-6">
                    {showPositionModal ? (
                        <div className="bg-white rounded-md shadow-card p-6">
                            <h2 className="text-xl font-bold text-brown mb-6">
                                {editingPosition ? '编辑广告位' : '创建广告位'}
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <AdminLabel required>广告位名称</AdminLabel>
                                    <AdminInput
                                        type="text"
                                        value={positionName}
                                        onChange={(e) => setPositionName(e.target.value)}
                                        maxLength={50}
                                        placeholder="请输入广告位名称"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <AdminLabel required>位置</AdminLabel>
                                        <AdminSelect
                                            value={positionLocation}
                                            onChange={(e) => setPositionLocation(e.target.value)}
                                        >
                                            {Object.entries(AdLocationMap).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </AdminSelect>
                                    </div>
                                    <div>
                                        <AdminLabel required>尺寸</AdminLabel>
                                        <AdminInput
                                            type="text"
                                            value={positionSize}
                                            onChange={(e) => setPositionSize(e.target.value)}
                                            maxLength={20}
                                            placeholder="如: 750x300"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        onClick={editingPosition ? handleEditPosition : handleCreatePosition}
                                    >
                                        {editingPosition ? '保存修改' : '创建'}
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setShowPositionModal(false); setEditingPosition(null); }}
                                    >
                                        取消
                                    </AdminButton>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <AdminTable.Status>
                                        <div className="mb-2 flex justify-center animate-pulse text-brown-light">
                                            <PawPrint size={32} aria-hidden="true" />
                                        </div>
                                        <p>加载中…</p>
                                    </AdminTable.Status>
                                ) : positions.length === 0 ? (
                                    <AdminTable.Status>
                                        <div className="mb-2 flex justify-center text-brown-light">
                                            <ClipboardList size={40} aria-hidden="true" />
                                        </div>
                                        <p>暂无广告位</p>
                                    </AdminTable.Status>
                                ) : (
                                    <AdminTable aria-label="广告位列表">
                                        <AdminTable.Header>
                                            <AdminTable.Column isRowHeader>ID</AdminTable.Column>
                                            <AdminTable.Column>名称</AdminTable.Column>
                                            <AdminTable.Column>位置</AdminTable.Column>
                                            <AdminTable.Column>尺寸</AdminTable.Column>
                                            <AdminTable.Column>状态</AdminTable.Column>
                                            <AdminTable.Column>创建时间</AdminTable.Column>
                                            <AdminTable.Column>操作</AdminTable.Column>
                                        </AdminTable.Header>
                                        <AdminTable.Body>
                                            {positions.map((position) => (
                                                <AdminTable.Row key={position.id} id={String(position.id)}>
                                                    <AdminTable.Cell className="whitespace-nowrap font-mono">#{position.id}</AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap font-medium">{position.name}</AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-soft text-secondary">
                                                            {getLocationLabel(position.location)}
                                                        </span>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap text-brown-muted">{position.size}</AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${position.status === 1 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                                            {position.status === 1 ? '启用' : '禁用'}
                                                        </span>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                                                        {new Date(position.createdAt).toLocaleString()}
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <div className={adminUi.actions}>
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => handleOpenPositionModal(position)}
                                                                className={adminActionClass('primary')}
                                                            >
                                                                编辑
                                                            </AdminButton>
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => handleDeletePosition(position.id)}
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
                        </>
                    )}
                </div>
            )}

            {activeTab === 'ads' && (
                <div className="px-6">
                    {showAdForm ? (
                        <AdForm
                            ad={editingAd}
                            onSubmit={handleAdFormSubmit}
                            onCancel={() => { setShowAdForm(false); setEditingAd(null); }}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <AdminTable.Status>
                                        <div className="mb-2 flex justify-center animate-pulse text-brown-light">
                                            <PawPrint size={32} aria-hidden="true" />
                                        </div>
                                        <p>加载中…</p>
                                    </AdminTable.Status>
                                ) : ads.length === 0 ? (
                                    <AdminTable.Status>
                                        <div className="mb-2 flex justify-center text-brown-light">
                                            <ClipboardList size={40} aria-hidden="true" />
                                        </div>
                                        <p>暂无广告</p>
                                    </AdminTable.Status>
                                ) : (
                                    <AdminTable aria-label="广告列表">
                                        <AdminTable.Header>
                                            <AdminTable.Column isRowHeader>ID</AdminTable.Column>
                                            <AdminTable.Column>标题</AdminTable.Column>
                                            <AdminTable.Column>广告位</AdminTable.Column>
                                            <AdminTable.Column>图片</AdminTable.Column>
                                            <AdminTable.Column>展示/点击</AdminTable.Column>
                                            <AdminTable.Column>状态</AdminTable.Column>
                                            <AdminTable.Column>时间范围</AdminTable.Column>
                                            <AdminTable.Column>操作</AdminTable.Column>
                                        </AdminTable.Header>
                                        <AdminTable.Body>
                                            {ads.map((ad) => (
                                                <AdminTable.Row key={ad.id} id={String(ad.id)}>
                                                    <AdminTable.Cell className="whitespace-nowrap font-mono">#{ad.id}</AdminTable.Cell>
                                                    <AdminTable.Cell>
                                                        <div className="max-w-xs truncate" title={ad.title}>
                                                            {ad.title}
                                                        </div>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-soft text-secondary">
                                                            {ad.position?.name || '-'}
                                                        </span>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <img
                                                            src={ad.imageUrl}
                                                            alt={ad.title}
                                                            className="w-12 h-12 object-cover rounded-md border border-border"
                                                        />
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-brown-muted inline-flex items-center gap-1"><Eye size={14} aria-hidden="true" /><span>{ad.viewCount}</span></span>
                                                            <span>/</span>
                                                            <span className="text-secondary inline-flex items-center gap-1"><Pointer size={14} aria-hidden="true" /><span>{ad.clickCount}</span></span>
                                                        </div>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                                                            {getStatusLabel(ad.status)}
                                                        </span>
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap text-brown-muted">
                                                        {new Date(ad.startTime).toLocaleDateString()}
                                                        <span className="mx-2">~</span>
                                                        {new Date(ad.endTime).toLocaleDateString()}
                                                    </AdminTable.Cell>
                                                    <AdminTable.Cell className="whitespace-nowrap">
                                                        <div className={adminUi.actions}>
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => handleEditAd(ad)}
                                                                className={adminActionClass('primary')}
                                                            >
                                                                编辑
                                                            </AdminButton>
                                                            {ad.status !== 1 && (
                                                                <AdminButton
                                                                    type="button"
                                                                    variant="ghost"
                                                                    onClick={() => handleReviewAd(ad.id, 1)}
                                                                    className={adminActionClass('success')}
                                                                >
                                                                    上架
                                                                </AdminButton>
                                                            )}
                                                            {ad.status !== 2 && (
                                                                <AdminButton
                                                                    type="button"
                                                                    variant="ghost"
                                                                    onClick={() => handleReviewAd(ad.id, 2)}
                                                                    className={adminActionClass('warning')}
                                                                >
                                                                    下架
                                                                </AdminButton>
                                                            )}
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteAd(ad.id)}
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
                        </>
                    )}
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="px-6">
                    <AdStats />
                </div>
            )}
        </div>
    );
}