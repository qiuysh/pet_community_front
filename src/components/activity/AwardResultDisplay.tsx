import { SubmissionInfo } from '../../types/activity';

interface AwardResultDisplayProps {
  firstPrize?: SubmissionInfo;
  secondPrizes?: SubmissionInfo[];
  thirdPrizes?: SubmissionInfo[];
}

export const AwardResultDisplay = ({ firstPrize, secondPrizes, thirdPrizes }: AwardResultDisplayProps) => {
  if (!firstPrize && (!secondPrizes || secondPrizes.length === 0) && (!thirdPrizes || thirdPrizes.length === 0)) {
    return (
      <div className="bg-white rounded-md border border-border-light p-4">
        <h3 className="text-lg font-semibold text-brown mb-4">获奖结果</h3>
        <div className="text-center text-sm text-brown-muted py-8">
          暂未设置获奖作品
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-border-light p-4">
      <h3 className="text-lg font-semibold text-brown mb-4">获奖结果</h3>

      {firstPrize && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-error text-white">
              一等奖
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-error/10 rounded">
            {firstPrize.images && firstPrize.images.length > 0 && (
              <img src={firstPrize.images[0]} alt={firstPrize.title} className="w-16 h-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brown truncate">{firstPrize.title}</p>
              <p className="text-sm text-brown-muted">作者: {firstPrize.userNickname}</p>
              <p className="text-xs text-brown-light">{firstPrize.votesCount} 票</p>
            </div>
          </div>
        </div>
      )}

      {secondPrizes && secondPrizes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-rank-gold text-white">
              二等奖
            </span>
          </div>
          <div className="space-y-2">
            {secondPrizes.map(submission => (
              <div key={submission.id} className="flex items-center gap-3 p-2 bg-warning/15 rounded-sm">
                {submission.images && submission.images.length > 0 && (
                  <img src={submission.images[0]} alt={submission.title} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brown truncate">{submission.title}</p>
                  <p className="text-sm text-brown-muted">作者: {submission.userNickname}</p>
                  <p className="text-xs text-brown-light">{submission.votesCount} 票</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {thirdPrizes && thirdPrizes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-rank-bronze text-white">
              三等奖
            </span>
          </div>
          <div className="space-y-2">
            {thirdPrizes.map(submission => (
              <div key={submission.id} className="flex items-center gap-3 p-2 bg-warning/10 rounded-sm">
                {submission.images && submission.images.length > 0 && (
                  <img src={submission.images[0]} alt={submission.title} className="w-10 h-10 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brown truncate">{submission.title}</p>
                  <p className="text-sm text-brown-muted">作者: {submission.userNickname}</p>
                  <p className="text-xs text-brown-light">{submission.votesCount} 票</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-brown-muted text-center">
        共 {((firstPrize ? 1 : 0) + (secondPrizes?.length || 0) + (thirdPrizes?.length || 0))} 个获奖作品
      </div>
    </div>
  );
};