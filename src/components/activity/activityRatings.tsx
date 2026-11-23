import { useState } from 'react';
import { Star } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../ui/button';
import { Textarea } from '../ui/input';
import { EmptyState } from '../ui/emptyState';
import { useToast } from '../toast';
import { useAsync, useAsyncEffect } from '../../hooks/useAsync';
import {
  deleteActivityRating,
  getActivityRatings,
  upsertActivityRating,
} from '../../api/activity';
import { ActivityRatingInfo } from '../../types/activity';
import {
  ACTIVITY_RATING_COMMENT_MAX,
  ACTIVITY_RATING_DEFAULT_SCORE,
  ACTIVITY_RATING_SCORE_MAX,
  ACTIVITY_RATING_SCORE_MIN,
  ACTIVITY_RATING_SCORE_OPTIONS,
} from '../../constants/activity';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';

interface ActivityRatingsProps {
  activityId: number;
  /** 活动是否已结束 */
  ended: boolean;
  /** 当前用户是否已通过报名 */
  canRate: boolean;
  isLoggedIn: boolean;
  onLoginRequired?: () => void;
  onChanged?: (average: number, count: number) => void;
}

function ScoreStars({
  value,
  onChange,
  size = ICON_SIZE.inline,
  interactive = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} 星`}>
      {ACTIVITY_RATING_SCORE_OPTIONS.map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            size={size}
            strokeWidth={iconStroke(size)}
            className={filled ? 'fill-warning text-warning' : 'text-brown-muted'}
            aria-hidden="true"
          />
        );
        if (!interactive || !onChange) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} 星`}
            className="p-0.5 rounded-sm hover:bg-cream"
            onClick={() => onChange(n)}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

export function ActivityRatings({
  activityId,
  ended,
  canRate,
  isLoggedIn,
  onLoginRequired,
  onChanged,
}: ActivityRatingsProps) {
  const toast = useToast();
  const { loading: saving, run: runSave } = useAsync();
  const { loading: removing, run: runRemove } = useAsync();
  const [list, setList] = useState<ActivityRatingInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [myRating, setMyRating] = useState<ActivityRatingInfo | null>(null);
  const [score, setScore] = useState(ACTIVITY_RATING_DEFAULT_SCORE);
  const [comment, setComment] = useState('');

  const { loading, refetch } = useAsyncEffect(
    async () => {
      const data = await getActivityRatings(activityId);
      setList(data.list);
      setTotal(data.total);
      setAverage(data.average);
      setMyRating(data.myRating ?? null);
      if (data.myRating) {
        setScore(data.myRating.score);
        setComment(data.myRating.comment || '');
      }
      onChanged?.(data.average, data.total);
      return data;
    },
    [activityId],
    {
      onError: (err: unknown) => {
        toast.error((err as { message?: string })?.message || '加载评价失败');
      },
    },
  );

  const handleSubmit = () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    if (!canRate) {
      toast.warning('仅已报名用户可评价');
      return;
    }
    if (!ended) {
      toast.warning('活动结束后才能评价');
      return;
    }
    if (score < ACTIVITY_RATING_SCORE_MIN || score > ACTIVITY_RATING_SCORE_MAX) {
      toast.warning(`请选择 ${ACTIVITY_RATING_SCORE_MIN}~${ACTIVITY_RATING_SCORE_MAX} 星`);
      return;
    }
    runSave(
      () => upsertActivityRating(activityId, { score, comment: comment.trim() || undefined }),
      () => {
        toast.success(myRating ? '评价已更新' : '评价已提交');
        refetch();
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '提交失败'),
    );
  };

  const handleDelete = () => {
    runRemove(
      () => deleteActivityRating(activityId),
      () => {
        toast.success('已删除评价');
        setScore(ACTIVITY_RATING_DEFAULT_SCORE);
        setComment('');
        setMyRating(null);
        refetch();
      },
      (err: unknown) => toast.error((err instanceof Error ? err.message : '') || '删除失败'),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="page-section-title">活动评价</h3>
        <div className="text-sm text-brown-muted flex items-center gap-2">
          <ScoreStars value={Math.round(average)} />
          <span>
            {average > 0 ? average.toFixed(1) : '—'} · {total} 条
          </span>
        </div>
      </div>

      {ended && canRate && (
        <div className="rounded-md border border-border-light bg-white p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-brown-secondary">{myRating ? '修改我的评价' : '写下评价'}</span>
            <ScoreStars value={score} onChange={setScore} interactive size={ICON_SIZE.action} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={ACTIVITY_RATING_COMMENT_MAX}
            rows={2}
            placeholder="一句话说说这次活动（选填）…"
            aria-label="评价内容"
          />
          <div className="flex gap-2">
            <Button size="sm" loading={saving} disabled={saving} onClick={handleSubmit}>
              {myRating ? '更新评价' : '提交评价'}
            </Button>
            {myRating && (
              <Button
                size="sm"
                variant="ghost"
                loading={removing}
                disabled={removing}
                className="text-error-text"
                onClick={handleDelete}
              >
                删除
              </Button>
            )}
          </div>
        </div>
      )}

      {!ended && (
        <p className="text-sm text-brown-muted">活动结束后，报名用户可在此打分评价。</p>
      )}
      {ended && isLoggedIn && !canRate && (
        <p className="text-sm text-brown-muted">仅已通过报名的用户可评价本活动。</p>
      )}

      {loading && list.length === 0 ? (
        <p className="text-sm text-brown-muted">加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState compact title="暂无评价" />
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.id} className="flex gap-3 border-b border-border-light pb-3 last:border-0">
              <img
                decoding="async"
                src={item.userAvatar || getDefaultUserAvatar()}
                alt=""
                width={32}
                height={32}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-brown-secondary truncate">{item.userNickname || '用户'}</span>
                  <ScoreStars value={item.score} />
                </div>
                {item.comment ? (
                  <p className="text-sm text-brown-muted mt-1">{item.comment}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
