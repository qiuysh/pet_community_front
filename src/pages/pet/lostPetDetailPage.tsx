import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { MapPin, Phone, Lock, Send, Share2 } from 'lucide-react';
import { ICON_SIZE } from '../../styles/iconSize';
import { getLostPetDetail, recordLostPetShare, updateLostPetStatus } from '../../api/pet';
import { useAsyncEffect } from '../../hooks/useAsync';
import { useConfirm } from '../../hooks/useConfirm';
import { useShare } from '../../hooks/useShare';
import { useUserStore } from '../../stores/userStore';
import { maskContact } from '../../utils/contactPrivacy';
import {
  buildLostPetShareTitle,
  LOST_PET_STATUS,
  LOST_PET_STATUS_LABEL,
} from '../../utils/lostPetShare';
import { showErrorToast, showSuccessToast } from '../../utils/toastManager';
import { ShareSheet } from '../../components/post/shareSheet';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Spinner } from '../../components/ui/spinner';

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
  const { confirm, confirmDialog } = useConfirm();

  const resolveShareTarget = useCallback(() => {
    if (!item) return { url: '', title: '' };
    return {
      url: `${window.location.origin}/lost-pets/${item.id}`,
      title: buildLostPetShareTitle(item),
    };
  }, [item]);

  const {
    shareOpen,
    shareUrl,
    shareTitle,
    openShare,
    closeShare,
    onShare,
  } = useShare({
    record: (platform) =>
      item ? recordLostPetShare(item.id, platform) : Promise.resolve({ sharesCount: 0 }),
    onCountChange: (delta) =>
      setData((prev) =>
        prev
          ? { ...prev, sharesCount: Math.max(0, (prev.sharesCount ?? 0) + delta) }
          : prev,
      ),
    resolveTarget: resolveShareTarget,
  });

  const handleMarkFound = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: '标记为已找回？',
      description: '标记后启事状态将变为「已找回」，其他用户不再看到寻宠求助提示。',
      confirmText: '标记为已找回',
      tone: 'primary',
    });
    if (!confirmed) return;
    try {
      await updateLostPetStatus(item.id, LOST_PET_STATUS.found);
      setData({ ...item, status: LOST_PET_STATUS.found });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner label="加载中…" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-cream min-h-screen">
        <PageHeader title="寻宠详情" fallbackTo="/lost-pets" />
        <div className="page-shell">
          <EmptyState
            title="未找到该启事"
            description="可能已下架或链接失效"
            action={
              <Link to="/lost-pets" className="font-medium text-primary-text">
                返回寻宠列表
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const statusLabel = LOST_PET_STATUS_LABEL[item.status] ?? '未知';
  const sharesCount = item.sharesCount ?? 0;

  return (
    <div className="bg-cream min-h-screen pb-6">
      <PageHeader title="寻宠详情" fallbackTo="/lost-pets" />

      {/* 列宽与 PageHeader 内层 page-shell 同宽；水平边距由卡片内 padding 承担（§5.5） */}
      <div className="page-shell space-y-4 py-4">
        <Card>
          <div className="flex justify-between items-start gap-3">
            <h2 className="page-content-title">{item.petName}</h2>
            <span
              className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                item.status === LOST_PET_STATUS.found
                  ? 'bg-success/10 text-success-text'
                  : 'bg-soft text-brown-secondary'
              }`}
              data-testid="lost-pet-status"
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-3 text-brown whitespace-pre-wrap">{item.description}</p>
          <div className="mt-4 space-y-2 text-sm text-brown-secondary">
            <p className="flex items-center gap-2">
              <MapPin size={ICON_SIZE.inline} aria-hidden="true" /> {item.lostLocation} · {item.lostTime}
            </p>
            {/* 联系方式（§4.11）：游客脱敏 + 登录/私信引导 */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-2" data-testid="lost-pet-contact">
                <Phone size={ICON_SIZE.inline} aria-hidden="true" />
                <span>{displayContact || '未提供'}</span>
                {!contactVisible && (
                  <span className="inline-flex items-center gap-1 text-xs text-brown-muted">
                    <Lock size={ICON_SIZE.inline} aria-hidden="true" />
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
                  <Send size={ICON_SIZE.inline} aria-hidden="true" />
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
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={200}
                  height={200}
                  loading="lazy"
                  className="rounded-md aspect-square object-cover w-full"
                  decoding="async"
                />
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            block
            onClick={openShare}
            aria-label="分享寻宠启事"
          >
            <Share2 size={ICON_SIZE.inline} aria-hidden="true" />
            分享{sharesCount > 0 ? ` ${sharesCount}` : ''}
          </Button>

          {isOwner && item.status === LOST_PET_STATUS.searching && (
            <Button type="button" block onClick={handleMarkFound}>
              标记为已找回
            </Button>
          )}
        </div>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={closeShare}
        postUrl={shareUrl}
        postTitle={shareTitle}
        onShare={(platform) => void onShare(platform)}
      />

      {confirmDialog}
    </div>
  );
}
