import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const toastSuccess = vi.fn();
const toastError = vi.fn();
const voteForSubmissionMock = vi.fn();
const cancelVoteMock = vi.fn();
const getVoteHistoryMock = vi.fn();

vi.mock('../components/toast', () => ({
  useToast: () => ({
    success: toastSuccess,
    error: toastError,
  }),
}));

vi.mock('../api/activity', () => ({
  voteForSubmission: (...args: unknown[]) => voteForSubmissionMock(...args),
  cancelVote: (...args: unknown[]) => cancelVoteMock(...args),
  getVoteHistory: (...args: unknown[]) => getVoteHistoryMock(...args),
}));

import { useVote } from './useVote';

describe('useVote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('vote 成功时应显示成功提示并返回结果', async () => {
    const result = { voted: true, votesCount: 11, remainingVotes: 9 };
    voteForSubmissionMock.mockResolvedValue(result);

    const { result: hook } = renderHook(() => useVote());

    let response;
    await act(async () => {
      response = await hook.current.vote({ activityId: 1, submissionId: 2 });
    });

    expect(response).toEqual(result);
    expect(toastSuccess).toHaveBeenCalledWith('投票成功，今日剩余票数：9');
  });

  it('vote 失败时应显示错误提示并返回 undefined', async () => {
    voteForSubmissionMock.mockRejectedValue(new Error('投票失败'));

    const { result: hook } = renderHook(() => useVote());

    let response: unknown = 'sentinel';
    await act(async () => {
      // useAsync.run 捕获错误后返回 undefined，不向外抛出
      response = await hook.current.vote({ activityId: 1, submissionId: 2 });
    });

    expect(response).toBeUndefined();
    expect(toastError).toHaveBeenCalledWith('投票失败');
  });

  it('cancel 成功时应显示取消成功提示', async () => {
    cancelVoteMock.mockResolvedValue(undefined);

    const { result: hook } = renderHook(() => useVote());

    await act(async () => {
      await hook.current.cancel(2);
    });

    expect(cancelVoteMock).toHaveBeenCalledWith(2);
    expect(toastSuccess).toHaveBeenCalledWith('取消投票成功');
  });

  it('fetchHistory 应返回投票记录列表', async () => {
    const history = { list: [{ id: 1, submissionTitle: '作品1' }], total: 1 };
    getVoteHistoryMock.mockResolvedValue(history);

    const { result: hook } = renderHook(() => useVote());

    let response;
    await act(async () => {
      response = await hook.current.fetchHistory(1);
    });

    expect(response).toEqual(history);
    expect(getVoteHistoryMock).toHaveBeenCalledWith(1, 1, 20);
  });

  it('加载状态应在请求期间为 true', async () => {
    voteForSubmissionMock.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ voted: true, votesCount: 1, remainingVotes: 1 }), 10)));

    const { result: hook } = renderHook(() => useVote());

    act(() => {
      hook.current.vote({ activityId: 1, submissionId: 2 });
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
