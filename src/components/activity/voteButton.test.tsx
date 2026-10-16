import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const toastSuccess = vi.fn();
const toastError = vi.fn();
const voteForSubmissionMock = vi.fn();
const cancelVoteMock = vi.fn();

vi.mock('../toast', () => ({
  useToast: () => ({
    success: toastSuccess,
    error: toastError,
  }),
}));

vi.mock('../../api/activity', () => ({
  voteForSubmission: (...args: unknown[]) => voteForSubmissionMock(...args),
  cancelVote: (...args: unknown[]) => cancelVoteMock(...args),
}));

import { VoteButton } from './voteButton';

describe('VoteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应渲染初始投票状态和票数', () => {
    render(
      <VoteButton
        activityId={1}
        submissionId={2}
        hasVoted={false}
        votesCount={10}
      />
    );

    expect(screen.getByRole('button', { name: /投票/i })).toBeInTheDocument();
    expect(screen.getByText('10 票')).toBeInTheDocument();
  });

  it('点击投票按钮应更新为已投票状态并显示票数', async () => {
    voteForSubmissionMock.mockResolvedValue({ voted: true, votesCount: 11, remainingVotes: 9 });
    const onVoteSuccess = vi.fn();

    render(
      <VoteButton
        activityId={1}
        submissionId={2}
        hasVoted={false}
        votesCount={10}
        onVoteSuccess={onVoteSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /投票/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /取消投票/i })).toBeInTheDocument();
    });

    expect(screen.getByText('11 票')).toBeInTheDocument();
    expect(screen.getByText('已投票')).toBeInTheDocument();
    expect(toastSuccess).toHaveBeenCalledWith('投票成功，今日剩余票数：9');
    expect(onVoteSuccess).toHaveBeenCalledWith({ voted: true, votesCount: 11 });
  });

  it('点击取消投票按钮应恢复未投票状态', async () => {
    cancelVoteMock.mockResolvedValue(undefined);
    const onVoteSuccess = vi.fn();

    render(
      <VoteButton
        activityId={1}
        submissionId={2}
        hasVoted
        votesCount={10}
        onVoteSuccess={onVoteSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /取消投票/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /投票/i })).toBeInTheDocument();
    });

    expect(cancelVoteMock).toHaveBeenCalledWith(2);
    expect(screen.getByText('9 票')).toBeInTheDocument();
    expect(screen.queryByText('已投票')).not.toBeInTheDocument();
    expect(toastSuccess).toHaveBeenCalledWith('取消投票成功');
    expect(onVoteSuccess).toHaveBeenCalledWith({ voted: false, votesCount: 9 });
  });

  it('投票失败时应显示错误提示', async () => {
    voteForSubmissionMock.mockRejectedValue(new Error('今日投票次数已达上限'));

    render(
      <VoteButton
        activityId={1}
        submissionId={2}
        hasVoted={false}
        votesCount={10}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /投票/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('今日投票次数已达上限');
    });
  });
});
