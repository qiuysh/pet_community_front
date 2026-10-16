import { useCallback } from 'react';
import { useToast } from '../components/toast';
import { useAsync } from '../hooks/useAsync';
import { voteForSubmission, cancelVote, getVoteHistory } from '../api/activity';
import { VoteRequest } from '../types/activity';

export const useVote = () => {
  const toast = useToast();
  const { loading, run } = useAsync();

  const vote = useCallback(async (data: VoteRequest) => {
    return run(
      () => voteForSubmission(data),
      (result) => toast.success(`投票成功，今日剩余票数：${result.remainingVotes}`),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '投票失败'),
    );
  }, [run, toast]);

  const cancel = useCallback(async (submissionId: number) => {
    return run(
      () => cancelVote(submissionId),
      () => toast.success('取消投票成功'),
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '取消投票失败'),
    );
  }, [run, toast]);

  const fetchHistory = useCallback(async (activityId: number, page = 1, pageSize = 20) => {
    return run(
      () => getVoteHistory(activityId, page, pageSize),
      undefined,
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '加载投票记录失败'),
    );
  }, [run, toast]);

  return {
    loading,
    vote,
    cancel,
    fetchHistory,
  };
};
