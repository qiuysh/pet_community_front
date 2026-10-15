import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { getLostPetList } from '../../api/pet';
import { useAsyncEffect } from '../../hooks/useAsync';
import { LostPetInfo } from '../../types/pet';
import { showErrorToast } from '../../utils/toastManager';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';

const STATUS_MAP: Record<number, string> = {
  0: '寻找中',
  1: '已找到',
  2: '已关闭',
};

export function LostPetListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { loading, data } = useAsyncEffect(
    () => getLostPetList({ page, pageSize: 10 }),
    [page],
    { onError: () => showErrorToast('获取寻宠列表失败') },
  );

  const list: LostPetInfo[] = data?.list ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="p-2 -ml-2 min-w-0 h-auto text-brown"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-lg font-semibold text-brown">寻宠启事</h1>
          <Link to="/lost-pets/create" className="text-sm text-primary font-medium">
            发布
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Spinner />
            <p className="text-brown-muted">加载中...</p>
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-brown-muted py-12">暂无寻宠信息</p>
        ) : (
          list.map((item) => (
            <Link key={item.id} to={`/lost-pets/${item.id}`} className="block">
              <Card hoverable className="rounded-xl shadow-card p-4">
                <div className="flex justify-between gap-3">
                  <h2 className="font-semibold text-brown">{item.petName}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-soft text-brown-secondary shrink-0">
                    {STATUS_MAP[item.status] ?? '未知'}
                  </span>
                </div>
                <p className="text-sm text-brown-muted mt-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-brown-secondary">
                  <MapPin size={12} />
                  <span>{item.lostLocation}</span>
                  <span className="mx-1">·</span>
                  <span>{item.lostTime}</span>
                </div>
              </Card>
            </Link>
          ))
        )}

        {total > page * 10 && (
          <div className="text-center">
            <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => setPage((p) => p + 1)}>
              加载更多
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
