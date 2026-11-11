import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getActivityDetail,
  getSubmissionList,
  getReview,
  cancelRegistration,
  deleteSubmission,
} from '../api/activity';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../components/toast';
import { useAsync, useAsyncEffect } from './useAsync';
import {
  ActivityReviewInfo,
  SubmissionInfo,
  RegistrationInfo,
  ActivityStatus,
  getActivityDisplayStatus,
  isSubmissionActivityType,
} from '../types/activity';

export type ActivityDetailTab = 'detail' | 'submissions' | 'album' | 'review' | 'registrations';

/**
 * 活动详情 hook
 *
 * 报名明细含联系方式，仅管理端可查；前台不拉报名列表。
 */
export function useActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useUserStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActivityDetailTab>('detail');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [review, setReview] = useState<ActivityReviewInfo | null>(null);
  const { loading: canceling, run: runCancel } = useAsync();
  const { loading: deletingSubmission, run: runDeleteSubmission } = useAsync();

  const { loading, data, refetch } = useAsyncEffect(
    async () => {
      if (!id) return null;
      const activityId = parseInt(id);
      const activityData = await getActivityDetail(activityId);

      let submissionsData: SubmissionInfo[] = [];
      if (isSubmissionActivityType(activityData.type)) {
        const subs = await getSubmissionList({
          activityId,
          sort: 'votes',
          pageSize: 20,
        });
        submissionsData = subs.list;
      }
      const registrationsData: RegistrationInfo[] = [];
      // 回顾为公开只读资源，未发布时后端返回空，失败不阻塞详情页
      const reviewData = await getReview(activityId).catch(() => null);
      setReview(reviewData);
      return { activity: activityData, submissions: submissionsData, registrations: registrationsData };
    },
    [id],
    {
      onError: (error: unknown) => {
        const msg = (error as { message?: string })?.message || '加载活动失败';
        toast.error(msg);
        navigate('/activities');
      },
      initialData: null,
    },
  );

  const activity = data?.activity ?? null;
  const submissions: SubmissionInfo[] = data?.submissions ?? [];
  const registrations: RegistrationInfo[] = data?.registrations ?? [];

  const handleRefresh = () => {
    refetch();
    setShowRegistrationForm(false);
    setShowSubmissionForm(false);
  };

  const isRegistrationOpen = () => {
    if (!activity) return false;
    if (activity.status !== ActivityStatus.PUBLISHED) return false;
    return getActivityDisplayStatus(activity) !== 'ended';
  };

  const isSubmissionOpen = () => {
    if (!activity) return false;
    if (!activity.isRegistered) return false;
    return getActivityDisplayStatus(activity) === 'active';
  };

  const isVoteOpen = () => {
    if (!activity) return false;
    return getActivityDisplayStatus(activity) === 'active';
  };

  /** 我的作品：从已加载列表里按 user.id 定位（详情接口不返回 submissionId） */
  const mySubmission = user
    ? submissions.find((item) => item.userId === user.id) ?? null
    : null;

  /** 已报名时允许取消；活动已结束 / 已截止不再提供 */
  const canCancelRegistration = () => {
    if (!activity || !activity.isRegistered) return false;
    if (activity.hasSubmitted) return false;
    return isRegistrationOpen();
  };

  const handleCancelRegistration = () => {
    if (!activity) return;
    runCancel(
      () => cancelRegistration(activity.id),
      () => {
        toast.success('已取消报名');
        refetch();
      },
      (err) => toast.error((err as Error).message || '取消报名失败'),
    );
  };

  const handleDeleteSubmission = () => {
    if (!mySubmission) return;
    runDeleteSubmission(
      () => deleteSubmission(mySubmission.id),
      () => {
        toast.success('作品已撤回');
        refetch();
      },
      (err) => toast.error((err as Error).message || '撤回作品失败'),
    );
  };

  return {
    activity,
    submissions,
    registrations,
    review,
    mySubmission,
    loading,
    refetch,
    isLoggedIn,
    activeTab,
    setActiveTab,
    showRegistrationForm,
    setShowRegistrationForm,
    showSubmissionForm,
    setShowSubmissionForm,
    handleRefresh,
    isRegistrationOpen,
    isSubmissionOpen,
    isVoteOpen,
    canCancelRegistration,
    handleCancelRegistration,
    handleDeleteSubmission,
    canceling,
    deletingSubmission,
  };
}
