import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAdoptDetail, getApplicationListByAdoption } from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { useUserStore } from '../stores/userStore';
import { AdoptInfo, AdoptionApplicationInfo } from '../types/adopt';

/**
 * 领养详情 hook
 *
 * 加载详情与（发布者）申请列表，管理申请表单/审核弹窗。
 */
export function useAdoptDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { user } = useUserStore();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<AdoptionApplicationInfo | null>(null);

  const { loading, data: adopt, refetch } = useAsyncEffect(
    async () => {
      if (!id) return undefined;
      return await getAdoptDetail(parseInt(id));
    },
    [id],
    { onError: () => toast.error('加载领养详情失败') },
  );

  const isOwner = !!user && !!adopt && user.id === adopt.userId;

  const {
    loading: appsLoading,
    data: applicationsData,
    refetch: refetchApps,
  } = useAsyncEffect(
    async () => {
      if (!id || !isOwner) return undefined;
      return await getApplicationListByAdoption(parseInt(id), {
        page: 1,
        pageSize: 50,
      });
    },
    [id, isOwner, adopt?.id],
    { onError: () => toast.error('加载申请列表失败') },
  );

  const applications: AdoptionApplicationInfo[] = applicationsData?.list ?? [];

  const openReview = (application: AdoptionApplicationInfo) => {
    setCurrentApplication(application);
    setShowReviewModal(true);
  };

  const handleApplySuccess = (_application: AdoptionApplicationInfo) => {
    setShowApplyForm(false);
    toast.success('申请已提交，请等待审核');
    refetch();
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setCurrentApplication(null);
    toast.success('审核成功');
    refetch();
    refetchApps();
  };

  return {
    adopt: adopt as AdoptInfo | undefined,
    loading,
    refetch,
    isOwner,
    applications,
    appsLoading,
    showApplyForm,
    setShowApplyForm,
    showReviewModal,
    setShowReviewModal,
    currentApplication,
    openReview,
    handleApplySuccess,
    handleReviewSuccess,
  };
}
