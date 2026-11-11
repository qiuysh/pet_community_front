import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAdoptDetail,
  getApplicationListByAdoption,
  getMyApplicationList,
  getFollowUpListByAdoption,
} from '../api/adopt';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import { useUserStore } from '../stores/userStore';
import {
  AdoptInfo,
  AdoptionApplicationInfo,
  AdoptionFollowUpInfo,
  ApplicationStatus,
} from '../types/adopt';

/**
 * 领养详情 hook
 *
 * 加载详情、（发布者）申请列表、领养回访记录；管理申请表单/审核弹窗。
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

  // 领养人身份：从「我的申请」里找本条领养下已通过且已签协议的申请
  const { data: myApplicationsData } = useAsyncEffect(
    async () => {
      if (!user || isOwner) return undefined;
      return await getMyApplicationList(undefined, 1, 50);
    },
    [user?.id, isOwner],
    { onError: () => toast.error('加载我的申请失败') },
  );
  const myApprovedApplication = (myApplicationsData?.list ?? []).find(
    (app) =>
      app.adoptionId === adopt?.id &&
      app.status === ApplicationStatus.APPROVED &&
      app.agreementSigned,
  );
  const isAdopter = !!myApprovedApplication;
  const canSeeFollowUps = isOwner || isAdopter;

  const ownerApprovedApplication = applications.find(
    (app) => app.status === ApplicationStatus.APPROVED && app.agreementSigned,
  );
  const followUpApplicationId = isOwner
    ? ownerApprovedApplication?.id
    : myApprovedApplication?.id;

  const {
    loading: followUpsLoading,
    data: followUpsData,
    refetch: refetchFollowUps,
  } = useAsyncEffect(
    async () => {
      if (!id || !canSeeFollowUps) return undefined;
      return await getFollowUpListByAdoption(parseInt(id), 1, 50);
    },
    [id, canSeeFollowUps],
    { onError: () => toast.error('加载回访记录失败') },
  );
  const followUps: AdoptionFollowUpInfo[] = followUpsData?.list ?? [];

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
    followUps,
    followUpsLoading,
    refetchFollowUps,
    canSeeFollowUps,
    followUpApplicationId,
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
