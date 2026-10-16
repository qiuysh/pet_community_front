import { useNavigate } from 'react-router-dom';
import { useActivityDetail } from '../../hooks/useActivityDetail';
import { ActivityType } from '../../types/activity';
import { RegistrationForm, SubmissionUploader, VoteButton } from '../../components/activity';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Clock, Users, Check, Trophy, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs } from '../../components/ui/tabs';

export const ActivityDetailPage = () => {
  const navigate = useNavigate();
  const {
    activity,
    submissions,
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
  } = useActivityDetail();

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !activity) {
    return <div className="min-h-screen flex items-center justify-center">加载中…</div>;
  }

  return (
    <div className="bg-cream min-h-screen pb-6">
      <div className="bg-white">
        <img
          src={activity.cover || '/default-activity-cover.png'}
          alt={activity.title}
          className="w-full h-48 object-cover"
        />
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-brown mb-2">{activity.title}</h1>
          <p className="text-brown-muted mb-3">{activity.description}</p>

          <div className="space-y-2 text-sm text-brown-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{formatTime(activity.startTime)} - {formatTime(activity.endTime)}</span>
            </div>
            {(activity.maxParticipants ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>
                  {activity.participantsCount}/{activity.maxParticipants} 人参与
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {isRegistrationOpen() && !activity.isRegistered && (
              <Button
                className="flex-1"
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  setShowRegistrationForm(true);
                }}
              >
                立即报名
              </Button>
            )}
            {isSubmissionOpen() && !activity.hasSubmitted && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSubmissionForm(true)}
              >
                提交作品
              </Button>
            )}
            {activity.isRegistered && (
              <span className="text-sm text-secondary-dark flex items-center gap-1">
                <Check size={12} aria-hidden="true" />
                <span>已报名</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-[var(--user-header-offset,56px)] bg-white z-10 border-b shadow-card px-4 py-2">
        <Tabs
          listOnly
          className="w-full"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as typeof activeTab)}
          items={[
            { key: 'detail', title: '活动详情' },
            ...(activity.type === ActivityType.VOTING || activity.type === ActivityType.CONTEST
              ? [{ key: 'submissions', title: '作品展示' }]
              : []),
          ]}
        />
      </div>

      <div className="px-4 py-4">
        {activeTab === 'detail' && (
          <Card>
            {activity.rules && (
              <div className="mb-4">
                <h3 className="text-base font-medium text-brown mb-2">活动规则</h3>
                <p className="text-sm text-brown-muted">{activity.rules}</p>
              </div>
            )}
            {activity.prizes && (
              <div className="mb-4">
                <h3 className="text-base font-medium text-brown mb-2">奖品设置</h3>
                <p className="text-sm text-brown-muted">{activity.prizes}</p>
              </div>
            )}
            {(activity.votesPerDay ?? 0) > 0 && (
              <div className="mb-4">
                <h3 className="text-base font-medium text-brown mb-2">投票规则</h3>
                <p className="text-sm text-brown-muted">每人每天最多可投票 {activity.votesPerDay} 次</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'submissions' && (
          <div>
            {submissions.length === 0 ? (
              <div className="py-8 text-center text-brown-muted">暂无作品</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} padding="none">
                    <img
                      src={submission.images?.[0] || '/default-submission.png'}
                      alt={submission.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-brown mb-1">{submission.title}</h4>
                      <p className="text-xs text-brown-muted mb-2 line-clamp-2">{submission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <img
                            src={submission.userAvatar || getDefaultUserAvatar()}
                            alt=""
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs text-brown-secondary">{submission.userNickname}</span>
                        </div>
                        {isVoteOpen() && (
                          <VoteButton
                            activityId={activity.id}
                            submissionId={submission.id}
                            hasVoted={submission.isVoted || false}
                            votesCount={submission.votesCount}
                            onVoteSuccess={() => refetch()}
                          />
                        )}
                      </div>
                      {submission.awardLevel && (
                        <div className="mt-2 text-xs text-warning flex items-center gap-1">
                          <Trophy size={12} aria-hidden="true" />
                          <span>{submission.awardLevel}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overscroll-contain">
          <Card className="w-full max-w-md max-h-[min(90dvh,40rem)] overflow-y-auto overscroll-contain" padding="none">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-medium text-brown">活动报名</h3>
              <Button
                variant="ghost"
                size="sm"
                aria-label="关闭"
                onClick={() => setShowRegistrationForm(false)}
              >
                <X size={20} aria-hidden="true" />
              </Button>
            </div>
            <div className="p-4">
              <RegistrationForm activity={activity} onSuccess={handleRefresh} />
            </div>
          </Card>
        </div>
      )}

      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overscroll-contain">
          <Card className="w-full max-w-md max-h-[min(90dvh,40rem)] overflow-y-auto overscroll-contain" padding="none">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-medium text-brown">提交作品</h3>
              <Button
                variant="ghost"
                size="sm"
                aria-label="关闭"
                onClick={() => setShowSubmissionForm(false)}
              >
                <X size={20} aria-hidden="true" />
              </Button>
            </div>
            <div className="p-4">
              <SubmissionUploader activity={activity} onSuccess={handleRefresh} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};