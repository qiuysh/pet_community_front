import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Lock, MapPin } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { getLostPetList } from '../../api/pet';
import { useAsyncEffect } from '../../hooks/useAsync';
import { useUserStore } from '../../stores/userStore';
import { LostPetInfo } from '../../types/pet';
import { LOST_PET_STATUS, LOST_PET_STATUS_LABEL } from '../../utils/lostPetShare';
import { formatRelativeTime } from '../../utils/format';
import { showErrorToast } from '../../utils/toastManager';
import { buttonClass } from '../../components/ui/button';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { Spinner } from '../../components/ui/spinner';

function statusChipClass(status: number): string {
  switch (status) {
    case LOST_PET_STATUS.searching:
      return 'bg-warning/15 text-warning-text';
    case LOST_PET_STATUS.found:
      return 'bg-secondary-soft text-secondary-dark';
    case LOST_PET_STATUS.closed:
      return 'bg-muted text-brown-muted';
    default:
      return 'bg-soft text-brown-secondary';
  }
}

export function LostPetListPage() {
  const [page, setPage] = useState(1);
  const { isLoggedIn } = useUserStore();

  const { loading, data } = useAsyncEffect(
    () => getLostPetList({ page, pageSize: 10 }),
    [page],
    { onError: () => showErrorToast('获取寻宠列表失败') },
  );

  const list: LostPetInfo[] = data?.list ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white shadow-card">
        <div className="page-shell flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="page-bar-title">寻宠启事</h1>
            <p className="text-xs text-brown-secondary mt-0.5 truncate">社区互助，帮毛孩早日回家</p>
          </div>
          {isLoggedIn ? (
            <Link to="/lost-pets/create" className={buttonClass({ size: 'sm' })}>
              发布
            </Link>
          ) : (
            <Link
              to="/login"
              state={{ from: '/lost-pets/create' }}
              className={buttonClass({ size: 'sm', variant: 'outline' })}
            >
              <Lock
                size={ICON_SIZE.inline}
                strokeWidth={iconStroke(ICON_SIZE.inline)}
                className="mr-1"
                aria-hidden="true"
              />
              登录后发布
            </Link>
          )}
        </div>
      </div>

      <div className="page-shell motion-list space-y-3 px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Spinner />
            <p className="text-brown-muted">加载中…</p>
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title="暂无寻宠信息"
            description="走失信息会显示在这里，也可帮其他铲屎官留意"
            action={
              isLoggedIn ? (
                <Link to="/lost-pets/create" className="font-medium text-primary-text">
                  发布寻宠启事
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: '/lost-pets/create' }}
                  className="font-medium text-primary-text"
                >
                  登录后发布
                </Link>
              )
            }
          />
        ) : (
          list.map((item) => (
            <Link key={item.id} to={`/lost-pets/${item.id}`} className="block">
              <Card hoverable className="rounded-xl shadow-card p-4">
                <div className="flex justify-between gap-3">
                  <h2 className="page-section-title">{item.petName}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${statusChipClass(item.status)}`}
                  >
                    {LOST_PET_STATUS_LABEL[item.status] ?? '未知'}
                  </span>
                </div>
                <p className="text-sm text-brown-muted mt-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-brown-secondary">
                  <MapPin size={ICON_SIZE.inline} aria-hidden="true" />
                  <span>{item.lostLocation}</span>
                  <span className="mx-1">·</span>
                  <span title={item.lostTime}>{formatRelativeTime(item.lostTime) || item.lostTime}</span>
                </div>
              </Card>
            </Link>
          ))
        )}

        {total > page * 10 && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary-text"
              onClick={() => setPage((p) => p + 1)}
            >
              加载更多
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
