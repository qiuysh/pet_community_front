import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelApplication,
  deleteAdopt,
  getMyAdoptList,
  getMyApplicationList,
  updateAdoptStatus,
} from '../../api/adopt';
import {
  AdoptionApplicationInfo,
  AdoptionStatus,
  AdoptInfo,
  ApplicationStatus,
} from '../../types/adopt';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../components/toast';
import { Button, buttonClass } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs } from '../../components/ui/tabs';

type TabKey = 'adopts' | 'applications';

const adoptStatusText: Record<number, string> = {
  [AdoptionStatus.PENDING]: '待领养',
  [AdoptionStatus.ADOPTED]: '已领养',
  [AdoptionStatus.CANCELLED]: '已取消',
};

const applicationStatusText: Record<number, string> = {
  [ApplicationStatus.PENDING]: '审核中',
  [ApplicationStatus.APPROVED]: '已通过',
  [ApplicationStatus.REJECTED]: '已拒绝',
};

/**
 * 我的领养：我发布的送养信息 + 我提交的领养申请。
 *
 * 数据全部来自 /adopts/my 与 /adopts/applications/my，进入即按需拉取，
 * 变更（取消申请 / 下架送养 / 标记已领养）后就地刷新。
 */
export const MyAdoptPage = () => {
  const toast = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [tab, setTab] = useState<TabKey>('adopts');
  const [adopts, setAdopts] = useState<AdoptInfo[]>([]);
  const [applications, setApplications] = useState<AdoptionApplicationInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [adoptRes, appRes] = await Promise.all([
        getMyAdoptList(1, 20),
        getMyApplicationList(undefined, 1, 20),
      ]);
      setAdopts(adoptRes.list ?? []);
      setApplications(appRes.list ?? []);
    } catch (error) {
      toast.error((error as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCancelApplication = async (id: number) => {
    const ok = await confirm({
      title: '取消申请',
      description: '取消后该申请不再参与审核，可重新提交。',
      confirmText: '取消申请',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await cancelApplication(id);
      toast.success('已取消申请');
      void load();
    } catch (error) {
      toast.error((error as Error).message || '取消失败');
    }
  };

  const handleUpdateStatus = async (adoptionId: number, status: AdoptionStatus, tip: string) => {
    const ok = await confirm({ title: tip, description: '该操作会更新送养信息状态。', confirmText: tip });
    if (!ok) return;
    try {
      await updateAdoptStatus({ adoptionId, status });
      toast.success('状态已更新');
      void load();
    } catch (error) {
      toast.error((error as Error).message || '更新失败');
    }
  };

  const handleDeleteAdopt = async (id: number) => {
    const ok = await confirm({
      title: '下架送养信息',
      description: '下架后该信息不再展示，已提交的申请记录仍保留。',
      confirmText: '下架',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteAdopt(id);
      toast.success('已下架');
      void load();
    } catch (error) {
      toast.error((error as Error).message || '下架失败');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader title="我的领养" fallbackTo="/adopts" />

      <div className="page-shell py-3">
        <Tabs
          listOnly
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as TabKey)}
          items={[
            { key: 'adopts', title: `我的送养${adopts.length ? ` (${adopts.length})` : ''}` },
            { key: 'applications', title: `我的申请${applications.length ? ` (${applications.length})` : ''}` },
          ]}
        />
      </div>

      <div className="page-shell pb-8 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
        ) : tab === 'adopts' ? (
          adopts.length === 0 ? (
            <EmptyState
              compact
              title="还没有发布送养信息"
              action={
                <Link to="/adopts/create" className={buttonClass({ size: 'sm' })}>
                  发布送养
                </Link>
              }
            />
          ) : (
            adopts.map((adopt) => (
              <Card key={adopt.id} className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    decoding="async"
                    src={adopt.photos?.[0] || '/default-pet.png'}
                    alt={adopt.petName}
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/adopts/${adopt.id}`} className="truncate font-medium text-brown">
                        {adopt.petName}
                      </Link>
                      <span className="shrink-0 rounded bg-secondary-soft px-1.5 py-0.5 text-xs text-secondary-dark">
                        {adoptStatusText[adopt.status] ?? '未知'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-brown-muted">{adopt.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      {adopt.status === AdoptionStatus.PENDING && (
                        <>
                          <button
                            type="button"
                            className="text-primary-text"
                            onClick={() => handleUpdateStatus(adopt.id, AdoptionStatus.ADOPTED, '标记已领养')}
                          >
                            标记已领养
                          </button>
                          <button
                            type="button"
                            className="text-error"
                            onClick={() => handleDeleteAdopt(adopt.id)}
                          >
                            下架
                          </button>
                        </>
                      )}
                      <Link to={`/adopts/${adopt.id}`} className="text-brown-muted">
                        查看申请与详情
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )
        ) : applications.length === 0 ? (
          <EmptyState
            compact
            title="还没有提交领养申请"
            action={
              <Link to="/adopts" className={buttonClass({ size: 'sm' })}>
                去看看待领养的宠物
              </Link>
            }
          />
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <Link to={`/adopts/${application.adoptionId}`} className="font-medium text-brown">
                  申请 #{application.adoptionId}
                </Link>
                <span className="rounded bg-secondary-soft px-1.5 py-0.5 text-xs text-secondary-dark">
                  {applicationStatusText[application.status] ?? '未知'}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-brown-muted">{application.applicationInfo}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-brown-muted">
                  提交于 {new Date(application.createdAt).toLocaleDateString('zh-CN')}
                </span>
                {application.status === ApplicationStatus.PENDING && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-0 text-error"
                    onClick={() => handleCancelApplication(application.id)}
                  >
                    取消申请
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {confirmDialog}
    </div>
  );
};

export default MyAdoptPage;
