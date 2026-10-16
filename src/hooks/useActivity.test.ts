import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const toastSuccess = vi.fn();
const toastError = vi.fn();

const apiMocks = {
  getActivityList: vi.fn(),
  getActivityDetail: vi.fn(),
  createActivity: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn(),
  getRegistrationList: vi.fn(),
  createRegistration: vi.fn(),
  getSubmissionList: vi.fn(),
  createSubmission: vi.fn(),
};

vi.mock('../components/toast', () => ({
  useToast: () => ({
    success: toastSuccess,
    error: toastError,
  }),
}));

vi.mock('../api/activity', () => ({
  getActivityList: (...args: unknown[]) => apiMocks.getActivityList(...args),
  getActivityDetail: (...args: unknown[]) => apiMocks.getActivityDetail(...args),
  createActivity: (...args: unknown[]) => apiMocks.createActivity(...args),
  updateActivity: (...args: unknown[]) => apiMocks.updateActivity(...args),
  deleteActivity: (...args: unknown[]) => apiMocks.deleteActivity(...args),
  getRegistrationList: (...args: unknown[]) => apiMocks.getRegistrationList(...args),
  createRegistration: (...args: unknown[]) => apiMocks.createRegistration(...args),
  getSubmissionList: (...args: unknown[]) => apiMocks.getSubmissionList(...args),
  createSubmission: (...args: unknown[]) => apiMocks.createSubmission(...args),
}));

import { ActivityType } from '../types/activity';
import { useActivity } from './useActivity';

describe('useActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchActivityList 成功时应返回活动列表', async () => {
    const list = { list: [{ id: 1, title: '萌宠投票' }], total: 1 };
    apiMocks.getActivityList.mockResolvedValue(list);

    const { result: hook } = renderHook(() => useActivity());

    let response;
    await act(async () => {
      response = await hook.current.fetchActivityList({ keyword: '萌宠' });
    });

    expect(response).toEqual(list);
    expect(apiMocks.getActivityList).toHaveBeenCalledWith({ keyword: '萌宠' });
  });

  it('fetchActivityList 失败时应显示错误提示', async () => {
    apiMocks.getActivityList.mockRejectedValue(new Error('加载失败'));

    const { result: hook } = renderHook(() => useActivity());

    let response: unknown = 'sentinel';
    await act(async () => {
      // useAsync.run 捕获错误后返回 undefined，不向外抛出
      response = await hook.current.fetchActivityList();
    });

    expect(response).toBeUndefined();
    expect(toastError).toHaveBeenCalledWith('加载失败');
  });

  it('createNewActivity 成功时应显示成功提示', async () => {
    const created = { id: 1, title: '新活动' };
    apiMocks.createActivity.mockResolvedValue(created);

    const { result: hook } = renderHook(() => useActivity());

    const data = {
      title: '新活动',
      description: '活动描述',
      type: ActivityType.VOTING,
      cover: 'cover.jpg',
      startTime: '2026-07-23T00:00:00Z',
      endTime: '2026-07-30T00:00:00Z',
    };

    let response;
    await act(async () => {
      response = await hook.current.createNewActivity(data);
    });

    expect(response).toEqual(created);
    expect(toastSuccess).toHaveBeenCalledWith('活动创建成功');
  });

  it('deleteExistingActivity 成功时不返回数据但显示提示', async () => {
    apiMocks.deleteActivity.mockResolvedValue(undefined);

    const { result: hook } = renderHook(() => useActivity());

    await act(async () => {
      await hook.current.deleteExistingActivity(1);
    });

    expect(apiMocks.deleteActivity).toHaveBeenCalledWith(1);
    expect(toastSuccess).toHaveBeenCalledWith('活动删除成功');
  });

  it('createNewSubmission 成功时应显示成功提示', async () => {
    const submission = { id: 1, title: '我的作品' };
    apiMocks.createSubmission.mockResolvedValue(submission);

    const { result: hook } = renderHook(() => useActivity());

    const data = {
      activityId: 1,
      title: '我的作品',
      description: '作品描述',
      type: 'image' as const,
      images: ['img1.jpg'],
    };

    let response;
    await act(async () => {
      response = await hook.current.createNewSubmission(data);
    });

    expect(response).toEqual(submission);
    expect(toastSuccess).toHaveBeenCalledWith('作品提交成功');
  });

  it('loading 状态应在异步操作期间正确切换', async () => {
    apiMocks.getActivityList.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ list: [], total: 0 }), 10)));

    const { result: hook } = renderHook(() => useActivity());

    act(() => {
      hook.current.fetchActivityList();
    });

    await waitFor(() => {
      expect(hook.current.loading).toBe(true);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(hook.current.loading).toBe(false);
  });
});
