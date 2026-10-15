import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Lock, Send } from 'lucide-react';
import { getLostPetDetail, updateLostPetStatus } from '../../api/pet';
import { useAsyncEffect } from '../../hooks/useAsync';
import { useUserStore } from '../../stores/userStore';
import { maskContact } from '../../utils/contactPrivacy';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';

const STATUS_MAP: Record<number, string> = {
  0: '寻找中',
  1: '已找到',
  2: '已关闭',
};

export function LostPetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();

  const { loading, data: item, setData } = useAsyncEffect(
    () => getLostPetDetail(Number(id)),
    [id],
    { onError: () => showErrorToast('获取详情失败') },
  );

  const isOwner = !!user && !!item && user.id === item.userId;

  const handleMarkFound = async () => {
    if (!item || !window.confirm('确认标记为已找到？')) return;
    try {
      await updateLostPetStatus(item.id, 1);
      setData({ ...item, status: 1 });
      showSuccessToast('已更新状态');
    } catch {
      showErrorToast('更新失败');
    }
  };

  // §4.11：联系方式不对游客明文展示；登录用户可见，或引导站内私信。
  // 后端已对游客脱敏下发；前端再兜底脱敏，避免明文泄露。
  const contactVisible = isLoggedIn || isOwner;
  const displayContact = item ? maskContact(item.contact, contactVisible) : '';

  const handleContactCta = () => {
    if (!item) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // 登录用户（非发布者）优先引导站内私信（§4.11）
    navigate(
      `/messages/new?userId=${encodeURIComponent(item.userId)}&nickname=${encodeURIComponent(item.petName)}`,
    );
  };

  if (loading || !item) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 text-brown-muted">
        {loading ? (
          <>
            <Spinner />
            <span>加载中...</span>
          </>
        ) : (
          '未找到该启事'
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="sticky top-[var(--user-header-offset,56px)] z-10 bg-white border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="p-2 -ml-2 min-w-0 h-auto text-brown"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-lg font-semibold text-brown">寻宠详情</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <Card className="rounded-xl shadow-card p-5">
          <div className="flex justify-between items-start gap-3">
            <h2 className="text-xl font-bold text-brown">{item.petName}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-soft text-brown-secondary">
              {STATUS_MAP[item.status] ?? '未知'}
            </span>
          </div>
          <p className="mt-3 text-brown whitespace-pre-wrap">{item.description}</p>
          <div className="mt-4 space-y-2 text-sm text-brown-secondary">
            <p className="flex items-center gap-2">
              <MapPin size={14} /> {item.lostLocation} · {item.lostTime}
            </p>
            {/* 联系方式（§4.11）：游客脱敏 + 登录/私信引导 */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-2" data-testid="lost-pet-contact">
                <Phone size={14} />
                <span>{displayContact || '未提供'}</span>
                {!contactVisible && (
                  <span className="inline-flex items-center gap-1 text-xs text-brown-muted">
                    <Lock size={12} aria-hidden="true" />
                    登录后查看完整联系方式
                  </span>
                )}
              </p>
              {!isOwner && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleContactCta}
                  aria-label={isLoggedIn ? '私信联系发布者' : '登录后查看联系方式'}
                >
                  <Send size={14} aria-hidden="true" />
                  {isLoggedIn ? '私信联系' : '登录查看'}
                </Button>
              )}
            </div>
            {item.breedName && <p>品种：{item.breedName}</p>}
            {item.age && <p>年龄：{item.age}</p>}
          </div>
          {item.images?.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {item.images.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-lg aspect-square object-cover w-full" />
              ))}
            </div>
          )}
        </Card>

        {isOwner && item.status === 0 && (
          <Button type="button" block className="rounded-xl" onClick={handleMarkFound}>
            标记为已找到
          </Button>
        )}
      </div>
    </div>
  );
}
