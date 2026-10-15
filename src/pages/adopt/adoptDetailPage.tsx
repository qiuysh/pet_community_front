import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Send } from 'lucide-react';
import { useAdoptDetail } from '../../hooks/useAdoptDetail';
import { useUserStore } from '../../stores/userStore';
import { maskContact } from '../../utils/contactPrivacy';
import { PetType, AdoptionStatus, PetGender } from '../../types/adopt';
import { AdoptionApplyForm } from '../../components/adopt/adoptionApplyForm';
import { AdoptionReview } from '../../components/adopt/adoptionReview';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export const AdoptDetailPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const {
    adopt,
    loading,
    showApplyForm,
    setShowApplyForm,
    showReviewModal,
    setShowReviewModal,
    currentApplication,
    handleApplySuccess,
    handleReviewSuccess,
  } = useAdoptDetail();

  const isOwner = !!user && !!adopt && user.id === adopt.userId;
  // §4.11：联系方式不对游客明文；登录用户可见，或优先引导站内私信（A8-03）。
  // 后端已对游客脱敏下发；前端再兜底脱敏。
  const contactVisible = isLoggedIn || isOwner;
  const displayContact = adopt ? maskContact(adopt.contactPhone, contactVisible) : '';

  const handleContactCta = () => {
    if (!adopt) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(
      `/messages/new?userId=${encodeURIComponent(adopt.userId)}&nickname=${encodeURIComponent(adopt.userNickname)}`,
    );
  };

  const getPetTypeLabel = (petType: PetType) => {
    const labels = {
      [PetType.CAT]: '猫咪',
      [PetType.DOG]: '狗狗',
      [PetType.BIRD]: '鸟类',
      [PetType.FISH]: '鱼类',
      [PetType.OTHER]: '其他',
    };
    return labels[petType] || '未知';
  };

  const getGenderLabel = (gender: PetGender) => {
    const labels = {
      [PetGender.UNKNOWN]: '未知',
      [PetGender.MALE]: '公',
      [PetGender.FEMALE]: '母',
    };
    return labels[gender] || '未知';
  };

  const getStatusLabel = (status: AdoptionStatus) => {
    const labels = {
      [AdoptionStatus.PENDING]: '待领养',
      [AdoptionStatus.ADOPTED]: '已领养',
      [AdoptionStatus.CANCELLED]: '已取消',
    };
    return labels[status] || '未知';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!adopt) {
    return (
      <div className="text-center py-12 text-brown-muted">
        领养信息不存在
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pb-6">
      {/* 照片展示 */}
      {adopt.photos && adopt.photos.length > 0 && (
        <div className="bg-white">
          <img
            src={adopt.photos[0]}
            alt={adopt.petName}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-brown">{adopt.petName}</h1>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              adopt.status === AdoptionStatus.PENDING
                ? 'bg-secondary-soft text-secondary-dark'
                : adopt.status === AdoptionStatus.ADOPTED
                ? 'bg-primary-soft text-primary-dark'
                : 'bg-error/10 text-error-dark'
            }`}>
              {getStatusLabel(adopt.status)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-brown-muted mb-3">
            <span>{getPetTypeLabel(adopt.petType)}</span>
            {adopt.petAge && <span>年龄: {adopt.petAge}</span>}
            <span>性别: {getGenderLabel(adopt.petGender)}</span>
          </div>

          {adopt.healthStatus && (
            <div className="text-sm text-brown-muted mb-3">
              <span className="font-medium">健康状况：</span>
              {adopt.healthStatus}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-brown-muted">
            <span className="icon-location" />
            <span>{adopt.location}</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-medium text-brown mb-2">宠物介绍</h2>
          <p className="text-sm text-brown-muted">{adopt.description}</p>
        </Card>

        {adopt.adoptConditions && (
          <Card>
            <h2 className="text-base font-medium text-brown mb-2">领养条件</h2>
            <p className="text-sm text-brown-muted">{adopt.adoptConditions}</p>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-3">
            <img
              src={adopt.userAvatar || getDefaultUserAvatar()}
              alt={adopt.userNickname}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-brown">{adopt.userNickname}</div>
              <div className="text-xs text-brown-muted">{adopt.createdAt}</div>
            </div>
          </div>
        </Card>

        {/* 联系方式（§4.11 / A8-03）：游客脱敏 + 登录/私信引导 */}
        <Card>
          <div className="flex flex-wrap items-center gap-2 text-sm text-brown-muted">
            <p className="flex items-center gap-2" data-testid="adopt-contact">
              <Phone size={14} aria-hidden="true" />
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
        </Card>

        {adopt.status === AdoptionStatus.PENDING && (
          <Card>
            <Button block size="lg" onClick={() => setShowApplyForm(true)}>
              申请领养
            </Button>
          </Card>
        )}
      </div>

      {/* 申请表单 */}
      {showApplyForm && adopt && (
        <AdoptionApplyForm
          adoptionId={adopt.id}
          onClose={() => setShowApplyForm(false)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* 审核组件 */}
      {showReviewModal && currentApplication && (
        <AdoptionReview
          application={currentApplication}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};