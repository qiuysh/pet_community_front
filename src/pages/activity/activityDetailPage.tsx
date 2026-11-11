import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useActivityDetail } from '../../hooks/useActivityDetail';
import { useConfirm } from '../../hooks/useConfirm';
import { isSubmissionActivityType } from '../../types/activity';
import {
  ActivityAlbum,
  RegistrationForm,
  SubmissionEditDialog,
  SubmissionUploader,
  VoteButton,
} from '../../components/activity';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Clock, Users, Check, Trophy, Pencil, Trash2 } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { Modal } from '../../components/ui/modal';
import { Tabs } from '../../components/ui/tabs';

export const ActivityDetailPage = () => {
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();
  const [editingSubmission, setEditingSubmission] = useState(false);
  const {
    activity,
    submissions,
    review,
    mySubmission,
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
    canCancelRegistration,
    handleCancelRegistration,
    handleDeleteSubmission,
    canceling,
    deletingSubmission,
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
          decoding="async"
          src={activity.cover || '/default-activity-cover.png'}
          alt={activity.title}
          className="w-full h-48 object-cover"
        />
        <div className="page-shell px-4 py-4">
          <h1 className="page-content-title mb-2">{activity.title}</h1>
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
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                    return;
                  }
                  setShowSubmissionForm(true);
                }}
              >
                提交作品
              </Button>
            )}
            {activity.isRegistered && (
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm text-secondary-dark flex items-center gap-1">
                  <Check size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
                  <span>已报名</span>
                </span>
                {canCancelRegistration() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start px-0 text-brown-muted"
                    loading={canceling}
                    disabled={canceling}
                    onClick={async () => {
                      const ok = await confirm({
                        title: '取消报名',
                        description: '取消后需要重新报名才能参与该活动，确定取消吗？',
                        confirmText: '取消报名',
                        tone: 'danger',
                      });
                      if (ok) handleCancelRegistration();
                    }}
                  >
                    取消报名
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-[var(--user-header-offset,56px)] z-10 border-b bg-white py-2 shadow-card">
        {/* 白底通栏；水平内边距放在 page-shell，与下方正文同列 */}
        <div className="page-shell px-4">
          <Tabs
            listOnly
            className="w-full"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as typeof activeTab)}
            items={[
              { key: 'detail', title: '活动详情' },
              ...(isSubmissionActivityType(activity.type)
                ? [{ key: 'submissions', title: '作品展示' }]
                : []),
              { key: 'album', title: '活动相册' },
              ...(review ? [{ key: 'review', title: '活动回顾' }] : []),
            ]}
          />
        </div>
      </div>

      <div className="page-shell px-4 py-4">
        {activeTab === 'detail' && (
          <Card>
            {activity.rules && (
              <div className="mb-4">
                <h3 className="page-section-title mb-2">活动规则</h3>
                <p className="text-sm text-brown-muted">{activity.rules}</p>
              </div>
            )}
            {activity.prizes && (
              <div className="mb-4">
                <h3 className="page-section-title mb-2">奖品设置</h3>
                <p className="text-sm text-brown-muted">{activity.prizes}</p>
              </div>
            )}
            {(activity.votesPerDay ?? 0) > 0 && (
              <div className="mb-4">
                <h3 className="page-section-title mb-2">投票规则</h3>
                <p className="text-sm text-brown-muted">每人每天最多可投票 {activity.votesPerDay} 次</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'submissions' && (
          <div>
            {submissions.length === 0 ? (
              <EmptyState compact title="暂无作品" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} padding="none">
                    <img
                      decoding="async"
                      src={submission.images?.[0] || '/default-submission.png'}
                      alt={submission.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="page-section-title mb-1">{submission.title}</h4>
                      <p className="text-xs text-brown-muted mb-2 line-clamp-2">{submission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <img
                            decoding="async"
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
                        <div className="mt-2 text-xs text-warning-text flex items-center gap-1">
                          <Trophy size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
                          <span>{submission.awardLevel}</span>
                        </div>
                      )}
                      {mySubmission?.id === submission.id && (
                        <div className="mt-2 flex items-center gap-3 border-t pt-2">
                          <button
                            type="button"
                            className="text-xs text-brown-secondary flex items-center gap-1"
                            onClick={() => setEditingSubmission(true)}
                          >
                            <Pencil size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
                            编辑
                          </button>
                          <button
                            type="button"
                            className="text-xs text-error-text flex items-center gap-1"
                            disabled={deletingSubmission}
                            onClick={async () => {
                              const ok = await confirm({
                                title: '撤回作品',
                                description: '撤回后作品与已有投票都会被移除，且无法恢复。',
                                confirmText: '撤回',
                                tone: 'danger',
                              });
                              if (ok) handleDeleteSubmission();
                            }}
                          >
                            <Trash2 size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
                            撤回
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'album' && (
          <ActivityAlbum
            activityId={activity.id}
            canUpload={isLoggedIn && !!activity.isRegistered}
          />
        )}

        {activeTab === 'review' && (
          <Card>
            {review ? (
              <article className="space-y-3">
                <h3 className="page-section-title">{review.title}</h3>
                {review.publishedAt && (
                  <p className="text-xs text-brown-muted">发布于 {formatTime(review.publishedAt)}</p>
                )}
                <p className="text-sm text-brown-secondary whitespace-pre-wrap">{review.content}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {review.photos.map((photo, index) => (
                      <img
                        key={`${photo}-${index}`}
                        decoding="async"
                        src={photo}
                        alt={`回顾照片 ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </article>
            ) : (
              <EmptyState compact title="暂无活动回顾" />
            )}
          </Card>
        )}
      </div>

      <Modal
        open={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        title="活动报名"
        size="md"
      >
        <RegistrationForm activity={activity} onSuccess={handleRefresh} />
      </Modal>

      <Modal
        open={showSubmissionForm}
        onClose={() => setShowSubmissionForm(false)}
        title="提交作品"
        size="md"
      >
        <SubmissionUploader activity={activity} onSuccess={handleRefresh} />
      </Modal>

      {mySubmission && (
        <SubmissionEditDialog
          key={mySubmission.id}
          submission={mySubmission}
          open={editingSubmission}
          onClose={() => setEditingSubmission(false)}
          onSuccess={() => refetch()}
        />
      )}

      {confirmDialog}
    </div>
  );
};