import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { formatRelativeTime } from '../../utils/format';
import { usePostDetail } from '../../hooks/usePostDetail';
import { usePostComments } from '../../hooks/usePostComments';
import { ReportReasonOptions } from '../../types/post';
import { MoreHorizontal, MapPin, Heart } from 'lucide-react';
import { AdBanner } from '../../components/ad/AdBanner';
import { ImageLightbox } from '../../components/chat/imageLightbox';
import { MentionText } from '../../components/post/mentionText';
import { MentionTextarea } from '../../components/post/mentionTextarea';
import { ShareSheet } from '../../components/post/shareSheet';
import { PostActions } from '../../components/post/postActions';
import { BackButton } from '../../components/ui/backButton';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { EmptyState } from '../../components/ui/emptyState';
import { Dropdown } from '../../components/ui/dropdown';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirmDialog';
import { Spinner } from '../../components/ui/spinner';
import { FilterChip } from '../../components/ui/filterChip';
import { Textarea } from '../../components/ui/input';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import './postDetailPage.scss';

const COMMENT_INPUT_ID = 'post-detail-comment-input';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const siteName = useSiteConfigStore((s) => s.siteName) || DEFAULT_SITE_NAME;

  const {
    post,
    loading: postLoading,
    onLike,
    onFavorite,
    onDelete,
    onReport,
    shareOpen,
    shareUrl,
    openShare,
    closeShare,
    onShare,
  } = usePostDetail(id);

  const {
    comments,
    totalCount: commentsTotal,
    replyTarget,
    addComment,
    toggleLike: onCommentLike,
    startReply,
    cancelReply,
  } = usePostComments(post ? post.id : 0, post?.commentsCount);

  const [commentText, setCommentText] = useState('');
  const [commentAtUsers, setCommentAtUsers] = useState<number[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const focusCommentInput = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('post-detail-comments')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    document.getElementById(COMMENT_INPUT_ID)?.focus();
  };

  const handleSubmitComment = async () => {
    const ok = await addComment(commentText, replyTarget, commentAtUsers);
    if (ok) {
      setCommentText('');
      setCommentAtUsers([]);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await onDelete();
  };

  const handleReport = async () => {
    if (!reportType) return;
    const ok = await onReport({
      targetType: 'post',
      targetId: post?.id ?? 0,
      reason: reportReason || reportType,
      reasonType: reportType,
    });
    if (ok) {
      setShowReport(false);
      setReportReason('');
      setReportType('');
    }
  };

  const isOwner = user && post && user.id === post.userId;

  if (postLoading || !post) {
    return (
      <div className="post-detail-page page-shell loading flex justify-center py-16">
        <Spinner label="加载中…" />
      </div>
    );
  }

  const moreMenuItems = isOwner
    ? [
        { key: 'edit', label: '编辑' },
        { key: 'delete', label: '删除', danger: true },
      ]
    : [{ key: 'report', label: '举报' }];

  const handleMoreAction = (key: string) => {
    if (key === 'edit') navigate(`/posts/${post.id}/edit`);
    if (key === 'delete') setShowDeleteConfirm(true);
    if (key === 'report') setShowReport(true);
  };

  return (
    <div className="post-detail-page page-shell">
      <div className="detail-header">
        <BackButton size={ICON_SIZE.nav} />
        <h1 className="page-bar-title title">动态详情</h1>
        <Dropdown
          aria-label="更多操作"
          className="more-wrapper"
          trigger={
            <Button type="button" variant="ghost" size="sm" className="more-btn" aria-label="更多操作">
              <MoreHorizontal size={ICON_SIZE.action} strokeWidth={iconStroke(ICON_SIZE.action)} aria-hidden="true" />
            </Button>
          }
          items={moreMenuItems}
          onAction={handleMoreAction}
        />
      </div>

      <div className="post-content-wrapper">
        <div className="post-header">
          <Link to={`/profile/${post.userId}`}>
            <Avatar
              src={post.userAvatar || getDefaultUserAvatar()}
              alt=""
              name={post.userNickname}
              size="md"
              className="avatar"
            />
          </Link>
          <div className="user-info">
            <Link to={`/profile/${post.userId}`} className="page-section-title nickname">{post.userNickname}</Link>
            <div className="time" title={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </div>
          </div>
          {post.visibility === 2 && <span className="visibility-tag">私密</span>}
          {post.visibility === 1 && <span className="visibility-tag">仅粉丝</span>}
        </div>

        {post.content && (
          <div className="post-text">
            <MentionText text={post.content} />
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
            {post.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className="image-item image-item--preview"
                onClick={() => setPreviewImage(img)}
                aria-label={`查看配图 ${idx + 1}`}
              >
                <img src={img} alt="" decoding="async" />
              </button>
            ))}
          </div>
        )}

        {post.video && (
          <div className="post-video">
            <video src={post.video} controls poster="" />
          </div>
        )}

        {post.topics && post.topics.length > 0 && (
          <div className="post-topics">
            {post.topics.map((topic) => (
              <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-tag">{topic.name}</Link>
            ))}
          </div>
        )}

        {post.location && (
          <div className="post-location">
            <MapPin size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
            <span>{post.location}</span>
          </div>
        )}

        <PostActions
          post={{ ...post, commentsCount: commentsTotal }}
          onLikeOverride={onLike}
          onFavoriteOverride={onFavorite}
          onCommentOverride={focusCommentInput}
          onShareOverride={openShare}
          className="post-detail-actions"
        />
      </div>

      <AdBanner location="detail_sidebar" className="detail-sidebar-ad" />

      <ShareSheet
        open={shareOpen}
        onClose={closeShare}
        postUrl={shareUrl}
        postTitle={post.content}
        onShare={(platform) => onShare(platform)}
        poster={{
          siteName,
          title: post.content,
          coverUrl: post.images?.[0],
          authorName: post.userNickname,
          authorAvatar: post.userAvatar || getDefaultUserAvatar(post.userNickname),
        }}
      />

      <ImageLightbox
        open={!!previewImage}
        src={previewImage || ''}
        alt="动态配图"
        onClose={() => setPreviewImage(null)}
      />

      <div id="post-detail-comments" className="comments-section">
        <div className="page-section-title comments-header">评论 ({commentsTotal})</div>

        <div className="comment-input-wrapper">
          {replyTarget && (
            <div className="reply-tip">
              回复 @{replyTarget.name}
              <Button type="button" variant="ghost" size="sm" onClick={cancelReply}>取消</Button>
            </div>
          )}
          <MentionTextarea
            id={COMMENT_INPUT_ID}
            aria-label={replyTarget ? `回复 @${replyTarget.name}` : '发表评论'}
            value={commentText}
            onChange={setCommentText}
            onAtUsersChange={setCommentAtUsers}
            placeholder={
              replyTarget
                ? `回复 @${replyTarget.name}，输入 @ 可提及用户`
                : '说点什么… 输入 @ 可提及用户'
            }
            rows={3}
            maxLength={200}
          />
          <div className="send-row">
            <Button
              type="button"
              size="sm"
              className="send-btn"
              disabled={!commentText.trim()}
              onClick={handleSubmitComment}
            >
              发送
            </Button>
          </div>
        </div>

        <div className="comments-list motion-list">
          {comments.length === 0 && <EmptyState compact title="暂无评论，快来抢沙发吧～" />}
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <Avatar
                src={comment.userAvatar || getDefaultUserAvatar()}
                alt=""
                name={comment.userNickname}
                size="sm"
                className="comment-avatar"
              />
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-name">{comment.userNickname}</span>
                  <span className="comment-time" title={comment.createdAt}>
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                {comment.replyToName && (
                  <div className="reply-prefix">回复 @{comment.replyToName}：</div>
                )}
                <div className="comment-text">
                  <MentionText text={comment.content} />
                </div>
                <div className="comment-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`like-btn ${comment.isLiked ? 'active' : ''}`}
                    onClick={() => onCommentLike(comment.id)}
                  >
                    <Heart
                      size={ICON_SIZE.inline}
                      strokeWidth={iconStroke(ICON_SIZE.inline)}
                      fill={comment.isLiked ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />{' '}
                    <span>{comment.likesCount}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="reply-btn"
                    onClick={() => { startReply(comment); focusCommentInput(); }}
                  >
                    回复
                  </Button>
                </div>

                {comment.children && comment.children.length > 0 && (
                  <div className="replies">
                    {comment.children.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <Avatar
                          src={reply.userAvatar || getDefaultUserAvatar()}
                          alt=""
                          name={reply.userNickname}
                          size="sm"
                          className="reply-avatar"
                        />
                        <div className="reply-body">
                          <div className="reply-header">
                            <span className="reply-name">{reply.userNickname}</span>
                            <span className="reply-time" title={reply.createdAt}>
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                          </div>
                          {reply.replyToName && (
                            <span className="reply-prefix">回复 @{reply.replyToName}：</span>
                          )}
                          <span className="reply-text">
                            <MentionText text={reply.content} />
                          </span>
                          <div className="reply-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`like-btn ${reply.isLiked ? 'active' : ''}`}
                              onClick={() => onCommentLike(reply.id)}
                            >
                              <Heart
                                size={ICON_SIZE.inline}
                                strokeWidth={iconStroke(ICON_SIZE.inline)}
                                fill={reply.isLiked ? 'currentColor' : 'none'}
                                aria-hidden="true"
                              />{' '}
                              <span>{reply.likesCount}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="reply-btn"
                              onClick={() => { startReply(reply); focusCommentInput(); }}
                            >
                              回复
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={showReport}
        onClose={() => setShowReport(false)}
        title="举报动态"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReport(false)}>取消</Button>
            <Button disabled={!reportType} onClick={handleReport}>提交举报</Button>
          </>
        }
      >
        <div className="reason-options flex flex-wrap gap-2 mb-3">
          {ReportReasonOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              active={reportType === opt.value}
              onClick={() => setReportType(opt.value)}
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
        <Textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="请补充描述（选填）"
          rows={3}
        />
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除这条动态？"
        description="删除后动态及其评论将一并移除，无法恢复。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
