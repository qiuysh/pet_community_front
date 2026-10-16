import { useState } from 'react';
import { useToast } from '../toast';
import { voteForSubmission, cancelVote } from '../../api/activity';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../ui/button';

interface VoteButtonProps {
  activityId: number;
  submissionId: number;
  hasVoted: boolean;
  votesCount: number;
  onVoteSuccess?: (result: { voted: boolean; votesCount: number }) => void;
}

export const VoteButton = ({
  activityId,
  submissionId,
  hasVoted,
  votesCount,
  onVoteSuccess,
}: VoteButtonProps) => {
  const toast = useToast();
  const { loading, run } = useAsync();
  const [voted, setVoted] = useState(hasVoted);
  const [count, setCount] = useState(votesCount);

  const handleVote = () =>
    run(
      () => voteForSubmission({ activityId, submissionId }),
      (result) => {
        setVoted(result.voted);
        setCount(result.votesCount);
        toast.success(`投票成功，今日剩余票数：${result.remainingVotes}`);
        onVoteSuccess?.({ voted: result.voted, votesCount: result.votesCount });
      },
      (err: unknown) => toast.error((err as Error).message || '投票失败，请稍后重试'),
    );

  const handleCancelVote = () =>
    run(
      () => cancelVote(submissionId),
      () => {
        const nextCount = Math.max(0, count - 1);
        setVoted(false);
        setCount(nextCount);
        toast.success('取消投票成功');
        onVoteSuccess?.({ voted: false, votesCount: nextCount });
      },
      (err: unknown) => toast.error((err as Error).message || '取消投票失败，请稍后重试'),
    );

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={voted ? 'outline' : 'primary'}
        size="sm"
        loading={loading}
        disabled={loading}
        onClick={voted ? handleCancelVote : handleVote}
        className={
          voted
            ? 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25'
            : undefined
        }
      >
        {loading ? '处理中' : voted ? '取消投票' : '投票'}
      </Button>
      <span className="text-sm text-brown-muted">{count} 票</span>
      {voted && <span className="text-xs text-warning">已投票</span>}
    </div>
  );
};
