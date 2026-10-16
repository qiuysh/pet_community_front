import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityDetail, getSubmissionList } from '../api/activity';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../components/toast';
import { useAsyncEffect } from './useAsync';
import {
  SubmissionInfo,
  RegistrationInfo,
  ActivityType,
  ActivityStatus,
  getActivityDisplayStatus,
} from '../types/activity';

export type ActivityDetailTab = 'detail' | 'submissions' | 'registrations';

/**
 * 活动详情 hook
 *
 * 报名明细含联系方式，仅管理端可查；前台不拉报名列表。
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
      if (activityData.type === ActivityType.VOTING || activityData.type === ActivityType.CONTEST) {
        const subs = await getSubmissionList({
          activityId,
          sort: 'votes',
          pageSize: 20,
        });
        submissionsData = subs.list;
      }
      const registrationsData: RegistrationInfo[] = [];
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
