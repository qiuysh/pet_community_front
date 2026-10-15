import { useCallback } from 'react';
import { useToast } from '../components/toast';
import { useAsync } from '../hooks/useAsync';
import {
  getActivityList,
  getActivityDetail,
  createActivity,
  updateActivity,
  deleteActivity,
  getRegistrationList,
  createRegistration,
  getSubmissionList,
  createSubmission,
} from '../api/activity';
import {
  ActivityListParams,
  ActivityCreateRequest,
  ActivityUpdateRequest,
  RegistrationListParams,
  RegistrationCreateRequest,
  SubmissionListParams,
  SubmissionCreateRequest,
} from '../types/activity';

export const useActivity = () => {
  const toast = useToast();
  const { loading, run } = useAsync();

  const fetchActivityList = useCallback(async (params?: ActivityListParams) => {
    return run(
      () => getActivityList(params),
      undefined,
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载活动列表失败'),
    );
  }, [run, toast]);

  const fetchActivityDetail = useCallback(async (id: number) => {
    return run(
      () => getActivityDetail(id),
      undefined,
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载活动详情失败'),
    );
  }, [run, toast]);

  const createNewActivity = useCallback(async (data: ActivityCreateRequest) => {
    return run(
      () => createActivity(data),
      () => toast.success('活动创建成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动创建失败'),
    );
  }, [run, toast]);

  const updateExistingActivity = useCallback(async (id: number, data: ActivityUpdateRequest) => {
    return run(
      () => updateActivity(id, data),
      () => toast.success('活动更新成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动更新失败'),
    );
  }, [run, toast]);

  const deleteExistingActivity = useCallback(async (id: number) => {
    await run(
      () => deleteActivity(id),
      () => toast.success('活动删除成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '活动删除失败'),
    );
  }, [run, toast]);

  const fetchRegistrationList = useCallback(async (params: RegistrationListParams) => {
    return run(
      () => getRegistrationList(params),
      undefined,
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载报名列表失败'),
    );
  }, [run, toast]);

  const createNewRegistration = useCallback(async (data: RegistrationCreateRequest) => {
    return run(
      () => createRegistration(data),
      () => toast.success('报名成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '报名失败'),
    );
  }, [run, toast]);

  const fetchSubmissionList = useCallback(async (params: SubmissionListParams) => {
    return run(
      () => getSubmissionList(params),
      undefined,
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载作品列表失败'),
    );
  }, [run, toast]);

  const createNewSubmission = useCallback(async (data: SubmissionCreateRequest) => {
    return run(
      () => createSubmission(data),
      () => toast.success('作品提交成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '作品提交失败'),
    );
  }, [run, toast]);

  return {
    loading,
    fetchActivityList,
    fetchActivityDetail,
    createNewActivity,
    updateExistingActivity,
    deleteExistingActivity,
    fetchRegistrationList,
    createNewRegistration,
    fetchSubmissionList,
    createNewSubmission,
  };
};
