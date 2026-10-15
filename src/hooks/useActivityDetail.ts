import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityDetail, getSubmissionList, getRegistrationList } from '../api/activity';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import {
  SubmissionInfo,
  RegistrationInfo,
  ActivityType,
  ActivityStatus,
  SubmissionStatus,
} from '../types/activity';

export type ActivityDetailTab = 'detail' | 'submissions' | 'registrations';

/**
 * 活动详情 hook
 *
 * 加载活动详情,若是投票活动则同时加载作品和报名列表。
 * 管理标签切换 + 报名/作品表单显隐 + 操作成功刷新。
 *
 * 用法:
 *   const { activity, submissions, registrations, loading, refetch, isLoggedIn, activeTab, setActiveTab, showRegistrationForm, setShowRegistrationForm, showSubmissionForm, setShowSubmissionForm, handleRefresh, isRegistrationOpen, isSubmissionOpen, isVoteOpen } = useActivityDetail();
 */
export function useActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActivityDetailTab>('detail');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { loading, data, refetch } = useAsyncEffect(
    async () => {
      if (!id) return null;
      const activityId = parseInt(id);
      const activityData = await getActivityDetail(activityId);

      let submissionsData: SubmissionInfo[] = [];
      let registrationsData: RegistrationInfo[] = [];
      if (activityData.type === ActivityType.ONLINE_VOTE) {
        const subs = await getSubmissionList({
          activityId,
          status: SubmissionStatus.APPROVED,
          sort: 'votes',
          pageSize: 20,
        });
        submissionsData = subs.list;

        const regs = await getRegistrationList({
          activityId,
          pageSize: 20,
        });
        registrationsData = regs.list;
      }
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
    if (activity.status !== ActivityStatus.ONGOING) return false;
    if (activity.registrationDeadline) {
      return new Date(activity.registrationDeadline) > new Date();
    }
    return true;
  };

  const isSubmissionOpen = () => {
    if (!activity) return false;
    if (!activity.isRegistered) return false;
    if (activity.registrationDeadline) {
      return new Date(activity.registrationDeadline) > new Date();
    }
    return activity.status === ActivityStatus.ONGOING;
  };

  const isVoteOpen = () => {
    if (!activity) return false;
    if (!activity.voteStartTime || !activity.voteEndTime) return false;
    const now = new Date();
    return new Date(activity.voteStartTime) <= now && new Date(activity.voteEndTime) >= now;
  };

  return {
    activity,
    submissions,
    registrations,
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
  };
}
