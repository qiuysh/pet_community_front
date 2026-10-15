import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { usePostDetail } from '../../hooks/usePostDetail';
import { usePostComments } from '../../hooks/usePostComments';
import { ReportReasonOptions } from '../../types/post';
import { ChevronLeft, MoreHorizontal, MapPin, Heart } from 'lucide-react';
import { AdBanner } from '../../components/ad/AdBanner';
import { ShareSheet } from '../../components/post/shareSheet';
import { PostActions } from '../../components/post/postActions';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/input';
import { Dropdown } from '../../components/ui/dropdown';
import { Modal } from '../../components/ui/modal';
import { Spinner } from '../../components/ui/spinner';
import { FilterChip } from '../../components/ui/filterChip';
import './postDetailPage.scss';

const COMMENT_INPUT_ID = 'post-detail-comment-input';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const { post, loading: postLoading, onLike, onFavorite, onShare, onDelete, onReport } = usePostDetail(id);

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
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const focusCommentInput = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('post-detail-comments')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    document.getElementById(COMMENT_INPUT_ID)?.focus();
  };

  const handleSubmitComment = async () => {
    const ok = await addComment(commentText, replyTarget);
    if (ok) setCommentText('');
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
      <div className="post-detail-page loading flex justify-center py-16">
        <Spinner label="加载中…" />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/#/post/${post.id}`;

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
    <div className="post-detail-page">
      <div className="detail-header">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <span className="title">动态详情</span>
        <Dropdown
          aria-label="更多操作"
          className="more-wrapper"
          trigger={
            <Button type="button" variant="ghost" size="sm" className="more-btn" aria-label="更多操作">
              <MoreHorizontal size={20} aria-hidden="true" />
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
            <Link to={`/profile/${post.userId}`} className="nickname">{post.userNickname}</Link>
            <div className="time">{post.createdAt}</div>
          </div>
          {post.visibility === 2 && <span className="visibility-tag">私密</span>}
          {post.visibility === 1 && <span className="visibility-tag">仅粉丝</span>}
        </div>

        {post.content && <div className="post-text">{post.content}</div>}

        {post.images && post.images.length > 0 && (
          <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
            {post.images.map((img, idx) => (
              <div key={idx} className="image-item">
                <img src={img} alt="" />
              </div>
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

        {post.location && <div className="post-location"><MapPin size={14} aria-hidden="true" /> <span>{post.location}</span></div>}

        <PostActions
          post={{ ...post, commentsCount: commentsTotal }}
          onLikeOverride={onLike}
          onFavoriteOverride={onFavorite}
          onCommentOverride={focusCommentInput}
          onShareOverride={() => setShareOpen(true)}
          className="post-detail-actions"
        />
      </div>

      <AdBanner location="detail_sidebar" className="detail-sidebar-ad" />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postUrl={shareUrl}
        postTitle={post.content}
        onShare={(platform) => onShare(platform)}
      />

      <div id="post-detail-comments" className="comments-section">
        <div className="comments-header">评论 ({commentsTotal})</div>

        <div className="comment-input-wrapper">
          {replyTarget && (
            <div className="reply-tip">
              回复 @{replyTarget.name}
              <Button type="button" variant="ghost" size="sm" onClick={cancelReply}>取消</Button>
            </div>
          )}
          <Textarea
            id={COMMENT_INPUT_ID}
            aria-label={replyTarget ? `回复 @${replyTarget.name}` : '发表评论'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={replyTarget ? `回复 @${replyTarget.name}` : '说点什么…'}
            rows={2}
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

        <div className="comments-list">
          {comments.length === 0 && <div className="empty">暂无评论，快来抢沙发吧～</div>}
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
                  <span className="comment-time">{comment.createdAt}</span>
                </div>
                {comment.replyToName && (
                  <div className="reply-prefix">回复 @{comment.replyToName}：</div>
                )}
                <div className="comment-text">{comment.content}</div>
                <div className="comment-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`like-btn ${comment.isLiked ? 'active' : ''}`}
                    onClick={() => onCommentLike(comment.id)}
                  >
                    <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} aria-hidden="true" /> <span>{comment.likesCount}</span>
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
                            <span className="reply-time">{reply.createdAt}</span>
                          </div>
                          {reply.replyToName && (
                            <span className="reply-prefix">回复 @{reply.replyToName}：</span>
                          )}
                          <span className="reply-text">{reply.content}</span>
                          <div className="reply-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`like-btn ${reply.isLiked ? 'active' : ''}`}
                              onClick={() => onCommentLike(reply.id)}
                            >
                              <Heart size={14} fill={reply.isLiked ? 'currentColor' : 'none'} aria-hidden="true" /> <span>{reply.likesCount}</span>
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
            <Button disabled={!reportType} onClick={handleReport}>提交</Button>
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

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除动态"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
            <Button variant="danger" onClick={handleDelete}>删除</Button>
          </>
        }
      >
        确定删除这条动态吗？此操作不可撤销。
      </Modal>
    </div>
  );
};
